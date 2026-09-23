import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  describe,
  expect,
  it,
} from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readdir, readFile } from "node:fs/promises";
const db = new PGlite({ extensions: { pgcrypto } });
const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
const eve = "00000000-0000-4000-8000-000000000003";
async function scalar<T = string>(sql: string, params: unknown[] = []) {
  const result = await db.query<Record<string, T>>(sql, params);
  return Object.values(result.rows[0]!)[0]!;
}
async function asUser(id: string, org?: string) {
  await db.exec("reset role");
  await db.query(
    "select set_config('request.jwt.claim.sub', $1, false), set_config('request.headers', $2, false)",
    [id, JSON.stringify(org ? { "x-organization-id": org } : {})],
  );
  await db.exec("set role authenticated");
}
async function create(name = "Organization") {
  return (
    await db.query<{ organization_id: string; membership_id: string }>(
      "select * from public.create_organization($1)",
      [name],
    )
  ).rows[0]!;
}
async function invite(org: string, email = "bob@example.com", admin = false) {
  return (
    await db.query<{ token: string; invitation_id: string }>(
      "select * from public.create_organization_invitation($1,$2,'freelancer',$3)",
      [org, email, admin],
    )
  ).rows[0]!;
}
async function createWork(
  org: string,
  overrides: {
    title?: string;
    workType?: string;
    startsAt?: string;
    endsAt?: string;
    timezone?: string;
    organizerPersonId?: string | null;
    organizerOrganizationId?: string | null;
  } = {},
) {
  return await scalar<string>(
    `select public.create_work($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      org,
      overrides.title ?? "Summer Festival",
      overrides.workType ?? "performance",
      overrides.startsAt ?? "2026-09-20T18:00:00Z",
      overrides.endsAt ?? "2026-09-21T03:00:00Z",
      overrides.timezone ?? "Atlantic/Azores",
      overrides.organizerPersonId ?? null,
      overrides.organizerOrganizationId ?? null,
    ],
  );
}

async function personId(authUserId: string) {
  await db.exec("reset role");
  const id = await scalar<string>(
    "select id from public.persons where auth_user_id=$1",
    [authUserId],
  );
  return id;
}

async function addParticipation(workId: string, authUserId: string) {
  await db.exec("reset role");
  const id = await scalar<string>(
    "select id from public.persons where auth_user_id=$1",
    [authUserId],
  );

  return await scalar<string>(
    `insert into public.work_participations(work_id,person_id)
     values($1,$2)
     returning id`,
    [workId, id],
  );
}
// A savepoint prevents an expected SQL failure from aborting the surrounding test.
async function denied(sql: string, params: unknown[] = [], code?: string) {
  await db.exec("savepoint expected_failure");
  try {
    await expect(db.query(sql, params)).rejects.toMatchObject(
      code ? { code } : { message: expect.any(String) },
    );
  } finally {
    await db.exec("rollback to savepoint expected_failure");
  }
}
beforeAll(async () => {
  // Only the Supabase Auth contract is supplied by the harness. All application
  // migrations, triggers, grants, RLS and RPCs execute unchanged in PostgreSQL.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema auth to authenticated, anon;
    create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;`);
  const files = (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files)
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
});
beforeEach(async () => {
  await db.exec("reset role; begin");
  for (const [id, email] of [
    [alice, "alice@example.com"],
    [bob, "bob@example.com"],
    [eve, "eve@example.com"],
  ]) {
    await db.query(
      'insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values ($1,$2,now(),\'{"first_name":" Person "}\')',
      [id, email],
    );
  }
  await asUser(alice);
});
afterEach(async () => {
  await db.exec("rollback; reset role");
});
afterAll(async () => {
  await db.close();
});

describe("identity and request-scoped tenancy", () => {
  it("bootstraps a global Person, without an Organization; other identities stay private", async () => {
    expect(
      await scalar<number>("select count(*)::int from public.persons"),
    ).toBe(1);
    expect(await scalar("select first_name from public.persons")).toBe(
      "Person",
    );
    expect(
      await scalar<number>(
        "select count(*)::int from public.current_person_organizations()",
      ),
    ).toBe(0);
  });
  it("creates a trimmed flexible Organization and Member administrator atomically", async () => {
    const org = await create("  Solo production  ");
    await asUser(alice, org.organization_id);
    expect(await scalar("select name from public.organizations")).toBe(
      "Solo production",
    );
    expect(
      await scalar(
        "select membership_type from public.organization_memberships",
      ),
    ).toBe("member");
    expect(
      await scalar<boolean>(
        "select is_admin from public.organization_memberships",
      ),
    ).toBe(true);
  });
  it("rejects empty and oversized names without leaving partial rows", async () => {
    for (const name of ["", "   ", "a".repeat(121), null])
      await denied("select public.create_organization($1)", [name]);
    expect(
      await scalar<number>(
        "select count(*)::int from public.current_person_organizations()",
      ),
    ).toBe(0);
  });
  it("discovers multiple organizations but reads only the selected tenant", async () => {
    const a = await create("A");
    const b = await create("B");
    expect(
      await scalar<number>(
        "select count(*)::int from public.current_person_organizations()",
      ),
    ).toBe(2);
    expect(
      await scalar<number>("select count(*)::int from public.organizations"),
    ).toBe(0);
    await asUser(alice, a.organization_id);
    expect(await scalar("select name from public.organizations")).toBe("A");
    await db.query(
      "update public.organizations set name='Intrusion' where id=$1",
      [b.organization_id],
    );
    await asUser(alice, b.organization_id);
    expect(await scalar("select name from public.organizations")).toBe("B");
  });
  it("rejects forged, malformed and missing contexts", async () => {
    const a = await create();
    await asUser(bob, a.organization_id);
    expect(await scalar("select public.active_organization_id()")).toBeNull();
    expect(
      await scalar<number>(
        "select count(*)::int from public.organization_memberships",
      ),
    ).toBe(0);
    await denied(
      "select public.create_organization_invitation($1,'x@example.com','member',false)",
      [a.organization_id],
      "42501",
    );
    await asUser(alice, "not-a-uuid");
    expect(await scalar("select public.active_organization_id()")).toBeNull();
  });
  it("denies anonymous RPC and table access", async () => {
    await db.exec("reset role; set role anon");
    await denied("select public.create_organization('A')", [], "42501");
    await denied("select * from public.persons", [], "42501");
    await denied(
      "select public.accept_organization_invitation('x')",
      [],
      "42501",
    );
  });
  it("does not allow identity reassignment or direct membership insertion and escalation", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    await denied("update public.persons set auth_user_id=$1", [bob], "42501");
    await denied(
      "update public.organization_memberships set is_admin=false",
      [],
      "42501",
    );
    await denied("delete from public.organization_memberships", [], "42501");
    await denied(
      "insert into public.organization_memberships(person_id,organization_id,membership_type) values(public.current_person_id(),$1,'freelancer')",
      [org.organization_id],
      "42501",
    );
  });
    it("enforces one exclusive membership per Person/Organization at the database level", async () => {
    const org = await create();
    await db.exec("reset role");
    await denied(
      "insert into public.organization_memberships(person_id,organization_id,membership_type) select person_id,organization_id,'freelancer' from public.organization_memberships where id=$1",
      [org.membership_id],
      "23505",
    );
  });
});

describe("invitations and administrative authority", () => {
  it("accepts once for the verified recipient and stores only a digest", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    const invitation = await invite(org.organization_id);
    await denied("select * from public.organization_invitations", [], "42501");
    await asUser(eve);
    await denied(
      "select public.accept_organization_invitation($1)",
      [invitation.token],
      "22023",
    );
    await asUser(bob);
    expect(
      await scalar("select public.accept_organization_invitation($1)", [
        invitation.token,
      ]),
    ).toBe(org.organization_id);
    await denied(
      "select public.accept_organization_invitation($1)",
      [invitation.token],
      "22023",
    );
    await asUser(bob, org.organization_id);
    expect(
      await scalar(
        "select membership_type from public.organization_memberships where person_id=public.current_person_id()",
      ),
    ).toBe("freelancer");
  });
  it("requires confirmed email and rejects expired and revoked tokens", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    const i = await invite(org.organization_id);
    await db.exec("reset role");
    await db.query(
      "update auth.users set email_confirmed_at=null where id=$1",
      [bob],
    );
    await asUser(bob);
    await denied(
      "select public.accept_organization_invitation($1)",
      [i.token],
      "42501",
    );
    await db.exec("reset role");
    await db.query(
      "update auth.users set email_confirmed_at=now() where id=$1",
      [bob],
    );
    await db.query(
      "update public.organization_invitations set expires_at=now()-interval '1 second' where id=$1",
      [i.invitation_id],
    );
    await asUser(bob);
    await denied(
      "select public.accept_organization_invitation($1)",
      [i.token],
      "22023",
    );
    await asUser(alice, org.organization_id);
    const j = await invite(org.organization_id);
    await db.query("select public.revoke_organization_invitation($1,$2)", [
      org.organization_id,
      j.invitation_id,
    ]);
    await asUser(bob);
    await denied(
      "select public.accept_organization_invitation($1)",
      [j.token],
      "22023",
    );
  });
  it("does not overwrite or elevate an existing membership via a second invitation", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    const i = await invite(org.organization_id);
    const j = await invite(org.organization_id, "bob@example.com", true);
    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      i.token,
    ]);
    await denied(
      "select public.accept_organization_invitation($1)",
      [j.token],
      "23505",
    );
    await asUser(bob, org.organization_id);
    expect(
      await scalar<boolean>(
        "select is_admin from public.organization_memberships where person_id=public.current_person_id()",
      ),
    ).toBe(false);
  });
  it("denies ordinary members admin RPCs", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    const i = await invite(org.organization_id);
    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      i.token,
    ]);
    await asUser(bob, org.organization_id);
    await denied(
      "select public.change_organization_membership($1,$2,'member',true,false)",
      [org.organization_id, org.membership_id],
      "42501",
    );
    await denied(
      "select public.create_organization_invitation($1,'eve@example.com','member',true)",
      [org.organization_id],
      "42501",
    );
  });
  it("protects the last admin; allows multiple admins independently of membership type", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    await denied(
      "select public.change_organization_membership($1,$2,'member',false,false)",
      [org.organization_id, org.membership_id],
      "23514",
    );
    await denied(
      "select public.change_organization_membership($1,$2,'member',true,true)",
      [org.organization_id, org.membership_id],
      "23514",
    );
    const i = await invite(org.organization_id, "bob@example.com", true);
    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      i.token,
    ]);
    await asUser(alice, org.organization_id);
    expect(
      await scalar<number>(
        "select count(*)::int from public.organization_memberships where is_admin",
      ),
    ).toBe(2);
    await db.query(
      "select public.change_organization_membership($1,$2,'freelancer',false,false)",
      [org.organization_id, org.membership_id],
    );
    expect(
      await scalar<boolean>("select public.is_organization_admin($1)", [
        org.organization_id,
      ]),
    ).toBe(false);
  });
  it("revocation immediately invalidates a stale organization header", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);
    const i = await invite(org.organization_id);
    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      i.token,
    ]);
    await asUser(bob, org.organization_id);
    const member = await scalar(
      "select id from public.organization_memberships where person_id=public.current_person_id()",
    );
    await asUser(alice, org.organization_id);
    await db.query(
      "select public.change_organization_membership($1,$2,'freelancer',false,true)",
      [org.organization_id, member],
    );
    await asUser(bob, org.organization_id);
    expect(
      await scalar<number>("select count(*)::int from public.organizations"),
    ).toBe(0);
    expect(await scalar("select public.active_organization_id()")).toBeNull();
  });
  it("cannot mutate a membership from another organization", async () => {
    const a = await create("A");
    const b = await create("B");
    await asUser(alice, a.organization_id);
    await denied(
      "select public.change_organization_membership($1,$2,'member',false,true)",
      [a.organization_id, b.membership_id],
      "22023",
    );
    await denied(
      "select public.change_organization_membership($1,$2,'member',false,true)",
      [b.organization_id, b.membership_id],
      "42501",
    );
  });
});

describe("work authorization and tenancy", () => {
    it("allows a Person with no Organization membership to participate in and view a Work", async () => {
  const org = await create();

  await asUser(alice, org.organization_id);
  const work = await createWork(org.organization_id);

  // Eve has no membership in the Organization.
  await addParticipation(work, eve);

  await asUser(eve);

  expect(
    await scalar<number>(
      "select count(*)::int from public.current_person_organizations()",
    ),
  ).toBe(0);

  expect(
    await scalar<boolean>("select public.is_work_participant($1)", [work]),
  ).toBe(true);

  expect(
    await scalar<boolean>("select public.can_view_work($1)", [work]),
  ).toBe(true);

  expect(
    await scalar<boolean>("select public.can_manage_work($1)", [work]),
  ).toBe(false);

  expect(
    await scalar<number>(
      "select count(*)::int from public.works where id=$1",
      [work],
    ),
  ).toBe(1);
});
it("does not grant Work authority merely because a Person is the organizer", async () => {
  const org = await create();

  const bobPerson = await personId(bob);

  await asUser(alice, org.organization_id);

  const work = await createWork(org.organization_id, {
    organizerPersonId: bobPerson,
  });

  await asUser(bob);

  expect(
    await scalar<boolean>("select public.can_manage_work($1)", [work]),
  ).toBe(false);

  expect(
    await scalar<boolean>("select public.can_view_work($1)", [work]),
  ).toBe(false);

  await addParticipation(work, bob);

  await asUser(bob);

  expect(
    await scalar<boolean>("select public.can_view_work($1)", [work]),
  ).toBe(true);

  expect(
    await scalar<boolean>("select public.can_manage_work($1)", [work]),
  ).toBe(false);
});

  it("allows Organization admins to create and manage Works", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(true);

    expect(
      await scalar<number>(
        "select count(*)::int from public.works where id=$1",
        [work],
      ),
    ).toBe(1);
  });

  it("lets creators manage their Works without granting Organization admins automatic authority", async () => {
    const org = await create();

    await asUser(alice, org.organization_id);
    const bobInvite = await invite(org.organization_id);

    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      bobInvite.token,
    ]);

    await asUser(bob, org.organization_id);
    const work = await createWork(org.organization_id);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(true);

    await asUser(alice, org.organization_id);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(false);

    expect(
      await scalar<boolean>("select public.can_view_work($1)", [work]),
    ).toBe(false);
  });

  it("denies Work creation to an ordinary Member", async () => {
    const org = await create();

    await asUser(alice, org.organization_id);

    const invitation = (
      await db.query<{ token: string }>(
        "select * from public.create_organization_invitation($1,$2,'member',false)",
        [org.organization_id, "bob@example.com"],
      )
    ).rows[0]!;

    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      invitation.token,
    ]);

    await asUser(bob, org.organization_id);

    await denied(
      `select public.create_work(
        $1,
        'Forbidden Work',
        'performance',
        '2026-09-20T18:00:00Z',
        '2026-09-21T03:00:00Z',
        'Atlantic/Azores',
        null,
        null
      )`,
      [org.organization_id],
      "42501",
    );
  });

  it("lets a Freelancer participant view but not manage another person's Work", async () => {
    const org = await create();

    await asUser(alice, org.organization_id);

    const bobInvite = await invite(org.organization_id);
    const eveInvite = await invite(org.organization_id, "eve@example.com");

    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      bobInvite.token,
    ]);

    await asUser(eve);
    await db.query("select public.accept_organization_invitation($1)", [
      eveInvite.token,
    ]);

    await asUser(bob, org.organization_id);
    const work = await createWork(org.organization_id);

    await addParticipation(work, eve);

    await asUser(eve, org.organization_id);

    expect(
      await scalar<boolean>("select public.is_work_participant($1)", [work]),
    ).toBe(true);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(false);

    expect(
      await scalar<number>(
        "select count(*)::int from public.works where id=$1",
        [work],
      ),
    ).toBe(1);
  });

  it("lets a Member participant view but not manage the Work", async () => {
    const org = await create();

    await asUser(alice, org.organization_id);

    const invitation = (
      await db.query<{ token: string }>(
        "select * from public.create_organization_invitation($1,$2,'member',false)",
        [org.organization_id, "bob@example.com"],
      )
    ).rows[0]!;

    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      invitation.token,
    ]);

    await asUser(alice, org.organization_id);
    const work = await createWork(org.organization_id);

    await addParticipation(work, bob);

    await asUser(bob, org.organization_id);

    expect(
      await scalar<boolean>("select public.can_view_work($1)", [work]),
    ).toBe(true);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(false);

    expect(
      await scalar<number>(
        "select count(*)::int from public.works where id=$1",
        [work],
      ),
    ).toBe(1);
  });

  it("hides Works from unrelated Members and Freelancers", async () => {
    const org = await create();

    await asUser(alice, org.organization_id);

    const bobInvite = await invite(org.organization_id);
    const eveInvitation = (
      await db.query<{ token: string }>(
        "select * from public.create_organization_invitation($1,$2,'member',false)",
        [org.organization_id, "eve@example.com"],
      )
    ).rows[0]!;

    await asUser(bob);
    await db.query("select public.accept_organization_invitation($1)", [
      bobInvite.token,
    ]);

    await asUser(eve);
    await db.query("select public.accept_organization_invitation($1)", [
      eveInvitation.token,
    ]);

    await asUser(bob, org.organization_id);
    const work = await createWork(org.organization_id);

    await asUser(eve, org.organization_id);

    expect(
      await scalar<boolean>("select public.can_view_work($1)", [work]),
    ).toBe(false);

    expect(
      await scalar<number>(
        "select count(*)::int from public.works where id=$1",
        [work],
      ),
    ).toBe(0);

    await asUser(alice, org.organization_id);

    expect(
      await scalar<number>(
        "select count(*)::int from public.works where id=$1",
        [work],
      ),
    ).toBe(0);
  });

  it("does not make the Work creator a participant automatically", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    expect(
      await scalar<number>(
        "select count(*)::int from public.work_participations where work_id=$1",
        [work],
      ),
    ).toBe(0);
  });

it("requires Organization context for creation but not for creator access afterwards", async () => {
  const org = await create();

  await asUser(alice, org.organization_id);
  const work = await createWork(org.organization_id);

  // Work authorization is autonomous after creation.
  await asUser(alice);

  expect(
    await scalar<boolean>("select public.can_manage_work($1)", [work]),
  ).toBe(true);

  expect(
    await scalar<boolean>("select public.can_view_work($1)", [work]),
  ).toBe(true);

  expect(
    await scalar<number>(
      "select count(*)::int from public.works where id=$1",
      [work],
    ),
  ).toBe(1);

  // But creating another Work still requires a valid authorizing Organization.
  await denied(
    `select public.create_work(
      $1,
      'No context',
      'performance',
      '2026-09-20T18:00:00Z',
      '2026-09-21T03:00:00Z',
      'Atlantic/Azores',
      null,
      null
    )`,
    [org.organization_id],
    "42501",
  );

  // An unrelated Person gets no access.
  await asUser(bob, org.organization_id);

  expect(await scalar("select public.active_organization_id()")).toBeNull();

  expect(
    await scalar<boolean>("select public.can_view_work($1)", [work]),
  ).toBe(false);

  expect(
    await scalar<number>(
      "select count(*)::int from public.works where id=$1",
      [work],
    ),
  ).toBe(0);
});

  it("denies anonymous Work access and creation", async () => {
    const org = await create();

    await db.exec("reset role; set role anon");

    await denied("select * from public.works", [], "42501");

    await denied(
      `select public.create_work(
        $1,
        'Anonymous',
        'performance',
        '2026-09-20T18:00:00Z',
        '2026-09-21T03:00:00Z',
        'Atlantic/Azores',
        null,
        null
      )`,
      [org.organization_id],
      "42501",
    );
  });
});

describe("work domain integrity", () => {
  it("rejects invalid Work time windows", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    await denied(
      `select public.create_work(
        $1,
        'Invalid',
        'performance',
        '2026-09-21T03:00:00Z',
        '2026-09-20T18:00:00Z',
        'Atlantic/Azores',
        null,
        null
      )`,
      [org.organization_id],
      "22023",
    );
  });

  it("rejects invalid timezones", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    await denied(
      `select public.create_work(
        $1,
        'Invalid timezone',
        'performance',
        '2026-09-20T18:00:00Z',
        '2026-09-21T03:00:00Z',
        'Mars/Olympus',
        null,
        null
      )`,
      [org.organization_id],
      "22023",
    );
  });

  it("rejects simultaneous Person and Organization organizers", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const alicePerson = await scalar<string>(
      "select public.current_person_id()",
    );

    await denied(
      `select public.create_work(
        $1,
        'Two organizers',
        'performance',
        '2026-09-20T18:00:00Z',
        '2026-09-21T03:00:00Z',
        'Atlantic/Azores',
        $2,
        $1
      )`,
      [org.organization_id, alicePerson],
      "22023",
    );
  });

  it("requires Work Blocks to stay inside the Work window", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    await db.exec("reset role");

    await denied(
      `insert into public.work_blocks(
        work_id,
        block_type,
        label,
        starts_at,
        ends_at
      ) values(
        $1,
        'setup',
        'Early setup',
        '2026-09-20T17:00:00Z',
        '2026-09-20T19:00:00Z'
      )`,
      [work],
      "23514",
    );
  });

  it("allows overlapping Work Blocks", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    await db.exec("reset role");

    await db.query(
      `insert into public.work_blocks(
        work_id,
        block_type,
        label,
        starts_at,
        ends_at
      ) values
        ($1,'setup','Stage setup','2026-09-20T18:00:00Z','2026-09-20T21:00:00Z'),
        ($1,'technical','System tuning','2026-09-20T19:00:00Z','2026-09-20T22:00:00Z')`,
      [work],
    );

    expect(
      await scalar<number>(
        "select count(*)::int from public.work_blocks where work_id=$1",
        [work],
      ),
    ).toBe(2);
  });

  it("prevents the same Person from having duplicate Participations", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const alicePerson = await scalar<string>(
      "select public.current_person_id()",
    );

    await db.exec("reset role");

    await db.query(
      "insert into public.work_participations(work_id,person_id) values($1,$2)",
      [work, alicePerson],
    );

    await denied(
      "insert into public.work_participations(work_id,person_id) values($1,$2)",
      [work, alicePerson],
      "23505",
    );
  });
});

describe("work management RPCs", () => {
  it("lets the Work creator add an external Person as participant", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const evePerson = await personId(eve);

    const participation = await scalar<string>(
      "select public.add_work_participant($1,$2)",
      [work, evePerson],
    );

    expect(participation).toBeTruthy();

    await asUser(eve);

    expect(
      await scalar<boolean>("select public.can_view_work($1)", [work]),
    ).toBe(true);

    expect(
      await scalar<boolean>("select public.can_manage_work($1)", [work]),
    ).toBe(false);
  });

  it("does not let a participant add another participant", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);
    const evePerson = await personId(eve);

    await db.query("select public.add_work_participant($1,$2)", [
      work,
      bobPerson,
    ]);

    await asUser(bob);

    await denied(
      "select public.add_work_participant($1,$2)",
      [work, evePerson],
      "42501",
    );
  });

  it("supports multiple Functions on the same Participation", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);

    const participation = await scalar<string>(
      "select public.add_work_participant($1,$2)",
      [work, bobPerson],
    );

    await db.query(
      "select public.add_work_participation_function($1,$2,$3)",
      [work, participation, "Guitar"],
    );

    await db.query(
      "select public.add_work_participation_function($1,$2,$3)",
      [work, participation, "Vocals"],
    );

    await asUser(bob);

    expect(
      await scalar<number>(
        `select count(*)::int
         from public.work_participation_functions
         where work_participation_id=$1`,
        [participation],
      ),
    ).toBe(2);
  });

  it("creates and assigns Work Blocks to a participant", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);

    const participation = await scalar<string>(
      "select public.add_work_participant($1,$2)",
      [work, bobPerson],
    );

    const soundcheck = await scalar<string>(
      `select public.create_work_block(
        $1,
        'soundcheck',
        'Soundcheck',
        '2026-09-20T19:00:00Z',
        '2026-09-20T20:00:00Z'
      )`,
      [work],
    );

    await db.query(
      "select public.assign_work_participant_to_block($1,$2,$3)",
      [work, soundcheck, participation],
    );

    await asUser(bob);

    expect(
      await scalar<number>(
        `select count(*)::int
         from public.work_block_participations
         where work_block_id=$1
           and work_participation_id=$2`,
        [soundcheck, participation],
      ),
    ).toBe(1);
  });

  it("prevents participants from mutating Work Blocks", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);

    await db.query("select public.add_work_participant($1,$2)", [
      work,
      bobPerson,
    ]);

    await asUser(bob);

    await denied(
      `select public.create_work_block(
        $1,
        'soundcheck',
        'Unauthorized Soundcheck',
        '2026-09-20T19:00:00Z',
        '2026-09-20T20:00:00Z'
      )`,
      [work],
      "42501",
    );
  });

  it("keeps Work Blocks inside the global Work window through RPCs", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    await denied(
      `select public.create_work_block(
        $1,
        'setup',
        'Too Early',
        '2026-09-20T17:00:00Z',
        '2026-09-20T19:00:00Z'
      )`,
      [work],
      "23514",
    );
  });

  it("does not allow assignments across different Works", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const workA = await createWork(org.organization_id, {
      title: "Work A",
    });

    const workB = await createWork(org.organization_id, {
      title: "Work B",
    });

    const bobPerson = await personId(bob);

    const participationA = await scalar<string>(
      "select public.add_work_participant($1,$2)",
      [workA, bobPerson],
    );

    const blockB = await scalar<string>(
      `select public.create_work_block(
        $1,
        'performance',
        'Show B',
        '2026-09-20T22:00:00Z',
        '2026-09-21T01:00:00Z'
      )`,
      [workB],
    );

    await denied(
      "select public.assign_work_participant_to_block($1,$2,$3)",
      [workB, blockB, participationA],
      "22023",
    );
  });

  it("removing a Participation cascades Functions and Block assignments", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);

    const participation = await scalar<string>(
      "select public.add_work_participant($1,$2)",
      [work, bobPerson],
    );

    await db.query(
      "select public.add_work_participation_function($1,$2,$3)",
      [work, participation, "Sound Engineer"],
    );

    const block = await scalar<string>(
      `select public.create_work_block(
        $1,
        'technical',
        'Technical setup',
        '2026-09-20T18:00:00Z',
        '2026-09-20T20:00:00Z'
      )`,
      [work],
    );

    await db.query(
      "select public.assign_work_participant_to_block($1,$2,$3)",
      [work, block, participation],
    );

    await db.query(
      "select public.remove_work_participant($1,$2)",
      [work, participation],
    );

    await db.exec("reset role");

    expect(
      await scalar<number>(
        `select count(*)::int
         from public.work_participation_functions
         where work_participation_id=$1`,
        [participation],
      ),
    ).toBe(0);

    expect(
      await scalar<number>(
        `select count(*)::int
         from public.work_block_participations
         where work_participation_id=$1`,
        [participation],
      ),
    ).toBe(0);
  });

  it("prevents shrinking the Work window over existing Blocks", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);

    await db.query(
      `select public.create_work_block(
        $1,
        'performance',
        'Show',
        '2026-09-20T22:00:00Z',
        '2026-09-21T01:00:00Z'
      )`,
      [work],
    );

    await denied(
      `select public.update_work(
        $1,
        'Summer Festival',
        'performance',
        'scheduled',
        '2026-09-20T18:00:00Z',
        '2026-09-20T23:00:00Z',
        'Atlantic/Azores',
        null,
        null
      )`,
      [work],
      "23514",
    );
  });

  it("does not let a participant update the Work", async () => {
    const org = await create();
    await asUser(alice, org.organization_id);

    const work = await createWork(org.organization_id);
    const bobPerson = await personId(bob);

    await db.query("select public.add_work_participant($1,$2)", [
      work,
      bobPerson,
    ]);

    await asUser(bob);

    await denied(
      `select public.update_work(
        $1,
        'Hijacked',
        'performance',
        'scheduled',
        '2026-09-20T18:00:00Z',
        '2026-09-21T03:00:00Z',
        'Atlantic/Azores',
        null,
        null
      )`,
      [work],
      "42501",
    );
  });
});
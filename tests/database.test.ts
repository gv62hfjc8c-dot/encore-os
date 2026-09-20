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

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const config = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], {
    encoding: "utf8",
  }),
);

const url = config.API_URL;
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(url).hostname),
  "Only local Supabase is allowed",
);

const options = {
  auth: { persistSession: false, autoRefreshToken: false },
};

const admin = createClient(url, config.SERVICE_ROLE_KEY, options);
const users = [];
const organizations = [];
const works = [];

async function createUser() {
  const client = createClient(url, config.ANON_KEY, options);
  const { data, error } = await client.auth.signUp({
    email: `work-${crypto.randomUUID()}@example.com`,
    password: `Strong-${crypto.randomUUID()}!`,
  });
  assert.ifError(error);
  assert.ok(data.session);
  users.push(data.user.id);
  return client;
}

function rpc(client, name, args, organizationId) {
  let request = client.rpc(name, args);
  if (organizationId) {
    request = request.setHeader(
      "x-organization-id",
      organizationId,
    );
  }
  return request;
}

test("Work: real HTTP authorization and participation", async () => {
  try {
    const creator = await createUser();
    const participant = await createUser();
    const outsider = await createUser();

    const organization = await rpc(
      creator,
      "create_organization",
      { p_organization_name: "Work integration test" },
    );
    assert.ifError(organization.error);

    const orgId = organization.data[0].organization_id;
    organizations.push(orgId);

    const args = {
      p_authorizing_organization_id: orgId,
      p_title: "Integration performance",
      p_work_type: "performance",
      p_starts_at: "2026-10-28T18:00:00Z",
      p_ends_at: "2026-10-28T23:00:00Z",
      p_timezone: "Atlantic/Azores",
    };

    const missingContext = await rpc(
      creator, "create_work", args,
    );
    assert.equal(missingContext.error?.code, "42501");

    const forgedContext = await rpc(
      outsider, "create_work", args, orgId,
    );
    assert.equal(forgedContext.error?.code, "42501");

    const created = await rpc(
      creator, "create_work", args, orgId,
    );
    assert.ifError(created.error);

    const workId = created.data;
    assert.ok(workId);
    works.push(workId);

    const ownerRead = await creator
      .from("works")
      .select("id,title")
      .eq("id", workId);

    assert.ifError(ownerRead.error);
    assert.equal(ownerRead.data.length, 1);

    const outsiderRead = await outsider
      .from("works")
      .select("id")
      .eq("id", workId);

    assert.ifError(outsiderRead.error);
    assert.equal(outsiderRead.data.length, 0);

    const person = await participant
      .from("persons")
      .select("id")
      .single();

    assert.ifError(person.error);

    const added = await rpc(
      creator,
      "add_work_participant",
      {
        p_work_id: workId,
        p_person_id: person.data.id,
      },
    );
    assert.ifError(added.error);

    const participantRead = await participant
      .from("works")
      .select("id")
      .eq("id", workId);

    assert.ifError(participantRead.error);
    assert.equal(participantRead.data.length, 1);

    const directWrite = await participant
      .from("works")
      .update({ title: "Unauthorized change" })
      .eq("id", workId);

    assert.ok(directWrite.error);

    const unauthorizedBlock = await rpc(
      participant,
      "create_work_block",
      {
        p_work_id: workId,
        p_block_type: "performance",
        p_label: "Unauthorized block",
        p_starts_at: "2026-10-28T20:00:00Z",
        p_ends_at: "2026-10-28T21:00:00Z",
      },
    );

    assert.equal(unauthorizedBlock.error?.code, "42501");

    const ownerBlock = await rpc(
      creator,
      "create_work_block",
      {
        p_work_id: workId,
        p_block_type: "performance",
        p_label: "Main performance",
        p_starts_at: "2026-10-28T20:00:00Z",
        p_ends_at: "2026-10-28T21:00:00Z",
      },
    );

    assert.ifError(ownerBlock.error);
    assert.ok(ownerBlock.data);
  } finally {
    if (works.length) {
      const { error } = await admin
        .from("works")
        .delete()
        .in("id", works);
      assert.ifError(error);
    }

    if (organizations.length) {
      const { error } = await admin
        .from("organizations")
        .delete()
        .in("id", organizations);
      assert.ifError(error);
    }

    for (const id of users) {
      const { error } = await admin.auth.admin.deleteUser(id);
      assert.ifError(error);
    }
  }
});

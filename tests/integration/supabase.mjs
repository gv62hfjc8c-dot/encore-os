import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const config = JSON.parse(
  execFileSync("supabase", ["status", "-o", "json"], { encoding: "utf8" }),
);
const url = config.API_URL;
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(url).hostname),
  "Only a disposable local Supabase instance is allowed",
);
const key = config.ANON_KEY;
const admin = createClient(url, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const ids = [];
const organizations = [];
async function user(label) {
  const email = `encore-${label}-${crypto.randomUUID()}@example.com`;
  const client = createClient(url, key, options);
  const { data, error } = await client.auth.signUp({
    email,
    password: `Strong-${crypto.randomUUID()}!`,
  });
  assert.ifError(error);
  assert.ok(data.session);
  ids.push(data.user.id);
  return { client, email, id: data.user.id };
}
async function rpc(client, name, args, org) {
  let call = client.rpc(name, args);
  if (org) call = call.setHeader("x-organization-id", org);
  return call;
}
test("real Auth → PostgREST → RLS → invitation → revocation", async () => {
  try {
    const a = await user("a");
    const b = await user("b");
    const outsider = await user("outsider");
    const profile = await a.client.from("persons").select("*");
    assert.ifError(profile.error);
    assert.equal(profile.data.length, 1);
    const create = await rpc(a.client, "create_organization", {
      p_organization_name: "HTTP tenant A",
    });
    assert.ifError(create.error);
    const org = create.data[0].organization_id;
    organizations.push(org);
    const second = await rpc(b.client, "create_organization", {
      p_organization_name: "HTTP tenant B",
    });
    assert.ifError(second.error);
    const other = second.data[0].organization_id;
    organizations.push(other);
    const forgery = await outsider.client
      .from("organizations")
      .select("*")
      .setHeader("x-organization-id", org);
    assert.ifError(forgery.error);
    assert.deepEqual(forgery.data, []);
    const noContext = await a.client.from("organizations").select("*");
    assert.ifError(noContext.error);
    assert.deepEqual(noContext.data, []);
    const invitation = await rpc(
      a.client,
      "create_organization_invitation",
      {
        p_organization_id: org,
        p_email: b.email,
        p_membership_type: "freelancer",
        p_is_admin: true,
      },
      org,
    );
    assert.ifError(invitation.error);
    const token = invitation.data[0].token;
    assert.ok(
      (
        await rpc(outsider.client, "accept_organization_invitation", {
          p_token: token,
        })
      ).error,
    );
    const accepted = await rpc(b.client, "accept_organization_invitation", {
      p_token: token,
    });
    assert.ifError(accepted.error);
    assert.ok(
      (
        await rpc(b.client, "accept_organization_invitation", {
          p_token: token,
        })
      ).error,
    );
    const discover = await rpc(b.client, "current_person_organizations", {});
    assert.ifError(discover.error);
    assert.equal(discover.data.length, 2);
    const scope = await b.client
      .from("organizations")
      .select("*")
      .setHeader("x-organization-id", org);
    assert.ifError(scope.error);
    assert.equal(scope.data.length, 1);
    assert.equal(scope.data[0].id, org);
    const rejectedCrossWrite = await rpc(
      b.client,
      "change_organization_membership",
      {
        p_organization_id: other,
        p_membership_id: second.data[0].membership_id,
        p_membership_type: "member",
        p_is_admin: false,
        p_remove: true,
      },
      org,
    );
    assert.ok(rejectedCrossWrite.error);
    const bm = discover.data.find(
      (o) => o.organization_id === org,
    ).membership_id;
    const remove = await rpc(
      a.client,
      "change_organization_membership",
      {
        p_organization_id: org,
        p_membership_id: bm,
        p_membership_type: "freelancer",
        p_is_admin: true,
        p_remove: true,
      },
      org,
    );
    assert.ifError(remove.error);
    const stale = await b.client
      .from("organizations")
      .select("*")
      .setHeader("x-organization-id", org);
    assert.ifError(stale.error);
    assert.deepEqual(stale.data, []);
    const anonymous = createClient(url, key, options);
    assert.ok(
      (
        await rpc(anonymous, "create_organization", {
          p_organization_name: "forbidden",
        })
      ).error,
    );
  } finally {
    if (organizations.length)
      await admin.from("organizations").delete().in("id", organizations);
    for (const id of ids) await admin.auth.admin.deleteUser(id);
  }
});

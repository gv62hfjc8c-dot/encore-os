import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Person = Database["public"]["Tables"]["persons"]["Row"];

type OrganizationContextRow =
  Database["public"]["Functions"]["current_person_organizations"]["Returns"][number];

export type OrganizationWithMembership = {
  id: OrganizationContextRow["organization_id"];
  name: OrganizationContextRow["organization_name"];
  membership: {
    id: OrganizationContextRow["membership_id"];
    membership_type: OrganizationContextRow["membership_type"];
    is_admin: OrganizationContextRow["is_admin"];
  };
};

export async function getCurrentPerson(): Promise<Person | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyOrganizations(): Promise<
  OrganizationWithMembership[]
> {
  const { data, error } = await supabase.rpc("current_person_organizations");

  if (error) {
    throw error;
  }

  return (data ?? []).map((organization) => ({
    id: organization.organization_id,
    name: organization.organization_name,
    membership: {
      id: organization.membership_id,
      membership_type: organization.membership_type,
      is_admin: organization.is_admin,
    },
  }));
}

export async function createOrganization(
  name: string,
): Promise<OrganizationWithMembership> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Organization name cannot be empty.");
  }

  const { data, error } = await supabase.rpc("create_organization", {
    p_organization_name: trimmedName,
  });

  if (error) {
    throw error;
  }

  const created = data?.[0];

  if (!created) {
    throw new Error("Organization could not be created.");
  }

  return {
    id: created.organization_id,
    name: created.organization_name,
    membership: {
      id: created.membership_id,
      membership_type: "member",
      is_admin: true,
    },
  };
}
// Every organizational request captures its context at construction time.
// No shared mutable client header can switch an in-flight request's tenant.
export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await supabase
    .from("organization_memberships")
    .select("*")
    .eq("organization_id", organizationId)
    .setHeader("x-organization-id", organizationId);
  if (error) throw error;
  return data;
}
export async function renameOrganization(organizationId: string, name: string) {
  const { data, error } = await supabase
    .from("organizations")
    .update({ name: name.trim() })
    .eq("id", organizationId)
    .select("id")
    .setHeader("x-organization-id", organizationId);
  if (error) throw error;
  if (!data?.length)
    throw new Error("Sem permissão para alterar esta organização.");
}
export async function inviteToOrganization(
  organizationId: string,
  email: string,
  type: "member" | "freelancer",
  admin: boolean,
) {
  const { data, error } = await supabase
    .rpc("create_organization_invitation", {
      p_organization_id: organizationId,
      p_email: email,
      p_membership_type: type,
      p_is_admin: admin,
    })
    .setHeader("x-organization-id", organizationId);
  if (error) throw error;
  if (!data?.[0]) throw new Error("Não foi possível criar o convite.");
  return data[0];
}
export async function acceptInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_organization_invitation", {
    p_token: token.trim(),
  });
  if (error) throw error;
  return data;
}
export async function revokeInvitation(
  organizationId: string,
  invitationId: string,
) {
  const { error } = await supabase
    .rpc("revoke_organization_invitation", {
      p_organization_id: organizationId,
      p_invitation_id: invitationId,
    })
    .setHeader("x-organization-id", organizationId);
  if (error) throw error;
}
export async function changeMembership(
  organizationId: string,
  membershipId: string,
  type: "member" | "freelancer",
  admin: boolean,
  remove = false,
) {
  const { error } = await supabase
    .rpc("change_organization_membership", {
      p_organization_id: organizationId,
      p_membership_id: membershipId,
      p_membership_type: type,
      p_is_admin: admin,
      p_remove: remove,
    })
    .setHeader("x-organization-id", organizationId);
  if (error) throw error;
}

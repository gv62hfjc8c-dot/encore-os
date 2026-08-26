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
  const { data, error } = await supabase.rpc(
    "current_person_organizations",
  );

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
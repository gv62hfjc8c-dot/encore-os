import { supabase } from "@/integrations/supabase/client";

export type CreateWorkInput = {
  title: string;
  workType: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  organizerPersonId?: string;
  organizerOrganizationId?: string;
};

/**
 * Work visibility is Person/Work scoped, not tenant-owned.
 * PostgreSQL RLS determines which records are visible.
 */
export async function getVisibleWorks() {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Organization context authorizes creation only.
 * The resulting Work remains autonomous.
 */
export async function createWork(
  organizationId: string,
  input: CreateWorkInput,
): Promise<string> {
  if (!organizationId) {
    throw new Error(
      "É necessária uma organização ativa para criar um Work.",
    );
  }

  const { data, error } = await supabase
    .rpc("create_work", {
      p_authorizing_organization_id: organizationId,
      p_title: input.title.trim(),
      p_work_type: input.workType.trim(),
      p_starts_at: input.startsAt,
      p_ends_at: input.endsAt,
      p_timezone: input.timezone,
      ...(input.organizerPersonId
        ? { p_organizer_person_id: input.organizerPersonId }
        : {}),
      ...(input.organizerOrganizationId
        ? {
            p_organizer_organization_id:
              input.organizerOrganizationId,
          }
        : {}),
    })
    .setHeader("x-organization-id", organizationId);

  if (error) throw error;
  if (!data) throw new Error("Não foi possível criar o Work.");

  return data;
}

/**
 * Adds a global Person to a Work.
 * Authorization is enforced by the database RPC.
 */
export async function addWorkParticipant(
  workId: string,
  personId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "add_work_participant",
    {
      p_work_id: workId,
      p_person_id: personId.trim(),
    },
  );

  if (error) throw error;
  if (!data) {
    throw new Error("Não foi possível adicionar o participante.");
  }

  return data;
}


/**
 * The Espetáculos area is a performance-only view of global Works.
 * RLS on works controls Person-scoped visibility.
 */
export async function getVisiblePerformances() {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("work_type", "performance")
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Read a single performance through the same Person-scoped RLS as the list. */
export async function getVisiblePerformanceById(id: string) {
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .eq("work_type", "performance")
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Existing Work-scoped RPC enforces creator-only management. */
export async function updatePerformance(
  work: NonNullable<Awaited<ReturnType<typeof getVisiblePerformanceById>>>,
  changes: { title: string; startsAt: string; endsAt: string },
) {
  if (!changes.title.trim() || changes.title.trim().length > 160) {
    throw new Error("O título deve ter entre 1 e 160 caracteres.");
  }
  if (Date.parse(changes.endsAt) <= Date.parse(changes.startsAt)) {
    throw new Error("O fim deve ser posterior ao início.");
  }

  const { error } = await supabase.rpc("update_work", {
    p_work_id: work.id,
    p_title: changes.title.trim(),
    p_work_type: work.work_type,
    p_status: work.status,
    p_starts_at: changes.startsAt,
    p_ends_at: changes.endsAt,
    p_timezone: work.timezone,
    p_organizer_person_id: work.organizer_person_id ?? undefined,
    p_organizer_organization_id: work.organizer_organization_id ?? undefined,
  });

  if (error) throw error;
}

export async function getWorkBlocks(workId: string) {
  const { data, error } = await supabase
    .from("work_blocks")
    .select("*")
    .eq("work_id", workId)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getWorkParticipationCount(workId: string) {
  const { count, error } = await supabase
    .from("work_participations")
    .select("id", { count: "exact", head: true })
    .eq("work_id", workId);

  if (error) throw error;
  return count ?? 0;
}


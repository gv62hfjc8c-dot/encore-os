import { supabase } from "@/integrations/supabase/client";

export type AppearancePreferences = { theme: "dark" | "light"; reduce_motion: boolean };
export const defaultPreferences: AppearancePreferences = { theme: "dark", reduce_motion: false };

export async function getPersonPreferences(personId: string): Promise<AppearancePreferences> {
  const { data, error } = await supabase
    .from("person_preferences")
    .select("theme,reduce_motion")
    .eq("person_id", personId)
    .maybeSingle();
  if (error) throw error;
  return data ? {
    theme: data.theme === "light" ? "light" : "dark",
    reduce_motion: data.reduce_motion,
  } : defaultPreferences;
}

export async function savePersonPreferences(personId: string, preferences: AppearancePreferences) {
  const { error } = await supabase
    .from("person_preferences")
    .upsert({ person_id: personId, ...preferences }, { onConflict: "person_id" });
  if (error) throw error;
}

export async function updateMyProfile(id: string, first_name: string, last_name: string) {
  const first = first_name.trim();
  const last = last_name.trim();
  if (first.length > 120 || last.length > 120) {
    throw new Error("Os nomes não podem ultrapassar 120 caracteres.");
  }
  const { data, error } = await supabase
    .from("persons")
    .update({ first_name: first || null, last_name: last || null })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  if (!data) throw new Error("Não foi possível atualizar o perfil.");
}

import { supabase } from "@/integrations/supabase/client";

/** Each notification belongs to a global Person; RLS always enforces recipient ownership. */
export async function getMyNotifications() {
  const { data, error } = await supabase
    .from("person_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("person_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) throw error;
}

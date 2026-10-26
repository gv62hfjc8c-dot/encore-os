import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIdentity } from "@/components/identity-context";
import { getPersonPreferences, savePersonPreferences, defaultPreferences, type AppearancePreferences } from "@/lib/person-settings";

export function AppearanceSettings() {
  const { person, session } = useIdentity();
  const queryClient = useQueryClient();
  const personId = person?.id;
  const queryKey = ["person-preferences", session?.user.id];
  const preferences = useQuery({
    queryKey,
    queryFn: () => getPersonPreferences(personId!),
    enabled: Boolean(personId),
  });
  const [draft, setDraft] = useState<AppearancePreferences>(defaultPreferences);
  useEffect(() => {
    if (preferences.data) setDraft(preferences.data);
  }, [preferences.data]);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!personId) throw new Error("Person indisponível.");
      await savePersonPreferences(personId, draft);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  if (preferences.isPending) return <p role="status" className="text-sm">A carregar preferências…</p>;
  if (preferences.isError) return <div role="alert" className="space-y-2 text-sm">
    Não foi possível consultar as preferências.
    <button onClick={() => void preferences.refetch()} className="ml-2 text-primary">Tentar novamente</button>
  </div>;

  return (
    <section className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Aparência pessoal</h2>
      <p className="text-sm text-muted-foreground">
        Estas preferências pertencem à sua Person e aplicam-se em qualquer Organization.
      </p>
      <label className="block text-sm">
        Tema
        <select value={draft.theme} onChange={(e) => setDraft((p) => ({
          ...p, theme: e.target.value as AppearancePreferences["theme"]
        }))} className="mt-1 block w-full rounded-lg border border-border bg-background p-2">
          <option value="dark">Escuro</option>
          <option value="light">Claro</option>
        </select>
      </label>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={draft.reduce_motion}
          onChange={(e) => setDraft((p) => ({ ...p, reduce_motion: e.target.checked }))} />
        Reduzir animações
      </label>
      {mutation.isError && <p role="alert" className="text-sm text-destructive">
        {mutation.error.message}
      </p>}
      {mutation.isSuccess && !mutation.isPending &&
        <p role="status" className="text-sm text-success">Preferências guardadas.</p>}
      <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {mutation.isPending ? "A guardar…" : "Guardar preferências"}
      </button>
    </section>
  );
}

export function ApplyAppearancePreferences() {
  const { session, person } = useIdentity();
  const prefs = useQuery({
    queryKey: ["person-preferences", session?.user.id],
    queryFn: () => getPersonPreferences(person!.id),
    enabled: Boolean(person && session),
  });

  useEffect(() => {
    const value = prefs.data ?? defaultPreferences;
    document.documentElement.classList.toggle("light", value.theme === "light");
    document.documentElement.classList.toggle("reduced-motion", value.reduce_motion);
    return () => {
      document.documentElement.classList.remove("light", "reduced-motion");
    };
  }, [prefs.data]);

  return null;
}

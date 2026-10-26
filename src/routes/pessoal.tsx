import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useIdentity } from "@/components/identity-context";
import { acceptWorkInvitation } from "@/lib/work";
import { updateMyProfile } from "@/lib/person-settings";

export const Route = createFileRoute("/pessoal")({
  ssr: false,
  component: Personal,
});

function Personal() {
  const { person, session } = useIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const mutation = useMutation({
    mutationFn: (value: string) => acceptWorkInvitation(value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      setToken("");
      void navigate({ to: "/trabalhos" });
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) return;
    mutation.mutate(token.trim());
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold">Espaço pessoal</h1>
      <p>{person?.first_name || session?.user.email}</p>
      <p>
        A sua Person é global. Pode participar em várias organizações ou
        continuar sem nenhuma.
      </p>

      <EditPersonalProfile />

      <div className="max-w-xl rounded-lg border border-border p-4">
        <h2 className="font-medium">Aceitar convite para um trabalho</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Um gestor pode partilhar consigo um código de convite. O trabalho só
          ficará visível após a aceitação com o email confirmado correspondente.
        </p>
        <form onSubmit={submit} className="mt-3 space-y-3">
          <label className="block text-sm">
            Código de convite
            <input
              required
              value={token}
              onChange={(event) => {
                setToken(event.target.value);
                mutation.reset();
              }}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-border bg-background p-2"
            />
          </label>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? "A aceitar..." : "Aceitar convite"}
          </button>
        </form>
      </div>

      {person && (
        <div className="max-w-xl rounded-lg border border-border p-4">
          <p className="mb-2 text-sm font-medium">Identificador da Person</p>
          <p className="mb-2 text-xs text-muted-foreground">
            Identificador técnico de desenvolvimento. Não é palavra-passe nem token de autenticação.
          </p>
          <code className="block break-all text-sm">{person.id}</code>
        </div>
      )}
      <Link to="/onboarding" className="text-primary underline">Criar organização ou aceitar convite organizacional</Link>
    </section>
  );
}

function EditPersonalProfile() {
  const { person, refresh } = useIdentity();
  const [first, setFirst] = useState(person?.first_name ?? "");
  const [last, setLast] = useState(person?.last_name ?? "");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!person) throw new Error("Person indisponível.");
      await updateMyProfile(person.id, first, last);
    },
    onSuccess: () => void refresh(),
  });
  if (!person) return null;
  return (
    <div className="max-w-xl rounded-lg border border-border p-4">
      <h2 className="font-medium">Dados pessoais</h2>
      <form className="mt-3 space-y-3" onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}>
        <label className="block text-sm">Nome
          <input value={first} onChange={(event) => setFirst(event.target.value)}
            maxLength={120} className="mt-1 w-full rounded-lg border border-border bg-background p-2" />
        </label>
        <label className="block text-sm">Apelido
          <input value={last} onChange={(event) => setLast(event.target.value)}
            maxLength={120} className="mt-1 w-full rounded-lg border border-border bg-background p-2" />
        </label>
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
        <button type="submit" disabled={mutation.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {mutation.isPending ? "A guardar…" : "Guardar perfil"}
        </button>
      </form>
    </div>
  );
}

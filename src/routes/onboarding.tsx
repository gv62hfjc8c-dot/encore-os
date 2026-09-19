import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useIdentity } from "@/components/identity-context";
import { acceptInvitation, createOrganization } from "@/lib/identity";
export const Route = createFileRoute("/onboarding")({
  ssr: false,
  component: Onboarding,
});
export function Onboarding() {
  const { refresh, select, signOut } = useIdentity();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(action: () => Promise<string>) {
    setBusy(true);
    setError("");
    try {
      const id = await action();
      await refresh(id);
      await navigate({ to: "/definicoes" });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível concluir. Verifique o convite e o email confirmado.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8">
      <h1 className="text-2xl font-semibold">O seu espaço no Encore OS</h1>
      <p>
        A sua identidade pessoal existe independentemente de qualquer
        organização. Uma organização pode representar uma pessoa, banda, empresa
        ou outra estrutura.
      </p>
      <form
        className="space-y-3 rounded border p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(async () => (await createOrganization(name)).id);
        }}
      >
        <h2 className="text-lg">Criar Organization</h2>
        <label className="block">
          Nome da organização
          <input
            className="block w-full rounded border bg-background p-2"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <p className="text-sm">
          Será Member e administrador da nova organização.
        </p>
        <button
          disabled={busy}
          className="rounded bg-primary p-2 text-primary-foreground"
        >
          Criar organização
        </button>
      </form>
      <form
        className="space-y-3 rounded border p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(() => acceptInvitation(token));
        }}
      >
        <h2 className="text-lg">Aceitar convite</h2>
        <label className="block">
          Código de convite
          <input
            className="block w-full rounded border bg-background p-2"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </label>
        <p className="text-sm">
          Use a conta com o email confirmado ao qual o convite foi dirigido.
        </p>
        <button disabled={busy} className="rounded border p-2">
          Aceitar convite
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <Link to="/pessoal" onClick={() => select(null)}>
        Continuar apenas como Person
      </Link>
      <button className="ml-6" onClick={() => void signOut()}>
        Sair
      </button>
    </main>
  );
}

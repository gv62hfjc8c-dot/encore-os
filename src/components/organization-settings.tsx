import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useIdentity } from "./identity-context";
import {
  getOrganizationMembers,
  renameOrganization,
  inviteToOrganization,
  changeMembership,
  revokeInvitation,
} from "@/lib/identity";
export function OrganizationSettings() {
  const { active, refresh } = useIdentity();
  const [members, setMembers] = useState<
    Awaited<ReturnType<typeof getOrganizationMembers>>
  >([]);
  const [name, setName] = useState(active?.name ?? "");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<"member" | "freelancer">("member");
  const [admin, setAdmin] = useState(false);
  const [invitation, setInvitation] = useState<{
    invitation_id: string;
    token: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let stale = false;
    setMembers([]);
    setName(active?.name ?? "");
    setInvitation(null);
    if (active)
      void getOrganizationMembers(active.id)
        .then((rows) => {
          if (!stale) setMembers(rows);
        })
        .catch((e) => {
          if (!stale) setError(e.message);
        });
    return () => {
      stale = true;
    };
  }, [active]);
  if (!active)
    return (
      <section>
        <h1>Espaço pessoal</h1>
        <p>Selecione uma organização para gerir o respetivo contexto.</p>
        <Link to="/onboarding">Criar organização ou aceitar convite</Link>
      </section>
    );
  const org = active;
  async function run(action: () => Promise<unknown>, reload = false) {
    setBusy(true);
    setError("");
    try {
      await action();
      if (reload) await refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Operação recusada. Verifique as permissões e atualize o contexto.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">{org.name}</h1>
      <p>
        {org.membership.membership_type} ·{" "}
        {org.membership.is_admin ? "Administrador" : "Sem administração"}
      </p>
      <button onClick={() => void refresh()}>
        Atualizar contexto e permissões
      </button>
      {error && <p role="alert">{error}</p>}
      {org.membership.is_admin && (
        <>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => renameOrganization(org.id, name), true);
            }}
          >
            <label>
              Nome da organização
              <input
                className="ml-3 rounded border bg-background p-2"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button disabled={busy} className="ml-3 rounded border p-2">
              Guardar
            </button>
          </form>
          <form
            className="space-y-3 rounded border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () =>
                setInvitation(
                  await inviteToOrganization(org.id, email, type, admin),
                ),
              );
            }}
          >
            <h2>Convidar pessoa</h2>
            <label className="block">
              Email
              <input
                className="ml-3 rounded border bg-background p-2"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Relação
              <select
                className="ml-3 rounded border bg-background p-2"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
              >
                <option value="member">Member</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </label>
            <label className="ml-3">
              <input
                type="checkbox"
                checked={admin}
                onChange={(e) => setAdmin(e.target.checked)}
              />{" "}
              Administrador
            </label>
            <button disabled={busy} className="block rounded border p-2">
              Criar convite
            </button>
            <p className="text-sm">
              O código é válido por 7 dias. Partilhe-o diretamente com a pessoa;
              não é enviado email automaticamente.
            </p>
          </form>
          {invitation && (
            <div className="rounded border p-4">
              <p>Código de convite (apresentado apenas agora):</p>
              <output className="break-all select-all">
                {invitation.token}
              </output>
              <button
                disabled={busy}
                className="block"
                onClick={() =>
                  void run(async () => {
                    await revokeInvitation(org.id, invitation.invitation_id);
                    setInvitation(null);
                  })
                }
              >
                Revogar este convite
              </button>
            </div>
          )}
        </>
      )}
      <h2 className="text-lg">Memberships desta organização</h2>
      <ul className="space-y-3">
        {members.map((m) => (
          <li key={m.id} className="rounded border p-3">
            <p className="break-all">
              Person {m.person_id}
              {m.id === org.membership.id ? " (eu)" : ""}
            </p>
            <p>
              {m.membership_type} · {m.is_admin ? "Admin" : "Sem administração"}
            </p>
            {org.membership.is_admin && (
              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () =>
                        changeMembership(
                          org.id,
                          m.id,
                          m.membership_type,
                          !m.is_admin,
                        ),
                      true,
                    )
                  }
                >
                  {m.is_admin
                    ? "Retirar administração"
                    : "Tornar administrador"}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    void run(
                      () =>
                        changeMembership(
                          org.id,
                          m.id,
                          m.membership_type === "member"
                            ? "freelancer"
                            : "member",
                          m.is_admin,
                        ),
                      true,
                    )
                  }
                >
                  Mudar relação
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm("Remover esta relação com a organização?")
                    )
                      void run(
                        () =>
                          changeMembership(
                            org.id,
                            m.id,
                            m.membership_type,
                            m.is_admin,
                            true,
                          ),
                        true,
                      );
                  }}
                >
                  Remover
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

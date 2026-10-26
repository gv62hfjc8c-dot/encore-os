import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Panel } from "@/components/ui-kit";
import { createWorkInvitation } from "@/lib/work";

type WorkOption = {
  id: string;
  title: string;
};

/** Invitation code only; direct addition of an external Person is forbidden. */
export function WorkParticipantForm({ works }: { works: WorkOption[] }) {
  const [workId, setWorkId] = useState("");
  const [email, setEmail] = useState("");
  const [invitation, setInvitation] = useState<{
    invitation_id: string;
    token: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: ({ targetWorkId, targetEmail }: {
      targetWorkId: string;
      targetEmail: string;
    }) => createWorkInvitation(targetWorkId, targetEmail),
    onSuccess: (value) => {
      setInvitation(value);
      setEmail("");
    },
  });

  if (!works.length) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workId || !email.trim()) return;
    setInvitation(null);
    mutation.mutate({ targetWorkId: workId, targetEmail: email.trim() });
  }

  return (
    <Panel
      title="Convidar participante"
      subtitle="A Person só terá acesso ao Work depois de aceitar o convite."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          Trabalho
          <select
            required
            value={workId}
            onChange={(event) => {
              setWorkId(event.target.value);
              setInvitation(null);
              mutation.reset();
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
          >
            <option value="">Selecionar trabalho</option>
            {works.map((work) => (
              <option key={work.id} value={work.id}>{work.title}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Email confirmado do destinatário
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setInvitation(null);
              mutation.reset();
            }}
            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
          />
        </label>

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}
        {invitation && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Convite criado, ainda não aceite</p>
            <p className="text-xs text-muted-foreground">
              Partilhe este código diretamente com o destinatário. É mostrado apenas agora,
              expira em 7 dias e não é enviado por email automaticamente.
              O destinatário deve iniciar sessão e introduzir o código no{" "}
              <Link to="/pessoal" className="text-primary underline">Espaço pessoal</Link>.
            </p>
            <output className="block break-all rounded border border-border bg-elevated p-2 font-mono text-xs select-all">
              {invitation.token}
            </output>
          </div>
        )}
        <button
          type="submit"
          disabled={mutation.isPending || !workId}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {mutation.isPending ? "A criar convite..." : "Criar convite"}
        </button>
      </form>
    </Panel>
  );
}

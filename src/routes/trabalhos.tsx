import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useIdentity } from "@/components/identity-context";
import { PageHeader, Panel, Pill, EmptyState } from "@/components/ui-kit";
import { createWork, getVisibleWorks, type CreateWorkInput } from "@/lib/work";
import { CalendarDays } from "lucide-react";
import { WorkParticipantForm } from "@/components/work-participant-form";

export const Route = createFileRoute("/trabalhos")({
  ssr: false,
  component: Trabalhos,
});

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

function Trabalhos() {
  const { session, person, active } = useIdentity();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [workType, setWorkType] = useState("performance");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const canCreate = Boolean(
    active &&
      (active.membership.is_admin ||
        active.membership.membership_type === "freelancer"),
  );

  const works = useQuery({
    queryKey: ["works", session?.user.id],
    queryFn: getVisibleWorks,
    enabled: Boolean(session),
  });

  const mutation = useMutation({
    mutationFn: ({
      organizationId,
      input,
    }: {
      organizationId: string;
      input: CreateWorkInput;
    }) => createWork(organizationId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      setTitle("");
      setStartsAt("");
      setEndsAt("");
      setFormOpen(false);
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!active || !canCreate) {
      setFormError("Não tem autorização para criar trabalhos neste contexto.");
      return;
    }

    const start = Date.parse(startsAt);
    const end = Date.parse(endsAt);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setFormError("Introduza um início e um fim válidos.");
      return;
    }

    if (!title.trim() || !workType.trim()) {
      setFormError("Preencha o título e o tipo de trabalho.");
      return;
    }

    mutation.mutate({
      organizationId: active.id,
      input: {
        title,
        workType,
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(end).toISOString(),
        timezone: timeZone,
      },
    });
  }

  return (
    <>
      <PageHeader
        title="Trabalhos"
        description="Trabalhos reais a que a sua identidade pessoal tem acesso."
        actions={
          <button
            type="button"
            onClick={() => void works.refetch()}
            disabled={works.isFetching}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
          >
            {works.isFetching ? "A atualizar..." : "Atualizar"}
          </button>
        }
      />

      <div className="mb-6">
        {canCreate ? (
          <button
            type="button"
            onClick={() => {
              mutation.reset();
              setFormError(null);
              setFormOpen((value) => !value);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {formOpen ? "Fechar formulário" : "Criar trabalho"}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Para criar trabalhos, selecione uma organização onde seja
            administrador ou Freelancer. Pode consultar os trabalhos
            em que participa sem uma organização ativa.
          </p>
        )}
      </div>

      {formOpen && canCreate && (
        <div className="mb-6">
          <Panel title="Novo trabalho">
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm">
                Título
                <input
                  required
                  maxLength={160}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                />
              </label>

              <label className="block text-sm">
                Tipo de trabalho
                <input
                  required
                  maxLength={64}
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  Início
                  <input
                    required
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                  />
                </label>

                <label className="block text-sm">
                  Fim
                  <input
                    required
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background p-2"
                  />
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                As horas são interpretadas no fuso horário deste
                dispositivo: {timeZone}.
              </p>

              {(formError || mutation.error) && (
                <p role="alert" className="text-sm text-destructive">
                  {formError ||
                    (mutation.error instanceof Error
                      ? mutation.error.message
                      : "Não foi possível criar o trabalho.")}
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {mutation.isPending ? "A guardar..." : "Guardar trabalho"}
              </button>
            </form>
          </Panel>
        </div>
      )}

      <Panel title="Trabalhos visíveis">
        {works.isPending ? (
          <p role="status">A carregar trabalhos...</p>
        ) : works.isError ? (
          <div role="alert" className="space-y-3">
            <p className="text-sm text-destructive">
              Não foi possível carregar os trabalhos: {works.error.message}
            </p>
            <button
              onClick={() => void works.refetch()}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        ) : !works.data?.length ? (
          <EmptyState
            icon={CalendarDays}
            title="Ainda não existem trabalhos visíveis"
            description="Os trabalhos criados por si ou em que participa aparecerão aqui."
          />
        ) : (
          <ul className="divide-y divide-border">
            {works.data.map((work) => (
              <li key={work.id} className="space-y-2 py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-medium">{work.title}</h2>
                  <Pill>{statusLabels[work.status] ?? work.status}</Pill>
                  <Pill tone={work.created_by === person?.id ? "primary" : "neutral"}>
                    {work.created_by === person?.id
                      ? "Gerido por si"
                      : "Participação"}
                  </Pill>
                </div>
                <p className="text-sm text-muted-foreground">
                  {work.work_type} ·{" "}
                  {new Date(work.starts_at).toLocaleString("pt-PT", {
                    timeZone: work.timezone,
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" — "}
                  {new Date(work.ends_at).toLocaleString("pt-PT", {
                    timeZone: work.timezone,
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" · "}{work.timezone}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="mt-6">
        <WorkParticipantForm
          works={(works.data ?? [])
            .filter((work) => work.created_by === person?.id)
            .map((work) => ({
              id: work.id,
              title: work.title,
            }))}
        />
      </div>
    </>
  );
}

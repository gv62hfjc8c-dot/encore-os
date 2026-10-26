import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Euro, Users2, Pencil } from "lucide-react";
import { useIdentity } from "@/components/identity-context";
import { Field, PageHeader, Panel, Pill, Tabs } from "@/components/ui-kit";
import {
  getVisiblePerformanceById,
  getWorkBlocks,
  getWorkParticipationCount,
  updatePerformance,
} from "@/lib/work";
import { formatWorkDateTime, deviceDateTime } from "@/lib/format";

type Performance = NonNullable<Awaited<ReturnType<typeof getVisiblePerformanceById>>>;

const operationalStates: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const tabs = [
  { id: "resumo", label: "Resumo" },
  { id: "equipa", label: "Equipa" },
  { id: "agenda", label: "Agenda" },
  { id: "setlist", label: "Setlist" },
  { id: "logistica", label: "Logística" },
  { id: "equipamentos", label: "Equipamentos" },
  { id: "financeiro", label: "Financeiro" },
  { id: "checklist", label: "Checklist" },
  { id: "documentos", label: "Documentos" },
  { id: "comunicacao", label: "Comunicação" },
  { id: "timeline", label: "Timeline" },
  { id: "relatorios", label: "Relatórios" },
];

const unavailableDescriptions: Record<string, string> = {
  setlist: "Ainda não existe uma setlist persistida para esta atuação.",
  logistica: "Os dados de deslocações, local, palco, alojamento e refeições ainda não estão ligados ao backend.",
  equipamentos: "Os equipamentos do espetáculo ainda não estão ligados ao backend.",
  financeiro: "Preço, custos, cachets e condições contratuais ainda não estão disponíveis no modelo persistido.",
  checklist: "A checklist operacional ainda não está ligada ao backend.",
  documentos: "Ainda não há documentos do espetáculo ligados ao backend.",
  comunicacao: "As mensagens do protótipo não foram migradas para dados reais.",
  timeline: "A timeline operacional do protótipo ainda não está persistida.",
  relatorios: "Os relatórios dependem de dados operacionais ainda não implementados.",
};

export function RealEspetaculoDetail({ id }: { id: string }) {
  const { session, person } = useIdentity();
  const [tab, setTab] = useState("resumo");
  const [editing, setEditing] = useState(false);

  const performance = useQuery({
    queryKey: ["works", session?.user.id, "performance", id],
    queryFn: () => getVisiblePerformanceById(id),
    enabled: Boolean(session),
  });
  const participations = useQuery({
    queryKey: ["work-participations", session?.user.id, id],
    queryFn: () => getWorkParticipationCount(id),
    enabled: Boolean(session) && Boolean(performance.data),
  });
  const blocks = useQuery({
    queryKey: ["work-blocks", session?.user.id, id],
    queryFn: () => getWorkBlocks(id),
    enabled: Boolean(session) && Boolean(performance.data),
  });

  const work = performance.data;

  if (performance.isPending) {
    return <Panel><p role="status">A carregar ficha do espetáculo…</p></Panel>;
  }
  if (performance.isError) {
    return (
      <Panel>
        <p role="alert" className="text-destructive">Não foi possível carregar o espetáculo: {performance.error.message}</p>
        <button type="button" onClick={() => void performance.refetch()} className="mt-3 text-sm text-primary">Tentar novamente</button>
      </Panel>
    );
  }
  if (!work) {
    return (
      <Panel>
        <h1 className="font-semibold">Espetáculo indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">Não existe uma atuação acessível com este identificador.</p>
        <Link to="/espetaculos" className="mt-3 inline-block text-sm text-primary">Voltar a Espetáculos</Link>
      </Panel>
    );
  }

  const isManager = work.created_by === person?.id;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Espetáculos", to: "/espetaculos" },
          { label: work.title },
        ]}
        title={work.title}
        description="Ficha de espetáculo · dados reais de Work"
        meta={
          <>
            <Pill>{operationalStates[work.status] ?? work.status}</Pill>
            <Pill tone={isManager ? "primary" : "neutral"}>
              {isManager ? "Gerido por si" : "Participação"}
            </Pill>
          </>
        }
        actions={
          isManager && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground"
            >
              <Pencil className="h-4 w-4" /> Editar espetáculo
            </button>
          ) : undefined
        }
      />

      {editing && isManager && (
        <div className="mb-6">
          <EditPerformance key={work.updated_at} work={work} onClose={() => setEditing(false)} />
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Clock, label: "Palco", value: formatWorkDateTime(work.starts_at, work.timezone) },
          { icon: MapPin, label: "Local", value: "Não registado" },
          { icon: Euro, label: "Cachet", value: "Não registado" },
          {
            icon: Users2,
            label: "Equipa",
            value: participations.isSuccess
              ? String(participations.data) + " participações"
              : participations.isError ? "Indisponível" : "A carregar…",
          },
        ].map((item) => (
          <div key={item.label} className="panel flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
              <item.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
              <p className="truncate text-sm font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs.map((item) => item.id === "equipa" && participations.isSuccess
        ? { ...item, badge: participations.data } : item)}
        active={tab}
        onChange={setTab}
      />

      <div className="animate-fade-in">
        {tab === "resumo" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Ficha do espetáculo" className="lg:col-span-2">
              <dl className="grid gap-5 sm:grid-cols-3">
                <Field label="Espetáculo">{work.title}</Field>
                <Field label="Tipo">Atuação musical</Field>
                <Field label="Estado operacional">{operationalStates[work.status] ?? work.status}</Field>
                <Field label="Início">{formatWorkDateTime(work.starts_at, work.timezone)}</Field>
                <Field label="Fim">{formatWorkDateTime(work.ends_at, work.timezone)}</Field>
                <Field label="Fuso horário">{work.timezone}</Field>
                <Field label="Cliente">Não registado</Field>
                <Field label="Local">Não registado</Field>
                <Field label="Tipo de evento">Não registado</Field>
                <Field label="Contrato">Não registado</Field>
                <Field label="Responsável">{isManager ? "Gerido por si" : "Outro gestor"}</Field>
                <Field label="Identificador Work" mono>{work.id}</Field>
              </dl>
            </Panel>
            <div className="space-y-6">
              <Panel title="Produção">
                <p className="text-sm text-muted-foreground">
                  Esta ficha mostra apenas dados já persistidos e autorizados. Os estados comerciais
                  de proposta, reserva e confirmação ainda não estão modelados.
                </p>
              </Panel>
              <Panel title="Riscos">
                <p className="text-sm text-muted-foreground">Os riscos ainda não estão ligados a dados persistidos.</p>
              </Panel>
            </div>
          </div>
        )}

        {tab === "equipa" && (
          <Panel title="Equipa" subtitle="Participações reais de Work">
            {participations.isPending && <p role="status" className="text-sm">A carregar participações…</p>}
            {participations.isError && <p role="alert" className="text-sm text-destructive">Não foi possível consultar as participações.</p>}
            {participations.isSuccess && (
              <p className="text-sm">
                {participations.data} {participations.data === 1 ? "pessoa associada" : "pessoas associadas"} a este Work.
              </p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              A apresentação das identidades, equipas específicas de Band e aceitação
              de convites externos ainda está pendente.
            </p>
          </Panel>
        )}

        {(tab === "agenda" || tab === "timeline") && (
          <Panel title={tab === "agenda" ? "Agenda" : "Timeline"}>
            {blocks.isPending && <p role="status" className="text-sm">A carregar blocos de Work…</p>}
            {blocks.isError && <p role="alert" className="text-sm text-destructive">Não foi possível consultar os blocos.</p>}
            {blocks.isSuccess && blocks.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Ainda não existem blocos operacionais registados.</p>
            )}
            {blocks.isSuccess && blocks.data.length > 0 && (
              <ul className="divide-y divide-border">
                {blocks.data.map((block) => (
                  <li key={block.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{block.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {block.block_type} · {formatWorkDateTime(block.starts_at, work.timezone)}
                      {" – "}{formatWorkDateTime(block.ends_at, work.timezone)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {tab === "timeline" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Apenas blocos de Work reais. A timeline enriquecida do protótipo ainda não está disponível.
              </p>
            )}
          </Panel>
        )}

        {tab !== "resumo" && tab !== "equipa" && tab !== "agenda" && tab !== "timeline" && (
          <Panel title={tabs.find((item) => item.id === tab)?.label ?? "Espetáculo"}>
            <p className="text-sm text-muted-foreground">
              {unavailableDescriptions[tab] ?? "Ainda não existem dados persistidos para esta área."}
            </p>
          </Panel>
        )}
      </div>
    </>
  );
}

function EditPerformance({ work, onClose }: { work: Performance; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(work.title);
  const [startsAt, setStartsAt] = useState(deviceDateTime(work.starts_at));
  const [endsAt, setEndsAt] = useState(deviceDateTime(work.ends_at));
  const [error, setError] = useState<string | null>(null);
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const mutation = useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      updatePerformance(work, { title, startsAt: start, endsAt: end }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      onClose();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const start = Date.parse(startsAt);
    const end = Date.parse(endsAt);
    if (!title.trim() || title.trim().length > 160 || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setError("Introduza um título e horários válidos, com fim posterior ao início.");
      return;
    }
    mutation.mutate({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  }

  return (
    <Panel title="Editar espetáculo" subtitle="Campos existentes na base de dados">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          Título
          <input
            required maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background p-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Início
            <input
              required type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background p-2"
            />
          </label>
          <label className="block text-sm">
            Fim
            <input
              required type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background p-2"
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Neste formulário as horas são apresentadas e interpretadas no fuso do dispositivo ({deviceTimezone}).
          O Work conserva o seu fuso original ({work.timezone}); a ficha mostra as horas nesse fuso.
          Não alteramos o estado comercial, o organizador ou as participações nesta edição.
        </p>
        {(error || mutation.error) && (
          <p role="alert" className="text-sm text-destructive">
            {error || (mutation.error instanceof Error ? mutation.error.message : "Não foi possível guardar.")}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit" disabled={mutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {mutation.isPending ? "A guardar…" : "Guardar alterações"}
          </button>
          <button
            type="button" onClick={onClose} disabled={mutation.isPending}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
          >Cancelar</button>
        </div>
      </form>
    </Panel>
  );
}

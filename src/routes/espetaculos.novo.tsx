import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Euro,
  MapPin,
  Mic2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useIdentity } from "@/components/identity-context";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { createWork } from "@/lib/work";
import { buildPerformanceInput, validPerformanceWindow } from "@/lib/performance-create";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espetaculos/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo espetáculo · Encore OS" },
      {
        name: "description",
        content: "Criar uma atuação musical real, a partir da estrutura original do assistente.",
      },
    ],
  }),
  component: NovoEspetaculo,
});

const passos = [
  { n: 1, label: "Cliente", icon: Building2 },
  { n: 2, label: "Data e local", icon: CalendarDays },
  { n: 3, label: "Elenco", icon: Mic2 },
  { n: 4, label: "Orçamento", icon: Euro },
];

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-elevated/50 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50";

function NovoEspetaculo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { active } = useIdentity();
  const [passo, setPasso] = useState(1);
  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // datetime-local interprets the times in the device timezone.
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const podeCriar = Boolean(
    active &&
      (active.membership.is_admin ||
        active.membership.membership_type === "freelancer"),
  );
  const nomeValido = nome.trim().length > 0 && nome.trim().length <= 160;
  const datasValidas = validPerformanceWindow(inicio, fim);
  const podeAvancar = passo === 1 ? nomeValido : passo === 2 ? datasValidas : true;

  const criar = useMutation({
    mutationFn: ({
      organizationId,
      name,
      start,
      end,
    }: {
      organizationId: string;
      name: string;
      start: string;
      end: string;
    }) =>
      createWork(
        organizationId,
        buildPerformanceInput({
          title: name,
          startsAtLocal: start,
          endsAtLocal: end,
          timezone,
        }),
      ),
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("Espetáculo criado", {
        description: "A atuação foi guardada como Work real, em rascunho.",
      });
      void navigate({ to: "/espetaculos/$id", params: { id } });
    },
  });

  function submeter() {
    setErro(null);
    if (!active || !podeCriar) {
      setErro("Selecione uma organização em que seja administrador ou Freelancer para autorizar a criação.");
      return;
    }
    try {
      buildPerformanceInput({
        title: nome,
        startsAtLocal: inicio,
        endsAtLocal: fim,
        timezone,
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Dados inválidos.");
      return;
    }

    criar.mutate({
      organizationId: active.id,
      name: nome,
      start: inicio,
      end: fim,
    });
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Espetáculos", to: "/espetaculos" }, { label: "Novo" }]}
        title="Novo espetáculo"
        description="Quatro passos para criar uma atuação real. Os restantes dados serão associados gradualmente."
        actions={
          <Link
            to="/espetaculos"
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated"
          >
            Cancelar
          </Link>
        }
      />

      {!podeCriar && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm" role="status">
          Para criar um espetáculo, selecione uma organização em que seja administrador ou Freelancer.
          O contexto organizacional autoriza a criação; não passa a ser o proprietário do Work.{" "}
          {!active && <Link to="/onboarding" className="text-primary underline">Criar organização</Link>}
        </div>
      )}

      <ol className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {passos.map((p) => {
          const feito = passo > p.n;
          const ativo = passo === p.n;
          return (
            <li
              key={p.n}
              aria-current={ativo ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors",
                ativo
                  ? "border-primary/40 bg-primary/10"
                  : feito
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-surface",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-semibold",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : feito
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {feito ? <Check className="h-3.5 w-3.5" /> : p.n}
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Passo {p.n}
                </span>
                <span className="block truncate text-sm font-medium">{p.label}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={passos[passo - 1]!.label}>
          {passo === 1 && (
            <div className="space-y-5">
              <Campo label="Cliente / organização">
                <div className="rounded-xl border border-dashed border-border bg-elevated/30 p-4">
                  <p className="text-sm font-medium">Associação a cliente ainda não disponível</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O catálogo de clientes do protótipo é demonstrativo. Não o utilizaremos para
                    criar uma relação fictícia com o espetáculo.
                  </p>
                </div>
              </Campo>
              <Campo label="Nome do espetáculo">
                <input
                  autoFocus
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Festas de São Pedro"
                  maxLength={160}
                  required
                  className={inputCls}
                />
              </Campo>
              <p className="text-xs text-muted-foreground">
                O tipo comercial de evento será integrado quando existir persistência própria.
                Este registo será sempre um Work do tipo atuação musical.
              </p>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Início da atuação">
                  <input
                    required
                    type="datetime-local"
                    value={inicio}
                    onChange={(event) => setInicio(event.target.value)}
                    className={inputCls}
                  />
                </Campo>
                <Campo label="Fim da atuação">
                  <input
                    required
                    type="datetime-local"
                    value={fim}
                    onChange={(event) => setFim(event.target.value)}
                    className={inputCls}
                  />
                </Campo>
              </div>
              <div className="rounded-xl border border-border bg-elevated/40 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <CalendarDays className="h-4 w-4 text-primary" /> Fuso horário: {timezone}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Os horários são interpretados no fuso do dispositivo. Se a atuação ocorrer
                  noutro fuso horário, é necessário usar um dispositivo configurado para esse fuso
                  nesta primeira versão do assistente.
                </p>
              </div>
              <Campo label="Local">
                <div className="flex items-start gap-2 rounded-xl border border-dashed border-border p-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    O local ainda não possui persistência em Work. Será associado posteriormente,
                    sem recorrer aos locais fictícios do protótipo.
                  </p>
                </div>
              </Campo>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-border bg-elevated/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15">
                    <Mic2 className="h-4 w-4 text-primary" />
                  </span>
                  <p className="font-medium">Elenco a associar após a criação</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ainda não existe uma ligação real entre Band, a sua equipa interna e Work.
                  Não vamos atribuir bandas do protótipo nem criar participações externas sem consentimento.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Pode continuar e criar o espetáculo como rascunho, sem elenco associado.
              </p>
            </div>
          )}

          {passo === 4 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Cachet (€)">
                  <input disabled placeholder="Por implementar" className={cn(inputCls, "cursor-not-allowed opacity-60")} />
                </Campo>
                <Campo label="Custos diretos (€)">
                  <input disabled placeholder="Por implementar" className={cn(inputCls, "cursor-not-allowed opacity-60")} />
                </Campo>
              </div>
              <div className="rounded-xl border border-border bg-elevated/50 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Margem estimada
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Disponível quando os valores financeiros tiverem persistência própria.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Ao confirmar, será criado um Work real de tipo <strong>performance</strong>,
                com o estado operacional <strong>Rascunho</strong>, título e horários.
                Não serão criados automaticamente clientes, bandas, contratos, checklists ou mensagens.
              </p>
            </div>
          )}

          {erro && <p role="alert" className="mt-5 text-sm text-destructive">{erro}</p>}
          {criar.error && (
            <p role="alert" className="mt-5 text-sm text-destructive">
              Não foi possível criar o espetáculo:{" "}
              {criar.error instanceof Error ? criar.error.message : "Erro desconhecido"}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => { setErro(null); setPasso((p) => Math.max(1, p - 1)); }}
              disabled={passo === 1 || criar.isPending}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            {passo < 4 ? (
              <button
                type="button"
                onClick={() => { setErro(null); setPasso((p) => Math.min(4, p + 1)); }}
                disabled={!podeAvancar}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Continuar <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submeter}
                disabled={!podeCriar || !nomeValido || !datasValidas || criar.isPending}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {criar.isPending ? "A guardar…" : "Criar espetáculo"}
              </button>
            )}
          </div>
        </Panel>

        <Panel title="Resumo" subtitle="Dados que serão realmente guardados">
          <dl className="space-y-3 text-sm">
            <Linha termo="Espetáculo" valor={nome.trim()} />
            <Linha termo="Tipo" valor="Atuação musical" />
            <Linha termo="Início" valor={inicio ? inicio.replace("T", " ") : undefined} />
            <Linha termo="Fim" valor={fim ? fim.replace("T", " ") : undefined} />
            <Linha termo="Fuso horário" valor={timezone} />
            <Linha termo="Estado" valor="Rascunho" />
            <Linha termo="Cliente" valor="Por associar" />
            <Linha termo="Local" valor="Por associar" />
            <Linha termo="Elenco" valor="Por associar" />
            <Linha termo="Orçamento" valor="Por definir" />
          </dl>
          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
            O contexto organizacional é utilizado para autorizar a criação. O Work é autónomo
            e as suas participações são geridas separadamente.
          </div>
          <div className="mt-4">
            <Pill tone={podeAvancar ? "success" : "warning"}>
              {podeAvancar ? "Pode continuar" : "Faltam dados neste passo"}
            </Pill>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Linha({ termo, valor }: { termo: string; valor?: string | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs text-muted-foreground">{termo}</dt>
      <dd className={cn("min-w-0 truncate text-right", !valor && "text-muted-foreground/50")}>
        {valor || "—"}
      </dd>
    </div>
  );
}

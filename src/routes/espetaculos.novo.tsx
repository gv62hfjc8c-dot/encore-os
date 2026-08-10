import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Euro,
  Mic2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { bandas, clientes, formatEUR, HOJE } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espetaculos/novo")({
  head: () => ({
    meta: [
      { title: "Novo espetáculo · Encore OS" },
      {
        name: "description",
        content:
          "Criar um espetáculo em quatro passos: cliente, data e local, elenco e orçamento.",
      },
      { property: "og:title", content: "Novo espetáculo · Encore OS" },
      {
        property: "og:description",
        content: "Fluxo guiado de criação de espetáculos no Encore OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

const tiposEvento = ["Festa popular", "Casamento", "Corporativo", "Festival", "Arraial", "Cocktail"];

function NovoEspetaculo() {
  const navigate = useNavigate();
  const [passo, setPasso] = useState(1);

  const [clienteId, setClienteId] = useState("");
  const [nome, setNome] = useState("");
  const [tipoEvento, setTipoEvento] = useState(tiposEvento[0]!);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("22:30");
  const [local, setLocal] = useState("");
  const [bandaId, setBandaId] = useState("");
  const [preco, setPreco] = useState<number | "">("");
  const [custos, setCustos] = useState<number | "">("");
  const [notas, setNotas] = useState("");

  const cliente = clientes.find((c) => c.id === clienteId);
  const banda = bandas.find((b) => b.id === bandaId);

  const margem = useMemo(
    () => (typeof preco === "number" ? preco : 0) - (typeof custos === "number" ? custos : 0),
    [preco, custos],
  );

  const podeAvancar =
    (passo === 1 && !!clienteId && nome.trim().length > 2) ||
    (passo === 2 && !!data && !!local.trim()) ||
    (passo === 3 && !!bandaId) ||
    (passo === 4 && typeof preco === "number" && preco > 0);

  const submeter = () => {
    toast.success("Espetáculo criado", {
      description: `${nome} · ${new Date(data).toLocaleDateString("pt-PT")} · ${local}`,
    });
    navigate({ to: "/espetaculos" });
  };

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Espetáculos", to: "/espetaculos" }, { label: "Novo" }]}
        title="Novo espetáculo"
        description="Quatro passos. Tudo o resto — equipa, setlist, logística — nasce a partir daqui."
        actions={
          <Link
            to="/espetaculos"
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated"
          >
            Cancelar
          </Link>
        }
      />

      {/* Passos */}
      <ol className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {passos.map((p) => {
          const feito = passo > p.n;
          const ativo = passo === p.n;
          return (
            <li
              key={p.n}
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
                <div className="grid gap-2 sm:grid-cols-2">
                  {clientes.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setClienteId(c.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        clienteId === c.id
                          ? "border-primary/50 bg-primary/10"
                          : "border-border bg-elevated/40 hover:bg-elevated",
                      )}
                    >
                      <p className="truncate text-sm font-medium">{c.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.tipo} · {c.localidade}
                      </p>
                    </button>
                  ))}
                </div>
              </Campo>
              <Campo label="Nome do espetáculo">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Festas de São Pedro"
                  className={inputCls}
                />
              </Campo>
              <Campo label="Tipo de evento">
                <div className="flex flex-wrap gap-2">
                  {tiposEvento.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipoEvento(t)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                        tipoEvento === t
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Campo>
            </div>
          )}

          {passo === 2 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Data">
                  <input
                    type="date"
                    min={HOJE}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={inputCls}
                  />
                </Campo>
                <Campo label="Hora de palco">
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className={inputCls}
                  />
                </Campo>
              </div>
              <Campo label="Local">
                <input
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Ex.: Praça do Peixe, Aveiro"
                  className={inputCls}
                />
              </Campo>
              <Campo label="Notas de produção (opcional)">
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Acessos, limite de ruído, palco coberto…"
                  className={cn(inputCls, "resize-none")}
                />
              </Campo>
            </div>
          )}

          {passo === 3 && (
            <div className="space-y-3">
              {bandas.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setBandaId(b.id);
                    if (preco === "") setPreco(b.cachetMedio);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    bandaId === b.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-elevated/40 hover:bg-elevated",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                    {b.iniciais}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{b.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {b.genero} · {b.membros} pessoas
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatEUR(b.cachetMedio)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {passo === 4 && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Cachet (€)">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="6800"
                    className={inputCls}
                  />
                </Campo>
                <Campo label="Custos diretos (€)">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={custos}
                    onChange={(e) => setCustos(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="2400"
                    className={inputCls}
                  />
                </Campo>
              </div>
              <div className="rounded-xl border border-border bg-elevated/50 p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Margem estimada
                </p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-semibold tabular-nums",
                    margem >= 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {formatEUR(margem)}
                </p>
                {cliente && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Pagamento: {cliente.prazoPagamento} · risco {cliente.risco.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-5">
            <button
              onClick={() => setPasso((p) => Math.max(1, p - 1))}
              disabled={passo === 1}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            {passo < 4 ? (
              <button
                onClick={() => setPasso((p) => p + 1)}
                disabled={!podeAvancar}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Continuar <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={submeter}
                disabled={!podeAvancar}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" /> Criar espetáculo
              </button>
            )}
          </div>
        </Panel>

        <Panel title="Resumo" subtitle="Atualiza à medida que preenche">
          <dl className="space-y-3 text-sm">
            <Linha termo="Cliente" valor={cliente?.nome} />
            <Linha termo="Espetáculo" valor={nome} />
            <Linha termo="Tipo" valor={tipoEvento} />
            <Linha
              termo="Data"
              valor={data ? `${new Date(data).toLocaleDateString("pt-PT")} · ${hora}` : undefined}
            />
            <Linha termo="Local" valor={local} />
            <Linha termo="Elenco" valor={banda?.nome} />
            <Linha termo="Cachet" valor={typeof preco === "number" ? formatEUR(preco) : undefined} />
          </dl>
          <div className="mt-5 rounded-xl border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
            Ao criar, o Encore OS gera automaticamente a timeline operacional, as checklists por área
            e o espaço de comunicação deste espetáculo.
          </div>
          <div className="mt-4">
            <Pill tone={podeAvancar ? "success" : "warning"}>
              {podeAvancar ? "Passo completo" : "Faltam campos neste passo"}
            </Pill>
          </div>
        </Panel>
      </div>
    </>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-elevated/50 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50";

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

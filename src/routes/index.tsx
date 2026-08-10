import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  CloudRain,
  Sun,
  Cloud,
  Clock,
  Euro,
  MapPin,
  Users2,
  Wind,
  Truck,
  Radio,
  FileSignature,
} from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone, Avatar, Progress } from "@/components/ui-kit";
import { espetaculos, formatEUR, musicos, tarefas, atividade, ensaios, HOJE, getMusico } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Centro de operações · Encore OS" },
      {
        name: "description",
        content:
          "O que precisa de acontecer hoje: próximos espetáculos, riscos, equipa por confirmar, meteorologia e tesouraria.",
      },
      { property: "og:title", content: "Centro de operações · Encore OS" },
      {
        property: "og:description",
        content: "Dashboard operacional para bandas de baile e produtoras de espetáculos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const meteoIcon = (estado: string) =>
  estado.toLowerCase().includes("chuv") || estado.toLowerCase().includes("aguace")
    ? CloudRain
    : estado.toLowerCase().includes("nublado")
      ? Cloud
      : Sun;

const diasAte = (data: string) =>
  Math.round((new Date(data).getTime() - new Date(HOJE).getTime()) / 86_400_000);

function Dashboard() {
  const [feitas, setFeitas] = useState<string[]>(tarefas.filter((t) => t.feito).map((t) => t.id));

  const proximos = useMemo(
    () =>
      espetaculos
        .filter((e) => e.data >= HOJE && e.estado !== "Cancelado")
        .sort((a, b) => a.data.localeCompare(b.data)),
    [],
  );

  const proximo = proximos[0]!;
  const Meteo = meteoIcon(proximo.meteo.estado);

  const riscos = proximos.flatMap((e) => e.riscos.map((r) => ({ esp: e, texto: r })));
  const porConfirmar = proximos.flatMap((e) =>
    e.equipa.filter((m) => !m.confirmado).map((m) => ({ esp: e, musico: getMusico(m.musicoId)!, papel: m.papel })),
  );
  const indisponiveis = musicos.filter((m) => m.disponibilidade !== "Disponível");

  const valorPipeline = proximos.reduce((a, e) => a + e.preco, 0);
  const margem = proximos.reduce((a, e) => a + (e.preco - e.custos), 0);
  const porFaturar = espetaculos
    .filter((e) => e.contrato !== "Assinado" && e.estado !== "Cancelado")
    .reduce((a, e) => a + e.preco, 0);

  const toggle = (id: string) =>
    setFeitas((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  return (
    <>
      <PageHeader
        title="Bom dia, Rui."
        description={`${new Date(HOJE).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })} · ${proximos.length} espetáculos no horizonte`}
        actions={
          <>
            <Link
              to="/agenda"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated"
            >
              <CalendarDays className="h-4 w-4" /> Agenda
            </Link>
            <Link
              to="/live"
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Radio className="h-4 w-4" /> Modo ao vivo
            </Link>
          </>
        }
      />

      {/* Próximo espetáculo — o centro de tudo */}
      <section className="panel relative mb-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="primary">Próximo espetáculo</Pill>
              <Pill tone={estadoTone(proximo.estado)}>{proximo.estado}</Pill>
              <span className="text-xs text-muted-foreground">
                daqui a {diasAte(proximo.data)} dias
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">{proximo.nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {proximo.banda} · {proximo.cliente} · {proximo.tipoEvento}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: Clock, l: "Palco", v: `${proximo.hora} – ${proximo.fim}` },
                { icon: MapPin, l: "Local", v: proximo.local },
                { icon: Truck, l: "Saída", v: `${proximo.horaSaida} · ${proximo.distanciaKm} km` },
                { icon: Users2, l: "Público", v: `${proximo.publicoEstimado.toLocaleString("pt-PT")} pessoas` },
              ].map((i) => (
                <div key={i.l} className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <i.icon className="h-3 w-3" /> {i.l}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium">{i.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/espetaculos/$id"
                params={{ id: proximo.id }}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Abrir espetáculo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/live"
                className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated"
              >
                <Radio className="h-3.5 w-3.5" /> Preparar palco
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-border bg-elevated/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Meteorologia no local
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Meteo className="h-8 w-8 text-primary" />
                <div className="min-w-0">
                  <p className="text-2xl font-semibold tabular-nums">{proximo.meteo.temp}°</p>
                  <p className="truncate text-xs text-muted-foreground">{proximo.meteo.estado}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wind className="h-3 w-3" /> {proximo.meteo.vento}
                </span>
                <span className="flex items-center gap-1">
                  <CloudRain className="h-3 w-3" /> {proximo.meteo.chuva}% chuva
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-elevated/50 p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Prontidão da produção
              </p>
              <div className="mt-3 space-y-3">
                {proximo.checklists.slice(0, 4).map((c) => {
                  const pct = Math.round((c.itens.filter((i) => i.feito).length / c.itens.length) * 100);
                  return (
                    <div key={c.id}>
                      <div className="flex justify-between text-xs">
                        <span>{c.nome}</span>
                        <span className="tabular-nums text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="mt-1.5">
                        <Progress value={pct} tone={pct === 100 ? "success" : pct < 40 ? "warning" : "primary"} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Valor contratado" value={formatEUR(valorPipeline)} hint={`${proximos.length} espetáculos futuros`} icon={Euro} />
        <StatCard label="Margem prevista" value={formatEUR(margem)} delta="+18%" hint="após custos diretos" icon={Euro} tone="success" />
        <StatCard label="Contratos em risco" value={formatEUR(porFaturar)} hint="por assinar" icon={FileSignature} tone="warning" to="/contratos" />
        <StatCard label="Equipa por confirmar" value={String(porConfirmar.length)} hint="em espetáculos futuros" icon={Users2} tone={porConfirmar.length ? "danger" : "success"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel
            title="Riscos operacionais"
            subtitle="Resolver antes que se tornem problema em palco"
            padded={false}
            action={<Pill tone="danger">{riscos.length}</Pill>}
          >
            <ul className="divide-y divide-border">
              {riscos.map((r, i) => (
                <li key={i}>
                  <Link
                    to="/espetaculos/$id"
                    params={{ id: r.esp.id }}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{r.texto}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.esp.nome} · {new Date(r.esp.data).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Próximos espetáculos" padded={false} action={<Link to="/espetaculos" className="text-xs text-primary hover:underline">Ver todos</Link>}>
            <ul className="divide-y divide-border">
              {proximos.slice(0, 5).map((e) => {
                const I = meteoIcon(e.meteo.estado);
                const conf = e.equipa.filter((m) => m.confirmado).length;
                return (
                  <li key={e.id}>
                    <Link
                      to="/espetaculos/$id"
                      params={{ id: e.id }}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="w-11 shrink-0 text-center">
                        <p className="text-[10px] uppercase text-muted-foreground">
                          {new Date(e.data).toLocaleDateString("pt-PT", { month: "short" })}
                        </p>
                        <p className="text-lg font-semibold leading-none tabular-nums">
                          {new Date(e.data).getDate()}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.local} · {e.hora} · {conf}/{e.equipa.length} confirmados
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <I className="h-4 w-4 text-muted-foreground" />
                        <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
                          {formatEUR(e.preco)}
                        </span>
                        <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Atividade recente" padded={false}>
            <ul className="divide-y divide-border">
              {atividade.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar iniciais={a.autor.split(" ").map((w) => w[0]).slice(0, 2).join("")} size="sm" tone="neutral" />
                  <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    <span className="text-foreground">{a.autor}</span> {a.acao}{" "}
                    <span className="text-foreground">{a.alvo}</span>
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">{a.quando}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="As minhas tarefas" subtitle="Atribuídas a si" padded={false}>
            <ul className="divide-y divide-border">
              {tarefas.map((t) => {
                const done = feitas.includes(t.id);
                return (
                  <li key={t.id} className="flex items-start gap-3 px-5 py-3">
                    <button onClick={() => toggle(t.id)} className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", done && "text-muted-foreground line-through")}>{t.titulo}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t.prazo}</p>
                    </div>
                    <Pill tone={t.prioridade === "Alta" ? "danger" : t.prioridade === "Média" ? "warning" : "neutral"}>
                      {t.prioridade}
                    </Pill>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Equipa por confirmar" padded={false}>
            <ul className="divide-y divide-border">
              {porConfirmar.map((p, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                  <Avatar iniciais={p.musico.iniciais} size="sm" tone="warning" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.musico.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.papel} · {p.esp.nome}
                    </p>
                  </div>
                  <button className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                    Lembrar
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Indisponibilidades" padded={false}>
            <ul className="divide-y divide-border">
              {indisponiveis.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar iniciais={m.iniciais} size="sm" tone="danger" />
                  <div className="min-w-0 flex-1">
                    <Link to="/musicos/$id" params={{ id: m.id }} className="truncate text-sm font-medium hover:text-primary">
                      {m.nome}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{m.motivo}</p>
                  </div>
                  <Pill tone={estadoTone(m.disponibilidade)}>{m.disponibilidade}</Pill>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Próximos ensaios" padded={false}>
            <ul className="divide-y divide-border">
              {ensaios.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{e.banda}</p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {new Date(e.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })} · {e.hora}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.foco}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={(e.confirmados / e.total) * 100} tone={e.confirmados / e.total > 0.7 ? "success" : "warning"} />
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {e.confirmados}/{e.total}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

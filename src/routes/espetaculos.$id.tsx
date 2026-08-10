import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  Clock,
  Euro,
  Users2,
  Download,
  Share2,
  CheckCircle2,
  Circle,
  Truck,
  FileText,
  CloudRain,
  Wind,
  Send,
  Paperclip,
  Boxes,
  AlertTriangle,
  Radio,
  Bot,
  Music2,
  Zap,
} from "lucide-react";
import { PageHeader, Panel, Pill, estadoTone, Tabs, Field, Avatar, Progress, Meter } from "@/components/ui-kit";
import { espetaculos, formatEUR, getEquipamento, getMusica, getMusico, type Espetaculo } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espetaculos/$id")({
  loader: ({ params }) => {
    const esp = espetaculos.find((e) => e.id === params.id);
    if (!esp) throw notFound();
    return { esp };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Espetáculo indisponível · Encore OS" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.esp.nome} · Encore OS`;
    return {
      meta: [
        { title: t },
        {
          name: "description",
          content: `${loaderData.esp.banda} em ${loaderData.esp.local} para ${loaderData.esp.cliente}.`,
        },
        { property: "og:title", content: t },
        { property: "og:description", content: `Ficha operacional completa do espetáculo em ${loaderData.esp.local}.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EspetaculoDetalhe,
});

function EspetaculoDetalhe() {
  const { esp } = Route.useLoaderData() as { esp: Espetaculo };
  const [tab, setTab] = useState("resumo");
  const [feitos, setFeitos] = useState<string[]>(
    esp.checklists.flatMap((c) => c.itens.filter((i) => i.feito).map((i) => `${c.id}:${i.id}`)),
  );
  const [msg, setMsg] = useState("");

  const totalItens = esp.checklists.reduce((a, c) => a + c.itens.length, 0);
  const pctChecklist = totalItens ? Math.round((feitos.length / totalItens) * 100) : 0;
  const margem = esp.preco - esp.custos;
  const confirmados = esp.equipa.filter((m) => m.confirmado).length;

  const toggle = (k: string) => setFeitos((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  const tabs = [
    { id: "resumo", label: "Resumo" },
    { id: "equipa", label: "Equipa", badge: esp.equipa.length },
    { id: "agenda", label: "Agenda" },
    { id: "setlist", label: "Setlist", badge: esp.setlist.reduce((a, b) => a + b.musicas.length, 0) },
    { id: "logistica", label: "Logística" },
    { id: "equipamentos", label: "Equipamentos", badge: esp.equipamentos.length },
    { id: "financeiro", label: "Financeiro" },
    { id: "checklist", label: "Checklist", badge: totalItens },
    { id: "documentos", label: "Documentos", badge: esp.documentos.length },
    { id: "comunicacao", label: "Comunicação", badge: esp.mensagens.length },
    { id: "timeline", label: "Timeline" },
    { id: "relatorios", label: "Relatórios" },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Espetáculos", to: "/espetaculos" }, { label: esp.nome }]}
        title={esp.nome}
        description={`${esp.banda} · ${esp.cliente} · ${esp.tipoEvento}`}
        meta={
          <>
            <Pill tone={estadoTone(esp.estado)}>{esp.estado}</Pill>
            <Pill tone={estadoTone(esp.contrato)}>Contrato {esp.contrato}</Pill>
            <Pill tone={pctChecklist === 100 ? "success" : "warning"}>Produção {pctChecklist}%</Pill>
            {esp.riscos.length > 0 && (
              <Pill tone="danger">
                <AlertTriangle className="h-3 w-3" /> {esp.riscos.length} riscos
              </Pill>
            )}
          </>
        }
        actions={
          <>
            <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated">
              <Share2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Partilhar</span>
            </button>
            <Link
              to="/live"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated"
            >
              <Radio className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Modo ao vivo</span>
            </Link>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">Folha de sala</span>
            </button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Clock, label: "Palco", value: `${new Date(esp.data).toLocaleDateString("pt-PT")} · ${esp.hora}` },
          { icon: MapPin, label: "Local", value: esp.local },
          { icon: Euro, label: "Cachet", value: formatEUR(esp.preco) },
          { icon: Users2, label: "Equipa", value: `${confirmados}/${esp.equipa.length} confirmados` },
        ].map((i) => (
          <div key={i.label} className="panel flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
              <i.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{i.label}</p>
              <p className="truncate text-sm font-medium">{i.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="animate-fade-in">
        {tab === "resumo" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Ficha do espetáculo" className="lg:col-span-2">
              <dl className="grid gap-5 sm:grid-cols-3">
                <Field label="Cliente">{esp.cliente}</Field>
                <Field label="Responsável">{esp.responsavel}</Field>
                <Field label="Tipo de evento">{esp.tipoEvento}</Field>
                <Field label="Horário">{esp.hora} – {esp.fim}</Field>
                <Field label="Palco">{esp.palco}</Field>
                <Field label="Energia">{esp.energia}</Field>
                <Field label="Morada">{esp.morada}</Field>
                <Field label="Alojamento">{esp.alojamento}</Field>
                <Field label="Refeições">{esp.refeicoes}</Field>
              </dl>
            </Panel>
            <div className="space-y-6">
              <Panel title="Meteorologia">
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-semibold tabular-nums">{esp.meteo.temp}°</p>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{esp.meteo.estado}</p>
                    <p className="mt-1 flex items-center justify-end gap-1">
                      <Wind className="h-3 w-3" /> {esp.meteo.vento}
                    </p>
                    <p className="mt-1 flex items-center justify-end gap-1">
                      <CloudRain className="h-3 w-3" /> {esp.meteo.chuva}%
                    </p>
                  </div>
                </div>
                {esp.meteo.chuva > 40 && (
                  <p className="mt-4 rounded-lg border border-warning/20 bg-warning/10 p-3 text-xs text-warning">
                    Risco elevado de chuva — confirmar cobertura de palco e proteção do FOH.
                  </p>
                )}
              </Panel>
              <Panel title="Riscos">
                {esp.riscos.length ? (
                  <ul className="space-y-3 text-sm">
                    {esp.riscos.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                        <span className="text-muted-foreground">{r}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem riscos assinalados.</p>
                )}
              </Panel>
            </div>
          </div>
        )}

        {tab === "equipa" && (
          <Panel padded={false} title="Escalação" subtitle={`${confirmados} de ${esp.equipa.length} confirmados`}>
            <ul className="divide-y divide-border">
              {esp.equipa.map((m) => {
                const mus = getMusico(m.musicoId);
                if (!mus) return null;
                return (
                  <li key={m.musicoId} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                    <Avatar iniciais={mus.iniciais} tone={m.confirmado ? "primary" : "warning"} />
                    <Link to="/musicos/$id" params={{ id: mus.id }} className="min-w-0 hover:text-primary">
                      <p className="truncate text-sm font-medium">{mus.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.papel}</p>
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-sm tabular-nums text-muted-foreground sm:block">
                        {formatEUR(mus.cachet)}
                      </span>
                      <Pill tone={m.confirmado ? "success" : "warning"}>
                        {m.confirmado ? "Confirmado" : "Por confirmar"}
                      </Pill>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {tab === "agenda" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Dia do espetáculo" className="lg:col-span-2" padded={false}>
              <ul className="divide-y divide-border">
                {esp.timeline.map((t) => (
                  <li key={t.hora} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 px-5 py-3.5">
                    <span className="w-12 shrink-0 font-mono text-sm text-primary">{t.hora}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.titulo}</p>
                      <p className="text-xs text-muted-foreground">{t.detalhe}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Convocatórias">
              <div className="space-y-4 text-sm">
                <Field label="Saída do armazém">{esp.horaSaida}</Field>
                <Field label="Viagem">{esp.duracaoViagem} · {esp.distanciaKm} km</Field>
                <Field label="Soundcheck">18:00 · line check + 3 temas</Field>
                <Field label="Em palco">{esp.hora}</Field>
              </div>
            </Panel>
          </div>
        )}

        {tab === "setlist" && (
          <div className="space-y-6">
            {esp.setlist.map((bloco) => (
              <Panel
                key={bloco.bloco}
                title={bloco.bloco}
                padded={false}
                action={<span className="text-xs text-muted-foreground">{bloco.musicas.length} temas</span>}
              >
                <ul className="divide-y divide-border">
                  {bloco.musicas.map((nome, i) => {
                    const m = getMusica(nome);
                    return (
                      <li key={nome + i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                        <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                        <div className="min-w-0">
                          {m ? (
                            <Link to="/repertorio/$id" params={{ id: m.id }} className="truncate text-sm font-medium hover:text-primary">
                              {nome}
                            </Link>
                          ) : (
                            <p className="truncate text-sm font-medium">{nome}</p>
                          )}
                          <p className="truncate text-xs text-muted-foreground">
                            {m ? `${m.artista} · ${m.vocalista}` : "Fora do repertório catalogado"}
                          </p>
                        </div>
                        {m && (
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                              {m.tom} · {m.bpm} BPM · {m.duracao}
                            </span>
                            <Meter value={m.energia} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            ))}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <Bot className="h-4 w-4 shrink-0 text-primary" />
              <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                O Encore AI sugere trocar <span className="text-foreground">Vem Bailar</span> por{" "}
                <span className="text-foreground">Danza Kuduro</span> no fecho — público médio de {esp.publicoEstimado.toLocaleString("pt-PT")} reage melhor a energia 9+.
              </p>
              <Link to="/encore-ai" className="shrink-0 text-xs text-primary hover:underline">
                Abrir AI
              </Link>
            </div>
          </div>
        )}

        {tab === "logistica" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Transporte">
              <ul className="space-y-3 text-sm">
                {[
                  ["Carrinha 1 · Backline e PA", `Saída ${esp.horaSaida} · ${esp.duracaoViagem}`],
                  ["Carrinha 2 · Luz e estrutura", "Saída 1h antes da carrinha 1"],
                  ["Equipa artística", "Viaturas próprias · boleias atribuídas"],
                ].map(([a, b]) => (
                  <li key={a} className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a}</p>
                      <p className="text-xs text-muted-foreground">{b}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Local e acolhimento">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Morada">{esp.morada}</Field>
                <Field label="Distância">{esp.distanciaKm} km · {esp.duracaoViagem}</Field>
                <Field label="Palco">{esp.palco}</Field>
                <Field label="Energia">{esp.energia}</Field>
                <Field label="Alojamento">{esp.alojamento}</Field>
                <Field label="Refeições">{esp.refeicoes}</Field>
              </div>
            </Panel>
          </div>
        )}

        {tab === "equipamentos" && (
          <Panel padded={false} title="Carga para este espetáculo">
            <ul className="divide-y divide-border">
              {esp.equipamentos.map((id) => {
                const eq = getEquipamento(id);
                if (!eq) return null;
                return (
                  <li key={id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                      <Boxes className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{eq.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {eq.flightCase} · {eq.transportadoPor} · {eq.qr}
                      </p>
                    </div>
                    <Pill tone={estadoTone(eq.estado)}>{eq.estado}</Pill>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {tab === "financeiro" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Conta do espetáculo" className="lg:col-span-2" padded={false}>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {[
                    ["Cachet bruto", formatEUR(esp.preco)],
                    ["Cachets da equipa", `- ${formatEUR(esp.custos * 0.62)}`],
                    ["Logística e transporte", `- ${formatEUR(esp.custos * 0.24)}`],
                    ["Alojamento e catering", `- ${formatEUR(esp.custos * 0.14)}`],
                    ["Margem estimada", formatEUR(margem)],
                  ].map(([k, v], i, arr) => (
                    <tr key={k} className={cn(i === arr.length - 1 && "font-medium text-success")}>
                      <td className="px-5 py-3 text-muted-foreground">{k}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
            <div className="space-y-6">
              <Panel title="Pagamentos">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sinal 30%</span>
                    <Pill tone={esp.contrato === "Assinado" ? "success" : "warning"}>
                      {esp.contrato === "Assinado" ? "Recebido" : "Pendente"}
                    </Pill>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Restante 70%</span>
                    <Pill tone="warning">A 30 dias</Pill>
                  </li>
                </ul>
              </Panel>
              <Panel title="Rentabilidade">
                <p className="text-3xl font-semibold tabular-nums text-success">
                  {Math.round((margem / esp.preco) * 100)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">margem sobre cachet bruto</p>
                <div className="mt-4">
                  <Progress value={(margem / esp.preco) * 100} tone="success" />
                </div>
              </Panel>
            </div>
          </div>
        )}

        {tab === "checklist" && (
          <div className="space-y-4">
            <div className="panel flex items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Prontidão global</p>
                <div className="mt-2">
                  <Progress value={pctChecklist} tone={pctChecklist === 100 ? "success" : "primary"} />
                </div>
              </div>
              <p className="shrink-0 text-2xl font-semibold tabular-nums">{pctChecklist}%</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {esp.checklists.map((c) => (
                <Panel key={c.id} title={c.nome} padded={false}>
                  <ul className="divide-y divide-border">
                    {c.itens.map((it) => {
                      const k = `${c.id}:${it.id}`;
                      const done = feitos.includes(k);
                      return (
                        <li key={k} className="flex items-center gap-3 px-5 py-2.5">
                          <button onClick={() => toggle(k)} className="shrink-0">
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </button>
                          <span className={cn("min-w-0 flex-1 truncate text-sm", done && "text-muted-foreground line-through")}>
                            {it.texto}
                          </span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{it.responsavel}</span>
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {tab === "documentos" && (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {esp.documentos.map((d) => (
                <li key={d.nome} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.tipo}</p>
                  </div>
                  <Pill tone={estadoTone(d.estado)}>{d.estado}</Pill>
                  <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "comunicacao" && (
          <Panel title="Canal do espetáculo" subtitle={`${esp.equipa.length + 2} participantes`} padded={false}>
            <ul className="space-y-5 p-5">
              {esp.mensagens.map((m) => (
                <li key={m.id} className="flex gap-3">
                  <Avatar iniciais={m.iniciais} size="sm" tone="neutral" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-medium">{m.autor}</span>
                      <span className="text-[11px] text-muted-foreground">{m.quando}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{m.texto}</p>
                    {m.anexo && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border bg-elevated/60 px-2.5 py-1 text-xs">
                        <Paperclip className="h-3 w-3" /> {m.anexo}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">Lido por {m.lidoPor}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Escrever para a equipa…"
                className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-input"
              />
              <button
                onClick={() => setMsg("")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </Panel>
        )}

        {tab === "timeline" && (
          <Panel title="Cronograma operacional">
            <ol className="relative space-y-6 border-l border-border pl-6">
              {esp.timeline.map((t) => (
                <li key={t.hora} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                  <p className="font-mono text-xs text-primary">{t.hora}</p>
                  <p className="text-sm font-medium">{t.titulo}</p>
                  <p className="text-xs text-muted-foreground">{t.detalhe}</p>
                </li>
              ))}
            </ol>
          </Panel>
        )}

        {tab === "relatorios" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Relatório pós-espetáculo" className="lg:col-span-2">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Público estimado">{esp.publicoEstimado.toLocaleString("pt-PT")}</Field>
                <Field label="Duração em palco">{esp.hora} – {esp.fim}</Field>
                <Field label="Margem">{formatEUR(margem)}</Field>
                <Field label="Atrasos registados">Nenhum</Field>
                <Field label="Avarias">1 · cabo XLR canal 6</Field>
                <Field label="Satisfação do cliente">9,2 / 10</Field>
              </div>
              <p className="mt-6 rounded-lg border border-border bg-elevated/60 p-4 text-sm text-muted-foreground">
                Bloco latino foi o momento de maior pista. Recomenda-se antecipar o bloco 2 em 15 minutos
                em eventos com público acima de 3 000 pessoas.
              </p>
            </Panel>
            <div className="space-y-6">
              <Panel title="Temas com mais reação">
                <ul className="space-y-3">
                  {["Bailando", "Danza Kuduro", "Chamar a Música"].map((n, i) => (
                    <li key={n} className="flex items-center gap-3 text-sm">
                      <Music2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{n}</span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">#{i + 1}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Exportar">
                <ul className="space-y-2 text-sm">
                  {["Relatório PDF para o cliente", "Mapa de cachets", "Registo de equipamento"].map((x) => (
                    <li key={x}>
                      <button className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-elevated">
                        <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="min-w-0 flex-1 truncate">{x}</span>
                        <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

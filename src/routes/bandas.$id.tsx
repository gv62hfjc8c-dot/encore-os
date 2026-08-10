import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Pill, estadoTone } from "@/components/ui-kit";
import { bandas, equipamentos, espetaculos, formatEUR, musicos } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bandas/$id")({
  loader: ({ params }) => {
    const banda = bandas.find((b) => b.id === params.id);
    if (!banda) throw notFound();
    return { banda };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Banda indisponível · Encore OS" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.banda.nome} · Encore OS`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `${loaderData.banda.genero} · ${loaderData.banda.membros} músicos.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Ficha completa da banda ${loaderData.banda.nome}.` },
      ],
    };
  },
  component: BandaDetalhe,
});

const tabs = ["Informações", "Membros", "Histórico", "Equipamentos", "Agenda", "Contratos"];

function BandaDetalhe() {
  const { banda } = Route.useLoaderData();
  const [tab, setTab] = useState("Informações");
  const shows = espetaculos.filter((e) => e.banda === banda.nome);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Bandas", to: "/bandas" }, { label: banda.nome }]}
        title={banda.nome}
        description={`${banda.genero} · ${banda.membros} músicos · cachet médio ${formatEUR(banda.cachetMedio)}`}
        actions={
          <Link
            to="/espetaculos/novo"
            className="flex h-9 items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Agendar
          </Link>
        }
      />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="animate-fade-in grid gap-6 lg:grid-cols-3">
        {tab === "Informações" && (
          <>
            <Panel title="Ficha" className="lg:col-span-2">
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Género", banda.genero],
                  ["Formação", `${banda.membros} elementos`],
                  ["Duração de espetáculo", "3 × 60 min"],
                  ["Raio de deslocação", "Todo o país + Galiza"],
                  ["Som e luz", "Produção própria"],
                  ["Cachet base", formatEUR(banda.cachetMedio)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd className="mt-1 text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
            <Panel title="Desempenho">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Espetáculos 2026</span><span className="tabular-nums">18</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Faturação</span><span className="tabular-nums">{formatEUR(122400)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxa de conversão</span><span className="tabular-nums text-success">64%</span></div>
              </div>
            </Panel>
          </>
        )}

        {tab === "Membros" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {musicos.map((m) => (
                <li key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-semibold text-primary">{m.iniciais}</span>
                  <Link to="/musicos/$id" params={{ id: m.id }} className="min-w-0 hover:text-primary">
                    <p className="truncate text-sm font-medium">{m.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.instrumentos.join(" · ")}</p>
                  </Link>
                  <Pill tone={estadoTone(m.disponibilidade)}>{m.disponibilidade}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {(tab === "Histórico" || tab === "Agenda") && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {shows.map((e) => (
                <li key={e.id}>
                  <Link to="/espetaculos/$id" params={{ id: e.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{new Date(e.data).toLocaleDateString("pt-PT")} · {e.local}</p>
                    </div>
                    <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Equipamentos" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {equipamentos.slice(0, 4).map((eq) => (
                <li key={eq.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{eq.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{eq.localizacao}</p>
                  </div>
                  <Pill tone={estadoTone(eq.estado)}>{eq.estado}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Contratos" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {shows.map((e) => (
                <li key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">Contrato — {e.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.cliente} · {formatEUR(e.preco)}</p>
                  </div>
                  <Pill tone={estadoTone(e.contrato)}>{e.contrato}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  );
}

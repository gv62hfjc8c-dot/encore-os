import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Youtube, Mail, TrendingUp, Megaphone } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard } from "@/components/ui-kit";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing · Encore OS" },
      { name: "description", content: "Campanhas, redes sociais e captação de leads para as suas bandas." },
      { property: "og:title", content: "Marketing · Encore OS" },
      { property: "og:description", content: "Campanhas e presença digital das suas bandas." },
    ],
  }),
  component: Marketing,
});

function Marketing() {
  return (
    <>
      <PageHeader title="Marketing" description="Campanhas, conteúdo e captação de leads" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Alcance mensal" value="184 mil" delta="+12%" icon={TrendingUp} />
        <StatCard label="Novos seguidores" value="2 340" delta="+8%" icon={Instagram} tone="success" />
        <StatCard label="Leads gerados" value="37" delta="+19%" icon={Mail} tone="warning" />
        <StatCard label="Campanhas ativas" value="3" hint="2 pagas · 1 orgânica" icon={Megaphone} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Campanhas" padded={false}>
          <ul className="divide-y divide-border">
            {[
              ["Verão 2026 — Autarquias", "Meta Ads", "Ativa", "success"],
              ["Casamentos Setembro", "Google Ads", "Ativa", "success"],
              ["Rebrand Nova Onda", "Orgânica", "Planeada", "warning"],
            ].map(([n, c, s, tone]) => (
              <li key={n} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{n}</p>
                  <p className="text-xs text-muted-foreground">{c}</p>
                </div>
                <Pill tone={String(tone)}>{s}</Pill>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Canais">
          <ul className="space-y-4 text-sm">
            {[
              [Instagram, "Instagram", "18,4 mil seguidores", "+6,2%"],
              [Youtube, "YouTube", "42 mil visualizações", "+11,8%"],
              [Mail, "Newsletter", "1 240 subscritores", "+3,4%"],
            ].map(([Icon, nome, v, d], i) => {
              const I = Icon as React.ComponentType<{ className?: string }>;
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                    <I className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{nome as string}</p>
                    <p className="truncate text-xs text-muted-foreground">{v as string}</p>
                  </div>
                  <span className="shrink-0 text-xs text-success">{d as string}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

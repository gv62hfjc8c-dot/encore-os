import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Columns3, GitBranch } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { roadmap } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap · Encore OS" },
      { name: "description", content: "Kanban e timeline do produto com prioridades e versões." },
      { property: "og:title", content: "Roadmap · Encore OS" },
      { property: "og:description", content: "O que está a ser construído no Encore OS." },
    ],
  }),
  component: Roadmap,
});

function Roadmap() {
  const [vista, setVista] = useState<"kanban" | "timeline">("kanban");

  return (
    <>
      <PageHeader
        title="Roadmap"
        description="Prioridades e versões do produto"
        actions={
          <div className="flex h-9 items-center rounded-lg border border-border bg-surface p-0.5">
            {([["kanban", Columns3], ["timeline", GitBranch]] as const).map(([k, Icon]) => (
              <button
                key={k}
                onClick={() => setVista(k)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-medium capitalize transition-colors",
                  vista === k ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {k}
              </button>
            ))}
          </div>
        }
      />

      {vista === "kanban" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roadmap.colunas.map((col) => (
            <div key={col.id} className="panel p-3">
              <div className="flex items-center justify-between px-1.5 pb-3">
                <p className="text-sm font-medium">{col.titulo}</p>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {col.cards.length}
                </span>
              </div>
              <ul className="space-y-2">
                {col.cards.map((c) => (
                  <li
                    key={c.id}
                    className="cursor-grab rounded-lg border border-border bg-elevated p-3 transition-colors hover:border-input"
                  >
                    <p className="text-sm">{c.titulo}</p>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <Pill tone="primary">{c.versao}</Pill>
                      <Pill tone={c.prioridade === "Alta" ? "danger" : c.prioridade === "Média" ? "warning" : "neutral"}>
                        {c.prioridade}
                      </Pill>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <Panel title="Timeline 2026">
          <ol className="relative space-y-6 border-l border-border pl-6">
            {[
              ["v1.0 · Junho", "Dashboard, bandas, músicos e repertório"],
              ["v1.1 · Agosto", "Agenda drag & drop, inventário com QR"],
              ["v1.2 · Outubro", "Faturação automática e relatórios"],
              ["v1.3 · Dezembro", "Portal do cliente e assinatura digital"],
              ["v1.4 · 2027", "App móvel para músicos"],
            ].map(([v, d]) => (
              <li key={v} className="relative">
                <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm font-medium">{v}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </>
  );
}

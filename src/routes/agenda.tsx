import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, LayoutGrid, List, Filter, GripVertical, Plus } from "lucide-react";
import { PageHeader, Panel, Pill, estadoTone } from "@/components/ui-kit";
import { espetaculos, formatEUR } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda · Encore OS" },
      { name: "description", content: "Calendário mensal, semanal e lista de atuações com drag & drop." },
      { property: "og:title", content: "Agenda · Encore OS" },
      { property: "og:description", content: "Planeamento visual de todas as atuações das suas bandas." },
    ],
  }),
  component: Agenda,
});

type Vista = "mes" | "semana" | "lista";

const bandasFiltro = ["Todas", "Encore Live Band", "Nova Onda", "Atlântico Show"];

function Agenda() {
  const [vista, setVista] = useState<Vista>("mes");
  const [banda, setBanda] = useState("Todas");
  const [dragId, setDragId] = useState<string | null>(null);
  const [posicoes, setPosicoes] = useState<Record<string, number>>(
    Object.fromEntries(espetaculos.map((e) => [e.id, new Date(e.data).getDate()])),
  );

  const lista = espetaculos.filter((e) => banda === "Todas" || e.banda === banda);
  const cells = Array.from({ length: 42 }, (_, i) => i - 4);

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Arraste um espetáculo para outro dia para reagendar."
        actions={
          <>
            <div className="flex h-9 items-center rounded-lg border border-border bg-surface p-0.5">
              {(
                [
                  { k: "mes", label: "Mês", icon: LayoutGrid },
                  { k: "semana", label: "Semana", icon: CalendarDays },
                  { k: "lista", label: "Lista", icon: List },
                ] as const
              ).map((v) => (
                <button
                  key={v.k}
                  onClick={() => setVista(v.k)}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-medium transition-colors",
                    vista === v.k
                      ? "bg-elevated text-foreground shadow-panel"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
            <Link
              to="/espetaculos/novo"
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar</span>
            </Link>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Banda
        </span>
        {bandasFiltro.map((b) => (
          <button
            key={b}
            onClick={() => setBanda(b)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs transition-colors",
              banda === b
                ? "border-primary/30 bg-primary/12 text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {b}
          </button>
        ))}
      </div>

      {vista === "mes" && (
        <Panel title="Agosto 2026" padded={false}>
          <div className="grid grid-cols-7 border-b border-border text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d} className="py-2">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const valid = d >= 1 && d <= 31;
              const eventos = lista.filter((e) => posicoes[e.id] === d && valid);
              return (
                <div
                  key={i}
                  onDragOver={(ev) => valid && ev.preventDefault()}
                  onDrop={() => {
                    if (valid && dragId) setPosicoes((p) => ({ ...p, [dragId]: d }));
                    setDragId(null);
                  }}
                  className={cn(
                    "min-h-[104px] border-b border-r border-border p-1.5 transition-colors",
                    !valid && "bg-background/40",
                    valid && dragId && "hover:bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px]",
                      valid ? "text-muted-foreground" : "text-muted-foreground/25",
                    )}
                  >
                    {valid ? d : ""}
                  </span>
                  <div className="mt-1 space-y-1">
                    {eventos.map((e) => (
                      <div
                        key={e.id}
                        draggable
                        onDragStart={() => setDragId(e.id)}
                        className="group cursor-grab rounded-md border border-primary/20 bg-primary/10 px-1.5 py-1 active:cursor-grabbing"
                      >
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-3 w-3 shrink-0 text-primary/60" />
                          <span className="truncate text-[11px] font-medium text-primary">
                            {e.nome}
                          </span>
                        </div>
                        <p className="truncate pl-4 text-[10px] text-muted-foreground">{e.hora}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {vista === "semana" && (
        <Panel title="Semana de 24 a 30 de Agosto" padded={false}>
          <div className="grid grid-cols-7 divide-x divide-border">
            {["24 Seg", "25 Ter", "26 Qua", "27 Qui", "28 Sex", "29 Sáb", "30 Dom"].map((d, i) => (
              <div key={d} className="min-h-[420px] p-2">
                <p className="pb-2 text-[11px] text-muted-foreground">{d}</p>
                {i === 5 && (
                  <div className="rounded-lg border border-warning/25 bg-warning/10 p-2">
                    <p className="text-[11px] font-medium text-warning">Noite Branca</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">00:30 · Braga</p>
                  </div>
                )}
                {i === 4 && (
                  <div className="rounded-lg border border-border bg-elevated p-2">
                    <p className="text-[11px] font-medium">Ensaio geral</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">19:00 · Estúdio Gaia</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {vista === "lista" && (
        <Panel padded={false}>
          <ul className="divide-y divide-border">
            {lista.map((e) => (
              <li key={e.id}>
                <Link
                  to="/espetaculos/$id"
                  params={{ id: e.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {new Date(e.data).toLocaleDateString("pt-PT", { day: "2-digit", month: "long" })} ·{" "}
                      {e.hora} · {e.local}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm tabular-nums sm:block">{formatEUR(e.preco)}</span>
                    <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

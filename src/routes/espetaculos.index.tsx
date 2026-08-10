import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { PageHeader, Panel, Pill, estadoTone } from "@/components/ui-kit";
import { espetaculos, formatEUR } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espetaculos/")({
  head: () => ({
    meta: [
      { title: "Espetáculos · Encore OS" },
      { name: "description", content: "Tabela de espetáculos com estado, cliente, local, preço e contrato." },
      { property: "og:title", content: "Espetáculos · Encore OS" },
      { property: "og:description", content: "Gestão completa de todos os espetáculos contratados." },
    ],
  }),
  component: Espetaculos,
});

const estados = ["Todos", "Confirmado", "Proposta", "Reservado", "Concluído", "Cancelado"];

function Espetaculos() {
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos");

  const rows = useMemo(
    () =>
      espetaculos.filter(
        (e) =>
          (estado === "Todos" || e.estado === estado) &&
          (e.nome + e.cliente + e.local + e.banda).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, estado],
  );

  return (
    <>
      <PageHeader
        title="Espetáculos"
        description={`${espetaculos.length} eventos · ${formatEUR(espetaculos.reduce((a, e) => a + e.preco, 0))} em valor contratado`}
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo espetáculo
          </button>
        }
      />

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 sm:w-72">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          {estados.map((s) => (
            <button
              key={s}
              onClick={() => setEstado(s)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                estado === s
                  ? "border-primary/30 bg-primary/12 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Colunas</span>
        </button>
      </div>

      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["Espetáculo", "Estado", "Data", "Cliente", "Local", "Preço", "Contrato", "Responsável"].map(
                  (h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        {h}
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </span>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((e) => (
                <tr key={e.id} className="group transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3.5">
                    <Link
                      to="/espetaculos/$id"
                      params={{ id: e.id }}
                      className="font-medium transition-colors group-hover:text-primary"
                    >
                      {e.nome}
                    </Link>
                    <p className="text-xs text-muted-foreground">{e.banda}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                    {new Date(e.data).toLocaleDateString("pt-PT")} · {e.hora}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.cliente}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.local}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 tabular-nums">{formatEUR(e.preco)}</td>
                  <td className="px-5 py-3.5">
                    <Pill tone={estadoTone(e.contrato)}>{e.contrato}</Pill>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{e.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>{rows.length} resultados</span>
          <div className="flex gap-1">
            <button className="rounded-md border border-border px-2 py-1 hover:text-foreground">Anterior</button>
            <button className="rounded-md border border-border px-2 py-1 hover:text-foreground">Seguinte</button>
          </div>
        </div>
      </Panel>
    </>
  );
}

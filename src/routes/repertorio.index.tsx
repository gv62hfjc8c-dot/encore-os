import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListMusic, Plus, Search, Music4, GraduationCap, Layers } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, Progress, Meter } from "@/components/ui-kit";
import { medleys, porAprender, repertorio } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/repertorio/")({
  head: () => ({
    meta: [
      { title: "Repertório · Encore OS" },
      { name: "description", content: "Centro musical da banda: tom, BPM, energia, stems, partituras e domínio por elemento." },
      { property: "og:title", content: "Repertório · Encore OS" },
      { property: "og:description", content: "Muito mais do que uma lista de músicas — o centro musical da operação." },
    ],
  }),
  component: Repertorio,
});

const estilos = ["Todos", "Latino", "Rock Português", "Pop Rock PT", "Popular", "Pimba Pop", "Balada"];

function Repertorio() {
  const [q, setQ] = useState("");
  const [estilo, setEstilo] = useState("Todos");

  const lista = useMemo(
    () =>
      repertorio.filter(
        (m) =>
          (estilo === "Todos" || m.estilo === estilo) &&
          (m.nome.toLowerCase().includes(q.toLowerCase()) || m.artista.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, estilo],
  );

  const dominioMedio = Math.round(repertorio.reduce((a, m) => a + m.dominio, 0) / repertorio.length);
  const minutos = repertorio.reduce((a, m) => {
    const [mm, ss] = m.duracao.split(":").map(Number);
    return a + (mm ?? 0) + (ss ?? 0) / 60;
  }, 0);

  return (
    <>
      <PageHeader
        title="Repertório"
        description="O centro musical da operação — tom, energia, materiais e domínio de cada tema."
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova música
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Temas ativos" value={String(repertorio.length)} hint="prontos para palco" icon={ListMusic} />
        <StatCard label="Duração total" value={`${Math.round(minutos)} min`} hint="≈ 2 blocos de baile" icon={Music4} />
        <StatCard label="Domínio médio" value={`${dominioMedio}%`} hint="da banda" icon={GraduationCap} tone="success" />
        <StatCard label="Por aprender" value={String(porAprender.length)} hint="com prazo definido" icon={Layers} tone="warning" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 sm:max-w-xs">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar tema ou artista…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {estilos.map((s) => (
            <button
              key={s}
              onClick={() => setEstilo(s)}
              className={cn(
                "h-9 rounded-lg border px-3 text-xs transition-colors",
                estilo === s
                  ? "border-primary/30 bg-primary/12 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:bg-elevated",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel padded={false} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {["Tema", "Tom / BPM", "Duração", "Energia", "Vocalista", "Domínio", "Materiais"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.map((m) => (
                  <tr key={m.id} className="group transition-colors hover:bg-accent/40">
                    <td className="px-5 py-3.5">
                      <Link to="/repertorio/$id" params={{ id: m.id }} className="block min-w-0">
                        <span className="block truncate font-medium group-hover:text-primary">{m.nome}</span>
                        <span className="block truncate text-xs text-muted-foreground">{m.artista} · {m.estilo}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[13px] text-muted-foreground">
                      {m.tom} · {m.bpm}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-muted-foreground">{m.duracao}</td>
                    <td className="px-5 py-3.5"><Meter value={m.energia} /></td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{m.vocalista}</td>
                    <td className="px-5 py-3.5">
                      <div className="w-24">
                        <Progress value={m.dominio} tone={m.dominio >= 90 ? "success" : m.dominio >= 75 ? "warning" : "danger"} />
                        <span className="mt-1 block text-[10px] tabular-nums text-muted-foreground">{m.dominio}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <div className="flex gap-1">
                        {m.clickTrack && <Pill tone="primary">Click</Pill>}
                        {m.stems && <Pill tone="success">Stems</Pill>}
                        {m.partituraSopros && <Pill>Sopros</Pill>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Por aprender" subtitle="Com prazo e responsável atribuídos">
            <ul className="space-y-4">
              {porAprender.map((p) => (
                <li key={p.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.musica}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.artista} · {p.responsavel}</p>
                    </div>
                    <Pill tone="warning">{p.prazo}</Pill>
                  </div>
                  <div className="mt-2"><Progress value={p.progresso} tone="warning" /></div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Medleys" subtitle="Sequências já ensaiadas e testadas em pista">
            <ul className="space-y-3">
              {medleys.map((m) => (
                <li key={m.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{m.nome}</p>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{m.duracao}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{m.musicas.join(" → ")}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

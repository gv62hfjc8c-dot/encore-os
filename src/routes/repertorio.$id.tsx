import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Play, FileMusic, Video, StickyNote, History, Info } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { repertorio } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/repertorio/$id")({
  loader: ({ params }) => {
    const musica = repertorio.find((m) => m.id === params.id);
    if (!musica) throw notFound();
    return { musica };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Música indisponível · Encore OS" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.musica.nome} · Repertório · Encore OS`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `${loaderData.musica.artista} · ${loaderData.musica.tom} · ${loaderData.musica.bpm} BPM.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Ficha técnica, letra e gravações de ${loaderData.musica.nome}.` },
      ],
    };
  },
  component: MusicaDetalhe,
});

const tabs = [
  { k: "Informações", icon: Info },
  { k: "Letra", icon: StickyNote },
  { k: "Partitura", icon: FileMusic },
  { k: "Áudio", icon: Play },
  { k: "Vídeo", icon: Video },
  { k: "Histórico", icon: History },
];

function MusicaDetalhe() {
  const { musica } = Route.useLoaderData();
  const [tab, setTab] = useState("Informações");

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Repertório", to: "/repertorio" }, { label: musica.nome }]}
        title={musica.nome}
        description={`${musica.artista} · ${musica.duracao}`}
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Play className="h-4 w-4" /> Reproduzir
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["BPM", String(musica.bpm)],
          ["Tom", musica.tom],
          ["Vocalista", musica.vocalista],
          ["Energia", musica.energia],
        ].map(([k, v]) => (
          <div key={k} className="panel p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</p>
            <p className="mt-1 text-lg font-medium tracking-tight">{v}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
              tab === t.k ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.k}
            {tab === t.k && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === "Informações" && (
          <Panel title="Ficha técnica">
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                ["Estrutura", "Intro · Verso · Refrão ×2 · Ponte · Refrão"],
                ["Instrumentação", "Voz, guitarra, teclas, baixo, bateria, sax"],
                ["Playback", "Click + pad em Ableton"],
                ["Última atuação", musica.ultima],
                ["Vezes tocada", "38"],
                ["Momento ideal", "2.º set"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        )}

        {tab === "Letra" && (
          <Panel title="Letra">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-muted-foreground">
{`[Verso 1]
Yo te miro, se me corta la respiración
Cuando tú me miras, se me sube el corazón

[Refrão]
Bailando, bailando
Tu cuerpo y el mío, llenando el vacío

[Ponte]
(Modulação para Bm — entrada do sax)`}
            </pre>
          </Panel>
        )}

        {tab === "Partitura" && (
          <Panel title="Partitura">
            <div className="grid h-64 place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Partitura_{musica.nome.replace(/\s/g, "_")}.pdf · 4 páginas
            </div>
          </Panel>
        )}

        {tab === "Áudio" && (
          <Panel title="Gravações">
            <div className="space-y-3">
              {["Versão de estúdio", "Ao vivo · Viana 2026", "Playback / click"].map((a) => (
                <div key={a} className="flex items-center gap-3 rounded-lg border border-border bg-elevated/50 p-3">
                  <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Play className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{a}</p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 rounded-full bg-primary" />
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{musica.duracao}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab === "Vídeo" && (
          <Panel title="Vídeo de referência">
            <div className="grid aspect-video place-items-center rounded-xl border border-border bg-elevated text-sm text-muted-foreground">
              <Video className="h-8 w-8 opacity-40" />
            </div>
          </Panel>
        )}

        {tab === "Histórico" && (
          <Panel padded={false} title="Onde foi tocada">
            <ul className="divide-y divide-border">
              {["19 Jul 2026 · Viana do Castelo", "05 Jul 2026 · Bombarral", "28 Jun 2026 · Ovar"].map((h) => (
                <li key={h} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span>{h}</span>
                  <Pill tone="success">Executada</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  );
}

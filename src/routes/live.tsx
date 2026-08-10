import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  StickyNote,
  Users2,
  Volume2,
  Maximize2,
} from "lucide-react";
import { Pill, Meter } from "@/components/ui-kit";
import { espetaculos, getMusica, getMusico, HOJE } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Modo ao vivo · Encore OS" },
      {
        name: "description",
        content: "Interface de palco: setlist a correr, cronómetro, tom, BPM e notas do diretor musical.",
      },
      { property: "og:title", content: "Modo ao vivo · Encore OS" },
      { property: "og:description", content: "Tudo o que a banda precisa em palco, num único ecrã legível." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveMode,
});

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function LiveMode() {
  const esp =
    espetaculos.find((e) => e.data >= HOJE && e.estado === "Confirmado" && e.setlist.length > 0) ?? espetaculos[0]!;

  const alinhamento = esp.setlist.flatMap((b) => b.musicas.map((nome) => ({ bloco: b.bloco, nome })));

  const [idx, setIdx] = useState(0);
  const [correr, setCorrer] = useState(false);
  const [seg, setSeg] = useState(0);
  const [notas, setNotas] = useState(true);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (correr) {
      tick.current = setInterval(() => setSeg((s) => s + 1), 1000);
    }
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [correr]);

  const atualNome = alinhamento[idx]?.nome ?? "";
  const atual = getMusica(atualNome);
  const proxima = getMusica(alinhamento[idx + 1]?.nome ?? "");

  const avancar = () => {
    setIdx((i) => Math.min(i + 1, alinhamento.length - 1));
    setSeg(0);
  };

  return (
    <div className="-m-1 animate-fade-in">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/espetaculos/$id"
            params={{ id: esp.id }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface transition-colors hover:bg-elevated"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{esp.nome}</p>
            <p className="truncate text-xs text-muted-foreground">
              {esp.banda} · {esp.local} · {esp.hora}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="danger">AO VIVO</Pill>
          <button
            onClick={() => setNotas((n) => !n)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors",
              notas ? "bg-elevated" : "bg-surface hover:bg-elevated",
            )}
          >
            <StickyNote className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Notas</span>
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface transition-colors hover:bg-elevated">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Tema atual */}
        <section className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            {alinhamento[idx]?.bloco} · tema {idx + 1} de {alinhamento.length}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{atualNome}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {atual ? `${atual.artista} · voz ${atual.vocalista}` : "Tema livre"}
          </p>

          {atual && (
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["Tom", atual.tom],
                ["BPM", String(atual.bpm)],
                ["Duração", atual.duracao],
                ["Estilo", atual.estilo],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{l}</p>
                  <p className="mt-1 font-mono text-2xl tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          )}

          {atual && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Energia</span>
                <Meter value={atual.energia} />
              </div>
              {atual.clickTrack && <Pill tone="primary">Click</Pill>}
              {atual.backingTrack && <Pill tone="primary">Playback</Pill>}
              {atual.solo && <Pill tone="warning">Solo · {atual.solo}</Pill>}
            </div>
          )}

          {/* Cronómetro */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
            <p className="font-mono text-5xl tabular-nums">{fmt(seg)}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCorrer((c) => !c)}
                className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {correr ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {correr ? "Pausar" : "Iniciar"}
              </button>
              <button
                onClick={() => setSeg(0)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface transition-colors hover:bg-elevated"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={avancar}
                className="flex h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm transition-colors hover:bg-elevated"
              >
                <SkipForward className="h-4 w-4" /> Próximo
              </button>
            </div>
          </div>

          {notas && atual?.notasDM && (
            <p className="mt-6 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
              <span className="font-medium">Nota do DM · </span>
              {atual.notasDM}
            </p>
          )}

          {proxima && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-elevated/50 p-4">
              <SkipForward className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">A seguir</p>
                <p className="truncate text-sm font-medium">{proxima.nome}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {proxima.tom} · {proxima.bpm} BPM
              </span>
            </div>
          )}
        </section>

        {/* Alinhamento + palco */}
        <div className="space-y-5">
          <section className="panel overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-medium">Alinhamento</h2>
              <span className="text-xs text-muted-foreground">{alinhamento.length} temas</span>
            </header>
            <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
              {alinhamento.map((a, i) => {
                const m = getMusica(a.nome);
                return (
                  <li key={a.nome + i}>
                    <button
                      onClick={() => {
                        setIdx(i);
                        setSeg(0);
                      }}
                      className={cn(
                        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 text-left transition-colors",
                        i === idx ? "bg-primary/10" : i < idx ? "opacity-45 hover:bg-accent/40" : "hover:bg-accent/40",
                      )}
                    >
                      <span className={cn("w-5 shrink-0 text-xs tabular-nums", i === idx ? "text-primary" : "text-muted-foreground")}>
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("block truncate text-sm", i === idx && "font-medium text-primary")}>
                          {a.nome}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">{a.bloco}</span>
                      </span>
                      {m && (
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {m.tom} · {m.duracao}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel overflow-hidden">
            <header className="flex items-center gap-2 border-b border-border px-5 py-3.5">
              <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-sm font-medium">Em palco</h2>
            </header>
            <ul className="divide-y divide-border">
              {esp.equipa.map((e) => {
                const m = getMusico(e.musicoId);
                if (!m) return null;
                return (
                  <li key={e.musicoId} className="flex items-center gap-3 px-5 py-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/12 text-[10px] font-semibold text-primary">
                      {m.iniciais}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{m.nome}</span>
                    <span className="shrink-0 truncate text-[11px] text-muted-foreground">{e.papel}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel flex items-center gap-3 p-5">
            <Volume2 className="h-4 w-4 shrink-0 text-primary" />
            <p className="min-w-0 flex-1 text-xs text-muted-foreground">
              FOH: {esp.energia}. Limite de ruído a respeitar até {esp.fim}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

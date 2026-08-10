import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  ListMusic,
  Users2,
  CloudRain,
  Truck,
  FileAudio,
  ListChecks,
  Clock,
  ArrowRight,
} from "lucide-react";
import { PageHeader, Panel, Pill, Avatar } from "@/components/ui-kit";
import { aiSkills, espetaculos, HOJE } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/encore-ai")({
  head: () => ({
    meta: [
      { title: "Encore AI · Encore OS" },
      {
        name: "description",
        content:
          "Assistente de produção: setlists sugeridas, análise de público, risco meteorológico, logística e resumos.",
      },
      { property: "og:title", content: "Encore AI · Encore OS" },
      { property: "og:description", content: "Inteligência aplicada à produção de espetáculos ao vivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EncoreAI,
});

const icones: Record<string, React.ComponentType<{ className?: string }>> = {
  ListMusic,
  Users2,
  Sparkles,
  CloudRain,
  Truck,
  FileAudio,
  ListChecks,
  Clock,
  Bot,
};

type Turno = { autor: "ai" | "eu"; texto: string; chips?: string[] };

const conversaInicial: Turno[] = [
  {
    autor: "ai",
    texto:
      "Analisei os 5 espetáculos das próximas semanas. Há três coisas que merecem decisão hoje: a licença de ruído de Aveiro, o contrato da Noite Branca (11 dias parado) e o risco de chuva de 65% na Feira Franca.",
    chips: ["Ver plano B de chuva", "Redigir email de contrato", "Resumir tudo em 5 linhas"],
  },
];

function EncoreAI() {
  const [conversa, setConversa] = useState<Turno[]>(conversaInicial);
  const [input, setInput] = useState("");

  const proximos = espetaculos.filter((e) => e.data >= HOJE && e.estado !== "Cancelado").slice(0, 3);

  const enviar = (texto: string) => {
    if (!texto.trim()) return;
    setConversa((c) => [
      ...c,
      { autor: "eu", texto },
      {
        autor: "ai",
        texto:
          "Com base no histórico de eventos semelhantes e no público estimado, proponho abrir com o bloco latino às 22h30, manter os temas de energia 9 nos primeiros 25 minutos e reservar o medley de fecho para depois da 1h. Quer que aplique esta ordem ao setlist do espetáculo?",
        chips: ["Aplicar ao setlist", "Ver alternativa mais suave", "Explicar o raciocínio"],
      },
    ]);
    setInput("");
  };

  return (
    <>
      <PageHeader
        title="Encore AI"
        description="O assistente que conhece os seus espetáculos, o repertório e a equipa"
        meta={
          <>
            <Pill tone="primary">
              <Sparkles className="h-3 w-3" /> 9 competências
            </Pill>
            <Pill tone="success">Ligado a {espetaculos.length} espetáculos</Pill>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="panel flex min-h-[560px] flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-border px-5 py-3.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/12 text-primary">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Assistente de produção</p>
              <p className="truncate text-xs text-muted-foreground">Contexto: Agosto 2026 · Encore Live Band</p>
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {conversa.map((t, i) => (
              <div key={i} className={cn("flex gap-3", t.autor === "eu" && "flex-row-reverse")}>
                {t.autor === "ai" ? (
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                ) : (
                  <Avatar iniciais="RM" size="sm" tone="neutral" />
                )}
                <div className={cn("min-w-0 max-w-[85%]", t.autor === "eu" && "text-right")}>
                  <div
                    className={cn(
                      "inline-block rounded-2xl px-4 py-3 text-sm",
                      t.autor === "ai"
                        ? "rounded-tl-md border border-border bg-elevated/60 text-left"
                        : "rounded-tr-md bg-primary text-primary-foreground",
                    )}
                  >
                    {t.texto}
                  </div>
                  {t.chips && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {t.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => enviar(c)}
                          className="rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/15"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar(input)}
              placeholder="Pergunte sobre setlists, logística, público ou riscos…"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-input"
            />
            <button
              onClick={() => enviar(input)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <Panel title="Competências" subtitle="Cada uma usa os dados reais da operação" padded={false}>
            <ul className="divide-y divide-border">
              {aiSkills.map((s) => {
                const I = icones[s.icone] ?? Sparkles;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => enviar(s.exemplo)}
                      className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-accent/40"
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                        <I className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{s.nome}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{s.desc}</span>
                        <span className="mt-1.5 block truncate font-mono text-[11px] text-primary">“{s.exemplo}”</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Sugestões por espetáculo" padded={false}>
            <ul className="divide-y divide-border">
              {proximos.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/espetaculos/$id"
                    params={{ id: e.id }}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.nome}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.meteo.chuva > 40
                          ? `Plano B de chuva sugerido (${e.meteo.chuva}% de probabilidade)`
                          : e.equipa.some((m) => !m.confirmado)
                            ? "Sugestão de substituto para a vaga por confirmar"
                            : `Setlist otimizado para ${e.publicoEstimado.toLocaleString("pt-PT")} pessoas`}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

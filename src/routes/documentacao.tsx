import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Hash, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/documentacao")({
  head: () => ({
    meta: [
      { title: "Documentação · Encore OS" },
      { name: "description", content: "Base de conhecimento interna com editor de blocos ao estilo Notion." },
      { property: "og:title", content: "Documentação · Encore OS" },
      { property: "og:description", content: "Processos, riders e manuais da equipa num só lugar." },
    ],
  }),
  component: Documentacao,
});

const paginas = [
  { id: "p1", titulo: "Manual de operação em palco" },
  { id: "p2", titulo: "Rider técnico standard" },
  { id: "p3", titulo: "Processo de contratação" },
  { id: "p4", titulo: "Política de cachets" },
  { id: "p5", titulo: "Checklist de montagem" },
];

function Documentacao() {
  const [ativa, setAtiva] = useState("p1");

  return (
    <>
      <PageHeader
        title="Documentação"
        description="Base de conhecimento da equipa"
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova página
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="panel h-fit p-3">
          <div className="mb-2 flex h-8 items-center gap-2 rounded-lg border border-border px-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input placeholder="Pesquisar…" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
          </div>
          <ul className="space-y-0.5">
            {paginas.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setAtiva(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    ativa === p.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{p.titulo}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="panel p-6 sm:p-10">
          <p className="text-xs text-muted-foreground">Atualizado há 2 dias por Rui Marques</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            {paginas.find((p) => p.id === ativa)?.titulo}
          </h2>

          <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
            <p>
              Este documento define o procedimento padrão da equipa. Todos os elementos devem confirmar
              a leitura antes do primeiro espetáculo da época.
            </p>

            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Hash className="h-4 w-4 text-primary" /> Antes do espetáculo
            </h3>
            <ul className="ml-1 space-y-2">
              {[
                "Confirmar hora de chegada 48h antes com o responsável de produção.",
                "Verificar o rider técnico enviado ao cliente.",
                "Validar o setlist final na página do espetáculo.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {t}
                </li>
              ))}
            </ul>

            <div className="rounded-xl border-l-2 border-primary bg-elevated/60 p-4 text-foreground">
              Atrasos superiores a 15 minutos devem ser comunicados imediatamente ao bandleader.
            </div>

            <h3 className="flex items-center gap-2 text-base font-medium text-foreground">
              <Hash className="h-4 w-4 text-primary" /> Durante o espetáculo
            </h3>
            <p>
              O bandleader é o único interlocutor com o cliente. Alterações ao alinhamento são decididas
              em palco e registadas na plataforma no final da noite.
            </p>

            <button className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs transition-colors hover:border-input hover:text-foreground">
              <Plus className="h-3.5 w-3.5" /> Adicionar bloco
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

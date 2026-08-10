import { toast } from "sonner";
import { CreateDialog } from "@/components/create-dialog";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Phone, Mail } from "lucide-react";
import { PageHeader, Pill, estadoTone } from "@/components/ui-kit";
import { formatEUR, musicos } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/musicos/")({
  head: () => ({
    meta: [
      { title: "Músicos · Encore OS" },
      { name: "description", content: "Base de dados de músicos: instrumentos, disponibilidade, contactos e cachet." },
      { property: "og:title", content: "Músicos · Encore OS" },
      { property: "og:description", content: "Disponibilidade e cachets de toda a equipa artística." },
    ],
  }),
  component: Musicos,
});

const filtros = ["Todos", "Disponível", "Em digressão", "Indisponível"];

function Musicos() {
  const [q, setQ] = useState("");
  const [f, setF] = useState("Todos");
  const lista = musicos.filter(
    (m) =>
      (f === "Todos" || m.disponibilidade === f) &&
      (m.nome + m.instrumentos.join(" ") + m.banda).toLowerCase().includes(q.toLowerCase()),
  );

  const [novoOpen, setNovoOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Músicos"
        description={`${musicos.length} perfis · ${musicos.filter((m) => m.disponibilidade === "Disponível").length} disponíveis`}
        actions={
          <button
            onClick={() => setNovoOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Novo músico
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 sm:w-64">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {filtros.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn(
              "rounded-lg border px-2.5 py-1 text-xs transition-colors",
              f === x
                ? "border-primary/30 bg-primary/12 text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((m) => (
          <Link
            key={m.id}
            to="/musicos/$id"
            params={{ id: m.id }}
            className="panel group p-5 transition-all duration-300 hover:border-input hover:shadow-panel"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                {m.iniciais}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium transition-colors group-hover:text-primary">{m.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{m.banda}</p>
              </div>
              <Pill tone={estadoTone(m.disponibilidade)}>{m.disponibilidade}</Pill>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.instrumentos.map((i) => (
                <Pill key={i}>{i}</Pill>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="h-3 w-3 shrink-0" /> <span className="truncate">{m.telefone}</span></p>
              <p className="flex items-center gap-2"><Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{m.email}</span></p>
              <p className="pt-1 text-foreground">Cachet: <span className="tabular-nums">{formatEUR(m.cachet)}</span> / espetáculo</p>
            </div>
          </Link>
        ))}
      </div>
      <CreateDialog
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Novo músico"
        description="Adiciona uma pessoa ao elenco."
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true, colSpan: 2, placeholder: "Marta Nogueira" },
          { nome: "funcao", label: "Função", placeholder: "Voz principal" },
          { nome: "banda", label: "Banda", placeholder: "Encore Live Band" },
          { nome: "telefone", label: "Telefone", placeholder: "+351 9…" },
          { nome: "email", label: "Email", placeholder: "nome@encoreos.pt" },
        ]}
        onSubmit={(v) => toast.success("Músico adicionado", { description: v["nome"] ?? v["espetaculo"] ?? "Guardado neste protótipo." })}
      />

    </>
  );
}

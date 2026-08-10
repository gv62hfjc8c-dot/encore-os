import { toast } from "sonner";
import { CreateDialog } from "@/components/create-dialog";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { bandas, formatEUR } from "@/data/mock";

export const Route = createFileRoute("/bandas/")({
  head: () => ({
    meta: [
      { title: "Bandas · Encore OS" },
      { name: "description", content: "Todas as formações, membros e próximas atuações num só lugar." },
      { property: "og:title", content: "Bandas · Encore OS" },
      { property: "og:description", content: "Gestão de formações musicais e respetivas equipas." },
    ],
  }),
  component: Bandas,
});

function Bandas() {
  const [q, setQ] = useState("");
  const lista = bandas.filter((b) => (b.nome + b.genero).toLowerCase().includes(q.toLowerCase()));

  const [novoOpen, setNovoOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Bandas"
        description={`${bandas.length} formações ativas`}
        actions={
          <button
            onClick={() => setNovoOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nova banda
          </button>
        }
      />

      <div className="mb-5 flex h-9 max-w-sm items-center gap-2 rounded-lg border border-border bg-surface px-3">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar bandas…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lista.map((b) => (
          <Link
            key={b.id}
            to="/bandas/$id"
            params={{ id: b.id }}
            className="panel group p-5 transition-all duration-300 hover:border-input hover:shadow-panel"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-sm font-semibold text-primary">
                {b.iniciais}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium transition-colors group-hover:text-primary">{b.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{b.genero}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Músicos</dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums">{b.membros}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Cachet médio</dt>
                <dd className="mt-0.5 text-sm font-medium tabular-nums">{formatEUR(b.cachetMedio)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Próximo</dt>
                <dd className="mt-0.5 truncate text-sm font-medium">{b.proximo}</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>

      {lista.length === 0 && (
        <Panel>
          <p className="text-center text-sm text-muted-foreground">Nenhuma banda encontrada.</p>
        </Panel>
      )}
      <CreateDialog
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Nova banda"
        description="Cria uma formação no protótipo."
        campos={[
          { nome: "nome", label: "Nome da banda", obrigatorio: true, colSpan: 2, placeholder: "Encore Live Band" },
          { nome: "genero", label: "Género", placeholder: "Baile / Pop-rock" },
          { nome: "membros", label: "Nº de músicos", tipo: "numero", placeholder: "9" },
          { nome: "cachet", label: "Cachet médio (€)", tipo: "numero", placeholder: "3500" },
          { nome: "base", label: "Base", placeholder: "V. N. Gaia" },
        ]}
        onSubmit={(v) => toast.success("Banda criada", { description: v["nome"] ?? v["espetaculo"] ?? "Guardado neste protótipo." })}
      />

    </>
  );
}

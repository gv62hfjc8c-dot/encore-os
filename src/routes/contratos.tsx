import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSignature, Download, Plus } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone } from "@/components/ui-kit";
import { espetaculos, formatEUR } from "@/data/mock";

export const Route = createFileRoute("/contratos")({
  head: () => ({
    meta: [
      { title: "Contratos · Encore OS" },
      { name: "description", content: "Estado de todos os contratos, sinais e assinaturas pendentes." },
      { property: "og:title", content: "Contratos · Encore OS" },
      { property: "og:description", content: "Controlo total sobre contratos e assinaturas." },
    ],
  }),
  component: Contratos,
});

function Contratos() {
  return (
    <>
      <PageHeader
        title="Contratos"
        description="Modelos, envios e assinaturas"
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo contrato
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Assinados" value="4" hint={formatEUR(23500)} icon={FileSignature} tone="success" />
        <StatCard label="Enviados" value="1" hint="a aguardar cliente" icon={FileSignature} />
        <StatCard label="Pendentes" value="1" hint="por preparar" icon={FileSignature} tone="warning" />
      </div>

      <Panel padded={false}>
        <ul className="divide-y divide-border">
          {espetaculos.map((e) => (
            <li key={e.id}>
              <Link to="/espetaculos/$id" params={{ id: e.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 hover:bg-accent/40">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Contrato — {e.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.cliente} · {new Date(e.data).toLocaleDateString("pt-PT")} · {formatEUR(e.preco)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Pill tone={estadoTone(e.contrato)}>{e.contrato}</Pill>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

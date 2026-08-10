import { createFileRoute } from "@tanstack/react-router";
import { QrCode, Plus, Wrench } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone } from "@/components/ui-kit";
import { equipamentos } from "@/data/mock";
import { Boxes, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/equipamentos")({
  head: () => ({
    meta: [
      { title: "Equipamentos · Encore OS" },
      { name: "description", content: "Inventário técnico com estado, localização, manutenções e código QR." },
      { property: "og:title", content: "Equipamentos · Encore OS" },
      { property: "og:description", content: "Inventário de som, luz e estrutura sempre atualizado." },
    ],
  }),
  component: Equipamentos,
});

function Equipamentos() {
  return (
    <>
      <PageHeader
        title="Equipamentos"
        description="Inventário técnico de som, luz, estrutura e energia"
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo artigo
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Artigos" value={String(equipamentos.length)} hint="em inventário" icon={Boxes} />
        <StatCard label="Operacionais" value="4" hint="prontos a sair" icon={CheckCircle2} tone="success" />
        <StatCard label="A necessitar atenção" value="2" hint="1 avariado · 1 em manutenção" icon={AlertTriangle} tone="warning" />
      </div>

      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                {["Artigo", "Categoria", "Estado", "Localização", "Última manutenção", "QR"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {equipamentos.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3.5 font-medium">{e.nome}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.categoria}</td>
                  <td className="px-5 py-3.5"><Pill tone={estadoTone(e.estado)}>{e.estado}</Pill></td>
                  <td className="px-5 py-3.5 text-muted-foreground">{e.localizacao}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Wrench className="h-3 w-3" />{e.ultimaManutencao}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      <QrCode className="h-3.5 w-3.5" /> {e.qr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

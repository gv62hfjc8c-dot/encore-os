import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CreateDialog } from "@/components/create-dialog";
import { downloadCSV } from "@/lib/export";
import { Download } from "lucide-react";
import { QrCode, Plus, Wrench } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone } from "@/components/ui-kit";
import { equipamentos } from "@/data/mock";
import { Boxes, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/equipamentos/")({
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

type NovoArtigo = { id: string; nome: string; categoria: string; estado: string; localizacao: string; ultimaManutencao: string; qr: string };

function Equipamentos() {
  const [dialog, setDialog] = useState(false);
  const [novos, setNovos] = useState<NovoArtigo[]>([]);
  const lista = [
    ...equipamentos.map((e) => ({
      id: e.id, nome: e.nome, categoria: e.categoria as string, estado: e.estado as string,
      localizacao: e.localizacao, ultimaManutencao: e.ultimaManutencao, qr: e.qr, real: true,
    })),
    ...novos.map((n) => ({ ...n, real: false })),
  ];

  return (
    <>
      <PageHeader
        title="Equipamentos"
        description="Inventário técnico de som, luz, estrutura e energia"
        actions={
          <>
            <button
              onClick={() =>
                downloadCSV(
                  "inventario-encore.csv",
                  lista.map((e) => ({ Artigo: e.nome, Categoria: e.categoria, Estado: e.estado, Localizacao: e.localizacao, QR: e.qr })),
                )
              }
              className="flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-sm transition-colors hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Exportar
            </button>
            <button
              onClick={() => setDialog(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Novo artigo
            </button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Artigos" value={String(lista.length)} hint="em inventário" icon={Boxes} />
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
              {lista.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3.5 font-medium">
                    {e.real ? (
                      <Link to="/equipamentos/$id" params={{ id: e.id }} className="transition-colors hover:text-primary">
                        {e.nome}
                      </Link>
                    ) : (
                      e.nome
                    )}
                  </td>
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

      <CreateDialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="Novo artigo de inventário"
        description="Adiciona um item ao inventário técnico deste protótipo."
        campos={[
          { nome: "nome", label: "Designação", obrigatorio: true, placeholder: "PA RCF HDL 30-A", colSpan: 2 },
          { nome: "categoria", label: "Categoria", tipo: "select", opcoes: ["Som", "Luz", "Estrutura", "Energia", "Backline"] },
          { nome: "estado", label: "Estado", tipo: "select", opcoes: ["Operacional", "Manutenção", "Avariado"] },
          { nome: "localizacao", label: "Localização", placeholder: "Armazém Gaia" },
          { nome: "qr", label: "Código QR", placeholder: "ENC-SOM-0100" },
        ]}
        onSubmit={(v) => {
          const id = `novo-${Date.now()}`;
          setNovos((p) => [
            ...p,
            {
              id,
              nome: v["nome"] ?? "Sem nome",
              categoria: v["categoria"] ?? "Som",
              estado: v["estado"] ?? "Operacional",
              localizacao: v["localizacao"] || "Armazém Gaia",
              ultimaManutencao: "—",
              qr: v["qr"] || "ENC-NOVO",
            },
          ]);
          toast.success("Artigo adicionado ao inventário");
        }}
      />
    </>
  );
}

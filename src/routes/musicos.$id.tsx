import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { PageHeader, Panel, Pill, estadoTone } from "@/components/ui-kit";
import { equipamentos, espetaculos, formatEUR, musicos, repertorio } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/musicos/$id")({
  loader: ({ params }) => {
    const musico = musicos.find((m) => m.id === params.id);
    if (!musico) throw notFound();
    return { musico };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Músico indisponível · Encore OS" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.musico.nome} · Encore OS`;
    return {
      meta: [
        { title: t },
        { name: "description", content: `${loaderData.musico.instrumentos.join(", ")} · ${loaderData.musico.banda}.` },
        { property: "og:title", content: t },
        { property: "og:description", content: `Perfil, agenda e pagamentos de ${loaderData.musico.nome}.` },
      ],
    };
  },
  component: MusicoDetalhe,
});

const tabs = ["Perfil", "Agenda", "Equipamentos", "Pagamentos", "Repertório", "Documentos"];

function MusicoDetalhe() {
  const { musico } = Route.useLoaderData();
  const [tab, setTab] = useState("Perfil");

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Músicos", to: "/musicos" }, { label: musico.nome }]}
        title={musico.nome}
        description={`${musico.instrumentos.join(" · ")} — ${musico.banda}`}
        actions={<Pill tone={estadoTone(musico.disponibilidade)}>{musico.disponibilidade}</Pill>}
      />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {tab === t && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="animate-fade-in grid gap-6 lg:grid-cols-3">
        {tab === "Perfil" && (
          <>
            <Panel title="Contactos e condições" className="lg:col-span-2">
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Telefone", musico.telefone],
                  ["Email", musico.email],
                  ["Cachet base", formatEUR(musico.cachet)],
                  ["Banda principal", musico.banda],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                    <dd className="mt-1 truncate text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 rounded-lg border border-border bg-elevated/60 p-4 text-sm text-muted-foreground">
                {musico.notas}
              </p>
            </Panel>
            <Panel title="Estatísticas">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Atuações 2026</span><span className="tabular-nums">21</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxa de presença</span><span className="tabular-nums text-success">98%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ganhos no ano</span><span className="tabular-nums">{formatEUR(musico.cachet * 21)}</span></div>
              </div>
            </Panel>
          </>
        )}

        {tab === "Agenda" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {espetaculos.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <Link to="/espetaculos/$id" params={{ id: e.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{new Date(e.data).toLocaleDateString("pt-PT")} · {e.local}</p>
                    </div>
                    <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Equipamentos" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {equipamentos.slice(1, 4).map((eq) => (
                <li key={eq.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{eq.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">Atribuído · {eq.localizacao}</p>
                  </div>
                  <Pill tone={estadoTone(eq.estado)}>{eq.estado}</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Pagamentos" && (
          <Panel padded={false} className="lg:col-span-3">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {[
                  ["Julho 2026 · 6 atuações", formatEUR(musico.cachet * 6), "Pago"],
                  ["Agosto 2026 · 4 atuações", formatEUR(musico.cachet * 4), "Pendente"],
                  ["Junho 2026 · 5 atuações", formatEUR(musico.cachet * 5), "Pago"],
                ].map(([d, v, s]) => (
                  <tr key={d}>
                    <td className="px-5 py-3.5 text-muted-foreground">{d}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{v}</td>
                    <td className="px-5 py-3.5 text-right"><Pill tone={estadoTone(String(s))}>{s}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}

        {tab === "Repertório" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {repertorio.slice(0, 5).map((m) => (
                <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.artista}</p>
                  </div>
                  <Pill tone="success">Dominada</Pill>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Documentos" && (
          <Panel padded={false} className="lg:col-span-3">
            <ul className="divide-y divide-border">
              {["Contrato de prestação de serviços.pdf", "Recibo verde Julho.pdf", "Cartão de cidadão.pdf"].map((d) => (
                <li key={d} className="flex items-center gap-3 px-5 py-3.5 hover:bg-accent/40">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm">{d}</span>
                  <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  );
}

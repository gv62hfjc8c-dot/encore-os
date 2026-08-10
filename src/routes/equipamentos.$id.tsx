import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  QrCode,
  Wrench,
  Truck,
  ShieldCheck,
  FileText,
  Package,
  Euro,
  MapPin,
  Download,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, Panel, Pill, estadoTone, Field } from "@/components/ui-kit";
import { equipamentos, espetaculos, formatEUR, type Equipamento } from "@/data/mock";
import { downloadDoc } from "@/lib/export";

export const Route = createFileRoute("/equipamentos/$id")({
  loader: ({ params }) => {
    const eq = equipamentos.find((e) => e.id === params.id);
    if (!eq) throw notFound();
    return { eq };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Equipamento indisponível · Encore OS" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.eq.nome} · Equipamentos · Encore OS`;
    const d = `Ficha técnica de ${loaderData.eq.marca} ${loaderData.eq.modelo}: estado, manutenção, flight case e histórico.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EquipamentoDetalhe,
  notFoundComponent: () => (
    <div className="py-20 text-center text-sm text-muted-foreground">
      Equipamento não encontrado.{" "}
      <Link to="/equipamentos" className="text-primary">
        Voltar ao inventário
      </Link>
      .
    </div>
  ),
});

function EquipamentoDetalhe() {
  const { eq } = Route.useLoaderData() as { eq: Equipamento };
  const usadoEm = espetaculos.filter((e) => (e.equipamentos ?? []).includes(eq.id));

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Equipamentos", to: "/equipamentos" }, { label: eq.nome }]}
        title={eq.nome}
        description={`${eq.marca} ${eq.modelo} · ${eq.categoria}`}
        meta={
          <>
            <Pill tone={estadoTone(eq.estado)}>{eq.estado}</Pill>
            <Pill>
              <MapPin className="h-3 w-3" /> {eq.localizacao}
            </Pill>
            <Pill>
              <Package className="h-3 w-3" /> {eq.flightCase}
            </Pill>
            <Pill>
              <Euro className="h-3 w-3" /> {formatEUR(eq.valor)}
            </Pill>
          </>
        }
        actions={
          <button
            onClick={() =>
              downloadDoc(`ficha-${eq.codigoInterno}.txt`, `Ficha técnica · ${eq.nome}`, [
                {
                  titulo: "Identificação",
                  linhas: [
                    `Marca/modelo: ${eq.marca} ${eq.modelo}`,
                    `Nº de série: ${eq.serie}`,
                    `Código interno: ${eq.codigoInterno}`,
                    `QR: ${eq.qr}`,
                  ],
                },
                {
                  titulo: "Estado e manutenção",
                  linhas: [
                    `Estado: ${eq.estado}`,
                    `Localização: ${eq.localizacao}`,
                    `Última manutenção: ${eq.ultimaManutencao}`,
                    `Próxima manutenção: ${eq.proximaManutencao}`,
                  ],
                },
                { titulo: "Histórico", linhas: eq.historico.map((h) => `${h.data} — ${h.evento}`) },
                { titulo: "Observações", linhas: [eq.observacoes] },
              ])
            }
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3.5 text-sm transition-colors hover:bg-accent"
          >
            <Download className="h-4 w-4" /> Ficha técnica
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Identificação">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Marca">{eq.marca}</Field>
              <Field label="Modelo">{eq.modelo}</Field>
              <Field label="Nº de série">{eq.serie}</Field>
              <Field label="Código interno">{eq.codigoInterno}</Field>
              <Field label="Data de compra">{eq.dataCompra}</Field>
              <Field label="Fornecedor">{eq.fornecedor}</Field>
              <Field label="Garantia até">{eq.garantiaAte}</Field>
              <Field label="Seguro">{eq.seguro}</Field>
            </div>
          </Panel>

          <Panel title="Manutenção" subtitle="Histórico e próximas intervenções">
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-elevated p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Última</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground" /> {eq.ultimaManutencao}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-elevated p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Próxima</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" /> {eq.proximaManutencao}
                </p>
              </div>
            </div>
            <ol className="relative space-y-4 border-l border-border pl-5">
              {eq.historico.map((h) => (
                <li key={h.data + h.evento} className="relative">
                  <span className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full border-2 border-background bg-primary" />
                  <p className="text-xs text-muted-foreground">{h.data}</p>
                  <p className="text-sm">{h.evento}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Utilização em espetáculos">
            {usadoEm.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem espetáculos associados de momento.</p>
            ) : (
              <ul className="divide-y divide-border">
                {usadoEm.map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/espetaculos/$id"
                      params={{ id: e.id }}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{e.nome}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {e.data} · {e.local}
                        </span>
                      </span>
                      <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Código QR">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="grid h-32 w-32 place-items-center rounded-xl border border-border bg-elevated">
                <QrCode className="h-16 w-16 text-foreground" />
              </div>
              <p className="font-mono text-xs text-muted-foreground">{eq.qr}</p>
              <p className="text-center text-xs text-muted-foreground">
                Cole na caixa. A leitura abre esta ficha no telemóvel.
              </p>
            </div>
          </Panel>

          <Panel title="Logística">
            <div className="space-y-4">
              <Field label="Flight case">{eq.flightCase}</Field>
              <Field label="Transporte">{eq.transportadoPor}</Field>
              <Field label="Localização atual">{eq.localizacao}</Field>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-elevated p-3 text-xs text-muted-foreground">
              <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Carregamento sempre pela ordem inversa da montagem.
            </p>
          </Panel>

          <Panel title="Observações">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              {eq.observacoes}
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" /> Manual: {eq.manual}
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}

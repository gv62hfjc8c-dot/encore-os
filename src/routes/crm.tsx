import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Euro,
  ArrowRight,
  ShieldAlert,
  FileSignature,
} from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone, Field, Progress } from "@/components/ui-kit";
import { clientes, espetaculos, formatEUR } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "Organizações · CRM · Encore OS" },
      {
        name: "description",
        content:
          "Comissões de festas, municípios, agências e promotores com histórico, risco de pagamento e contratos.",
      },
      { property: "og:title", content: "Organizações · CRM · Encore OS" },
      { property: "og:description", content: "Gestão de relação comercial por tipo de organização cliente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CRM,
});

const tipos = ["Todos", "Comissão de Festas", "Município", "Junta de Freguesia", "Agência", "Empresa", "Promotor"];

function CRM() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [sel, setSel] = useState(clientes[0]!.id);

  const lista = useMemo(
    () =>
      clientes.filter(
        (c) =>
          (tipo === "Todos" || c.tipo === tipo) &&
          (c.nome + c.localidade + c.contactoNome).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, tipo],
  );

  const cliente = clientes.find((c) => c.id === sel) ?? clientes[0]!;
  const historico = espetaculos.filter((e) => e.clienteId === cliente.id);
  const receitaTotal = clientes.reduce((a, c) => a + c.valor, 0);
  const maxValor = Math.max(...clientes.map((c) => c.valor));

  return (
    <>
      <PageHeader
        title="Organizações"
        description="Quem contrata os espetáculos — comissões, municípios, agências, empresas e promotores"
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Nova organização
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Organizações ativas" value={String(clientes.filter((c) => c.estado === "Ativo").length)} hint={`${clientes.length} no total`} icon={Building2} />
        <StatCard label="Faturação histórica" value={formatEUR(receitaTotal)} delta="+24%" hint="últimos 4 anos" icon={Euro} tone="success" />
        <StatCard label="Leads em avaliação" value={String(clientes.filter((c) => c.estado === "Lead").length)} hint="propostas por fechar" icon={FileSignature} tone="warning" />
        <StatCard label="Risco elevado" value={String(clientes.filter((c) => c.risco === "Alto").length)} hint="exigir sinal reforçado" icon={ShieldAlert} tone="danger" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 sm:max-w-xs">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Pesquisar organização…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tipos.map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                tipo === t
                  ? "border-primary/30 bg-primary/12 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel padded={false} title="Carteira" subtitle={`${lista.length} organizações`}>
          <ul className="divide-y divide-border">
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSel(c.id)}
                  className={cn(
                    "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 text-left transition-colors",
                    sel === c.id ? "bg-primary/8" : "hover:bg-accent/40",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{c.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {c.tipo} · {c.localidade} · {c.espetaculos} espetáculos
                    </span>
                    <span className="mt-2 block">
                      <Progress value={(c.valor / maxValor) * 100} tone={c.risco === "Alto" ? "danger" : "primary"} />
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm tabular-nums">{formatEUR(c.valor)}</span>
                    <span className="mt-1 block">
                      <Pill tone={estadoTone(c.estado)}>{c.estado}</Pill>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel
            title={cliente.nome}
            subtitle={`${cliente.tipo} · cliente desde ${cliente.desde}`}
            action={<Pill tone={cliente.risco === "Alto" ? "danger" : cliente.risco === "Médio" ? "warning" : "success"}>Risco {cliente.risco}</Pill>}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contacto">
                {cliente.contactoNome} · {cliente.contactoFuncao}
              </Field>
              <Field label="NIF" mono>{cliente.nif}</Field>
              <Field label="Email">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-muted-foreground" /> {cliente.contacto}
                </span>
              </Field>
              <Field label="Telefone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-muted-foreground" /> {cliente.telefone}
                </span>
              </Field>
              <Field label="Localidade">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" /> {cliente.localidade}
                </span>
              </Field>
              <Field label="Condições de pagamento">{cliente.prazoPagamento}</Field>
              <Field label="Ticket médio">{formatEUR(cliente.ticketMedio)}</Field>
              <Field label="Comissão">{cliente.comissao ? `${cliente.comissao}%` : "Sem comissão"}</Field>
            </div>
            <p className="mt-6 rounded-lg border border-border bg-elevated/60 p-4 text-sm text-muted-foreground">
              {cliente.notas}
            </p>
          </Panel>

          <Panel title="Histórico de espetáculos" padded={false}>
            {historico.length ? (
              <ul className="divide-y divide-border">
                {historico.map((e) => (
                  <li key={e.id}>
                    <Link
                      to="/espetaculos/$id"
                      params={{ id: e.id }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/40"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(e.data).toLocaleDateString("pt-PT")} · {e.local}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm tabular-nums text-muted-foreground">{formatEUR(e.preco)}</span>
                        <Pill tone={estadoTone(e.estado)}>{e.estado}</Pill>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-muted-foreground">Ainda sem espetáculos realizados.</p>
            )}
          </Panel>

          <Panel title="Contratos e documentos" padded={false}>
            <ul className="divide-y divide-border">
              {historico.flatMap((e) =>
                e.documentos.slice(0, 2).map((d) => (
                  <li key={e.id + d.nome} className="flex items-center gap-3 px-5 py-3">
                    <FileSignature className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{d.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.nome}</p>
                    </div>
                    <Pill tone={estadoTone(d.estado)}>{d.estado}</Pill>
                  </li>
                )),
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

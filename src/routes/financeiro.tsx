import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Wallet, Download } from "lucide-react";
import { PageHeader, Panel, Pill, StatCard, estadoTone } from "@/components/ui-kit";
import { formatEUR, receitaMensal, transacoes } from "@/data/mock";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro · Encore OS" },
      { name: "description", content: "Receitas, despesas, lucro, pagamentos e relatórios da operação." },
      { property: "og:title", content: "Financeiro · Encore OS" },
      { property: "og:description", content: "Controlo financeiro completo da sua produtora." },
    ],
  }),
  component: Financeiro,
});

function Financeiro() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Agosto de 2026"
        actions={
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm transition-colors hover:bg-elevated">
            <Download className="h-3.5 w-3.5" /> Relatório
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Receitas" value={formatEUR(61300)} delta="+16,4%" icon={TrendingUp} tone="success" />
        <StatCard label="Despesas" value={formatEUR(24900)} delta="+9,1%" icon={TrendingDown} tone="warning" />
        <StatCard label="Lucro" value={formatEUR(36400)} delta="+21,7%" hint="margem 59%" icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Evolução mensal" className="xl:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaMensal} margin={{ left: -18, right: 6, top: 6 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)" }}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatEUR(v)}
                />
                <Bar dataKey="receita" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesa" fill="var(--color-warning)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Por categoria">
          <ul className="space-y-4 text-sm">
            {[
              ["Cachets músicos", 46, "warning"],
              ["Logística", 22, "primary"],
              ["Equipamento", 18, "success"],
              ["Administrativo", 14, "danger"],
            ].map(([l, v]) => (
              <li key={String(l)}>
                <div className="flex justify-between text-xs">
                  <span>{l}</span>
                  <span className="tabular-nums text-muted-foreground">{v}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Movimentos" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {["Descrição", "Tipo", "Categoria", "Data", "Valor", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transacoes.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/40">
                    <td className="px-5 py-3.5 font-medium">{t.descricao}</td>
                    <td className="px-5 py-3.5">
                      <Pill tone={t.tipo === "Receita" ? "success" : "warning"}>{t.tipo}</Pill>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{t.categoria}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{t.data}</td>
                    <td className="px-5 py-3.5 tabular-nums">{formatEUR(t.valor)}</td>
                    <td className="px-5 py-3.5"><Pill tone={estadoTone(t.estado)}>{t.estado}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}

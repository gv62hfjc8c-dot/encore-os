import { OrganizationSettings } from "@/components/organization-settings";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/definicoes")({
  head: () => ({
    meta: [
      { title: "Definições · Encore OS" },
      {
        name: "description",
        content:
          "Preferências da organização, equipa, faturação e notificações.",
      },
      { property: "og:title", content: "Definições · Encore OS" },
      {
        property: "og:description",
        content: "Configuração da sua conta Encore OS.",
      },
    ],
  }),
  component: OrganizationSettings,
});

const seccoes = [
  "Organização",
  "Equipa",
  "Notificações",
  "Faturação",
  "Aparência",
];

function Toggle({ on }: { on: boolean }) {
  const [v, setV] = useState(on);
  return (
    <button
      onClick={() => setV(!v)}
      className={cn(
        "h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors",
        v ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "block h-4 w-4 rounded-full bg-background transition-transform",
          v && "translate-x-4",
        )}
      />
    </button>
  );
}

function Definicoes() {
  const [sec, setSec] = useState("Organização");

  return (
    <>
      <PageHeader
        title="Definições"
        description="Configuração da conta e da organização"
      />

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="panel h-fit p-2">
          <ul className="space-y-0.5">
            {seccoes.map((s) => (
              <li key={s}>
                <button
                  onClick={() => setSec(s)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    sec === s
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          <Panel title={sec}>
            {sec === "Organização" && (
              <div className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Nome da empresa", "Encore Produções, Lda."],
                  ["NIF", "PT 514 882 331"],
                  ["Morada", "Rua da Fábrica 42, V. N. Gaia"],
                  ["Email geral", "geral@encoreos.pt"],
                ].map(([l, v]) => (
                  <label key={l} className="block">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {l}
                    </span>
                    <input
                      defaultValue={v}
                      className="mt-1.5 h-9 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none transition-colors focus:border-primary"
                    />
                  </label>
                ))}
              </div>
            )}

            {sec === "Equipa" && (
              <ul className="divide-y divide-border">
                {[
                  ["Rui Marques", "Admin"],
                  ["Marta Nogueira", "Produção"],
                  ["Tiago Ferraz", "Produção"],
                  ["Sofia Brandão", "Leitura"],
                ].map(([n, r]) => (
                  <li
                    key={n}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span>{n}</span>
                    <Pill tone={r === "Admin" ? "primary" : "neutral"}>
                      {r}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}

            {sec === "Notificações" && (
              <ul className="divide-y divide-border">
                {[
                  ["Novos pedidos de orçamento", true],
                  ["Contratos por assinar", true],
                  ["Alertas de manutenção", false],
                  ["Resumo semanal por email", true],
                ].map(([l, v]) => (
                  <li
                    key={String(l)}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="min-w-0">{l}</span>
                    <Toggle on={Boolean(v)} />
                  </li>
                ))}
              </ul>
            )}

            {sec === "Faturação" && (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-border bg-elevated p-4">
                  <div>
                    <p className="font-medium">Plano Pro</p>
                    <p className="text-xs text-muted-foreground">
                      49 €/mês · até 10 bandas
                    </p>
                  </div>
                  <Pill tone="success">Ativo</Pill>
                </div>
                <p className="text-muted-foreground">
                  Próxima renovação a 1 de Setembro de 2026.
                </p>
              </div>
            )}

            {sec === "Aparência" && (
              <ul className="divide-y divide-border">
                {[
                  ["Modo escuro", true],
                  ["Animações reduzidas", false],
                  ["Densidade compacta", false],
                ].map(([l, v]) => (
                  <li
                    key={String(l)}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span>{l}</span>
                    <Toggle on={Boolean(v)} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

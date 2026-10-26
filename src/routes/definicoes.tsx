import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OrganizationSettings } from "@/components/organization-settings";
import { AppearanceSettings } from "@/components/appearance-settings";
import { PageHeader } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/definicoes")({
  head: () => ({ meta: [{ title: "Definições · Encore OS" }] }),
  component: Definicoes,
});

function Definicoes() {
  const [tab, setTab] = useState<"organizacao" | "aparencia">("organizacao");
  return (
    <>
      <PageHeader title="Definições" description="Conta pessoal, organização e preferências reais." />
      <nav className="mb-6 flex gap-2" aria-label="Secções de definições">
        {[
          { id: "organizacao" as const, label: "Organização" },
          { id: "aparencia" as const, label: "Aparência" },
        ].map((item) => (
          <button key={item.id} type="button"
            className={cn("rounded-lg border px-4 py-2 text-sm",
              tab === item.id ? "border-primary bg-primary/10 text-primary" : "border-border")}
            onClick={() => setTab(item.id)}>{item.label}</button>
        ))}
      </nav>
      {tab === "organizacao" ? <OrganizationSettings /> : <AppearanceSettings />}
    </>
  );
}

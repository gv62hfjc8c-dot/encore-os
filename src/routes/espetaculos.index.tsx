import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { useIdentity } from "@/components/identity-context";
import { PageHeader, Panel, Pill } from "@/components/ui-kit";
import { getVisiblePerformances } from "@/lib/work";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/espetaculos/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Espetáculos · Encore OS" },
      { name: "description", content: "Atuações musicais visíveis à sua identidade." },
    ],
  }),
  component: Espetaculos,
});

const estados = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

const nomesEstado: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

function formatarData(data: string, fuso: string) {
  const dataReal = new Date(data);
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      timeZone: fuso,
      dateStyle: "short",
      timeStyle: "short",
    }).format(dataReal);
  } catch {
    return new Intl.DateTimeFormat("pt-PT", {
      timeZone: "UTC",
      dateStyle: "short",
      timeStyle: "short",
    }).format(dataReal) + " UTC";
  }
}

function Espetaculos() {
  const { session, person } = useIdentity();
  const [pesquisa, setPesquisa] = useState("");
  const [estado, setEstado] = useState("all");
  const [ordemAscendente, setOrdemAscendente] = useState(true);
  const [mostrarColunasComerciais, setMostrarColunasComerciais] = useState(true);

  const espetaculos = useQuery({
    queryKey: ["works", session?.user.id, "performance"],
    queryFn: getVisiblePerformances,
    enabled: Boolean(session),
  });

  const resultados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-PT");
    return (espetaculos.data ?? [])
      .filter((work) =>
        (estado === "all" || work.status === estado) &&
        (!termo || work.title.toLocaleLowerCase("pt-PT").includes(termo)),
      )
      .sort((a, b) => ordemAscendente
        ? a.starts_at.localeCompare(b.starts_at)
        : b.starts_at.localeCompare(a.starts_at));
  }, [espetaculos.data, pesquisa, estado, ordemAscendente]);

  return (
    <>
      <PageHeader
        title="Espetáculos"
        description="Atuações musicais reais a que tem acesso."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void espetaculos.refetch()}
              disabled={espetaculos.isFetching}
              className="flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm disabled:opacity-50"
            >
              {espetaculos.isFetching ? "A atualizar…" : "Atualizar"}
            </button>
            <Link
              to="/trabalhos"
              title="Criação provisória na interface técnica de Work"
              className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Novo espetáculo
            </Link>
          </div>
        }
      />

      <p className="mb-4 text-xs text-muted-foreground">
        Esta vista apresenta dados reais de Work. Cliente, local, preço e contrato
        ainda não têm persistência; a ficha detalhada e os estados comerciais
        serão integrados em incrementos seguintes. A criação usa temporariamente
        a interface técnica de Trabalhos.
      </p>

      <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
        <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 sm:w-72">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Pesquisar espetáculos…"
            aria-label="Pesquisar espetáculos"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {estados.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => setEstado(opcao.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs transition-colors",
                estado === opcao.value
                  ? "border-primary/30 bg-primary/12 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {opcao.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMostrarColunasComerciais((visivel) => !visivel)}
          aria-pressed={mostrarColunasComerciais}
          className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Colunas comerciais
        </button>
      </div>

      <Panel padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Espetáculo</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">
                  <button
                    type="button"
                    onClick={() => setOrdemAscendente((asc) => !asc)}
                    className="inline-flex items-center gap-1"
                  >
                    Data <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                {mostrarColunasComerciais && (
                  <>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Local</th>
                    <th className="px-5 py-3 font-medium">Preço</th>
                    <th className="px-5 py-3 font-medium">Contrato</th>
                  </>
                )}
                <th className="px-5 py-3 font-medium">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resultados.map((work) => (
                <tr key={work.id} className="group transition-colors hover:bg-accent/40">
                  <td className="px-5 py-3.5">
                    <span className="font-medium">{work.title}</span>
                    <p className="text-xs text-muted-foreground">Atuação musical</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <Pill>{nomesEstado[work.status] ?? work.status}</Pill>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">
                    {formatarData(work.starts_at, work.timezone)}
                    <p className="text-[10px]">{work.timezone}</p>
                  </td>
                  {mostrarColunasComerciais && (
                    <>
                      <td className="px-5 py-3.5 text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-muted-foreground">—</td>
                    </>
                  )}
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {work.created_by === person?.id ? "Gerido por si" : "Outro gestor"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {espetaculos.isPending && (
          <p className="p-5 text-sm" role="status">A carregar espetáculos…</p>
        )}
        {espetaculos.isError && (
          <div className="space-y-2 p-5" role="alert">
            <p className="text-sm text-destructive">
              Não foi possível consultar os espetáculos: {espetaculos.error.message}
            </p>
            <button
              type="button"
              onClick={() => void espetaculos.refetch()}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {espetaculos.isSuccess && resultados.length === 0 && (
          <p className="p-5 text-sm text-muted-foreground">
            Nenhum espetáculo corresponde à pesquisa ou aos filtros.
          </p>
        )}
        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          {resultados.length} {resultados.length === 1 ? "resultado" : "resultados"}
        </div>
      </Panel>
    </>
  );
}

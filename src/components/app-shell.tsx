import { OrganizationSwitcher, useIdentity } from "./identity-context";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Sun,
  CalendarDays,
  Sparkles,
  Users2,
  ListMusic,
  Boxes,
  FileSignature,
  Wallet,
  Building2,
  Map,
  Megaphone,
  ListMusic as ListMusicTab,
  BookOpen,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Command,
  Menu,
  X,
  Radio,
  Bot,
  Mic2,
  ChevronsUpDown,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  espetaculos,
  musicos,
  notificacoes,
  organizacoes,
  repertorio,
} from "@/data/mock";

/**
 * Arquitetura de informação orientada à operação:
 * 1. HOJE      — o que tenho de fazer agora
 * 2. PRODUÇÃO  — o espetáculo e tudo o que gira à volta dele
 * 3. RECURSOS  — o que o espetáculo consome (pessoas, música, equipamento)
 * 4. NEGÓCIO   — o que sustenta a operação
 * 5. SISTEMA   — configuração e evolução do produto
 */
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
};

const nav: { group: string; items: NavItem[] }[] = [
  {
    group: "Hoje",
    items: [
      { to: "/", label: "Centro de operações", icon: Sun, exact: true },
      { to: "/agenda", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    group: "Produção",
    items: [
      { to: "/espetaculos", label: "Espetáculos", icon: Sparkles },
      { to: "/live", label: "Modo ao vivo", icon: Radio },
      { to: "/encore-ai", label: "Encore AI", icon: Bot, badge: "AI" },
    ],
  },
  {
    group: "Recursos",
    items: [
      { to: "/bandas", label: "Elenco", icon: Mic2 },
      { to: "/musicos", label: "Pessoas", icon: Users2 },
      { to: "/repertorio", label: "Repertório", icon: ListMusic },
      { to: "/equipamentos", label: "Equipamentos", icon: Boxes },
    ],
  },
  {
    group: "Negócio",
    items: [
      { to: "/crm", label: "Organizações", icon: Building2 },
      { to: "/contratos", label: "Contratos", icon: FileSignature },
      { to: "/financeiro", label: "Financeiro", icon: Wallet },
      { to: "/marketing", label: "Marketing", icon: Megaphone },
    ],
  },
  {
    group: "Sistema",
    items: [
      { to: "/roadmap", label: "Roadmap", icon: Map },
      { to: "/documentacao", label: "Documentação", icon: BookOpen },
      { to: "/definicoes", label: "Definições", icon: Settings },
    ],
  },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            Encore OS
          </p>
          <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Live Operations
          </p>
        </div>
      </div>

      <OrganizationSwitcher />

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {nav.map((group) => (
          <div key={group.group}>
            <p className="px-2.5 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-200",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span className="ml-auto rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-primary">
                          {item.badge}
                        </span>
                      )}
                      {active && !("badge" in item && item.badge) && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Link
          to="/live"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/10 p-3 transition-colors hover:bg-primary/15"
        >
          <Radio className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium">
              Próximo espetáculo
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              Aveiro · sábado 22:30
            </span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
        </Link>
      </div>
    </div>
  );
}

/* ---------------- Command palette (⌘K) ---------------- */

function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  if (!open) return null;

  const term = q.trim().toLowerCase();
  const match = (s: string) => !term || s.toLowerCase().includes(term);

  const grupos = [
    {
      titulo: "Espetáculos",
      itens: espetaculos
        .filter((e) => match(e.nome) || match(e.local))
        .slice(0, 4)
        .map((e) => ({
          id: e.id,
          label: e.nome,
          hint: `${e.local} · ${e.data}`,
          to: `/espetaculos/${e.id}`,
        })),
    },
    {
      titulo: "Repertório",
      itens: repertorio
        .filter((m) => match(m.nome) || match(m.artista))
        .slice(0, 4)
        .map((m) => ({
          id: m.id,
          label: m.nome,
          hint: `${m.artista} · ${m.tom} · ${m.bpm} BPM`,
          to: `/repertorio/${m.id}`,
        })),
    },
    {
      titulo: "Pessoas",
      itens: musicos
        .filter((m) => match(m.nome) || match(m.funcao))
        .slice(0, 3)
        .map((m) => ({
          id: m.id,
          label: m.nome,
          hint: m.funcao,
          to: `/musicos/${m.id}`,
        })),
    },
    {
      titulo: "Ações rápidas",
      itens: [
        { id: "q1", label: "Abrir modo ao vivo", hint: "Palco", to: "/live" },
        {
          id: "q2",
          label: "Perguntar ao Encore AI",
          hint: "Assistente de produção",
          to: "/encore-ai",
        },
        {
          id: "q3",
          label: "Ver agenda do mês",
          hint: "Agosto 2026",
          to: "/agenda",
        },
      ].filter((i) => match(i.label)),
    },
  ].filter((g) => g.itens.length > 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="panel relative z-10 w-full max-w-xl animate-fade-in overflow-hidden shadow-panel">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar espetáculos, músicas, pessoas ou ações…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {grupos.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Sem resultados para “{q}”.
            </p>
          )}
          {grupos.map((g) => (
            <div key={g.titulo} className="mb-2">
              <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
                {g.titulo}
              </p>
              {g.itens.map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    onClose();
                    navigate({ to: i.to });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{i.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.hint}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
      </button>
      {open && (
        <>
          <button
            aria-label="Fechar"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-panel">
            <p className="border-b border-border px-4 py-2.5 text-xs font-medium">
              Notificações
            </p>
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {notificacoes.map((n) => (
                <li key={n.id}>
                  <Link
                    to={n.alvo}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <p className="text-xs leading-relaxed">{n.texto}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {n.quando}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { person, session } = useIdentity();
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((v) => !v);
      }
      if (e.key === "Escape") setCmd(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-sidebar-border bg-sidebar lg:block">
        <NavContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[264px] animate-slide-in-right border-r border-sidebar-border bg-sidebar">
            <button
              aria-label="Fechar"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <NavContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
            <button
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden lg:block" />

            <button
              onClick={() => setCmd(true)}
              className="group flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:border-input hover:bg-elevated md:max-w-md"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Ir para espetáculo, música ou pessoa…
              </span>
              <span className="ml-auto hidden shrink-0 items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] md:flex">
                <Command className="h-2.5 w-2.5" />K
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                to="/live"
                className="hidden h-9 items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15 sm:flex"
              >
                <Radio className="h-3.5 w-3.5" /> Ao vivo
              </Link>
              <NotificationsMenu />
              <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
                  {person?.first_name?.slice(0, 2) ?? "EU"}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-medium leading-tight">
                    {person?.first_name || session?.user.email}
                  </span>
                  <span className="block text-[10px] leading-tight text-muted-foreground">
                    Identidade pessoal
                  </span>
                </span>
                <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          {children}
        </main>
      </div>

      <MobileTabBar />
    </div>
  );
}

/* ---------------- Navegação inferior (mobile) ---------------- */

const tabs: NavItem[] = [
  { to: "/", label: "Hoje", icon: Sun, exact: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/espetaculos", label: "Espetáculos", icon: Sparkles },
  { to: "/repertorio", label: "Repertório", icon: ListMusicTab },
  { to: "/live", label: "Ao vivo", icon: Radio },
];

function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.to
            : pathname === t.to || pathname.startsWith(t.to + "/");
          return (
            <li key={t.to}>
              <Link
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-[18px] w-[18px]" />
                <span className="truncate">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

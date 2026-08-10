import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; to?: string }[];
  meta?: ReactNode;
}) {
  return (
    <div className="mb-8 animate-fade-in">
      {breadcrumb && (
        <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          {breadcrumb.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {b.to ? (
                <Link to={b.to} className="transition-colors hover:text-foreground">
                  {b.label}
                </Link>
              ) : (
                <span className="text-foreground">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:truncate sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-medium tracking-tight">{title}</h2>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}

const toneMap: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  primary: "bg-primary/12 text-primary border-primary/20",
  success: "bg-success/12 text-success border-success/20",
  warning: "bg-warning/12 text-warning border-warning/20",
  danger: "bg-destructive/12 text-destructive border-destructive/20",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        toneMap[tone] ?? toneMap["neutral"],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function estadoTone(estado: string) {
  switch (estado) {
    case "Confirmado":
    case "Assinado":
    case "Operacional":
    case "Disponível":
    case "Recebido":
    case "Pago":
    case "Ativo":
    case "Válido":
    case "Baixo":
      return "success";
    case "Proposta":
    case "Enviado":
    case "Em digressão":
    case "Lead":
    case "Recebido ✓":
      return "primary";
    case "Reservado":
    case "Pendente":
    case "Manutenção":
    case "Médio":
      return "warning";
    case "Cancelado":
    case "Avariado":
    case "Indisponível":
    case "Alto":
      return "danger";
    default:
      return "neutral";
  }
}

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "primary",
  to,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "success" | "warning" | "danger";
  to?: string;
}) {
  const ring: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/12 text-warning",
    danger: "bg-destructive/12 text-destructive",
  };
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", ring[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {delta && <span className={cn(delta.startsWith("-") ? "text-destructive" : "text-success")}>{delta}</span>}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </>
  );
  const cls =
    "panel group relative block overflow-hidden p-5 transition-all duration-300 hover:border-input hover:shadow-panel";
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * Estado vazio com ícone, mensagem e ação opcional.
 * Usar sempre que uma lista pode ficar sem itens.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-5 py-8" : "gap-3 px-6 py-12",
      )}
    >
      {Icon && (
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-elevated/60 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}


/* ---------------- novos primitivos ---------------- */

export function Avatar({ iniciais, tone = "primary", size = "md" }: { iniciais: string; tone?: string; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-12 w-12 text-sm" }[size];
  const t: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-lg font-semibold", s, t[tone] ?? t["primary"])}>
      {iniciais}
    </span>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="-mx-1 mb-6 overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 border-b border-border px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
              active === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="rounded-md bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">{t.badge}</span>
            )}
            {active === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Field({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className={cn("mt-1 text-sm", mono && "font-mono text-[13px]")}>{children}</div>
    </div>
  );
}

export function Progress({ value, tone = "primary" }: { value: number; tone?: string }) {
  const t: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all duration-500", t[tone] ?? t["primary"])} style={{ width: `${value}%` }} />
    </div>
  );
}

export function Meter({ value, max = 10 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-3 w-1 rounded-full",
            i < value ? (value >= 8 ? "bg-destructive" : value >= 5 ? "bg-warning" : "bg-primary") : "bg-muted",
          )}
        />
      ))}
      <span className="ml-1.5 text-xs tabular-nums text-muted-foreground">{value}/{max}</span>
    </div>
  );
}

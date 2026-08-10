import { useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center px-0 sm:items-center sm:px-4 sm:py-8">
      <button aria-label="Fechar" className="absolute inset-0 bg-background/75 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="panel relative z-10 max-h-[92vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-b-none shadow-panel sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-medium tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="p-5">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

export type CampoTipo = "texto" | "numero" | "data" | "select" | "textarea";

export type Campo = {
  nome: string;
  label: string;
  tipo?: CampoTipo;
  placeholder?: string;
  opcoes?: string[];
  obrigatorio?: boolean;
  defaultValue?: string;
  colSpan?: 1 | 2;
};

const inputCls =
  "mt-1.5 w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

/** Diálogo genérico de criação usado por todos os módulos do protótipo. */
export function CreateDialog({
  open,
  onClose,
  title,
  description,
  campos,
  submitLabel = "Criar",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  campos: Campo[];
  submitLabel?: string;
  onSubmit: (valores: Record<string, string>) => void;
}) {
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValores(Object.fromEntries(campos.map((c) => [c.nome, c.defaultValue ?? (c.tipo === "select" ? c.opcoes?.[0] ?? "" : "")])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (n: string, v: string) => setValores((p) => ({ ...p, [n]: v }));
  const valido = campos.every((c) => !c.obrigatorio || (valores[c.nome] ?? "").trim().length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 rounded-lg border border-border px-3.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            disabled={!valido}
            onClick={() => {
              onSubmit(valores);
              onClose();
            }}
            className="h-9 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {campos.map((c) => (
          <label key={c.nome} className={cn("block min-w-0", (c.colSpan ?? 1) === 2 && "sm:col-span-2")}>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {c.label}
              {c.obrigatorio && <span className="text-primary"> *</span>}
            </span>
            {c.tipo === "select" ? (
              <select value={valores[c.nome] ?? ""} onChange={(e) => set(c.nome, e.target.value)} className={inputCls}>
                {(c.opcoes ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : c.tipo === "textarea" ? (
              <textarea
                rows={3}
                value={valores[c.nome] ?? ""}
                placeholder={c.placeholder}
                onChange={(e) => set(c.nome, e.target.value)}
                className={inputCls}
              />
            ) : (
              <input
                type={c.tipo === "numero" ? "number" : c.tipo === "data" ? "date" : "text"}
                value={valores[c.nome] ?? ""}
                placeholder={c.placeholder}
                onChange={(e) => set(c.nome, e.target.value)}
                className={inputCls}
              />
            )}
          </label>
        ))}
      </div>
    </Modal>
  );
}

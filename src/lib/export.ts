import { toast } from "sonner";

/** Faz download de um ficheiro gerado no browser (protótipo — sem backend). */
export function downloadFile(nome: string, conteudo: string, mime = "text/plain;charset=utf-8") {
  if (typeof window === "undefined") return;
  const blob = new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast.success(`${nome} exportado`, { description: "Ficheiro gerado localmente a partir dos dados do protótipo." });
}

export function toCSV(linhas: Record<string, string | number>[]) {
  if (linhas.length === 0) return "";
  const cols = Object.keys(linhas[0]!);
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [cols.join(","), ...linhas.map((l) => cols.map((c) => esc(l[c] ?? "")).join(","))].join("\n");
}

export function downloadCSV(nome: string, linhas: Record<string, string | number>[]) {
  downloadFile(nome, toCSV(linhas), "text/csv;charset=utf-8");
}

/** "PDF" de protótipo: documento de texto legível com o conteúdo do relatório. */
export function downloadDoc(nome: string, titulo: string, seccoes: { titulo: string; linhas: string[] }[]) {
  const corpo = [
    titulo,
    "=".repeat(titulo.length),
    "",
    ...seccoes.flatMap((s) => [s.titulo, "-".repeat(s.titulo.length), ...s.linhas, ""]),
    `Gerado por Encore OS · ${new Date().toLocaleString("pt-PT")}`,
  ].join("\n");
  downloadFile(nome, corpo);
}

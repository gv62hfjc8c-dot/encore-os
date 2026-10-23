import type { CreateWorkInput } from "@/lib/work";

export type PerformanceDraft = {
  title: string;
  startsAtLocal: string;
  endsAtLocal: string;
  timezone: string;
};

/** HTML datetime-local values are interpreted in the browser's local timezone. */
export function validPerformanceWindow(start: string, end: string): boolean {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  return Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs;
}

/**
 * Create only the attributes supported by the existing Work RPC.
 * Commercial fields and Band assignments are intentionally not fabricated.
 */
export function buildPerformanceInput(draft: PerformanceDraft): CreateWorkInput {
  const title = draft.title.trim();
  if (title.length < 1 || title.length > 160) {
    throw new Error("O nome do espetáculo deve ter entre 1 e 160 caracteres.");
  }

  if (!validPerformanceWindow(draft.startsAtLocal, draft.endsAtLocal)) {
    throw new Error("Indique horários válidos, com o fim posterior ao início.");
  }

  try {
    new Intl.DateTimeFormat("en", { timeZone: draft.timezone });
  } catch {
    throw new Error("O fuso horário do dispositivo não é válido.");
  }

  return {
    title,
    workType: "performance",
    startsAt: new Date(draft.startsAtLocal).toISOString(),
    endsAt: new Date(draft.endsAtLocal).toISOString(),
    timezone: draft.timezone,
  };
}

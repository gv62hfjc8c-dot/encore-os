import { useEffect, useState } from "react";

/**
 * Estado local persistido em localStorage.
 * Lê apenas depois da hidratação para evitar mismatch entre servidor e cliente.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignorar storage indisponível */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignorar quota / modo privado */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

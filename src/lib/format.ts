/** Formatting shared by all authorized Work views (never based on mock dates). */
export function formatWorkDateTime(
  iso: string,
  timezone: string,
  dateStyle: "short" | "medium" | "long" = "medium",
): string {
  const date = new Date(iso);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    dateStyle,
    timeStyle: "short",
  };
  try {
    return new Intl.DateTimeFormat("pt-PT", options).format(date);
  } catch {
    return new Intl.DateTimeFormat("pt-PT", {
      ...options,
      timeZone: "UTC",
    }).format(date) + " UTC";
  }
}

export function formatWorkDate(iso: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      timeZone: timezone, dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat("pt-PT", {
      timeZone: "UTC", dateStyle: "medium",
    }).format(new Date(iso)) + " UTC";
  }
}

export function deviceDateTime(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-")
    + "T" + [pad(date.getHours()), pad(date.getMinutes())].join(":");
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency", currency: "EUR",
  }).format(amount);
}

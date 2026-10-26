import { describe, expect, it } from "vitest";
import { deviceDateTime, formatEuro, formatWorkDateTime } from "@/lib/format";

describe("transversal presentation helpers", () => {
  it("uses the Work timezone rather than the browser timezone", () => {
    const iso = "2026-10-29T20:00:00Z";
    const azores = formatWorkDateTime(iso, "Atlantic/Azores");
    const london = formatWorkDateTime(iso, "Europe/London");
    expect(azores).not.toBe(london);
    expect(azores).toMatch(/29/);
  });

  it("falls back explicitly to UTC for unsupported timezone values", () => {
    expect(formatWorkDateTime("2026-10-29T20:00:00Z", "Fake/Unknown")).toContain("UTC");
  });

  it("returns a valid local datetime string and a Portuguese euro amount", () => {
    expect(deviceDateTime("2026-10-29T20:00:00Z")).toMatch(/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(formatEuro(1234.56)).toContain("€");
  });
});

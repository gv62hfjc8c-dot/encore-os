import { describe, expect, it } from "vitest";
import { buildPerformanceInput, validPerformanceWindow } from "@/lib/performance-create";

describe("Performance creation from Lovable wizard", () => {
  const valid = {
    title: "  Espetáculo de teste  ",
    startsAtLocal: "2026-10-29T20:00",
    endsAtLocal: "2026-10-29T23:00",
    timezone: "Europe/Lisbon",
  };

  it("always creates a performance Work with trimmed title and ISO timestamps", () => {
    const result = buildPerformanceInput(valid);
    expect(result.title).toBe("Espetáculo de teste");
    expect(result.workType).toBe("performance");
    expect(result.startsAt).toBe(new Date(valid.startsAtLocal).toISOString());
    expect(result.endsAt).toBe(new Date(valid.endsAtLocal).toISOString());
    expect(result.timezone).toBe("Europe/Lisbon");
    expect(Object.keys(result).sort()).toEqual(
      ["title", "workType", "startsAt", "endsAt", "timezone"].sort(),
    );
  });

  it("rejects invalid or reversed schedules, including equal start and end", () => {
    expect(validPerformanceWindow("2026-10-29T20:00", "2026-10-29T19:00")).toBe(false);
    expect(validPerformanceWindow("2026-10-29T20:00", "2026-10-29T20:00")).toBe(false);
    expect(() => buildPerformanceInput({ ...valid, endsAtLocal: "invalid" })).toThrow("horários");
  });

  it("rejects missing and excessive titles", () => {
    expect(() => buildPerformanceInput({ ...valid, title: "   " })).toThrow("nome");
    expect(() => buildPerformanceInput({ ...valid, title: "x".repeat(161) })).toThrow("nome");
  });

  it("rejects invalid timezones instead of persisting an incorrect one", () => {
    expect(() => buildPerformanceInput({ ...valid, timezone: "Not/AZone" })).toThrow("fuso horário");
  });
});

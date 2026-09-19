import { expect, it } from "vitest";
import {
  chooseOrganization,
  contextStorageKey,
  safeNext,
} from "../src/lib/identity-state";
it("rejects redirects capable of escaping this origin", () => {
  for (const url of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\nevil.test",
    undefined,
  ])
    expect(safeNext(url)).toBe("/");
  expect(safeNext("/onboarding")).toBe("/onboarding");
});
it("keeps personal mode and validates persisted contexts", () => {
  expect(chooseOrganization(["a", "b"], "b")).toBe("b");
  expect(chooseOrganization(["a", "b"], "removed")).toBe("a");
  expect(chooseOrganization(["a"], "")).toBeNull();
  expect(chooseOrganization([], "a")).toBeNull();
  expect(contextStorageKey("alice")).not.toBe(contextStorageKey("bob"));
});

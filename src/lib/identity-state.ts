export function safeNext(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    Array.from(value).some(
      (character) => character === "\\" || character.charCodeAt(0) <= 32,
    )
  )
    return "/";
  return value;
}

export function chooseOrganization(
  ids: string[],
  saved: string | null,
): string | null {
  // Empty selection explicitly means personal context, even with memberships.
  if (saved === "") return null;
  return saved && ids.includes(saved) ? saved : (ids[0] ?? null);
}
export const contextStorageKey = (userId: string) =>
  `encore-os.active-organization-id:${userId}`;

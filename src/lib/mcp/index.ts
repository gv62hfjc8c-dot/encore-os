import { defineMcp, auth } from "@lovable.dev/mcp-js";

/**
 * Legacy Lovable MCP handlers returned static mock data.
 * Do not advertise them as a real Encore OS integration.
 * Endpoints are retained for backwards compatibility, but expose no tools
 * until per-request Person/Work-scoped RLS-backed adapters are implemented.
 */
const tools: Parameters<typeof defineMcp>[0]["tools"] = [];
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "encore-os-dashboard",
  title: "Encore OS Dashboard",
  version: "0.1.0",
  instructions: "As ferramentas do protótipo estão indisponíveis. Nenhum resultado demonstrativo é servido por este adaptador.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools,
});

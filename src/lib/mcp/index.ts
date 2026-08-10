import { defineMcp } from "@lovable.dev/mcp-js";
import { auth } from "@lovable.dev/mcp-js";
import listShowsTool, { getShowTool } from "./tools/shows";
import searchRepertoireTool from "./tools/repertoire";
import listEquipmentTool from "./tools/equipment";
import listRosterTool from "./tools/roster";

const tools = [
  listShowsTool,
  getShowTool,
  searchRepertoireTool,
  listEquipmentTool,
  listRosterTool,
] as unknown as Parameters<typeof defineMcp>[0]["tools"];


const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "encore-os-dashboard",
  title: "Encore OS Dashboard",
  version: "0.1.0",
  instructions:
    "Ferramentas do Encore OS, plataforma de gestão de bandas de baile e indústria do espetáculo. Use list_shows e get_show para espetáculos (equipa, setlist, logística, checklists), search_repertoire para o catálogo musical, list_equipment para o inventário técnico e list_roster para bandas e músicos.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools,
});

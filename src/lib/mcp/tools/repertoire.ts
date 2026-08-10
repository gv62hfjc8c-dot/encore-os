import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { repertorio } from "@/data/mock";

export default defineTool({
  name: "search_repertoire",
  title: "Pesquisar repertório",
  description:
    "Pesquisa o repertório musical do Encore OS por nome, artista, género ou estilo, devolvendo tom, BPM, energia e domínio da banda.",
  inputSchema: {
    query: z.string().optional().describe("Texto livre a procurar no nome, artista ou género."),
    limite: z.number().int().optional().describe("Número máximo de músicas a devolver (predefinido 25)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, limite }) => {
    const q = (query ?? "").trim().toLowerCase();
    const max = Math.min(Math.max(limite ?? 25, 1), 100);
    const items = repertorio
      .filter((m) => (q ? JSON.stringify(m).toLowerCase().includes(q) : true))
      .slice(0, max);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { songs: items },
    };
  },
});

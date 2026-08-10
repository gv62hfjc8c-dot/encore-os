import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { musicos, bandas } from "@/data/mock";

export default defineTool({
  name: "list_roster",
  title: "Listar bandas e músicos",
  description:
    "Lista as bandas do Encore OS e os músicos do plantel, com instrumento, disponibilidade e função.",
  inputSchema: {
    banda: z.string().optional().describe("Nome ou ID da banda para filtrar os músicos."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ banda }) => {
    const q = (banda ?? "").trim().toLowerCase();
    const people = musicos.filter((m) => (q ? JSON.stringify(m).toLowerCase().includes(q) : true));
    const payload = { bandas, musicos: people };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});

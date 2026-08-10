import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { equipamentos } from "@/data/mock";

export default defineTool({
  name: "list_equipment",
  title: "Listar equipamentos",
  description:
    "Lista o inventário técnico do Encore OS (som, luz, backline) com estado, localização e manutenção. Filtra opcionalmente por estado ou categoria.",
  inputSchema: {
    estado: z.string().optional().describe("Estado do equipamento, por exemplo Operacional ou Manutenção."),
    categoria: z.string().optional().describe("Categoria do equipamento, por exemplo Som, Luz ou Backline."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ estado, categoria }) => {
    const items = equipamentos.filter((e) => {
      const blob = JSON.stringify(e).toLowerCase();
      if (estado && !blob.includes(estado.toLowerCase())) return false;
      if (categoria && !blob.includes(categoria.toLowerCase())) return false;
      return true;
    });
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { equipment: items },
    };
  },
});

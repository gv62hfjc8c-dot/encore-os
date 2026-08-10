import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { espetaculos, getEspetaculo } from "@/data/mock";

export default defineTool({
  name: "list_shows",
  title: "Listar espetáculos",
  description:
    "Lista os espetáculos do Encore OS com data, local, organização, estado e cachê. Filtra opcionalmente por estado.",
  inputSchema: {
    estado: z
      .string()
      .optional()
      .describe("Estado a filtrar: Confirmado, Proposta, Reservado, Concluído ou Cancelado."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ estado }) => {
    const items = espetaculos
      .filter((e) => (estado ? e.estado.toLowerCase() === estado.toLowerCase() : true))
      .map((e) => ({
        id: e.id,
        nome: e.nome,
        banda: e.banda,
        data: e.data,
        hora: e.hora,
        local: e.local,
        cliente: e.cliente,
        estado: e.estado,
        preco: e.preco,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { shows: items },
    };
  },
});

export const getShowTool = defineTool({
  name: "get_show",
  title: "Detalhe do espetáculo",
  description:
    "Devolve o detalhe completo de um espetáculo: equipa, setlist, logística, checklists, timeline e financeiro.",
  inputSchema: { id: z.string().describe("ID do espetáculo, por exemplo o devolvido por list_shows.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const show = getEspetaculo(id);
    if (!show) throw new ToolError(`Espetáculo "${id}" não encontrado.`);
    return {
      content: [{ type: "text", text: JSON.stringify(show, null, 2) }],
      structuredContent: { show },
    };
  },
});

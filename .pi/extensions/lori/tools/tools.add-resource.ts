import { LoriOptions } from "../core/core.model";
import { LoriTool } from "./tools.model";
import { Type } from "@sinclair/typebox";
import { appendEvent, getLoriDir } from "../events/events.persistence";
import { readModuleFile, writeModuleFile } from "../modules/modules.io";
import { LoriEvents } from "../events/events.model";
import { join } from "node:path";
import { appendFile } from "node:fs/promises";

export const loriToolAddResource = ({ pi }: LoriOptions) => {
  return pi.registerTool({
    name: LoriTool.ADD_RESOURCE,
    label: "Lori Resource",
    description: "Add a curated resource to a Lori module or global resources.",
    promptSnippet: "Add learning resources to Lori",
    parameters: Type.Object({
      module: Type.Optional(Type.String({ description: "Module name, or omit for global" })),
      title: Type.String(),
      url: Type.Optional(Type.String()),
      notes: Type.Optional(Type.String()),
      tags: Type.Optional(Type.Array(Type.String())),
    }),
    async execute(_id, params, _signal, _onUpdate, ctx) {
      const line = `- [${params.title}](${params.url ?? ""})${params.notes ? " - " + params.notes : ""}`;
      if (params.module) {
        const existing = (await readModuleFile(ctx.cwd, params.module, "resources.md")) ?? "";
        await writeModuleFile(ctx.cwd, params.module, "resources.md", existing + line + "\n");
        await appendEvent(ctx.cwd, {
          type: LoriEvents.RESOURCE_CURATED,
          data: {
            module: params.module,
            title: params.title,
            url: params.url,
            notes: params.notes,
            tags: params.tags,
          },
        });
      } else {
        const path = join(getLoriDir(ctx.cwd), "resources", "index.md");
        await appendFile(path, line + "\n");
        await appendEvent(ctx.cwd, {
          type: LoriEvents.RESOURCE_CURATED,
          data: { title: params.title, url: params.url, notes: params.notes, tags: params.tags },
        });
      }
      return {
        content: [{ type: "text", text: `Recurso adicionado: ${params.title}` }],
        details: { title: params.title },
      };
    },
  });
};

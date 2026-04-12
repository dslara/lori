import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import {
  addResource,
  listResources,
  getResourceInfo,
  moveResource,
  deleteResource,
  linkResources,
  unlinkResources,
  getRelations,
  readContent,
  exportPack,
  importPack,
} from "./resource-core.js";

export default tool({
  description: "Manage OpenViking resources - add, list, move, delete, link, read, export/import resources for semantic search",
  args: {
    operation: z.enum([
      "add", "list", "info", "mv", "rm", "link", "unlink", "relations", "abstract", "overview", "read", "export", "import"
    ]).describe("Operation to perform: add=list=info=mv=rm=link=unlink=relations=abstract=overview=read=export=import"),

    path: z.string().optional().describe("URL or local path to add as resource. Required for 'add' operation."),
    target: z.string().optional().describe("Target URI in viking://resources/ (e.g., viking://resources/ultralearning/openviking)"),
    uri: z.string().optional().describe("Resource URI for list/info/relations/abstract/overview/read operations"),
    from: z.string().optional().describe("Source URI for 'mv' operation"),
    to: z.string().optional().describe("Destination URI for 'mv' operation, or target for 'export'"),
    recursive: z.boolean().optional().describe("Recursive flag for 'rm' operation"),
    to_uri: z.string().optional().describe("Target URI for 'link' or 'unlink' operation"),
    reason: z.string().optional().describe("Reason for adding or linking resources"),
    wait: z.boolean().optional().describe("Wait for semantic processing to complete (default: false)"),
    file_path: z.string().optional().describe("Local file path for 'export' or 'import' operation"),
    parent: z.string().optional().describe("Parent URI for 'import' operation"),
    force: z.boolean().optional().describe("Force overwrite for 'import' operation"),
    vectorize: z.boolean().optional().describe("Trigger vectorization after import (default: true)"),
  },

  async execute(args, context) {
    switch (args.operation) {
      case "add": {
        if (!args.path) {
          return JSON.stringify({ success: false, error: "MISSING_PATH", message: "path is required for 'add' operation" });
        }
        return await addResource({ path: args.path, target: args.target, wait: args.wait, reason: args.reason });
      }

      case "list": {
        return await listResources({ uri: args.uri });
      }

      case "info": {
        if (!args.uri) {
          return JSON.stringify({ success: false, error: "MISSING_URI", message: "uri is required for 'info' operation" });
        }
        return await getResourceInfo({ uri: args.uri });
      }

      case "mv": {
        if (!args.from || !args.to) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "from and to are required for 'mv' operation" });
        }
        return await moveResource({ from: args.from, to: args.to });
      }

      case "rm": {
        if (!args.uri) {
          return JSON.stringify({ success: false, error: "MISSING_URI", message: "uri is required for 'rm' operation" });
        }
        return await deleteResource({ uri: args.uri, recursive: args.recursive });
      }

      case "link": {
        if (!args.uri || !args.to_uri) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "uri and to_uri are required for 'link' operation" });
        }
        return await linkResources({ from: args.uri, to: args.to_uri, reason: args.reason });
      }

      case "unlink": {
        if (!args.uri || !args.to_uri) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "uri and to_uri are required for 'unlink' operation" });
        }
        return await unlinkResources(args.uri, args.to_uri);
      }

      case "relations": {
        if (!args.uri) {
          return JSON.stringify({ success: false, error: "MISSING_URI", message: "uri is required for 'relations' operation" });
        }
        return await getRelations({ uri: args.uri });
      }

      case "abstract":
      case "overview":
      case "read": {
        if (!args.uri) {
          return JSON.stringify({ success: false, error: "MISSING_URI", message: "uri is required for content operations" });
        }
        return await readContent({ uri: args.uri, level: args.operation });
      }

      case "export": {
        if (!args.uri || !args.to) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "uri and to are required for 'export' operation" });
        }
        return await exportPack({ uri: args.uri, to: args.to });
      }

      case "import": {
        if (!args.file_path || !args.parent) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "file_path and parent are required for 'import' operation" });
        }
        return await importPack({ file_path: args.file_path, parent: args.parent, force: args.force, vectorize: args.vectorize });
      }

      default:
        return JSON.stringify({ success: false, error: "INVALID_OPERATION", message: `Unknown operation: ${args.operation}` });
    }
  },
});
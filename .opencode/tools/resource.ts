import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { addResource, listResources, getResourceInfo } from "./resource-core.js";

export default tool({
  description: "Manage OpenViking resources - add and list indexed knowledge resources for semantic search",
  args: {
    operation: z.enum(["add", "list", "info"]).describe("Operation to perform"),

    path: z.string().optional().describe("URL or local path to add as resource (e.g., https://github.com/volcengine/OpenViking). Required for 'add' operation."),
    target: z.string().optional().describe("Target URI in viking://resources/ (e.g., viking://resources/ultralearning/openviking)"),
    uri: z.string().optional().describe("Resource URI for 'list' and 'info' operations (default: viking://resources/)"),
    wait: z.boolean().optional().describe("Wait for semantic processing to complete (default: false)"),
    reason: z.string().optional().describe("Reason for adding this resource"),
  },

  async execute(args, context) {
    switch (args.operation) {
      case "add": {
        if (!args.path) {
          return JSON.stringify({
            success: false,
            error: "MISSING_PATH",
            message: "path is required for 'add' operation"
          });
        }
        const result = await addResource({
          path: args.path,
          target: args.target,
          wait: args.wait,
          reason: args.reason,
        });
        return result;
      }

      case "list": {
        const result = await listResources({
          uri: args.uri,
        });
        return result;
      }

      case "info": {
        if (!args.uri) {
          return JSON.stringify({
            success: false,
            error: "MISSING_URI",
            message: "uri is required for 'info' operation"
          });
        }
        const result = await getResourceInfo({
          uri: args.uri,
        });
        return result;
      }

      default:
        return JSON.stringify({
          success: false,
          error: "INVALID_OPERATION",
          message: `Unknown operation: ${args.operation}`
        });
    }
  },
});
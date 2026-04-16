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
  writeContent,
  mkdir,
  treeResources,
  syncResource,
  searchFind,
  searchDeep,
  searchGrep,
  searchGlob,
  exportPack,
  importPack,
} from "./resource-core.js";

export default tool({
  description: "Manage OpenViking resources - add, list, move, delete, link, read, write, search, sync, export/import resources for semantic search",
  args: {
    operation: z.enum([
      "add", "list", "info", "mv", "rm", "link", "unlink", "relations",
      "abstract", "overview", "read", "write", "mkdir", "tree", "sync",
      "find", "search", "grep", "glob", "export", "import"
    ]).describe("Operation to perform: add=list=info=mv=rm=link=unlink=relations=abstract=overview=read=write=mkdir=tree=sync=find=search=grep=glob=export=import"),

    path: z.string().optional().describe("URL or local path to add as resource. Required for 'add' operation."),
    target: z.string().optional().describe("Target URI in viking://resources/ (e.g., viking://resources/ultralearning/openviking)"),
    uri: z.string().optional().describe("Resource URI for list/info/relations/abstract/overview/read/write operations"),
    from: z.string().optional().describe("Source URI for 'mv' operation"),
    to: z.string().optional().describe("Destination URI for 'mv' operation, or target for 'export'"),
    recursive: z.boolean().optional().describe("Recursive flag for 'rm' operation"),
    to_uri: z.string().optional().describe("Target URI for 'link' or 'unlink' operation"),
    reason: z.string().optional().describe("Reason for adding, linking, or syncing resources"),
    wait: z.boolean().optional().describe("Wait for semantic processing to complete (default: false)"),
    file_path: z.string().optional().describe("Local file path for 'export' or 'import' operation"),
    parent: z.string().optional().describe("Parent URI for 'import' operation"),
    force: z.boolean().optional().describe("Force overwrite for 'import' operation"),
    vectorize: z.boolean().optional().describe("Trigger vectorization after import (default: true)"),
    // Write operation args
    content: z.string().optional().describe("Content to write (for 'write' operation)"),
    mode: z.enum(["replace", "append"]).optional().describe("Write mode: replace (default) or append"),
    timeout: z.number().optional().describe("Timeout in seconds when wait=true for 'write' operation"),
    // Sync operation args
    watch_interval: z.number().optional().describe("Auto-refresh interval in minutes. 0=disable. For 'sync' operation."),
    instruction: z.string().optional().describe("Processing instructions for 'add' operation"),
    // Search operation args
    query: z.string().optional().describe("Search query for 'find'/'search' operations"),
    limit: z.number().optional().describe("Max results for search operations"),
    score_threshold: z.number().min(0).max(1).optional().describe("Min relevance score (0-1) for search operations"),
    search_mode: z.enum(["fast", "deep", "auto"]).optional().describe("Search mode for 'find' operation"),
    session_id: z.string().optional().describe("Session ID for context-aware 'search' operation"),
    pattern: z.string().optional().describe("Glob/regex pattern for 'grep'/'glob' operations"),
    simple: z.boolean().optional().describe("Simple output flag for 'list'/'tree' operations"),
  },

  async execute(args, context) {
    switch (args.operation) {
      case "add": {
        if (!args.path) {
          return JSON.stringify({ success: false, error: "MISSING_PATH", message: "path is required for 'add' operation" });
        }
        return await addResource({ 
          path: args.path, 
          target: args.target, 
          wait: args.wait, 
          reason: args.reason,
          instruction: args.instruction,
          watch_interval: args.watch_interval,
        });
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

      case "write": {
        if (!args.uri || !args.content) {
          return JSON.stringify({ success: false, error: "MISSING_PARAMS", message: "uri and content are required for 'write' operation" });
        }
        return await writeContent({ 
          uri: args.uri, 
          content: args.content, 
          mode: args.mode, 
          wait: args.wait, 
          timeout: args.timeout 
        });
      }

      case "mkdir": {
        if (!args.uri) {
          return JSON.stringify({ success: false, error: "MISSING_URI", message: "uri is required for 'mkdir' operation" });
        }
        return await mkdir({ uri: args.uri });
      }

      case "tree": {
        return await treeResources({ uri: args.uri, simple: args.simple });
      }

      case "sync": {
        if (!args.target) {
          return JSON.stringify({ success: false, error: "MISSING_TARGET", message: "target is required for 'sync' operation" });
        }
        return await syncResource({ 
          target: args.target, 
          path: args.path, 
          watch_interval: args.watch_interval, 
          reason: args.reason 
        });
      }

      case "find": {
        if (!args.query) {
          return JSON.stringify({ success: false, error: "MISSING_QUERY", message: "query is required for 'find' operation" });
        }
        return await searchFind({ 
          query: args.query, 
          target_uri: args.target, 
          limit: args.limit, 
          score_threshold: args.score_threshold, 
          mode: args.search_mode 
        });
      }

      case "search": {
        if (!args.query) {
          return JSON.stringify({ success: false, error: "MISSING_QUERY", message: "query is required for 'search' operation" });
        }
        return await searchDeep({ 
          query: args.query, 
          target_uri: args.target, 
          session_id: args.session_id, 
          limit: args.limit, 
          score_threshold: args.score_threshold 
        });
      }

      case "grep": {
        if (!args.pattern) {
          return JSON.stringify({ success: false, error: "MISSING_PATTERN", message: "pattern is required for 'grep' operation" });
        }
        return await searchGrep({ pattern: args.pattern, uri: args.uri, limit: args.limit });
      }

      case "glob": {
        if (!args.pattern) {
          return JSON.stringify({ success: false, error: "MISSING_PATTERN", message: "pattern is required for 'glob' operation" });
        }
        return await searchGlob({ pattern: args.pattern, uri: args.uri, limit: args.limit });
      }

      default:
        return JSON.stringify({ success: false, error: "INVALID_OPERATION", message: `Unknown operation: ${args.operation}` });
    }
  },
});
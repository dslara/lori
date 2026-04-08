import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { format } from "date-fns";
import { join } from "path";

import { getUserId, readCSV } from "./utils-csv.js";
import { createSession, getSessions } from "./data-session.js";
import { updateInsight, getInsight, getAllInsights, getStreak, updateStreak } from "./data-insight.js";
import { createFlashcard, getFlashcards, createReview } from "./data-flashcard.js";
import { createModule, switchModule, archiveModule } from "./data-module.js";
import { initDataDir, resetAllData, createBackup } from "./data-core.js";
import type { SessionSkill } from "./model-types.js";

function getDataDir(context: any): string {
  return join(context.worktree || context.directory, "data");
}

export default tool({
  description: "CRUD operations for Ultralearning System data (CSV files)",
  args: {
    operation: z.enum([
      "init",
      "createSession",
      "getSessions",
      "getSessionSkills",
      "updateInsight",
      "getInsight",
      "getAllInsights",
      "getStreak",
      "updateStreak",
      "createFlashcard",
      "getFlashcards",
      "createReview",
      "resetAll",
      "createModule",
      "switchModule",
      "archiveModule",
      "createBackup"
    ]).describe("Operation to perform"),
    
    moduleId: z.string().optional().describe("Module ID (e.g., M1, M2)"),
    duration: z.number().min(0).optional().describe("Session duration in minutes"),
    focusScore: z.number().min(1).max(10).optional().describe("Focus score (1-10)"),
    notes: z.string().max(200).optional().describe("Session notes"),
    
    filterModuleId: z.string().optional().describe("Filter sessions by module"),
    limit: z.number().min(1).max(100).optional().describe("Limit number of results"),
    
    metric: z.string().optional().describe("Metric name (e.g., streak, best_streak)"),
    value: z.string().optional().describe("Metric value"),
    insightModuleId: z.string().optional().describe("Module ID for insight"),
    
    front: z.string().optional().describe("Flashcard front text"),
    back: z.string().optional().describe("Flashcard back text"),
    category: z.string().optional().describe("Flashcard category"),
    tags: z.array(z.string()).optional().describe("Flashcard tags"),
    
    flashcardId: z.string().optional().describe("Flashcard ID"),
    quality: z.number().min(0).max(5).optional().describe("Review quality (0-5, SM-2)"),
    
    moduleName: z.string().optional().describe("Module name (e.g., python-backend, rust-async)"),
  },
  
  async execute(args, context) {
    const dataDir = getDataDir(context);
    
    try {
      switch (args.operation) {
        case "init":
          return await initDataDir(dataDir);
        
        case "createSession":
          if (!args.moduleId) {
            return JSON.stringify({ success: false, error: "MODULE_ID_REQUIRED", message: "moduleId is required" });
          }
          return await createSession(dataDir, {
            moduleId: args.moduleId,
            duration: args.duration,
            focusScore: args.focusScore,
            notes: args.notes
          });
        
        case "getSessions":
          return await getSessions(dataDir, {
            filterModuleId: args.filterModuleId,
            limit: args.limit
          });
        
        case "getSessionSkills": {
          const skills = await readCSV<SessionSkill>(join(dataDir, "session_skills.csv"));
          return JSON.stringify({
            success: true,
            data: { skills }
          });
        }
        
        case "updateInsight":
          if (!args.metric || args.value === undefined) {
            return JSON.stringify({ success: false, error: "METRIC_REQUIRED", message: "metric and value are required" });
          }
          return await updateInsight(dataDir, {
            metric: args.metric,
            value: args.value,
            insightModuleId: args.insightModuleId
          });
        
        case "getInsight":
          if (!args.metric) {
            return JSON.stringify({ success: false, error: "METRIC_REQUIRED", message: "metric is required" });
          }
          return await getInsight(dataDir, { metric: args.metric });
        
        case "getAllInsights":
          return await getAllInsights(dataDir);
        
        case "getStreak":
          return await getStreak(dataDir);
        
        case "updateStreak":
          return await updateStreak(dataDir);
        
        case "createFlashcard":
          if (!args.front || !args.back) {
            return JSON.stringify({ success: false, error: "FLASHCARD_CONTENT_REQUIRED", message: "front and back are required" });
          }
          return await createFlashcard(dataDir, {
            moduleId: args.moduleId,
            front: args.front,
            back: args.back,
            category: args.category,
            tags: args.tags
          });
        
        case "getFlashcards":
          return await getFlashcards(dataDir);
        
        case "createReview":
          if (!args.flashcardId || args.quality === undefined) {
            return JSON.stringify({ success: false, error: "REVIEW_DATA_REQUIRED", message: "flashcardId and quality are required" });
          }
          return await createReview(dataDir, {
            flashcardId: args.flashcardId,
            quality: args.quality
          });
        
        case "resetAll":
          return await resetAllData(dataDir);
        
        case "createModule":
          if (!args.moduleName) {
            return JSON.stringify({ success: false, error: "MODULE_NAME_REQUIRED", message: "moduleName is required" });
          }
          return await createModule(dataDir, context, { moduleName: args.moduleName });
        
        case "switchModule":
          return await switchModule(dataDir, { moduleName: args.moduleName });
        
        case "archiveModule":
          if (!args.moduleName) {
            return JSON.stringify({ success: false, error: "MODULE_NAME_REQUIRED", message: "moduleName is required" });
          }
          return await archiveModule(dataDir, context, { moduleName: args.moduleName });
        
        case "createBackup":
          return await createBackup(dataDir, context);
        
        default:
          return JSON.stringify({
            success: false,
            error: "UNKNOWN_OPERATION",
            message: `Unknown operation: ${args.operation}`
          });
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: "EXECUTION_ERROR",
        message: String(error)
      });
    }
  }
});

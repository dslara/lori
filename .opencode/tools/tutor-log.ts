import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { format } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache, sanitize } from "./utils-csv.js";
import type { Interaction } from "./model-types.js";

export default tool({
  description: "Log and retrieve tutor interactions",
  args: {
    operation: z.enum([
      "logInteraction",
      "getInteractionsByTopic",
      "getInteractionsBySession",
      "getRecentInteractions"
    ]).describe("Operation to perform"),
    
    sessionId: z.string().optional().describe("Session ID"),
    skill: z.string().optional().describe("Skill used (e.g., drill, quiz)"),
    topic: z.string().optional().describe("Topic of interaction"),
    userMessage: z.string().optional().describe("User's question/message"),
    userResponse: z.string().optional().describe("User's response/answer"),
    tutorResponse: z.string().optional().describe("Tutor's response"),
    metadata: z.object({}).passthrough().optional().describe("Additional metadata (JSON)"),
    
    limit: z.number().min(1).max(100).default(10).optional().describe("Number of results to return"),
    
    filterTopic: z.string().optional().describe("Topic to filter by")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    
    try {
      switch (args.operation) {
        case "logInteraction": {
          if (!args.sessionId || !args.skill || !args.topic || !args.userMessage) {
            return JSON.stringify({
              success: false,
              error: "MISSING_PARAMETERS",
              message: "sessionId, skill, topic, and userMessage are required"
            });
          }
          
          const timestamp = new Date().toISOString();
          const interactionId = `I${format(new Date(), "yyyyMMddHHmmss")}`;
          
          const interaction: Interaction = {
            id: interactionId,
            session_id: args.sessionId,
            skill: args.skill,
            topic: args.topic,
            user_message: sanitize(args.userMessage, 200),
            user_response: sanitize(args.userResponse || "", 200),
            tutor_response: sanitize(args.tutorResponse || "", 500),
            timestamp,
            metadata: JSON.stringify(args.metadata || {})
          };
          
          return JSON.stringify({
            success: true,
            data: {
              interactionId,
              timestamp,
              logged: true
            }
          });
        }
        
        case "getInteractionsByTopic": {
          if (!args.filterTopic) {
            return JSON.stringify({
              success: false,
              error: "TOPIC_REQUIRED",
              message: "filterTopic is required"
            });
          }
          
          const cacheKey = getCacheKey("tutor-log", "topic", args.filterTopic, String(args.limit));
          const cached = getFromCache(cacheKey);
          if (cached) {
            return JSON.stringify({ success: true, data: cached, cached: true });
          }
          
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const filtered = interactions
            .filter(i => i.topic.toLowerCase() === args.filterTopic?.toLowerCase())
            .slice(-(args.limit || 10));
          
          const result = {
            interactions: filtered,
            count: filtered.length,
            topic: args.filterTopic
          };
          
          setCache(cacheKey, result);
          return JSON.stringify({ success: true, data: result, cached: false });
        }
        
        case "getInteractionsBySession": {
          if (!args.sessionId) {
            return JSON.stringify({
              success: false,
              error: "SESSION_ID_REQUIRED",
              message: "sessionId is required"
            });
          }
          
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const filtered = interactions.filter(i => i.session_id === args.sessionId);
          
          return JSON.stringify({
            success: true,
            data: {
              interactions: filtered,
              count: filtered.length,
              sessionId: args.sessionId
            }
          });
        }
        
        case "getRecentInteractions": {
          const cacheKey = getCacheKey("tutor-log", "recent", String(args.limit));
          const cached = getFromCache(cacheKey);
          if (cached) {
            return JSON.stringify({ success: true, data: cached, cached: true });
          }
          
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const sorted = interactions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, args.limit || 10);
          
          const result = {
            interactions: sorted,
            count: sorted.length
          };
          
          setCache(cacheKey, result);
          return JSON.stringify({ success: true, data: result, cached: false });
        }
        
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

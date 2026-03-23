import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache } from "./utils-csv.js";
import { 
  getAgentId, 
  getAgentBaseUri, 
  getAgentMemoryUri, 
  getUserPreferencesUri,
  isOpenVikingAvailable 
} from "./openviking-utils.js";
import type { Session, SessionSkill, Flashcard, Insight } from "./model-types.js";

// ============================================================================
// TYPES
// ============================================================================

interface HybridContext {
  sessions: Session[];
  sessionSkills: SessionSkill[];
  flashcards: Flashcard[];
  streak: number;
  totalSessions: number;
  preferences: any | null;
  agentUri: string | null;
  openvikingAvailable: boolean;
  warnings: string[];
}

interface SessionContext {
  sessions: Session[];
  sessionSkills: SessionSkill[];
  currentModule: string | null;
  recentTopics: string[];
  streak: number;
  lastSessionDate: string | null;
}

// ============================================================================
// CSV DATA LOADING (with cache)
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadCsvData(dataDir: string, userId: string) {
  const cacheKey = getCacheKey("hybrid-context", userId);
  const cached = getFromCache<{ sessions: Session[]; sessionSkills: SessionSkill[]; flashcards: Flashcard[]; insights: Insight[] }>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const [sessions, sessionSkills, flashcards, insights] = await Promise.all([
    readCSV<Session>(join(dataDir, "sessions.csv")),
    readCSV<SessionSkill>(join(dataDir, "session_skills.csv")),
    readCSV<Flashcard>(join(dataDir, "flashcards.csv")),
    readCSV<Insight>(join(dataDir, "insights.csv"))
  ]);
  
  const result = {
    sessions: sessions.filter(s => s.user_id === userId),
    sessionSkills,
    flashcards: flashcards.filter(f => f.user_id === userId),
    insights: insights.filter(i => i.user_id === userId)
  };
  
  setCache(cacheKey, result);
  return result;
}

function getLatestInsight(insights: Insight[], metric: string): string | null {
  const filtered = insights.filter(i => i.metric === metric);
  if (filtered.length === 0) return null;
  return filtered.sort((a, b) => b.date.localeCompare(a.date))[0]?.value || null;
}

// ============================================================================
// OPENVIKING HELPERS
// ============================================================================

/**
 * Safe wrapper for memread that returns null on failure.
 */
async function safeMemread(uri: string, level: string = "overview"): Promise<any> {
  try {
    // Note: In OpenCode context, this would call the actual memread tool
    // For now, we return null to indicate OpenViking is not available
    // When integrated, this would be:
    // const result = await memread({ uri, level });
    // return JSON.parse(result);
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Safe wrapper for memsearch that returns empty array on failure.
 */
async function safeMemsearch(query: string, targetUri: string, limit: number = 5): Promise<any[]> {
  try {
    // Note: In OpenCode context, this would call the actual memsearch tool
    // For now, we return empty array to indicate OpenViking is not available
    // When integrated, this would be:
    // const result = await memsearch({ query, target_uri: targetUri, limit });
    // return JSON.parse(result).results || [];
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Safe wrapper for getAgentId that returns null on failure.
 */
async function safeGetAgentId(): Promise<string | null> {
  try {
    return await getAgentId();
  } catch (error) {
    return null;
  }
}

// ============================================================================
// MAIN TOOL
// ============================================================================

export default tool({
  description: "Get hybrid context (CSV structured data + OpenViking semantic memory)",
  
  args: {
    operation: z.enum([
      "getFullContext",
      "getUserPreferences",
      "getRelevantSessions",
      "getLearningPatterns",
      "getAgentId",
      "getSessionContext"
    ]).describe("Context operation to perform"),
    
    query: z.string().optional().describe("Search query for semantic memory"),
    limit: z.number().min(1).max(50).optional().describe("Limit for search results"),
    includeContent: z.boolean().optional().describe("Include full content in results")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    
    try {
      const openvikingAvailable = await isOpenVikingAvailable();
      const warnings: string[] = [];
      
      switch (args.operation) {
        case "getFullContext": {
          // CSV - Dados estruturados
          const csvData = await loadCsvData(dataDir, userId);
          const streak = getLatestInsight(csvData.insights, "streak");
          const totalSessions = getLatestInsight(csvData.insights, "total_sessions");
          
          // OpenViking - Contexto semântico (com fallback)
          let preferences = null;
          let patterns: any[] = [];
          let agentUri: string | null = null;
          
          if (openvikingAvailable) {
            preferences = await safeMemread(getUserPreferencesUri(), "overview");
            agentUri = await getAgentBaseUri();
            if (agentUri) {
              patterns = await safeMemsearch("padrões de aprendizado",`${agentUri}patterns/`, 5);
            }
          } else {
            warnings.push("OpenViking not available - preferences and patterns unavailable");
          }
          
          const result: HybridContext = {
            sessions: csvData.sessions.slice(-5),
            sessionSkills: csvData.sessionSkills,
            flashcards: csvData.flashcards,
            streak: parseInt(streak || "0"),
            totalSessions: parseInt(totalSessions || "0"),
            preferences,
            agentUri,
            openvikingAvailable,
            warnings
          };
          
          return JSON.stringify({ success: true, data: result });
        }
        
        case "getUserPreferences": {
          if (!openvikingAvailable) {
            return JSON.stringify({
              success: false,
              error: "OPENVIKING_UNAVAILABLE",
              message: "OpenViking is not available. Preferences are stored in OpenViking."
            });
          }
          
          const preferences = await safeMemread(getUserPreferencesUri(), "overview");
          
          return JSON.stringify({
            success: true,
            source: "openviking",
            data: preferences,
            uri: getUserPreferencesUri()
          });
        }
        
        case "getRelevantSessions": {
          if (!args.query) {
            return JSON.stringify({
              success: false,
              error: "QUERY_REQUIRED",
              message: "Query parameter is required for getRelevantSessions"
            });
          }
          
          if (!openvikingAvailable) {
            return JSON.stringify({
              success: true,
              data: [],
              warning: "OpenViking not available - semantic search unavailable"            });
          }
          
          const agentUri = await safeGetAgentId();
          if (!agentUri) {
            return JSON.stringify({
              success: true,
              data: [],
              warning: "Agent ID not available"
            });
          }
          
          const casesUri = `viking://agent/${agentUri}/memories/cases/`;
          const results = await safeMemsearch(args.query, casesUri, args.limit || 10);
          
          return JSON.stringify({
            success: true,
            data: results,
            _agentUri: agentUri
          });
        }
        
        case "getLearningPatterns": {
          if (!openvikingAvailable) {
            return JSON.stringify({
              success: true,
              data: [],
              warning: "OpenViking not available - patterns unavailable"
            });
          }
          
          const patternsUri = await getAgentMemoryUri('patterns');
          const patterns = await safeMemread(patternsUri, "overview");
          
          return JSON.stringify({
            success: true,
            data: patterns,
            uri: patternsUri
          });
        }
        
        case "getAgentId": {
          // Para debug - retorna o ID descoberto
          const agentId = await safeGetAgentId();
          return JSON.stringify({
            success: true,
            data: { agentId, agentUri: agentId ? `viking://agent/${agentId}/memories/` : null }
          });
        }
        
        case "getSessionContext": {
          // Contexto de sessão para iniciar estudo
          const csvData = await loadCsvData(dataDir, userId);
          
          // Últimas sessões
          const recentSessions = csvData.sessions
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5);
          
          // Skills das sessões recentes
          const recentSessionIds = new Set(recentSessions.map(s => s.id));
          const recentSkills = csvData.sessionSkills
            .filter(s => recentSessionIds.has(s.session_id));
          
          // Tópicos recentes
          const recentTopics = [...new Set(recentSkills.map(s => s.topic).filter(Boolean))];
          
          // Módulo atual
          const currentModule = recentSessions[0]?.module_id || null;
          
          // Streak
          const streak = getLatestInsight(csvData.insights, "streak");
          
          // Última sessão
          const lastSessionDate = recentSessions[0]?.date || null;
          
          const sessionContext: SessionContext = {
            sessions: recentSessions,
            sessionSkills: recentSkills,
            currentModule,
            recentTopics,
            streak: parseInt(streak || "0"),lastSessionDate
          };
          
          return JSON.stringify({ success: true, data: sessionContext });
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
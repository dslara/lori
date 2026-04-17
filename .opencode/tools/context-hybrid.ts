import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { readFile } from "node:fs/promises";
import { format } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache } from "../shared/utils-csv.js";
import {
  getAgentId,
  getAgentBaseUri,
  getAgentMemoryUri,
  getUserPreferencesUri,
  isOpenVikingAvailable
} from "../shared/openviking-utils.js";
import {
  loadConfig,
  makeRequest,
  unwrapResponse,
} from "../shared/openviking-client.js";
import type { OpenVikingResponse } from "../shared/openviking-client.js";
import type { Module, Session, SessionSkill, Flashcard, Insight } from "../shared/model-types.js";

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
  patterns: any[];
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

interface WeekContext {
  file: string | null;
  content: string | null;
  weekNumber: number | null;
}

interface SRSPending {
  count: number;
  cards: Array<{
    id: string;
    front: string;
    nextReview: string;
  }>;
}

interface ProjectInfo {
  root: string;
  version: string;
  today: string;
  userId: string;
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
// OPENVIKING HELPERS (real HTTP calls)
// ============================================================================

let _ovConfig: ReturnType<typeof loadConfig> | null = null;
let _ovConfigFailed: boolean = false;

function getOVConfig() {
  if (_ovConfigFailed) {
    return null;
  }
  if (!_ovConfig) {
    try {
      _ovConfig = loadConfig();
    } catch (e) {
      console.warn("[context-hybrid] Failed to load OpenViking config:", e);
      _ovConfigFailed = true;
      return null;
    }
  }
  if (!_ovConfig!.enabled) return null;
  return _ovConfig;
}

/**
 * Safe wrapper for memread via direct HTTP.
 */
async function safeMemread(uri: string, level: string = "overview"): Promise<any> {
  try {
    const config = getOVConfig();
    if (!config) return null;
    const response = await makeRequest<OpenVikingResponse<any>>(config, {
      method: "GET",
      endpoint: `/api/v1/content/${level}?uri=${encodeURIComponent(uri)}`,
      timeoutMs: 10000,
    });
    return unwrapResponse(response) ?? null;
  } catch (e) {
    console.warn(`[context-hybrid] memread failed for ${uri}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Safe wrapper for memsearch via direct HTTP.
 */
async function safeMemsearch(query: string, targetUri: string, limit: number = 5): Promise<any[]> {
  try {
    const config = getOVConfig();
    if (!config) return [];
    const response = await makeRequest<OpenVikingResponse<any>>(config, {
      method: "POST",
      endpoint: "/api/v1/search/find",
      body: { query, limit, target_uri: targetUri },
      timeoutMs: 10000,
    });
    const result = unwrapResponse(response);
    return result?.memories ?? [];
  } catch (e) {
    console.warn(`[context-hybrid] memsearch failed for "${query}":`, e instanceof Error ? e.message : e);
    return [];
  }
}

/**
 * Safe wrapper for getAgentId that returns null on failure.
 */
async function safeGetAgentId(): Promise<string | null> {
  try {
    return await getAgentId();
  } catch {
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
      "getSessionContext",
      "getWeekContext",
      "getSRSPending",
      "getProjectInfo",
      "getCurrentModule"
    ]).describe("Context operation to perform"),

    query: z.string().optional().describe("Search query for semantic memory"),
    limit: z.number().min(1).max(50).optional().describe("Limit for search results"),
    includeContent: z.boolean().default(false).optional().describe("Include week file content (for getWeekContext)")
  },

  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();

    try {
      const ovAvailable = await isOpenVikingAvailable();
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

          if (ovAvailable) {
            preferences = await safeMemread(getUserPreferencesUri(), "overview");
            agentUri = await getAgentBaseUri();
            if (agentUri) {
              patterns = await safeMemsearch("padrões de aprendizado", `${agentUri}patterns/`, 5);
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
            patterns,
            agentUri,
            openvikingAvailable: ovAvailable,
            warnings
          };

          return JSON.stringify({ success: true, data: result });
        }

        case "getUserPreferences": {
          if (!ovAvailable) {
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

          if (!ovAvailable) {
            return JSON.stringify({
              success: true,
              data: [],
              warning: "OpenViking not available - semantic search unavailable"
            });
          }

          const agentId = await safeGetAgentId();
          if (!agentId) {
            return JSON.stringify({
              success: true,
              data: [],
              warning: "Agent ID not available"
            });
          }

          const casesUri = await getAgentMemoryUri('cases');
          const results = await safeMemsearch(args.query, casesUri, args.limit || 10);

          return JSON.stringify({
            success: true,
            data: results,
            _agentId: agentId
          });
        }

        case "getLearningPatterns": {
          if (!ovAvailable) {
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
          const agentId = await safeGetAgentId();
          return JSON.stringify({
            success: true,
            data: { agentId, agentUri: agentId ? `viking://agent/${agentId}/memories/` : null }
          });
        }

        case "getSessionContext": {
          const csvData = await loadCsvData(dataDir, userId);

          const recentSessions = csvData.sessions
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5);

          const recentSessionIds = new Set(recentSessions.map(s => s.id));
          const recentSkills = csvData.sessionSkills
            .filter(s => recentSessionIds.has(s.session_id));

          const recentTopics = [...new Set(recentSkills.map(s => s.topic).filter(Boolean))];

          const currentModule = recentSessions[0]?.module_id || null;

          const streak = getLatestInsight(csvData.insights, "streak");

          const lastSessionDate = recentSessions[0]?.date || null;

          const sessionContext: SessionContext = {
            sessions: recentSessions,
            sessionSkills: recentSkills,
            currentModule,
            recentTopics,
            streak: parseInt(streak || "0"),
            lastSessionDate
          };

          return JSON.stringify({ success: true, data: sessionContext });
        }

        case "getWeekContext": {
          const today = format(new Date(), "yyyy-MM-dd");
          const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
          const activeModule = modules.find(m =>
            m.user_id === userId && m.is_active === "true"
          );

          if (!activeModule) {
            return JSON.stringify({
              success: true,
              data: { weekContext: { file: null, content: null, weekNumber: null } }
            });
          }

          const { glob } = await import("glob");
          const modulePath = join(projectRoot, "projects", `${activeModule.id}-${activeModule.name}`, "meta");
          let weekFiles: string[];
          try {
            weekFiles = await glob("week-*.md", { cwd: modulePath });
          } catch {
            weekFiles = [];
          }

          let weekContext: WeekContext = { file: null, content: null, weekNumber: null };

          if (weekFiles.length > 0) {
            weekFiles.sort();
            const currentWeekFile = weekFiles[0];
            const weekMatch = currentWeekFile.match(/week-(\d+)/);
            const weekNumber = weekMatch ? parseInt(weekMatch[1]) : null;

            weekContext = {
              file: currentWeekFile,
              weekNumber,
              content: null
            };

            if (args.includeContent) {
              try {
                weekContext.content = await readFile(join(modulePath, currentWeekFile), "utf-8");
              } catch {}
            }
          }

          return JSON.stringify({ success: true, data: { weekContext } });
        }

        case "getSRSPending": {
          const today = format(new Date(), "yyyy-MM-dd");
          const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
          const pendingCards = flashcards
            .filter(f => f.user_id === userId && f.next_review <= today)
            .map(f => ({
              id: f.id,
              front: f.front,
              nextReview: f.next_review
            }));

          const srsPending: SRSPending = {
            count: pendingCards.length,
            cards: pendingCards.slice(0, 10)
          };

          return JSON.stringify({ success: true, data: { srsPending } });
        }

        case "getProjectInfo": {
          const today = format(new Date(), "yyyy-MM-dd");
          let version = "unknown";
          try {
            version = await readFile(join(projectRoot, "VERSION"), "utf-8");
            version = version.trim();
          } catch {}

          const info: ProjectInfo = {
            root: projectRoot,
            version,
            today,
            userId
          };

          return JSON.stringify({ success: true, data: info });
        }

        case "getCurrentModule": {
          const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
          const activeModule = modules.find(m =>
            m.user_id === userId && m.is_active === "true"
          );

          if (!activeModule) {
            return JSON.stringify({
              success: true,
              data: { currentModule: null }
            });
          }

          return JSON.stringify({
            success: true,
            data: {
              currentModule: {
                id: activeModule.id,
                name: activeModule.name,
                status: activeModule.status,
                startedAt: activeModule.started_at,
                totalHours: parseFloat(activeModule.total_hours) || 0
              }
            }
          });
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

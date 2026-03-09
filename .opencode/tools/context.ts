import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { readFile } from "fs/promises";
import { join } from "path";
import { format } from "date-fns";

import { readCSV, getUserId } from "./utils-csv.js";
import type { Module, Session, Flashcard } from "./model-types.js";

interface ProjectInfo {
  root: string;
  version: string;
  today: string;
  userId: string;
}

interface CurrentModule {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  totalHours: number;
}

interface WeekContext {
  file: string | null;
  content: string | null;
  weekNumber: number | null;
}

interface RecentSession {
  id: string;
  date: string;
  duration: number;
  focusScore: number;
  notes: string;
}

interface SRSPending {
  count: number;
  cards: Array<{
    id: string;
    front: string;
    nextReview: string;
  }>;
}

interface FullContext {
  projectInfo: ProjectInfo;
  currentModule: CurrentModule | null;
  recentSessions: RecentSession[];
  weekContext: WeekContext;
  srsPending: SRSPending;
}

export default tool({
  description: "Get session context for Ultralearning System (current module, recent sessions, week plan, SRS pending)",
  args: {
    operation: z.enum([
      "getCurrentModule",
      "getRecentSessions",
      "getWeekContext",
      "getSRSPending",
      "getProjectInfo",
      "getFullContext"
    ]).describe("Context operation to perform"),
    
    limit: z.number().min(1).max(20).default(3).optional().describe("Number of recent sessions to fetch"),
    includeContent: z.boolean().default(false).optional().describe("Include week file content")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const today = format(new Date(), "yyyy-MM-dd");
    
    try {
      switch (args.operation) {
        case "getProjectInfo": {
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
          
          return JSON.stringify({
            success: true,
            data: info
          });
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
          
          const currentModule: CurrentModule = {
            id: activeModule.id,
            name: activeModule.name,
            status: activeModule.status,
            startedAt: activeModule.started_at,
            totalHours: parseFloat(activeModule.total_hours) || 0
          };
          
          return JSON.stringify({
            success: true,
            data: { currentModule }
          });
        }
        
        case "getRecentSessions": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const userSessions = sessions
            .filter(s => s.user_id === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, args.limit || 3);
          
          const recentSessions: RecentSession[] = userSessions.map(s => ({
            id: s.id,
            date: s.date,
            duration: parseInt(s.duration_min) || 0,
            focusScore: parseInt(s.focus_score) || 0,
            notes: s.notes
          }));
          
          return JSON.stringify({
            success: true,
            data: { recentSessions, count: recentSessions.length }
          });
        }
        
        case "getWeekContext": {
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
          const weekFiles = await glob("week-*.md", { cwd: modulePath });
          
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
          
          return JSON.stringify({
            success: true,
            data: { weekContext }
          });
        }
        
        case "getSRSPending": {
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
          
          return JSON.stringify({
            success: true,
            data: { srsPending }
          });
        }
        
        case "getFullContext": {
          const [projectInfo, currentModuleResult, recentSessionsResult, weekContextResult, srsPendingResult] = await Promise.all([
            (async () => {
              let version = "unknown";
              try {
                version = await readFile(join(projectRoot, "VERSION"), "utf-8");
                version = version.trim();
              } catch {}
              return {
                root: projectRoot,
                version,
                today,
                userId
              };
            })(),
            
            (async () => {
              const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
              const activeModule = modules.find(m => 
                m.user_id === userId && m.is_active === "true"
              );
              
              if (!activeModule) return null;
              
              return {
                id: activeModule.id,
                name: activeModule.name,
                status: activeModule.status,
                startedAt: activeModule.started_at,
                totalHours: parseFloat(activeModule.total_hours) || 0
              };
            })(),
            
            (async () => {
              const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
              return sessions
                .filter(s => s.user_id === userId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, args.limit || 3)
                .map(s => ({
                  id: s.id,
                  date: s.date,
                  duration: parseInt(s.duration_min) || 0,
                  focusScore: parseInt(s.focus_score) || 0,
                  notes: s.notes
                }));
            })(),
            
            (async () => {
              const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
              const activeModule = modules.find(m => 
                m.user_id === userId && m.is_active === "true"
              );
              
              if (!activeModule) {
                return { file: null, content: null, weekNumber: null };
              }
              
              const { glob } = await import("glob");
              const modulePath = join(projectRoot, "projects", `${activeModule.id}-${activeModule.name}`, "meta");
              const weekFiles = await glob("week-*.md", { cwd: modulePath });
              
              if (weekFiles.length === 0) {
                return { file: null, content: null, weekNumber: null };
              }
              
              weekFiles.sort();
              const currentWeekFile = weekFiles[0];
              const weekMatch = currentWeekFile.match(/week-(\d+)/);
              
              const result: WeekContext = {
                file: currentWeekFile,
                weekNumber: weekMatch ? parseInt(weekMatch[1]) : null,
                content: null
              };
              
              if (args.includeContent) {
                try {
                  result.content = await readFile(join(modulePath, currentWeekFile), "utf-8");
                } catch {}
              }
              
              return result;
            })(),
            
            (async () => {
              const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
              const pendingCards = flashcards
                .filter(f => f.user_id === userId && f.next_review <= today)
                .map(f => ({
                  id: f.id,
                  front: f.front,
                  nextReview: f.next_review
                }));
              
              return {
                count: pendingCards.length,
                cards: pendingCards.slice(0, 10)
              };
            })()
          ]);
          
          const fullContext: FullContext = {
            projectInfo,
            currentModule: currentModuleResult,
            recentSessions: recentSessionsResult,
            weekContext: weekContextResult,
            srsPending: srsPendingResult
          };
          
          return JSON.stringify({
            success: true,
            data: fullContext
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

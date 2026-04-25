import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";

import { readCSV, getUserId } from "./utils-csv.js";
import type { Insight, Module, Session } from "./model-types.js";

interface StatusStats {
  streak: number;
  bestStreak: number;
  totalSessions: number;
  lastSession: string | null;
  currentModule: {
    id: string;
    name: string;
  } | null;
  level: string;
  progressBar: string;
  progressPercent: number;
}

interface FormattedStatus {
  text: string;
  stats: StatusStats;
}

function createProgressBar(current: number, target: number): { bar: string; percent: number } {
  const filled = Math.min(Math.round((current / target) * 10), 10);
  const empty = 10 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  const percent = Math.min(Math.round((current / target) * 100), 100);
  
  return { bar, percent };
}

function getLevel(streak: number): { name: string; target: number } {
  if (streak >= 30) {
    return { name: "🌟 MESTRE", target: 30 };
  } else if (streak >= 7) {
    return { name: "🔥 Em chamas", target: 30 };
  } else {
    return { name: "⭐ Iniciando", target: 7 };
  }
}

export default tool({
  description: "Get formatted status display for Ultralearning System (streak, sessions, progress)",
  args: {
    operation: z.enum([
      "getStatus",
      "formatStatus"
    ]).describe("Status operation to perform"),
    
    includeProgressBar: z.boolean().default(true).optional().describe("Include visual progress bar")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    
    try {
      const [insights, modules] = await Promise.all([
        readCSV<Insight>(join(dataDir, "insights.csv")),
        readCSV<Module>(join(dataDir, "modules.csv"))
      ]);
      
      const latestInsights: Record<string, Insight> = {};
      for (const insight of insights.filter(i => i.user_id === userId)) {
        if (!latestInsights[insight.metric] || 
            new Date(insight.date) > new Date(latestInsights[insight.metric].date)) {
          latestInsights[insight.metric] = insight;
        }
      }
      
      const streak = parseInt(latestInsights["streak"]?.value || "0");
      const bestStreak = parseInt(latestInsights["best_streak"]?.value || "0");
      const totalSessions = parseInt(latestInsights["total_sessions"]?.value || "0");
      const lastSession = latestInsights["last_session"]?.value || null;
      
      const currentModule = modules.find(m => 
        m.user_id === userId && m.is_active === "true"
      );
      
      const level = getLevel(streak);
      const { bar: progressBar, percent: progressPercent } = createProgressBar(
        streak, 
        level.target
      );
      
      const stats: StatusStats = {
        streak,
        bestStreak,
        totalSessions,
        lastSession,
        currentModule: currentModule ? {
          id: currentModule.id,
          name: currentModule.name
        } : null,
        level: level.name,
        progressBar,
        progressPercent
      };
      
      switch (args.operation) {
        case "getStatus": {
          return JSON.stringify({
            success: true,
            data: stats
          });
        }
        
        case "formatStatus": {
          const lines: string[] = [
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            "        🎮 STATUS",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            ""
          ];
          
          if (streak >= 30) {
            lines.push(`Streak:      🔥 ${streak} dias`);
            lines.push(`Progresso:   ${progressBar} ${level.name}`);
          } else if (streak >= 7) {
            lines.push(`Streak:      🔥 ${streak} dias`);
            lines.push(`Progresso:   ${progressBar} ${streak}/${level.target} → ${level.name}`);
          } else if (streak >= 1) {
            lines.push(`Streak:      🔥 ${streak} dias`);
            lines.push(`Progresso:   ${progressBar} ${streak}/${level.target} → ${level.name}`);
          } else {
            lines.push(`Streak:      💤 0 dias`);
            lines.push(`Progresso:   ${progressBar} 0/${level.target}`);
          }
          
          lines.push("");
          lines.push(`Recorde:     🏆 ${bestStreak} dias`);
          lines.push(`Sessões:     📚 ${totalSessions} total`);
          
          if (lastSession) {
            lines.push(`Última:      📅 ${lastSession}`);
          }
          
          if (currentModule) {
            lines.push("");
            lines.push(`Módulo:      📦 ${currentModule.id}-${currentModule.name}`);
          }
          
          lines.push("");
          lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          
          const formattedStatus: FormattedStatus = {
            text: lines.join("\n"),
            stats
          };
          
          return JSON.stringify({
            success: true,
            data: formattedStatus
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

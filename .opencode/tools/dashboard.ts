import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { subDays } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache, parseMetadata } from "./utils-csv.js";
import type { Insight, Session } from "./model-types.js";

function formatDashboard(data: any): string {
  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "        📊 DASHBOARD ULTRALEARNING",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "📈 RESUMO GERAL",
    `   🔥 Streak: ${data.summary.streak} dias`,
    `   🏆 Recorde: ${data.summary.bestStreak} dias`,
    `   📚 Total: ${data.summary.totalSessions} sessões`,
    `   ⏱️  Esta semana: ${Math.round(data.summary.weeklyTime / 60 * 10) / 10} horas`,
    ""
  ];
  
  if (data.effectiveness.mostEffective) {
    lines.push("🎯 EFETIVIDADE");
    lines.push(`   Técnica mais efetiva: ${data.effectiveness.mostEffective}`);
    if (data.effectiveness.leastUsed) {
      lines.push(`   Técnica menos usada: ${data.effectiveness.leastUsed}`);
    }
    lines.push("");
  }
  
  if (data.patterns.bestPeriod) {
    lines.push("⏰ PADRÕES");
    lines.push(`   Melhor período: ${data.patterns.bestPeriod}`);
    lines.push(`   Duração ideal: ${data.patterns.idealDuration} minutos`);
    lines.push("");
  }
  
  if (data.weaknesses.count > 0) {
    lines.push(`⚠️  PONTOS FRACOS (${data.weaknesses.count})`);
    for (const w of data.weaknesses.topics.slice(0, 3)) {
      lines.push(`   • ${w.topic} (${Math.round(w.errorRate * 100)}% erro) → ${w.suggestedTechnique}`);
    }
    lines.push("");
  }
  
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("💡 Use /effectiveness, /patterns ou /weakness para detalhes");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  return lines.join("\n");
}

export default tool({
  description: "Comprehensive dashboard showing all learning metrics and insights",
  args: {
    operation: z.enum(["show", "compare"]).describe("Dashboard operation"),
    period: z.enum(["week", "month", "all"]).default("week").describe("Time period"),
    compareWith: z.enum(["previous", "last_month"]).optional().describe("Comparison period")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const cacheKey = getCacheKey("dashboard", args.operation, args.period, args.compareWith || "none");
    
    try {
      switch (args.operation) {
        case "show": {
          const cached = getFromCache<{
            summary: { streak: number; bestStreak: number; totalSessions: number; weeklyTime: number };
            effectiveness: { mostEffective: string; leastUsed: string; topSkills: string[] };
            patterns: { bestPeriod: string; idealDuration: number; fatiguePoint: number };
            weaknesses: { count: number; topics: any[] };
          }>(cacheKey);
          if (cached) {
            return JSON.stringify({
              success: true,
              data: { ...cached, cached: true }
            });
          }
          
          const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          
          const latestInsights: Record<string, string> = {};
          for (const insight of insights.filter(i => i.user_id === userId)) {
            if (!latestInsights[insight.metric] || insight.date > latestInsights[insight.metric]) {
              latestInsights[insight.metric] = insight.value;
            }
          }
          
          const streak = parseInt(latestInsights["streak"] || "0");
          const bestStreak = parseInt(latestInsights["best_streak"] || "0");
          const totalSessions = parseInt(latestInsights["total_sessions"] || "0");
          
          const weekAgo = subDays(new Date(), 7);
          const weeklyTime = sessions
            .filter(s => s.user_id === userId && new Date(s.date) >= weekAgo)
            .reduce((sum, s) => sum + (parseInt(s.duration_min) || 0), 0);
          
          const weaknesses: any[] = [];
          for (const [metric, value] of Object.entries(latestInsights)) {
            if (metric.startsWith("error_rate_")) {
              const rate = parseFloat(value);
              if (rate > 0.3) {
                weaknesses.push({
                  topic: metric.replace("error_rate_", ""),
                  errorRate: rate,
                  suggestedTechnique: "drill"
                });
              }
            }
          }
          
          const periodFocus: Record<string, number[]> = { morning: [], afternoon: [], evening: [] };
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            const focus = parseInt(session.focus_score) || 0;
            if (focus === 0) continue;
            
            const duration = parseInt(session.duration_min) || 0;
            if (duration >= 60) periodFocus.afternoon.push(focus);
            else if (duration <= 30) periodFocus.evening.push(focus);
            else periodFocus.morning.push(focus);
          }
          
          const periodAvgs: Record<string, number> = {};
          for (const [period, focuses] of Object.entries(periodFocus)) {
            if (focuses.length > 0) {
              periodAvgs[period] = focuses.reduce((a, b) => a + b, 0) / focuses.length;
            }
          }
          
          const bestPeriod = Object.entries(periodAvgs)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "morning";
          
          const result = {
            summary: {
              streak,
              bestStreak,
              totalSessions,
              weeklyTime
            },
            effectiveness: {
              mostEffective: "feynman",
              leastUsed: "directness",
              topSkills: ["feynman", "drill", "quiz"]
            },
            patterns: {
              bestPeriod: bestPeriod === "morning" ? "Manhã" : bestPeriod === "afternoon" ? "Tarde" : "Noite",
              idealDuration: 45,
              fatiguePoint: 60
            },
            weaknesses: {
              count: weaknesses.length,
              topics: weaknesses
            },
            formattedText: "",
            period: args.period,
            timestamp: new Date().toISOString()
          };
          
          result.formattedText = formatDashboard(result);
          
          setCache(cacheKey, result);
          
          return JSON.stringify({
            success: true,
            data: { ...result, cached: false }
          });
        }
        
        case "compare": {
          const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          
          const now = new Date();
          const currentStart = subDays(now, args.period === "month" ? 30 : 7);
          const previousStart = subDays(now, args.period === "month" ? 60 : 14);
          
          const currentSessions = sessions.filter(s => 
            s.user_id === userId && new Date(s.date) >= currentStart
          );
          
          const currentTime = currentSessions.reduce((sum, s) => 
            sum + (parseInt(s.duration_min) || 0), 0
          );
          
          const currentFocus = currentSessions
            .filter(s => parseInt(s.focus_score) > 0)
            .reduce((sum, s) => sum + parseInt(s.focus_score), 0) / 
            currentSessions.filter(s => parseInt(s.focus_score) > 0).length || 0;
          
          const previousSessions = sessions.filter(s => 
            s.user_id === userId && 
            new Date(s.date) >= previousStart && 
            new Date(s.date) < currentStart
          );
          
          const previousTime = previousSessions.reduce((sum, s) => 
            sum + (parseInt(s.duration_min) || 0), 0
          );
          
          const previousFocus = previousSessions
            .filter(s => parseInt(s.focus_score) > 0)
            .reduce((sum, s) => sum + parseInt(s.focus_score), 0) / 
            previousSessions.filter(s => parseInt(s.focus_score) > 0).length || 0;
          
          const timeChange = previousTime > 0
            ? Math.round(((currentTime - previousTime) / previousTime) * 100)
            : 0;
          
          const focusChange = previousFocus > 0
            ? Math.round(((currentFocus - previousFocus) / previousFocus) * 100)
            : 0;
          
          const sessionChange = previousSessions.length > 0
            ? Math.round(((currentSessions.length - previousSessions.length) / previousSessions.length) * 100)
            : 0;
          
          const result = {
            currentPeriod: {
              sessions: currentSessions.length,
              time: currentTime,
              avgFocus: Math.round(currentFocus * 10) / 10
            },
            previousPeriod: {
              sessions: previousSessions.length,
              time: previousTime,
              avgFocus: Math.round(previousFocus * 10) / 10
            },
            changes: {
              sessions: sessionChange,
              time: timeChange,
              focus: focusChange
            },
            trend: sessionChange > 0 ? "improving" : sessionChange < 0 ? "declining" : "stable"
          };
          
          return JSON.stringify({
            success: true,
            data: result
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

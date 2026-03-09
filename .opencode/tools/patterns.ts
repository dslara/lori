import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { getDay, subDays, parseISO } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache } from "./utils-csv.js";
import type { Session } from "./model-types.js";

function getPeriodFromDuration(duration: number): "morning" | "afternoon" | "evening" {
  if (duration >= 60) return "afternoon";
  if (duration <= 30) return "evening";
  return "morning";
}

export default tool({
  description: "Analyze study session patterns (best time, ideal duration, fatigue points)",
  args: {
    operation: z.enum([
      "getBestPeriod",
      "getIdealDuration",
      "getFatiguePoint",
      "getBestWeekday",
      "compareWeeks"
    ]).describe("Operation to perform"),
    
    weeks: z.number().min(1).max(12).default(2).describe("Number of weeks to compare"),
    days: z.number().min(7).max(90).default(30).describe("Number of days to analyze")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const cacheKey = getCacheKey("patterns", args.operation, userId, String(args.days));
    
    try {
      switch (args.operation) {
        case "getBestPeriod": {
          const cached = getFromCache<{ bestPeriod: string; stats: any }>(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const periodStats: Record<string, { sum: number; count: number }> = {
            morning: { sum: 0, count: 0 },
            afternoon: { sum: 0, count: 0 },
            evening: { sum: 0, count: 0 }
          };
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            
            const sessionDate = parseISO(session.date);
            if (sessionDate < cutoffDate) continue;
            
            const focus = parseInt(session.focus_score) || 0;
            if (focus === 0) continue;
            
            const duration = parseInt(session.duration_min) || 0;
            const period = getPeriodFromDuration(duration);
            
            periodStats[period].sum += focus;
            periodStats[period].count++;
          }
          
          const stats: Record<string, { avgFocus: number; sessions: number }> = {};
          for (const [period, data] of Object.entries(periodStats)) {
            if (data.count > 0) {
              stats[period] = {
                avgFocus: Math.round((data.sum / data.count) * 10) / 10,
                sessions: data.count
              };
            }
          }
          
          let bestPeriod = "morning";
          let bestFocus = 0;
          
          for (const [period, data] of Object.entries(stats)) {
            if (data.avgFocus > bestFocus) {
              bestFocus = data.avgFocus;
              bestPeriod = period;
            }
          }
          
          const periodNames: Record<string, string> = {
            morning: "Manhã (6-12h)",
            afternoon: "Tarde (12-18h)",
            evening: "Noite (18-24h)"
          };
          
          const morningFocus = stats.morning?.avgFocus || 0;
          const bestFocusValue = stats[bestPeriod]?.avgFocus || 0;
          const improvement = morningFocus > 0
            ? Math.round(((bestFocusValue - morningFocus) / morningFocus) * 100)
            : 0;
          
          const result = {
            bestPeriod,
            bestPeriodName: periodNames[bestPeriod],
            stats,
            recommendation: improvement > 0 
              ? `Você rende ${improvement}% mais na ${periodNames[bestPeriod].split(" ")[0].toLowerCase()}`
              : "Seu foco é consistente em todos os períodos"
          };
          
          setCache(cacheKey, result);
          return JSON.stringify({ success: true, data: result, cached: false });
        }
        
        case "getIdealDuration": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const durationBuckets: Record<string, { totalFocus: number; count: number }> = {
            "30": { totalFocus: 0, count: 0 },
            "45": { totalFocus: 0, count: 0 },
            "60": { totalFocus: 0, count: 0 },
            "90": { totalFocus: 0, count: 0 },
            "120": { totalFocus: 0, count: 0 }
          };
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            
            const sessionDate = parseISO(session.date);
            if (sessionDate < cutoffDate) continue;
            
            const duration = parseInt(session.duration_min) || 0;
            const focus = parseInt(session.focus_score) || 0;
            
            if (focus === 0) continue;
            
            let bucket = "60";
            if (duration <= 37) bucket = "30";
            else if (duration <= 52) bucket = "45";
            else if (duration <= 75) bucket = "60";
            else if (duration <= 105) bucket = "90";
            else bucket = "120";
            
            durationBuckets[bucket].totalFocus += focus;
            durationBuckets[bucket].count++;
          }
          
          const bucketAvgs: Record<string, { avgFocus: number; count: number }> = {};
          for (const [bucket, data] of Object.entries(durationBuckets)) {
            if (data.count >= 3) {
              bucketAvgs[bucket] = {
                avgFocus: Math.round((data.totalFocus / data.count) * 10) / 10,
                count: data.count
              };
            }
          }
          
          let idealDuration = 60;
          let bestFocus = 0;
          
          for (const [bucket, data] of Object.entries(bucketAvgs)) {
            if (data.avgFocus > bestFocus) {
              bestFocus = data.avgFocus;
              idealDuration = parseInt(bucket);
            }
          }
          
          return JSON.stringify({
            success: true,
            data: {
              idealDuration,
              avgFocusAtIdeal: bestFocus,
              durationStats: bucketAvgs,
              recommendation: `Sessões de ${idealDuration} minutos têm melhor foco médio (${bestFocus}/10)`
            }
          });
        }
        
        case "getFatiguePoint": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const userSessions = sessions
            .filter(s => s.user_id === userId && parseISO(s.date) >= cutoffDate)
            .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
          
          let fatigueDuration = 90;
          let maxDrop = 0;
          
          for (let i = 1; i < userSessions.length; i++) {
            const prevFocus = parseInt(userSessions[i - 1].focus_score) || 0;
            const currFocus = parseInt(userSessions[i].focus_score) || 0;
            const prevDuration = parseInt(userSessions[i - 1].duration_min) || 0;
            
            if (prevFocus > 0 && currFocus > 0) {
              const drop = prevFocus - currFocus;
              if (drop > maxDrop && drop >= 2) {
                maxDrop = drop;
                fatigueDuration = prevDuration;
              }
            }
          }
          
          return JSON.stringify({
            success: true,
            data: {
              fatigueDuration,
              focusDrop: maxDrop,
              recommendation: maxDrop > 0
                ? `Seu foco cai após ${fatigueDuration} minutos. Considere pausas neste ponto.`
                : "Seu foco se mantém estável nas sessões"
            }
          });
        }
        
        case "getBestWeekday": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
          const weekdayStats: Record<string, { totalFocus: number; count: number }> = {};
          
          for (const day of dayNames) {
            weekdayStats[day] = { totalFocus: 0, count: 0 };
          }
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            
            const sessionDate = parseISO(session.date);
            if (sessionDate < cutoffDate) continue;
            
            const focus = parseInt(session.focus_score) || 0;
            if (focus === 0) continue;
            
            const dayIndex = getDay(sessionDate);
            const dayName = dayNames[dayIndex];
            
            weekdayStats[dayName].totalFocus += focus;
            weekdayStats[dayName].count++;
          }
          
          const dayAvgs: Record<string, { avgFocus: number; sessions: number }> = {};
          for (const [day, data] of Object.entries(weekdayStats)) {
            if (data.count >= 3) {
              dayAvgs[day] = {
                avgFocus: Math.round((data.totalFocus / data.count) * 10) / 10,
                sessions: data.count
              };
            }
          }
          
          let bestDay = "Seg";
          let bestFocus = 0;
          
          for (const [day, data] of Object.entries(dayAvgs)) {
            if (data.avgFocus > bestFocus) {
              bestFocus = data.avgFocus;
              bestDay = day;
            }
          }
          
          return JSON.stringify({
            success: true,
            data: {
              bestDay,
              avgFocusOnBestDay: bestFocus,
              weekdayStats: dayAvgs,
              recommendation: `${bestDay} é seu melhor dia para estudar (foco médio: ${bestFocus}/10)`
            }
          });
        }
        
        case "compareWeeks": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          
          const now = new Date();
          const currentWeekStart = subDays(now, 7);
          const previousWeekStart = subDays(now, 14);
          
          let currentWeek = { sessions: 0, totalTime: 0, avgFocus: 0, focusSum: 0 };
          let previousWeek = { sessions: 0, totalTime: 0, avgFocus: 0, focusSum: 0 };
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            
            const sessionDate = parseISO(session.date);
            const duration = parseInt(session.duration_min) || 0;
            const focus = parseInt(session.focus_score) || 0;
            
            if (sessionDate >= currentWeekStart) {
              currentWeek.sessions++;
              currentWeek.totalTime += duration;
              if (focus > 0) {
                currentWeek.focusSum += focus;
              }
            } else if (sessionDate >= previousWeekStart && sessionDate < currentWeekStart) {
              previousWeek.sessions++;
              previousWeek.totalTime += duration;
              if (focus > 0) {
                previousWeek.focusSum += focus;
              }
            }
          }
          
          if (currentWeek.sessions > 0) {
            currentWeek.avgFocus = Math.round((currentWeek.focusSum / currentWeek.sessions) * 10) / 10;
          }
          if (previousWeek.sessions > 0) {
            previousWeek.avgFocus = Math.round((previousWeek.focusSum / previousWeek.sessions) * 10) / 10;
          }
          
          const sessionChange = previousWeek.sessions > 0
            ? Math.round(((currentWeek.sessions - previousWeek.sessions) / previousWeek.sessions) * 100)
            : 0;
          
          const timeChange = previousWeek.totalTime > 0
            ? Math.round(((currentWeek.totalTime - previousWeek.totalTime) / previousWeek.totalTime) * 100)
            : 0;
          
          const focusChange = previousWeek.avgFocus > 0
            ? Math.round(((currentWeek.avgFocus - previousWeek.avgFocus) / previousWeek.avgFocus) * 100)
            : 0;
          
          return JSON.stringify({
            success: true,
            data: {
              currentWeek,
              previousWeek,
              changes: {
                sessions: sessionChange,
                time: timeChange,
                focus: focusChange
              },
              trend: sessionChange > 0 ? "up" : sessionChange < 0 ? "down" : "stable"
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

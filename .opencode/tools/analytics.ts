import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { format, subDays, getDay } from "date-fns";

import { readCSV, getUserId, parseMetadata } from "./utils-csv.js";
import type { Session, SessionSkill, Insight, Review, Interaction } from "./model-types.js";

interface AnalyticsReport {
  general: {
    streak: number;
    bestStreak: number;
    totalSessions: number;
  };
  module?: {
    id: string;
    totalTime: number;
    avgFocus: number;
    sessionCount: number;
  };
  srs: {
    reviewedToday: number;
    pending: number;
  };
  skills: {
    mostUsed: string | null;
    count: number;
    distribution: Record<string, number>;
  };
  errors: Array<{
    topic: string;
    errorRate: number;
    total: number;
    correct: number;
  }>;
  weekdayDistribution: Record<string, number>;
  recommendations: {
    difficultyLevel: "easy" | "medium" | "hard";
    suggestedActivity: string;
  };
}

export default tool({
  description: "Calculate analytics and metrics for Ultralearning System",
  args: {
    operation: z.enum([
      "getTotalTime",
      "getAvgFocus",
      "getSessionsByWeekday",
      "getMostUsedSkill",
      "getErrorRateByTopic",
      "getFlashcardsReviewed",
      "generateReport",
      "getDifficultyLevel"
    ]).describe("Analytics operation to perform"),
    
    moduleId: z.string().optional().describe("Module ID to filter by"),
    date: z.string().optional().describe("Specific date (YYYY-MM-DD)"),
    topic: z.string().optional().describe("Specific topic for error rate")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const today = format(new Date(), "yyyy-MM-dd");
    
    try {
      switch (args.operation) {
        case "getTotalTime": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          let total = 0;
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            if (args.moduleId && session.module_id !== args.moduleId) continue;
            
            const duration = parseInt(session.duration_min) || 0;
            total += duration;
          }
          
          return JSON.stringify({
            success: true,
            data: { totalTime: total, unit: "minutes" }
          });
        }
        
        case "getAvgFocus": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          let sum = 0;
          let count = 0;
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            if (args.moduleId && session.module_id !== args.moduleId) continue;
            
            const focus = parseInt(session.focus_score);
            if (!isNaN(focus) && focus > 0) {
              sum += focus;
              count++;
            }
          }
          
          const avgFocus = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
          
          return JSON.stringify({
            success: true,
            data: { avgFocus, count }
          });
        }
        
        case "getSessionsByWeekday": {
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const distribution: Record<string, number> = {
            Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
          };
          
          for (const session of sessions) {
            if (session.user_id !== userId) continue;
            
            try {
              const date = new Date(session.date);
              const day = getDay(date);
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              distribution[days[day]]++;
            } catch {}
          }
          
          return JSON.stringify({
            success: true,
            data: { distribution }
          });
        }
        
        case "getMostUsedSkill": {
          const skills = await readCSV<SessionSkill>(join(dataDir, "session_skills.csv"));
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          const userSessionIds = new Set(
            sessions.filter(s => s.user_id === userId).map(s => s.id)
          );
          
          const skillCount: Record<string, number> = {};
          
          for (const skill of skills) {
            if (!userSessionIds.has(skill.session_id)) continue;
            
            const skillName = skill.skill?.toLowerCase().trim();
            if (skillName) {
              skillCount[skillName] = (skillCount[skillName] || 0) + 1;
            }
          }
          
          let mostUsed: string | null = null;
          let maxCount = 0;
          
          for (const [skill, count] of Object.entries(skillCount)) {
            if (count > maxCount) {
              mostUsed = skill;
              maxCount = count;
            }
          }
          
          return JSON.stringify({
            success: true,
            data: { mostUsed, count: maxCount, distribution: skillCount }
          });
        }
        
        case "getErrorRateByTopic": {
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const topicStats: Record<string, { correct: number; total: number }> = {};
          
          for (const interaction of interactions) {
            const metadata = parseMetadata(interaction.metadata);
            
            if (metadata.correct === undefined) continue;
            
            const topic = interaction.topic?.trim();
            if (!topic) continue;
            
            if (!topicStats[topic]) {
              topicStats[topic] = { correct: 0, total: 0 };
            }
            
            topicStats[topic].total++;
            if (metadata.correct) {
              topicStats[topic].correct++;
            }
          }
          
          const errorRates = Object.entries(topicStats).map(([topic, stats]) => ({
            topic,
            errorRate: stats.total > 0 ? Math.round(((stats.total - stats.correct) / stats.total) * 100) / 100 : 0,
            total: stats.total,
            correct: stats.correct
          }));
          
          const filtered = args.topic 
            ? errorRates.filter(e => e.topic.toLowerCase().includes(args.topic!.toLowerCase()))
            : errorRates;
          
          return JSON.stringify({
            success: true,
            data: { errorRates: filtered }
          });
        }
        
        case "getFlashcardsReviewed": {
          const targetDate = args.date || today;
          const reviews = await readCSV<Review>(join(dataDir, "reviews.csv"));
          
          let count = 0;
          for (const review of reviews) {
            if (review.reviewed_at?.includes(targetDate)) {
              count++;
            }
          }
          
          return JSON.stringify({
            success: true,
            data: { reviewed: count, date: targetDate }
          });
        }
        
        case "getDifficultyLevel": {
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          
          const sevenDaysAgo = subDays(new Date(), 7);
          let totalCorrect = 0;
          let totalQuestions = 0;
          
          for (const interaction of interactions) {
            try {
              const date = new Date(interaction.timestamp);
              if (date < sevenDaysAgo) continue;
              
              const metadata = parseMetadata(interaction.metadata);
              
              if (metadata.correct === undefined) continue;
              
              totalQuestions++;
              if (metadata.correct) {
                totalCorrect++;
              }
            } catch {
              continue;
            }
          }
          
          let difficultyLevel: "easy" | "medium" | "hard" = "medium";
          
          if (totalQuestions < 5) {
            difficultyLevel = "medium";
          } else {
            const errorRate = (totalQuestions - totalCorrect) / totalQuestions;
            
            if (errorRate < 0.2) {
              difficultyLevel = "easy";
            } else if (errorRate > 0.4) {
              difficultyLevel = "hard";
            } else {
              difficultyLevel = "medium";
            }
          }
          
          return JSON.stringify({
            success: true,
            data: { 
              difficultyLevel,
              errorRate: totalQuestions > 0 ? Math.round(((totalQuestions - totalCorrect) / totalQuestions) * 100) / 100 : null,
              sampleSize: totalQuestions
            }
          });
        }
        
        case "generateReport": {
          const [
            sessions,
            insights,
            reviews,
            sessionSkills,
            interactions
          ] = await Promise.all([
            readCSV<Session>(join(dataDir, "sessions.csv")),
            readCSV<Insight>(join(dataDir, "insights.csv")),
            readCSV<Review>(join(dataDir, "reviews.csv")),
            readCSV<SessionSkill>(join(dataDir, "session_skills.csv")),
            readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"))
          ]);
          
          const latestInsights: Record<string, Insight> = {};
          for (const insight of insights.filter(i => i.user_id === userId)) {
            if (!latestInsights[insight.metric] || 
                new Date(insight.date) > new Date(latestInsights[insight.metric].date)) {
              latestInsights[insight.metric] = insight;
            }
          }
          
          const general = {
            streak: parseInt(latestInsights["streak"]?.value || "0"),
            bestStreak: parseInt(latestInsights["best_streak"]?.value || "0"),
            totalSessions: parseInt(latestInsights["total_sessions"]?.value || "0")
          };
          
          let moduleMetrics = undefined;
          if (args.moduleId) {
            const moduleSessions = sessions.filter(s => 
              s.user_id === userId && s.module_id === args.moduleId
            );
            
            const totalTime = moduleSessions.reduce((sum, s) => 
              sum + (parseInt(s.duration_min) || 0), 0
            );
            
            const focusScores = moduleSessions
              .map(s => parseInt(s.focus_score))
              .filter(f => !isNaN(f) && f > 0);
            
            const avgFocus = focusScores.length > 0 
              ? Math.round((focusScores.reduce((a, b) => a + b, 0) / focusScores.length) * 10) / 10
              : 0;
            
            moduleMetrics = {
              id: args.moduleId,
              totalTime,
              avgFocus,
              sessionCount: moduleSessions.length
            };
          }
          
          const todayReviews = reviews.filter(r => r.reviewed_at?.includes(today)).length;
          const pending = 0;
          
          const srs = {
            reviewedToday: todayReviews,
            pending
          };
          
          const userSessionIds = new Set(
            sessions.filter(s => s.user_id === userId).map(s => s.id)
          );
          
          const skillCount: Record<string, number> = {};
          for (const skill of sessionSkills) {
            if (!userSessionIds.has(skill.session_id)) continue;
            const skillName = skill.skill?.toLowerCase().trim();
            if (skillName) {
              skillCount[skillName] = (skillCount[skillName] || 0) + 1;
            }
          }
          
          let mostUsed: string | null = null;
          let maxCount = 0;
          for (const [skill, count] of Object.entries(skillCount)) {
            if (count > maxCount) {
              mostUsed = skill;
              maxCount = count;
            }
          }
          
          const skills = {
            mostUsed,
            count: maxCount,
            distribution: skillCount
          };
          
          const topicStats: Record<string, { correct: number; total: number }> = {};
          for (const interaction of interactions) {
            const metadata = parseMetadata(interaction.metadata);
            
            if (metadata.correct === undefined) continue;
            
            const topic = interaction.topic?.trim();
            if (!topic) continue;
            
            if (!topicStats[topic]) {
              topicStats[topic] = { correct: 0, total: 0 };
            }
            
            topicStats[topic].total++;
            if (metadata.correct) {
              topicStats[topic].correct++;
            }
          }
          
          const errors = Object.entries(topicStats).map(([topic, stats]) => ({
            topic,
            errorRate: stats.total > 0 ? Math.round(((stats.total - stats.correct) / stats.total) * 100) / 100 : 0,
            total: stats.total,
            correct: stats.correct
          })).filter(e => e.total >= 3);
          
          const weekdayDistribution: Record<string, number> = {
            Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
          };
          
          for (const session of sessions.filter(s => s.user_id === userId)) {
            try {
              const date = new Date(session.date);
              const day = getDay(date);
              const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              weekdayDistribution[days[day]]++;
            } catch {}
          }
          
          const difficultyLevel: "easy" | "medium" | "hard" = errors.length > 0 && errors[0].errorRate > 0.4 
            ? "hard" 
            : errors.length > 0 && errors[0].errorRate < 0.2 
              ? "easy" 
              : "medium";
          
          const recommendations = {
            difficultyLevel,
            suggestedActivity: errors.length > 0 && errors[0].errorRate > 0.4 
              ? "drill" 
              : skills.mostUsed || "quiz"
          };
          
          const report: AnalyticsReport = {
            general,
            module: moduleMetrics,
            srs,
            skills,
            errors,
            weekdayDistribution,
            recommendations
          };
          
          return JSON.stringify({
            success: true,
            data: report
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

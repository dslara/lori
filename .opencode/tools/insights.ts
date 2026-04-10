import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { format, subDays, getDay, parseISO } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache } from "../shared/utils-csv.js";
import type { Session, SessionSkill, Insight, Review, Flashcard } from "../shared/model-types.js";

// ============================================================================
// TYPES
// ============================================================================

interface InsightsReport {
  summary: {
    streak: number;
    bestStreak: number;
    totalSessions: number;
    weeklyTime: number;
    totalTime: number;
    avgFocus: number;
  };
  effectiveness: {
    mostEffective: string | null;
    leastUsed: string | null;
    topSkills: Array<{ skill: string; successRate: number; count: number }>;
    retention: Record<string, { avgEasiness: number; count: number }>;
  };
  patterns: {
    bestDuration: { name: string; avgFocus: number };
    bestWeekday: { name: string; avgFocus: number };
    idealDuration: number;
    fatiguePoint: number;
    weekdayDistribution: Record<string, number>;
  };
  weaknesses: Array<{
    topic: string;
    errorRate: number;
    attempts: number;
    suggestedTechnique: string;
  }>;
  srs: {
    reviewedToday: number;
    pending: number;
  };
  recommendations: {
    difficultyLevel: "easy" | "medium" | "hard";
    suggestedActivity: string;
    focusAreas: string[];
  };
}

// ============================================================================
// CACHE & DATA LOADING
// ============================================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData: {
  timestamp: number;
  sessions: Session[];
  insights: Insight[];
  reviews: Review[];
  flashcards: Flashcard[];
  sessionSkills: SessionSkill[];
} | null = null;

async function loadAllData(dataDir: string, userId: string): Promise<typeof cachedData> {
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
    return cachedData;
  }
  
  const [sessions, insights, reviews, flashcards, sessionSkills] = await Promise.all([
    readCSV<Session>(join(dataDir, "sessions.csv")),
    readCSV<Insight>(join(dataDir, "insights.csv")),
    readCSV<Review>(join(dataDir, "reviews.csv")),
    readCSV<Flashcard>(join(dataDir, "flashcards.csv")),
    readCSV<SessionSkill>(join(dataDir, "session_skills.csv"))
  ]);
  
  cachedData = {
    timestamp: now,
    sessions: sessions.filter(s => s.user_id === userId),
    insights: insights.filter(i => i.user_id === userId),
    reviews,
    flashcards: flashcards.filter(f => f.user_id === userId),
    sessionSkills
  };
  
  return cachedData;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function suggestTechnique(topic: string): string {
  const topicLower = topic.toLowerCase();
  const techniqueMap: Record<string, string> = {
    recursão: "feynman", recursion: "feynman",
    "big o": "drill", complexity: "drill",
    algoritmo: "drill", algorithm: "drill",
    estrutura: "directness", structure: "directness",
    memória: "explain", memory: "explain",
    símbolo: "quiz", symbol: "quiz", notation: "quiz"
  };
  
  for (const [key, technique] of Object.entries(techniqueMap)) {
    if (topicLower.includes(key)) return technique;
  }
  return "drill";
}

// Map duration to session type (not time of day - we don't have time data)
function getSessionTypeFromDuration(duration: number): "short" | "medium" | "long" {
  if (duration >= 60) return "long";
  if (duration <= 30) return "short";
  return "medium";
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function analyzeSummary(data: typeof cachedData, days: number = 30) {
  const latestInsights: Record<string, string> = {};
  for (const insight of data!.insights) {
    if (!latestInsights[insight.metric] || insight.date > latestInsights[insight.metric]) {
      latestInsights[insight.metric] = insight.value;
    }
  }
  
  const cutoffDate = subDays(new Date(), days);
  const recentSessions = data!.sessions.filter(s => new Date(s.date) >= cutoffDate);
  
  const focusScores = recentSessions
    .map(s => parseInt(s.focus_score))
    .filter(f => !isNaN(f) && f > 0);
  
  const totalTime = data!.sessions.reduce((sum, s) => sum + (parseInt(s.duration_min) || 0), 0);
  const weeklyTime = recentSessions.reduce((sum, s) => sum + (parseInt(s.duration_min) || 0), 0);
  
  return {
    streak: parseInt(latestInsights["streak"] || "0"),
    bestStreak: parseInt(latestInsights["best_streak"] || "0"),
    totalSessions: parseInt(latestInsights["total_sessions"] || "0"),
    weeklyTime,
    totalTime,
    avgFocus: focusScores.length > 0 
      ? Math.round((focusScores.reduce((a, b) => a + b, 0) / focusScores.length) * 10) / 10 
      : 0
  };
}

function analyzeEffectiveness(data: typeof cachedData, days: number = 30) {
  const cutoffDate = subDays(new Date(), days);
  const userSessionIds = new Set(data!.sessions.map(s => s.id));
  
  // Success rate by skill - derived from session_skills
  const skillStats: Record<string, { correct: number; total: number }> = {};
  for (const skill of data!.sessionSkills) {
    if (!userSessionIds.has(skill.session_id)) continue;
    
    const skillName = skill.skill?.toLowerCase().trim();
    if (!skillName) continue;
    
    const rating = parseInt(skill.success_rating) || 0;
    const correct = rating >= 6;
    
    if (!skillStats[skillName]) skillStats[skillName] = { correct: 0, total: 0 };
    skillStats[skillName].total++;
    if (correct) skillStats[skillName].correct++;
  }
  
  const topSkills = Object.entries(skillStats)
    .filter(([, stats]) => stats.total >= 3)
    .map(([skill, stats]) => ({
      skill,
      successRate: Math.round((stats.correct / stats.total) * 100) / 100,
      count: stats.total
    }))
    .sort((a, b) => b.successRate - a.successRate);
  
  // Retention by category
  const categoryStats: Record<string, { totalEasiness: number; count: number }> = {};
  for (const card of data!.flashcards) {
    const category = card.category?.toLowerCase().trim() || "general";
    const easiness = parseFloat(card.easiness) || 2.5;
    
    if (!categoryStats[category]) categoryStats[category] = { totalEasiness: 0, count: 0 };
    categoryStats[category].totalEasiness += easiness;
    categoryStats[category].count++;
  }
  
  const retention: Record<string, { avgEasiness: number; count: number }> = {};
  for (const [category, stats] of Object.entries(categoryStats)) {
    if (stats.count >= 3) {
      retention[category] = {
        avgEasiness: Math.round((stats.totalEasiness / stats.count) * 100) / 100,
        count: stats.count
      };
    }
  }
  
  // Most and least used
  const skillCount: Record<string, number> = {};
  for (const skill of data!.sessionSkills) {
    if (!userSessionIds.has(skill.session_id)) continue;
    const skillName = skill.skill?.toLowerCase().trim();
    if (skillName) skillCount[skillName] = (skillCount[skillName] || 0) + 1;
  }
  
  const sortedSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]);
  
  return {
    mostEffective: topSkills[0]?.skill || null,
    leastUsed: sortedSkills[sortedSkills.length - 1]?.[0] || null,
    topSkills: topSkills.slice(0, 5),
    retention
  };
}

function analyzePatterns(data: typeof cachedData, days: number = 30) {
  const cutoffDate = subDays(new Date(), days);
  const sessions = data!.sessions.filter(s => new Date(s.date) >= cutoffDate);
  
  // Best session duration (renamed from "period" since we don't have time-of-day data)
  const durationStats: Record<string, { sum: number; count: number }> = {
    short: { sum: 0, count: 0 },    // <= 30 min
    medium: { sum: 0, count: 0 },   // 30-60 min
    long: { sum: 0, count: 0 }      // >= 60 min
  };
  
  for (const session of sessions) {
    const focus = parseInt(session.focus_score) || 0;
    if (focus === 0) continue;
    
    const duration = parseInt(session.duration_min) || 0;
    const sessionType = getSessionTypeFromDuration(duration);
    durationStats[sessionType].sum += focus;
    durationStats[sessionType].count++;
  }
  
  const durationAvgs: Record<string, number> = {};
  for (const [type, data] of Object.entries(durationStats)) {
    if (data.count > 0) durationAvgs[type] = data.sum / data.count;
  }
  
  const bestDuration = Object.entries(durationAvgs).sort((a, b) => b[1] - a[1])[0]?.[0] || "medium";
  const durationNames: Record<string, string> = {
    short: "Sessões curtas (≤30min)",
    medium: "Sessões médias (30-60min)",
    long: "Sessões longas (≥60min)"
  };
  
  // Best weekday
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const weekdayStats: Record<string, { totalFocus: number; count: number }> = {};
  for (const day of dayNames) weekdayStats[day] = { totalFocus: 0, count: 0 };
  
  for (const session of sessions) {
    const focus = parseInt(session.focus_score) || 0;
    if (focus === 0) continue;
    
    const dayIndex = getDay(parseISO(session.date));
    const dayName = dayNames[dayIndex];
    weekdayStats[dayName].totalFocus += focus;
    weekdayStats[dayName].count++;
  }
  
  const dayAvgs: Record<string, number> = {};
  for (const [day, stats] of Object.entries(weekdayStats)) {
    if (stats.count >= 3) dayAvgs[day] = stats.totalFocus / stats.count;
  }
  
  const bestWeekday = Object.entries(dayAvgs).sort((a, b) => b[1] - a[1])[0]?.[0] || "Seg";
  
  // Ideal duration
  const durationBuckets: Record<string, { totalFocus: number; count: number }> = {
    "30": { totalFocus: 0, count: 0 },
    "45": { totalFocus: 0, count: 0 },
    "60": { totalFocus: 0, count: 0 },
    "90": { totalFocus: 0, count: 0 }
  };
  
  for (const session of sessions) {
    const duration = parseInt(session.duration_min) || 0;
    const focus = parseInt(session.focus_score) || 0;
    if (focus === 0) continue;
    
    let bucket = "60";
    if (duration <= 37) bucket = "30";
    else if (duration <= 52) bucket = "45";
    else if (duration <= 75) bucket = "60";
    else bucket = "90";
    
    durationBuckets[bucket].totalFocus += focus;
    durationBuckets[bucket].count++;
  }
  
  let idealDuration = 60;
  let bestFocus = 0;
  for (const [bucket, stats] of Object.entries(durationBuckets)) {
    if (stats.count >= 3) {
      const avg = stats.totalFocus / stats.count;
      if (avg > bestFocus) {
        bestFocus = avg;
        idealDuration = parseInt(bucket);
      }
    }
  }
  
  // Weekday distribution
  const weekdayDistribution: Record<string, number> = {};
  for (const day of dayNames) weekdayDistribution[day] = 0;
  for (const session of data!.sessions) {
    const dayIndex = getDay(parseISO(session.date));
    weekdayDistribution[dayNames[dayIndex]]++;
  }
  
  return {
    bestDuration: { name: durationNames[bestDuration], avgFocus: Math.round(durationAvgs[bestDuration] * 10) / 10 },
    bestWeekday: { name: bestWeekday, avgFocus: Math.round(dayAvgs[bestWeekday] * 10) / 10 },
    idealDuration,
    fatiguePoint: 60, // Simplified calculation
    weekdayDistribution
  };
}

function analyzeWeaknesses(data: typeof cachedData, threshold: number = 0.3, days: number = 7) {
  const cutoffDate = subDays(new Date(), days);
  const userSessionIds = new Set(data!.sessions.map(s => s.id));
  
  // From insights (error_rate_* metrics)
  const errorRates: Record<string, { rate: number; attempts: number }> = {};
  for (const insight of data!.insights) {
    if (!insight.metric.startsWith("error_rate_")) continue;
    
    const topic = insight.metric.replace("error_rate_", "");
    const date = parseISO(insight.date);
    if (date < cutoffDate) continue;
    
    try {
      const rate = parseFloat(insight.value);
      if (rate > threshold) errorRates[topic] = { rate, attempts: 0 };
    } catch { continue; }
  }
  
  // Count attempts from session_skills
  for (const skill of data!.sessionSkills) {
    if (!userSessionIds.has(skill.session_id)) continue;
    
    const topic = skill.topic?.toLowerCase().trim();
    if (!topic || !errorRates[topic]) continue;
    
    errorRates[topic].attempts++;
  }
  
  return Object.entries(errorRates)
    .filter(([, data]) => data.attempts >= 3)
    .map(([topic, data]) => ({
      topic,
      errorRate: Math.round(data.rate * 100) / 100,
      attempts: data.attempts,
      suggestedTechnique: suggestTechnique(topic)
    }))
    .sort((a, b) => b.errorRate - a.errorRate);
}

function analyzeSRS(data: typeof cachedData) {
  const today = format(new Date(), "yyyy-MM-dd");
  const reviewedToday = data!.reviews.filter(r => r.reviewed_at?.includes(today)).length;
  
  // Calculate pending (cards with next_review <= today)
  let pending = 0;
  for (const card of data!.flashcards) {
    if (card.next_review && card.next_review <= today) pending++;
  }
  
  return { reviewedToday, pending };
}

function generateRecommendations(
  summary: ReturnType<typeof analyzeSummary>,
  effectiveness: ReturnType<typeof analyzeEffectiveness>,
  weaknesses: ReturnType<typeof analyzeWeaknesses>
): InsightsReport["recommendations"] {
  let difficultyLevel: "easy" | "medium" | "hard" = "medium";
  
  if (weaknesses.length > 0 && weaknesses[0].errorRate > 0.4) {
    difficultyLevel = "hard";
  } else if (weaknesses.length === 0 || weaknesses[0].errorRate < 0.2) {
    difficultyLevel = "easy";
  }
  
  const suggestedActivity = weaknesses.length > 0 && weaknesses[0].errorRate > 0.4
    ? "drill"
    : effectiveness.mostEffective || "quiz";
  
  const focusAreas = weaknesses.slice(0, 3).map(w => w.topic);
  
  return { difficultyLevel, suggestedActivity, focusAreas };
}

// ============================================================================
// FORMATTING
// ============================================================================

function formatDashboard(data: InsightsReport): string {
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
    `   🎯 Foco médio: ${data.summary.avgFocus}/10`,
    ""
  ];
  
  if (data.effectiveness.mostEffective) {
    lines.push("🎯 EFETIVIDADE");
    lines.push(`   Técnica mais efetiva: ${data.effectiveness.mostEffective}`);
    lines.push(`   Top 3: ${data.effectiveness.topSkills.slice(0, 3).map(s => s.skill).join(", ")}`);
    lines.push("");
  }
  
  if (data.patterns.bestDuration) {
    lines.push("⏰ PADRÕES");
    lines.push(`   Melhor duração: ${data.patterns.bestDuration.name}`);
    lines.push(`   Melhor dia: ${data.patterns.bestWeekday.name}`);
    lines.push(`   Duração ideal: ${data.patterns.idealDuration} minutos`);
    lines.push("");
  }
  
  if (data.weaknesses.length > 0) {
    lines.push(`⚠️  PONTOS FRACOS (${data.weaknesses.length})`);
    for (const w of data.weaknesses.slice(0, 3)) {
      lines.push(`   • ${w.topic} (${Math.round(w.errorRate * 100)}% erro) → ${w.suggestedTechnique}`);
    }
    lines.push("");
  }
  
  lines.push("💡 RECOMENDAÇÕES");
  lines.push(`   Dificuldade: ${data.recommendations.difficultyLevel}`);
  lines.push(`   Sugestão: ${data.recommendations.suggestedActivity}`);
  if (data.recommendations.focusAreas.length > 0) {
    lines.push(`   Foco em: ${data.recommendations.focusAreas.join(", ")}`);
  }
  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("💡 Use /ul-data-analytics para análise detalhada");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  return lines.join("\n");
}

// ============================================================================
// MAIN TOOL
// ============================================================================

export default tool({
  description: "Comprehensive learning insights - analytics, effectiveness, patterns, and weaknesses consolidated",
  args: {
    operation: z.enum([
      "getSummary",
      "getEffectiveness",
      "getPatterns",
      "getWeaknesses",
      "getSRS",
      "getDifficultyLevel",
      "generateReport",
      "showDashboard",
      "comparePeriods"
    ]).describe("Insights operation to perform"),
    
    days: z.number().min(1).max(90).default(30).describe("Number of days to analyze"),
    threshold: z.number().min(0).max(1).default(0.3).describe("Error rate threshold for weaknesses"),
    period: z.enum(["week", "month"]).default("week").describe("Period for comparison")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const cacheKey = getCacheKey("insights", args.operation, userId, String(args.days));
    
    try {
      // Load all data once (with caching)
      const data = await loadAllData(dataDir, userId);
      
      switch (args.operation) {
        case "getSummary": {
          const cached = getFromCache(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const summary = analyzeSummary(data, args.days);
          setCache(cacheKey, summary);
          return JSON.stringify({ success: true, data: summary, cached: false });
        }
        
        case "getEffectiveness": {
          const cached = getFromCache(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const effectiveness = analyzeEffectiveness(data, args.days);
          setCache(cacheKey, effectiveness);
          return JSON.stringify({ success: true, data: effectiveness, cached: false });
        }
        
        case "getPatterns": {
          const cached = getFromCache(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const patterns = analyzePatterns(data, args.days);
          setCache(cacheKey, patterns);
          return JSON.stringify({ success: true, data: patterns, cached: false });
        }
        
        case "getWeaknesses": {
          const cached = getFromCache(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const weaknesses = analyzeWeaknesses(data, args.threshold, args.days);
          setCache(cacheKey, weaknesses);
          return JSON.stringify({ success: true, data: weaknesses, cached: false });
        }
        
        case "getSRS": {
          const srs = analyzeSRS(data);
          return JSON.stringify({ success: true, data: srs });
        }
        
        case "getDifficultyLevel": {
          const userSessionIds = new Set(data!.sessions.map(s => s.id));
          const recentSkills = data!.sessionSkills.filter(s => userSessionIds.has(s.session_id));
          
          let totalCorrect = 0;
          let totalQuestions = 0;
          
          for (const skill of recentSkills) {
            const rating = parseInt(skill.success_rating) || 0;
            if (rating === 0) continue;
            totalQuestions++;
            if (rating >= 6) totalCorrect++;
          }
          
          let difficultyLevel: "easy" | "medium" | "hard" = "medium";
          if (totalQuestions >= 5) {
            const errorRate = (totalQuestions - totalCorrect) / totalQuestions;
            if (errorRate < 0.2) difficultyLevel = "easy";
            else if (errorRate > 0.4) difficultyLevel = "hard";
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
          const cached = getFromCache<InsightsReport>(cacheKey);
          if (cached) return JSON.stringify({ success: true, data: cached, cached: true });
          
          const summary = analyzeSummary(data, args.days);
          const effectiveness = analyzeEffectiveness(data, args.days);
          const patterns = analyzePatterns(data, args.days);
          const weaknesses = analyzeWeaknesses(data, args.threshold, 7);
          const srs = analyzeSRS(data);
          const recommendations = generateRecommendations(summary, effectiveness, weaknesses);
          
          const report: InsightsReport = {
            summary,
            effectiveness,
            patterns,
            weaknesses,
            srs,
            recommendations
          };
          
          setCache(cacheKey, report);
          return JSON.stringify({ success: true, data: report, cached: false });
        }
        
        case "showDashboard": {
          const cached = getFromCache<InsightsReport>(cacheKey);
          let report: InsightsReport;
          
          if (cached) {
            report = cached;
          } else {
            const summary = analyzeSummary(data, args.days);
            const effectiveness = analyzeEffectiveness(data, args.days);
            const patterns = analyzePatterns(data, args.days);
            const weaknesses = analyzeWeaknesses(data, args.threshold, 7);
            const srs = analyzeSRS(data);
            const recommendations = generateRecommendations(summary, effectiveness, weaknesses);
            
            report = { summary, effectiveness, patterns, weaknesses, srs, recommendations };
            setCache(cacheKey, report);
          }
          
          return JSON.stringify({
            success: true,
            data: {
              ...report,
              formattedText: formatDashboard(report),
              timestamp: new Date().toISOString()
            },
            cached: !!cached
          });
        }
        
        case "comparePeriods": {
          const currentDays = args.period === "month" ? 30 : 7;
          const previousDays = currentDays * 2;
          
          const current = analyzeSummary(data, currentDays);
          const previous = analyzeSummary(data, previousDays);
          
          const sessionChange = previous.totalSessions > 0
            ? Math.round(((current.totalSessions - previous.totalSessions) / previous.totalSessions) * 100)
            : 0;
          
          const timeChange = previous.weeklyTime > 0
            ? Math.round(((current.weeklyTime - previous.weeklyTime) / previous.weeklyTime) * 100)
            : 0;
          
          const focusChange = previous.avgFocus > 0
            ? Math.round(((current.avgFocus - previous.avgFocus) / previous.avgFocus) * 100)
            : 0;
          
          return JSON.stringify({
            success: true,
            data: {
              currentPeriod: {
                sessions: current.totalSessions,
                time: current.weeklyTime,
                avgFocus: current.avgFocus
              },
              previousPeriod: {
                sessions: previous.totalSessions,
                time: previous.weeklyTime,
                avgFocus: previous.avgFocus
              },
              changes: {
                sessions: sessionChange,
                time: timeChange,
                focus: focusChange
              },
              trend: sessionChange > 0 ? "improving" : sessionChange < 0 ? "declining" : "stable"
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

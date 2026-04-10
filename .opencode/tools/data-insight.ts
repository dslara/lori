import { format } from "date-fns";
import { join } from "path";
import { readCSV, writeCSV, initCSVDir, getUserId, CSV_HEADERS } from "../shared/utils-csv.js";
import type { Insight } from "../shared/model-types.js";

export async function updateInsight(
  dataDir: string,
  args: {
    metric: string;
    value: string;
    insightModuleId?: string;
  }
): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
  
  const filtered = insights.filter(i => 
    !(i.date === today && i.user_id === userId && i.metric === args.metric)
  );
  
  filtered.push({
    date: today,
    user_id: userId,
    metric: args.metric,
    value: args.value,
    module_id: args.insightModuleId || ""
  });
  
  await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered);
  
  return JSON.stringify({
    success: true,
    data: { metric: args.metric, value: args.value, date: today }
  });
}

export async function getInsight(
  dataDir: string,
  args: { metric: string }
): Promise<string> {
  const userId = getUserId();
  
  const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
  const insight = insights
    .filter(i => i.user_id === userId && i.metric === args.metric)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  return JSON.stringify({
    success: true,
    data: { 
      metric: args.metric, 
      value: insight?.value || null,
      date: insight?.date || null
    }
  });
}

export async function getAllInsights(dataDir: string): Promise<string> {
  const userId = getUserId();
  
  const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
  const userInsights = insights.filter(i => i.user_id === userId);
  
  const latestByMetric: Record<string, Insight> = {};
  for (const insight of userInsights) {
    if (!latestByMetric[insight.metric] || 
        new Date(insight.date) > new Date(latestByMetric[insight.metric].date)) {
      latestByMetric[insight.metric] = insight;
    }
  }
  
  return JSON.stringify({
    success: true,
    data: { insights: latestByMetric }
  });
}

export async function getStreak(dataDir: string): Promise<string> {
  const userId = getUserId();
  
  const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
  const streakInsight = insights
    .filter(i => i.user_id === userId && i.metric === "streak")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const bestStreakInsight = insights
    .filter(i => i.user_id === userId && i.metric === "best_streak")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  return JSON.stringify({
    success: true,
    data: {
      streak: parseInt(streakInsight?.value || "0"),
      bestStreak: parseInt(bestStreakInsight?.value || "0")
    }
  });
}

export async function updateStreak(dataDir: string): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Batch read: read insights once
  const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
  
  // Find latest values for each metric
  const lastSession = insights
    .filter(i => i.user_id === userId && i.metric === "last_session")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const streakInsight = insights
    .filter(i => i.user_id === userId && i.metric === "streak")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const bestStreakInsight = insights
    .filter(i => i.user_id === userId && i.metric === "best_streak")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  const totalSessionsInsight = insights
    .filter(i => i.user_id === userId && i.metric === "total_sessions")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  let streak = parseInt(streakInsight?.value || "0");
  let bestStreak = parseInt(bestStreakInsight?.value || "0");
  const totalSessions = parseInt(totalSessionsInsight?.value || "0") + 1;
  
  if (lastSession?.value === today) {
    return JSON.stringify({
      success: true,
      data: { streak, bestStreak, message: "Session already recorded today", unchanged: true }
    });
  }
  
  if (!lastSession?.value) {
    streak = 1;
  } else {
    const lastDate = new Date(lastSession.value);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }
  
  if (streak > bestStreak) {
    bestStreak = streak;
  }
  
  // Batch write: filter and add all metrics in one operation
  await initCSVDir(dataDir);
  
  const filtered = insights.filter(i => 
    !(i.date === today && i.user_id === userId && 
      ["streak", "best_streak", "last_session", "total_sessions"].includes(i.metric))
  );
  
  filtered.push(
    { date: today, user_id: userId, metric: "streak", value: String(streak), module_id: "" },
    { date: today, user_id: userId, metric: "best_streak", value: String(bestStreak), module_id: "" },
    { date: today, user_id: userId, metric: "last_session", value: today, module_id: "" },
    { date: today, user_id: userId, metric: "total_sessions", value: String(totalSessions), module_id: "" }
  );
  
  // Single write operation
  await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered);
  
  return JSON.stringify({
    success: true,
    data: { streak, bestStreak, totalSessions, isNewRecord: streak === bestStreak }
  });
}
import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { format } from "date-fns";
import { join } from "path";

import { readCSV, writeCSV, initCSVDir, getUserId, CSV_HEADERS, logTutorInteraction } from "./utils-csv.js";
import type { Session, Insight, Flashcard, Review, Interaction } from "./model-types.js";

function getDataDir(context: any): string {
  return join(context.worktree || context.directory, "data");
}

export default tool({
  description: "CRUD operations for Ultralearning System data (CSV files)",
  args: {
    operation: z.enum([
      "init",
      "createSession",
      "getSessions",
      "updateInsight",
      "getInsight",
      "getAllInsights",
      "getStreak",
      "updateStreak",
      "createFlashcard",
      "getFlashcards",
      "createReview",
      "createInteraction",
      "resetAll"
    ]).describe("Operation to perform"),
    
    moduleId: z.string().optional().describe("Module ID (e.g., M1, M2)"),
    duration: z.number().min(0).optional().describe("Session duration in minutes"),
    focusScore: z.number().min(1).max(10).optional().describe("Focus score (1-10)"),
    notes: z.string().max(200).optional().describe("Session notes"),
    
    filterModuleId: z.string().optional().describe("Filter sessions by module"),
    limit: z.number().min(1).max(100).optional().describe("Limit number of results"),
    
    metric: z.string().optional().describe("Metric name (e.g., streak, best_streak)"),
    value: z.string().optional().describe("Metric value"),
    insightModuleId: z.string().optional().describe("Module ID for insight"),
    
    front: z.string().optional().describe("Flashcard front text"),
    back: z.string().optional().describe("Flashcard back text"),
    category: z.string().optional().describe("Flashcard category"),
    tags: z.array(z.string()).optional().describe("Flashcard tags"),
    
    flashcardId: z.string().optional().describe("Flashcard ID"),
    quality: z.number().min(0).max(5).optional().describe("Review quality (0-5, SM-2)"),
    
    sessionId: z.string().optional().describe("Session ID"),
    skill: z.string().optional().describe("Skill used (e.g., drill, quiz)"),
    topic: z.string().optional().describe("Topic of interaction"),
    userMessage: z.string().optional().describe("User message/question"),
    userResponse: z.string().optional().describe("User response/answer"),
    tutorResponse: z.string().optional().describe("Tutor response"),
    metadata: z.object({}).passthrough().optional().describe("Additional metadata (JSON)")
  },
  
  async execute(args, context) {
    const dataDir = getDataDir(context);
    const userId = getUserId();
    const today = format(new Date(), "yyyy-MM-dd");
    
    try {
      switch (args.operation) {
        case "init": {
          await initCSVDir(dataDir);
          return JSON.stringify({
            success: true,
            data: { message: "Data structure initialized", dataDir }
          });
        }
        
        case "createSession": {
          if (!args.moduleId) {
            return JSON.stringify({ success: false, error: "MODULE_ID_REQUIRED", message: "moduleId is required" });
          }
          
          const sessionId = `${today}-${format(new Date(), "HHmmss")}`;
          const session: Session = {
            id: sessionId,
            user_id: userId,
            module_id: args.moduleId,
            date: today,
            duration_min: String(args.duration || 0),
            focus_score: String(args.focusScore || 0),
            notes: (args.notes || "").substring(0, 200)
          };
          
          const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          sessions.push(session);
          await writeCSV(join(dataDir, "sessions.csv"), CSV_HEADERS.sessions, sessions);
          
          // Log automático da interação
          await logTutorInteraction(
            dataDir,
            sessionId,
            "session",
            args.moduleId,
            "createSession",
            "",
            `Session created: ${args.duration}min, focus ${args.focusScore}/10`,
            { operation: "createSession", moduleId: args.moduleId }
          );
          
          return JSON.stringify({
            success: true,
            data: { sessionId, timestamp: new Date().toISOString() }
          });
        }
        
        case "getSessions": {
          let sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
          sessions = sessions.filter(s => s.user_id === userId);
          
          if (args.filterModuleId) {
            sessions = sessions.filter(s => s.module_id === args.filterModuleId);
          }
          
          sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          if (args.limit) {
            sessions = sessions.slice(0, args.limit);
          }
          
          return JSON.stringify({
            success: true,
            data: { sessions, count: sessions.length }
          });
        }
        
        case "updateInsight": {
          if (!args.metric || args.value === undefined) {
            return JSON.stringify({ success: false, error: "METRIC_REQUIRED", message: "metric and value are required" });
          }
          
          const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          
          const filtered = insights.filter(i => 
            !(i.date === today && i.user_id === userId && i.metric === args.metric)
          );
          
          filtered.push({
            date: today,
            user_id: userId,
            metric: args.metric,
            value: args.value!,
            module_id: args.insightModuleId || ""
          });
          
          await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered);
          
          return JSON.stringify({
            success: true,
            data: { metric: args.metric, value: args.value, date: today }
          });
        }
        
        case "getInsight": {
          if (!args.metric) {
            return JSON.stringify({ success: false, error: "METRIC_REQUIRED", message: "metric is required" });
          }
          
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
        
        case "getAllInsights": {
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
        
        case "getStreak": {
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
        
        case "updateStreak": {
          const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          
          const lastSession = insights
            .filter(i => i.user_id === userId && i.metric === "last_session")
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const streakInsight = insights
            .filter(i => i.user_id === userId && i.metric === "streak")
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const bestStreakInsight = insights
            .filter(i => i.user_id === userId && i.metric === "best_streak")
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          let streak = parseInt(streakInsight?.value || "0");
          let bestStreak = parseInt(bestStreakInsight?.value || "0");
          
          if (lastSession?.value === today) {
            return JSON.stringify({
              success: true,
              data: { streak, message: "Session already recorded today", unchanged: true }
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
          
          await initCSVDir(dataDir);
          
          const allInsights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          
          const filtered = allInsights.filter(i => 
            !(i.date === today && i.user_id === userId && i.metric === "streak")
          );
          filtered.push({ date: today, user_id: userId, metric: "streak", value: String(streak), module_id: "" });
          await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered);
          
          const filtered2 = filtered.filter(i => 
            !(i.date === today && i.user_id === userId && i.metric === "best_streak")
          );
          filtered2.push({ date: today, user_id: userId, metric: "best_streak", value: String(bestStreak), module_id: "" });
          await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered2);
          
          const filtered3 = filtered2.filter(i => 
            !(i.date === today && i.user_id === userId && i.metric === "last_session")
          );
          filtered3.push({ date: today, user_id: userId, metric: "last_session", value: today, module_id: "" });
          await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered3);
          
          const totalSessionsInsight = insights
            .filter(i => i.user_id === userId && i.metric === "total_sessions")
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const totalSessions = parseInt(totalSessionsInsight?.value || "0") + 1;
          
          const filtered4 = filtered3.filter(i => 
            !(i.date === today && i.user_id === userId && i.metric === "total_sessions")
          );
          filtered4.push({ date: today, user_id: userId, metric: "total_sessions", value: String(totalSessions), module_id: "" });
          await writeCSV(join(dataDir, "insights.csv"), CSV_HEADERS.insights, filtered4);
          
          return JSON.stringify({
            success: true,
            data: { streak, bestStreak, totalSessions, isNewRecord: streak === bestStreak }
          });
        }
        
        case "createFlashcard": {
          if (!args.front || !args.back) {
            return JSON.stringify({ success: false, error: "FLASHCARD_CONTENT_REQUIRED", message: "front and back are required" });
          }
          
          const flashcardId = `F${Date.now()}`;
          const flashcard: Flashcard = {
            id: flashcardId,
            user_id: userId,
            module_id: args.moduleId || "",
            front: args.front,
            back: args.back,
            category: args.category || "general",
            created_at: today,
            tags: (args.tags || []).join(","),
            next_review: today,
            interval: "1",
            easiness: "2.5",
            reviews: "0"
          };
          
          const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
          flashcards.push(flashcard);
          await writeCSV(join(dataDir, "flashcards.csv"), CSV_HEADERS.flashcards, flashcards);
          
          // Log automático da interação
          await logTutorInteraction(
            dataDir,
            "system",
            "srs-generator",
            args.category || "general",
            "createFlashcard",
            args.front,
            "Flashcard created",
            { flashcardId, category: args.category }
          );
          
          return JSON.stringify({
            success: true,
            data: { flashcardId, front: args.front }
          });
        }
        
        case "getFlashcards": {
          let flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
          flashcards = flashcards.filter(f => f.user_id === userId);
          
          const pending = flashcards.filter(f => f.next_review <= today);
          
          return JSON.stringify({
            success: true,
            data: { 
              flashcards: pending,
              count: pending.length,
              total: flashcards.length
            }
          });
        }
        
        case "createReview": {
          if (!args.flashcardId || args.quality === undefined) {
            return JSON.stringify({ success: false, error: "REVIEW_DATA_REQUIRED", message: "flashcardId and quality are required" });
          }
          
          const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
          const flashcard = flashcards.find(f => f.id === args.flashcardId);
          
          if (!flashcard) {
            return JSON.stringify({ success: false, error: "FLASHCARD_NOT_FOUND", message: `Flashcard ${args.flashcardId} not found` });
          }
          
          let interval = parseFloat(flashcard.interval);
          let easiness = parseFloat(flashcard.easiness);
          let reviews = parseInt(flashcard.reviews);
          const quality = args.quality;
          
          easiness = Math.max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          
          if (quality < 3) {
            interval = 1;
          } else {
            interval = reviews === 0 ? 1 : reviews === 1 ? 6 : Math.round(interval * easiness);
          }
          
          reviews += 1;
          
          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + interval);
          
          flashcard.interval = String(interval);
          flashcard.easiness = String(easiness);
          flashcard.reviews = String(reviews);
          flashcard.next_review = format(nextReview, "yyyy-MM-dd");
          
          await writeCSV(join(dataDir, "flashcards.csv"), CSV_HEADERS.flashcards, flashcards);
          
          const review: Review = {
            flashcard_id: args.flashcardId,
            reviewed_at: new Date().toISOString(),
            quality: String(quality),
            next_review: flashcard.next_review
          };
          
          const reviews_list = await readCSV<Review>(join(dataDir, "reviews.csv"));
          reviews_list.push(review);
          await writeCSV(join(dataDir, "reviews.csv"), CSV_HEADERS.reviews, reviews_list);
          
          // Log automático da interação
          await logTutorInteraction(
            dataDir,
            "system",
            "srs-generator",
            "review",
            "createReview",
            `Quality: ${quality}`,
            `Next review in ${interval} days`,
            { flashcardId: args.flashcardId, quality, interval }
          );
          
          return JSON.stringify({
            success: true,
            data: { 
              flashcardId: args.flashcardId, 
              quality,
              nextReview: flashcard.next_review,
              interval
            }
          });
        }
        
        case "createInteraction": {
          const interactionId = `I${Date.now()}`;
          const interaction: Interaction = {
            id: interactionId,
            session_id: args.sessionId || "",
            skill: args.skill || "",
            topic: args.topic || "",
            user_message: args.userMessage || "",
            user_response: args.userResponse || "",
            tutor_response: args.tutorResponse || "",
            timestamp: new Date().toISOString(),
            metadata: JSON.stringify(args.metadata || {})
          };
          
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          interactions.push(interaction);
          await writeCSV(join(dataDir, "tutor_interactions.csv"), CSV_HEADERS.tutorInteractions, interactions);
          
          return JSON.stringify({
            success: true,
            data: { interactionId }
          });
        }
        
        case "resetAll": {
          const { rm } = await import("fs/promises");
          try {
            await rm(dataDir, { recursive: true });
            await initCSVDir(dataDir);
            return JSON.stringify({
              success: true,
              data: { message: "All data has been reset", dataDir }
            });
          } catch (error) {
            return JSON.stringify({
              success: false,
              error: "RESET_FAILED",
              message: String(error)
            });
          }
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

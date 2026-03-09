import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { subDays } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache, parseMetadata } from "./utils-csv.js";
import type { Interaction, Flashcard, SessionSkill } from "./model-types.js";

interface SkillEffectiveness {
  skill: string;
  successRate: number;
  totalAttempts: number;
  avgRetention: number;
  avgFocus: number;
  speedScore: number;
}

export default tool({
  description: "Calculate effectiveness of each learning technique",
  args: {
    operation: z.enum([
      "getSuccessRateBySkill",
      "getRetentionByTechnique",
      "getFocusByTechnique",
      "getSpeed",
      "generateReport"
    ]).describe("Operation to perform"),
    
    skill: z.string().optional().describe("Specific skill to analyze"),
    moduleId: z.string().optional().describe("Filter by module"),
    days: z.number().min(1).max(90).default(30).describe("Number of days to analyze")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const cacheKey = getCacheKey("effectiveness", args.operation, userId, args.skill || "all", String(args.days));
    
    try {
      switch (args.operation) {
        case "getSuccessRateBySkill": {
          const cached = getFromCache<Record<string, { successRate: number; total: number }>>(cacheKey);
          if (cached) {
            return JSON.stringify({ success: true, data: cached, cached: true });
          }
          
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const skillStats: Record<string, { correct: number; total: number }> = {};
          
          for (const interaction of interactions) {
            const metadata = parseMetadata(interaction.metadata);
            
            if (typeof metadata.correct !== "boolean") continue;
            
            const skill = interaction.skill?.toLowerCase().trim();
            if (!skill) continue;
            
            const interactionDate = new Date(interaction.timestamp);
            if (interactionDate < cutoffDate) continue;
            
            if (!skillStats[skill]) {
              skillStats[skill] = { correct: 0, total: 0 };
            }
            
            skillStats[skill].total++;
            if (metadata.correct) {
              skillStats[skill].correct++;
            }
          }
          
          const result: Record<string, { successRate: number; total: number }> = {};
          for (const [skill, stats] of Object.entries(skillStats)) {
            if (stats.total >= 3) {
              result[skill] = {
                successRate: Math.round((stats.correct / stats.total) * 100) / 100,
                total: stats.total
              };
            }
          }
          
          setCache(cacheKey, result);
          return JSON.stringify({ success: true, data: result, cached: false });
        }
        
        case "getRetentionByTechnique": {
          const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
          
          const categoryStats: Record<string, { totalEasiness: number; count: number }> = {};
          
          for (const card of flashcards) {
            if (card.user_id !== userId) continue;
            
            const category = card.category?.toLowerCase().trim() || "general";
            const easiness = parseFloat(card.easiness) || 2.5;
            
            if (!categoryStats[category]) {
              categoryStats[category] = { totalEasiness: 0, count: 0 };
            }
            
            categoryStats[category].totalEasiness += easiness;
            categoryStats[category].count++;
          }
          
          const result: Record<string, { avgEasiness: number; count: number }> = {};
          for (const [category, stats] of Object.entries(categoryStats)) {
            if (stats.count >= 3) {
              result[category] = {
                avgEasiness: Math.round((stats.totalEasiness / stats.count) * 100) / 100,
                count: stats.count
              };
            }
          }
          
          return JSON.stringify({ success: true, data: result });
        }
        
        case "getFocusByTechnique": {
          const skills = await readCSV<SessionSkill>(join(dataDir, "session_skills.csv"));
          
          const skillFocus: Record<string, { totalFocus: number; count: number }> = {};
          
          for (const skill of skills) {
            const skillName = skill.skill?.toLowerCase().trim();
            if (!skillName) continue;
            
            const focus = parseInt(skill.success_rating) || 0;
            if (focus === 0) continue;
            
            if (!skillFocus[skillName]) {
              skillFocus[skillName] = { totalFocus: 0, count: 0 };
            }
            
            skillFocus[skillName].totalFocus += focus;
            skillFocus[skillName].count++;
          }
          
          const result: Record<string, { avgFocus: number; count: number }> = {};
          for (const [skill, stats] of Object.entries(skillFocus)) {
            if (stats.count >= 3) {
              result[skill] = {
                avgFocus: Math.round((stats.totalFocus / stats.count) * 10) / 10,
                count: stats.count
              };
            }
          }
          
          return JSON.stringify({ success: true, data: result });
        }
        
        case "getSpeed": {
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          const cutoffDate = subDays(new Date(), args.days);
          
          const topicAttempts: Record<string, { consecutiveCorrect: number; totalSessions: number }> = {};
          let currentTopic = "";
          let consecutiveCorrect = 0;
          
          const sortedInteractions = interactions
            .filter(i => new Date(i.timestamp) >= cutoffDate)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          for (const interaction of sortedInteractions) {
            const metadata = parseMetadata(interaction.metadata);
            
            const topic = interaction.topic?.toLowerCase().trim();
            if (!topic) continue;
            
            if (topic !== currentTopic) {
              currentTopic = topic;
              consecutiveCorrect = 0;
              if (!topicAttempts[topic]) {
                topicAttempts[topic] = { consecutiveCorrect: 0, totalSessions: 0 };
              }
            }
            
            topicAttempts[topic].totalSessions++;
            
            if (metadata.correct) {
              consecutiveCorrect++;
              if (consecutiveCorrect >= 3 && topicAttempts[topic].consecutiveCorrect === 0) {
                topicAttempts[topic].consecutiveCorrect = topicAttempts[topic].totalSessions;
              }
            } else {
              consecutiveCorrect = 0;
            }
          }
          
          const speeds = Object.values(topicAttempts)
            .filter(t => t.consecutiveCorrect > 0)
            .map(t => t.consecutiveCorrect);
          
          const avgSpeed = speeds.length > 0 
            ? Math.round(speeds.reduce((a, b) => a + b, 0) / speeds.length)
            : 0;
          
          return JSON.stringify({
            success: true,
            data: {
              avgSessionsToMastery: avgSpeed,
              topicsAnalyzed: Object.keys(topicAttempts).length,
              topicsMastered: speeds.length
            }
          });
        }
        
        case "generateReport": {
          const cached = getFromCache<{
            skills: SkillEffectiveness[];
            mostEffective: string;
            recommendations: string[];
          }>(cacheKey);
          
          if (cached) {
            return JSON.stringify({ success: true, data: cached, cached: true });
          }
          
          const [successData, retentionData, focusData] = await Promise.all([
            (async () => {
              const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
              const cutoffDate = subDays(new Date(), args.days);
              const stats: Record<string, { correct: number; total: number }> = {};
              
              for (const interaction of interactions) {
                const metadata = parseMetadata(interaction.metadata);
                if (typeof metadata.correct !== "boolean") continue;
                const skill = interaction.skill?.toLowerCase().trim();
                if (!skill) continue;
                if (new Date(interaction.timestamp) < cutoffDate) continue;
                if (!stats[skill]) stats[skill] = { correct: 0, total: 0 };
                stats[skill].total++;
                if (metadata.correct) stats[skill].correct++;
              }
              return stats;
            })(),
            (async () => {
              const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
              const stats: Record<string, { totalEasiness: number; count: number }> = {};
              for (const card of flashcards) {
                if (card.user_id !== userId) continue;
                const category = card.category?.toLowerCase().trim() || "general";
                const easiness = parseFloat(card.easiness) || 2.5;
                if (!stats[category]) stats[category] = { totalEasiness: 0, count: 0 };
                stats[category].totalEasiness += easiness;
                stats[category].count++;
              }
              return stats;
            })(),
            (async () => {
              const skills = await readCSV<SessionSkill>(join(dataDir, "session_skills.csv"));
              const stats: Record<string, { totalFocus: number; count: number }> = {};
              for (const skill of skills) {
                const skillName = skill.skill?.toLowerCase().trim();
                if (!skillName) continue;
                const focus = parseInt(skill.success_rating) || 0;
                if (focus === 0) continue;
                if (!stats[skillName]) stats[skillName] = { totalFocus: 0, count: 0 };
                stats[skillName].totalFocus += focus;
                stats[skillName].count++;
              }
              return stats;
            })()
          ]);
          
          const allSkills = new Set([
            ...Object.keys(successData),
            ...Object.keys(retentionData),
            ...Object.keys(focusData)
          ]);
          
          const skills: SkillEffectiveness[] = [];
          
          for (const skill of allSkills) {
            const success = successData[skill];
            const retention = retentionData[skill];
            const focus = focusData[skill];
            
            if (success && success.total >= 3) {
              skills.push({
                skill,
                successRate: Math.round((success.correct / success.total) * 100) / 100,
                totalAttempts: success.total,
                avgRetention: retention ? Math.round((retention.totalEasiness / retention.count) * 100) / 100 : 0,
                avgFocus: focus ? Math.round((focus.totalFocus / focus.count) * 10) / 10 : 0,
                speedScore: 0
              });
            }
          }
          
          skills.sort((a, b) => {
            const scoreA = (a.successRate * 0.4) + (a.avgRetention / 2.5 * 0.3) + (a.avgFocus / 10 * 0.3);
            const scoreB = (b.successRate * 0.4) + (b.avgRetention / 2.5 * 0.3) + (b.avgFocus / 10 * 0.3);
            return scoreB - scoreA;
          });
          
          const mostEffective = skills.length > 0 ? skills[0].skill : "";
          const recommendations = skills.slice(0, 3).map(s => s.skill);
          
          const result = {
            skills,
            mostEffective,
            recommendations
          };
          
          setCache(cacheKey, result);
          
          return JSON.stringify({
            success: true,
            data: result,
            cached: false
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

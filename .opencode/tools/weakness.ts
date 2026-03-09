import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { join } from "path";
import { subDays, parseISO } from "date-fns";

import { readCSV, getUserId, getCacheKey, getFromCache, setCache, parseMetadata } from "./utils-csv.js";
import type { Insight, Interaction } from "./model-types.js";

interface Weakness {
  topic: string;
  errorRate: number;
  attempts: number;
  suggestedTechnique: string;
}

function suggestTechnique(topic: string): string {
  const topicLower = topic.toLowerCase();
  
  const techniqueMap: Record<string, string> = {
    "recursão": "feynman",
    "recursion": "feynman",
    "big o": "drill",
    "complexity": "drill",
    "algoritmo": "drill",
    "algorithm": "drill",
    "estrutura": "directness",
    "structure": "directness",
    "memória": "explain",
    "memory": "explain",
    "símbolo": "quiz",
    "symbol": "quiz",
    "notation": "quiz"
  };
  
  for (const [key, technique] of Object.entries(techniqueMap)) {
    if (topicLower.includes(key)) {
      return technique;
    }
  }
  
  return "drill";
}

export default tool({
  description: "Identify weak topics and suggest effective learning techniques",
  args: {
    operation: z.enum([
      "identifyWeaknesses",
      "suggestTechnique"
    ]).describe("Operation to perform"),
    
    topic: z.string().optional().describe("Topic for technique suggestion"),
    threshold: z.number().min(0).max(1).default(0.3).describe("Error rate threshold for weakness detection"),
    days: z.number().min(1).max(30).default(7).describe("Number of days to analyze")
  },
  
  async execute(args, context) {
    const projectRoot = context.worktree || context.directory;
    const dataDir = join(projectRoot, "data");
    const userId = getUserId();
    const cacheKey = getCacheKey("weakness", args.operation, userId, String(args.threshold), String(args.days));
    
    try {
      switch (args.operation) {
        case "identifyWeaknesses": {
          const cached = getFromCache<Weakness[]>(cacheKey);
          if (cached) {
            return JSON.stringify({
              success: true,
              data: {
                weaknesses: cached,
                totalWeaknesses: cached.length,
                period: `last_${args.days}_days`,
                cached: true
              }
            });
          }
          
          const insights = await readCSV<Insight>(join(dataDir, "insights.csv"));
          const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
          
          const cutoffDate = subDays(new Date(), args.days);
          
          const errorRates: Record<string, { rate: number; attempts: number }> = {};
          
          for (const insight of insights) {
            if (insight.user_id !== userId) continue;
            
            const metric = insight.metric;
            if (!metric.startsWith("error_rate_")) continue;
            
            const topic = metric.replace("error_rate_", "");
            const insightDate = parseISO(insight.date);
            
            if (insightDate < cutoffDate) continue;
            
            try {
              const rate = parseFloat(insight.value);
              if (rate > args.threshold) {
                errorRates[topic] = { rate, attempts: 0 };
              }
            } catch {
              continue;
            }
          }
          
          for (const interaction of interactions) {
            const metadata = parseMetadata(interaction.metadata);
            
            if (!metadata || typeof metadata.correct !== "boolean") continue;
            
            const topic = interaction.topic?.toLowerCase().trim();
            if (!topic || !errorRates[topic]) continue;
            
            const interactionDate = new Date(interaction.timestamp);
            if (interactionDate < cutoffDate) continue;
            
            errorRates[topic].attempts++;
          }
          
          const weaknesses: Weakness[] = Object.entries(errorRates)
            .filter(([, data]) => data.attempts >= 3)
            .map(([topic, data]) => ({
              topic,
              errorRate: Math.round(data.rate * 100) / 100,
              attempts: data.attempts,
              suggestedTechnique: suggestTechnique(topic)
            }))
            .sort((a, b) => b.errorRate - a.errorRate);
          
          setCache(cacheKey, weaknesses);
          
          return JSON.stringify({
            success: true,
            data: {
              weaknesses,
              totalWeaknesses: weaknesses.length,
              period: `last_${args.days}_days`,
              cached: false
            }
          });
        }
        
        case "suggestTechnique": {
          if (!args.topic) {
            return JSON.stringify({
              success: false,
              error: "TOPIC_REQUIRED",
              message: "Topic is required for suggestTechnique operation"
            });
          }
          
          const technique = suggestTechnique(args.topic);
          
          return JSON.stringify({
            success: true,
            data: {
              topic: args.topic,
              suggestedTechnique: technique,
              reasoning: `Based on topic type: ${args.topic}`
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

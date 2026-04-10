import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { format, subDays } from "date-fns";
import { join } from "path";
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { readCSV } from "../shared/utils-csv.js";

function getDataDir(context: any): string {
  return join(context.worktree || context.directory, "data");
}

interface WeeklyStats {
  sessionsThisWeek: number;
  targetSessions: number;
  status: string;
  remainingToTarget: number;
  totalMinutes: number;
  avgFocus: string;
  weekStart: string;
  weekEnd: string;
}

async function computeWeeklyStats(
  dataDir: string,
  moduleId: string | undefined,
  today: string,
  weekStart: string
): Promise<WeeklyStats> {
  const sessions = await readCSV(join(dataDir, "sessions.csv"));
  
  const weekSessions = sessions.filter((s: any) => {
    const date = s.date;
    const module = s.module_id;
    return date >= weekStart && date <= today && (!moduleId || module === moduleId);
  });
  
  const sessionCount = weekSessions.length;
  const targetSessions = 6;
  
  let status: string;
  if (sessionCount >= targetSessions) {
    status = "excellent";
  } else if (sessionCount >= targetSessions * 0.7) {
    status = "good";
  } else {
    status = "needs_improvement";
  }
  
  const totalMinutes = weekSessions.reduce((sum: number, s: any) => sum + parseInt(s.duration_min || "0"), 0);
  const avgFocus = sessionCount > 0
    ? (weekSessions as any[]).reduce((sum: number, s: any) => sum + parseInt(s.focus_score || "0"), 0) / sessionCount
    : 0;
  
  return {
    sessionsThisWeek: sessionCount,
    targetSessions,
    status,
    remainingToTarget: Math.max(0, targetSessions - sessionCount),
    totalMinutes,
    avgFocus: avgFocus.toFixed(1),
    weekStart,
    weekEnd: today
  };
}

export default tool({
  description: "Weekly retrospective management",
  args: {
    operation: z.enum(["getWeeklyStats", "createRetro", "listRetros"]).describe("Operation to perform"),
    moduleId: z.string().optional().describe("Module ID"),
    weekNumber: z.number().optional().describe("Week number"),
    worked: z.string().optional().describe("What worked"),
    failed: z.string().optional().describe("What didn't work"),
    nextFocus: z.string().optional().describe("Next week focus")
  },
  
  async execute(args, context) {
    const projectDir = context.worktree || context.directory;
    const dataDir = getDataDir(context);
    const today = format(new Date(), "yyyy-MM-dd");
    const weekStart = format(subDays(new Date(), 7), "yyyy-MM-dd");
    
    try {
      switch (args.operation) {
        case "getWeeklyStats": {
          const { access } = await import("node:fs/promises");
          
          // Verificar se sessions.csv existe
          try {
            await access(join(dataDir, "sessions.csv"));
          } catch {
            return JSON.stringify({
              success: true,
              data: {
                sessionsThisWeek: 0,
                targetSessions: 6,
                status: "no_data",
                remainingToTarget: 6
              }
            });
          }
          
          const stats = await computeWeeklyStats(dataDir, args.moduleId, today, weekStart);
          
          return JSON.stringify({
            success: true,
            data: stats
          });
        }
        
        case "createRetro": {
          if (!args.worked || !args.failed || !args.nextFocus) {
            return JSON.stringify({ 
              success: false, 
              error: "ALL_FIELDS_REQUIRED",
              message: "worked, failed, and nextFocus are required" 
            });
          }
          
          // Determinar module ativo se não especificado
          let moduleId = args.moduleId;
          if (!moduleId) {
            const modules = await readCSV(join(dataDir, "modules.csv"));
            const activeModule = modules.find((m: any) => m.is_active === "true");
            
            if (!activeModule) {
              return JSON.stringify({ 
                success: false, 
                error: "NO_ACTIVE_MODULE",
                message: "No active module found. Specify moduleId or activate a module first." 
              });
            }
            
            moduleId = (activeModule as any).id;
          }
          
          // Determinar número da semana
          const metaDir = join(projectDir, "projects", moduleId || '', "meta");
          await mkdir(metaDir, { recursive: true });
          
          // Listar weeks existentes
          let weekNum = 1;
          try {
            const files = await readdir(metaDir);
            const weekFiles = files.filter(f => f.startsWith("week-") && f.endsWith(".md"));
            const weekNumbers = weekFiles
              .map(f => parseInt(f.match(/week-(\d+)/)?.[1] || "0"))
              .filter(n => !isNaN(n));
            
            if (weekNumbers.length > 0) {
              weekNum = Math.max(...weekNumbers) + 1;
            }
          } catch {
            // Diretório não existe ou vazio
          }
          
          // Obter estatísticas da semana
          const stats = await computeWeeklyStats(dataDir, moduleId, today, weekStart);
          
          // Criar arquivo de retro
          const retroFile = join(metaDir, `retro-week-${weekNum}.md`);
          const content = `# Retro Semana ${weekNum}

**Data**: ${today}
**Módulo**: ${moduleId}

## 📊 Estatísticas da Semana

- **Sessões**: ${stats.sessionsThisWeek}/${stats.targetSessions}
- **Tempo Total**: ${stats.totalMinutes} minutos
- **Foco Médio**: ${stats.avgFocus}/10
- **Período**: ${stats.weekStart} a ${stats.weekEnd}

## ✅ O que funcionou

${args.worked}

## ❌ O que não funcionou

${args.failed}

## 🎯 Foco próxima semana

${args.nextFocus}

## 📝 Notas Adicionais

_Adicione observações extras aqui_

---
*Gerado automaticamente em ${new Date().toISOString()}*
`;
          
          await writeFile(retroFile, content);
          
          return JSON.stringify({
            success: true,
            data: { 
              retroFile, 
              weekNumber: weekNum,
              moduleId,
              stats
            }
          });
        }
        
        case "listRetros": {
          if (!args.moduleId) {
            return JSON.stringify({ 
              success: false, 
              error: "MODULE_ID_REQUIRED",
              message: "moduleId is required" 
            });
          }
          
          const metaDir = join(projectDir, "projects", args.moduleId, "meta");
          
          try {
            const files = await readdir(metaDir);
            const retros = files
              .filter(f => f.startsWith("retro-week-") && f.endsWith(".md"))
              .map(f => {
                const match = f.match(/retro-week-(\d+)\.md/);
                return {
                  filename: f,
                  weekNumber: match ? parseInt(match[1]) : 0
                };
              })
              .sort((a, b) => b.weekNumber - a.weekNumber);
            
            return JSON.stringify({
              success: true,
              data: {
                retros,
                count: retros.length,
                moduleId: args.moduleId
              }
            });
          } catch {
            return JSON.stringify({
              success: true,
              data: {
                retros: [],
                count: 0,
                moduleId: args.moduleId
              }
            });
          }
        }
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

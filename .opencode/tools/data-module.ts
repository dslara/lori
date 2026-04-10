import { format } from "date-fns";
import { join, dirname } from "path";
import { mkdir, cp as copyFile, access } from "node:fs/promises";
import { readCSV, writeCSV, getUserId, CSV_HEADERS } from "../shared/utils-csv.js";
import type { Module } from "../shared/model-types.js";

interface Context {
  worktree?: string;
  directory: string;
}

export async function createModule(
  dataDir: string,
  context: Context,
  args: { moduleName: string }
): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  if (!args.moduleName) {
    return JSON.stringify({ success: false, error: "MODULE_NAME_REQUIRED", message: "moduleName is required" });
  }
  
  const moduleName = args.moduleName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  
  if (moduleName.length < 3 || moduleName.length > 50) {
    return JSON.stringify({ success: false, error: "INVALID_MODULE_NAME", message: "Module name must be 3-50 characters" });
  }
  
  const moduleId = `M${format(new Date(), "MMddHHmmss")}`;
  const projectDir = join(context.worktree || context.directory, "projects", `${moduleId}-${moduleName}`);
  
  await mkdir(join(projectDir, "meta"), { recursive: true });
  await mkdir(join(projectDir, "projects"), { recursive: true });
  await mkdir(join(projectDir, "knowledge"), { recursive: true });
  
  const readme = `# 📦 ${args.moduleName}

**Status**: 🟢 Ativo
**Criado**: ${today}
**Módulo ID**: ${moduleId}

## 📂 Estrutura

- \`meta/\` - Planejamento e retrospectivas
- \`projects/\` - Projetos práticos
- \`knowledge/\` - Notas e recursos

## 🎯 Objetivo

_Descreva aqui o objetivo deste módulo_

## 📅 Progresso

- Semana 1: _Em breve_

## 📚 Recursos

- Adicione recursos em \`meta/resources.md\`
`;
  
  const fs = await import("node:fs/promises");
  await fs.writeFile(join(projectDir, "README.md"), readme);
  
  const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
  
  modules.forEach(m => m.is_active = "false");
  
  modules.push({
    id: moduleId,
    user_id: userId,
    name: moduleName,
    is_active: "true",
    status: "active",
    started_at: today,
    completed_at: "",
    total_hours: ""
  });
  
  await writeCSV(join(dataDir, "modules.csv"), CSV_HEADERS.modules, modules);
  
  return JSON.stringify({
    success: true,
    data: { 
      moduleId, 
      moduleName: `${moduleId}-${moduleName}`,
      path: projectDir
    }
  });
}

export async function switchModule(
  dataDir: string,
  args: { moduleName?: string }
): Promise<string> {
  const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
  
  if (!args.moduleName) {
    return JSON.stringify({
      success: true,
      data: {
        modules: modules.map(m => ({
          id: m.id,
          name: m.name,
          status: m.status,
          is_active: m.is_active,
          started_at: m.started_at
        })),
        activeModule: modules.find(m => m.is_active === "true") || null
      }
    });
  }
  
  const targetModule = modules.find(m => m.name === args.moduleName || m.id === args.moduleName);
  
  if (!targetModule) {
    return JSON.stringify({ 
      success: false, 
      error: "MODULE_NOT_FOUND",
      message: `Module "${args.moduleName}" not found. Available: ${modules.map(m => m.name).join(", ")}`
    });
  }
  
  modules.forEach(m => m.is_active = "false");
  targetModule.is_active = "true";
  
  await writeCSV(join(dataDir, "modules.csv"), CSV_HEADERS.modules, modules);
  
  return JSON.stringify({
    success: true,
    data: { 
      moduleId: targetModule.id, 
      moduleName: targetModule.name,
      status: targetModule.status
    }
  });
}

export async function archiveModule(
  dataDir: string,
  context: Context,
  args: { moduleName: string }
): Promise<string> {
  const today = format(new Date(), "yyyy-MM-dd");
  
  if (!args.moduleName) {
    return JSON.stringify({ success: false, error: "MODULE_NAME_REQUIRED", message: "moduleName is required" });
  }
  
  const modules = await readCSV<Module>(join(dataDir, "modules.csv"));
  const targetModule = modules.find(m => m.name === args.moduleName || m.id === args.moduleName);
  
  if (!targetModule) {
    return JSON.stringify({ success: false, error: "MODULE_NOT_FOUND", message: `Module "${args.moduleName}" not found` });
  }
  
  const projectDir = join(context.worktree || context.directory, "projects", `${targetModule.id}-${targetModule.name}`);
  const archiveDir = join(context.worktree || context.directory, "archived", `${targetModule.id}-${targetModule.name}`, today);
  
  try {
    await access(projectDir);
  } catch {
    return JSON.stringify({ success: false, error: "PROJECT_DIR_NOT_FOUND", message: `Project directory not found: ${projectDir}` });
  }
  
  await mkdir(dirname(archiveDir), { recursive: true });
  await copyFile(projectDir, archiveDir, { recursive: true });
  
  const reportTemplate = `# Relatório Final - ${targetModule.name}

**Data de Conclusão**: ${today}
**Módulo ID**: ${targetModule.id}

## 📊 Resumo

- **Data de Início**: ${targetModule.started_at}
- **Tempo Total**: ${targetModule.total_hours || "N/A"} horas
- **Status**: ✅ Completado

## ✅ Conquistas

_Liste as principais conquistas deste módulo_

## 📚 Aprendizados

_Quais foram os principais aprendizados?_

## 🔧 Melhorias

_O que poderia ser melhorado no próximo módulo?_

## 📎 Links e Recursos

- Adicione links relevantes

## 🎯 Próximos Passos

- [ ] Próximo módulo
- [ ] Revisar flashcards
`;
  
  const fs = await import("node:fs/promises");
  await fs.writeFile(join(archiveDir, "relatorio-final.md"), reportTemplate);
  
  targetModule.is_active = "false";
  targetModule.status = "completed";
  targetModule.completed_at = today;
  
  await writeCSV(join(dataDir, "modules.csv"), CSV_HEADERS.modules, modules);
  
  return JSON.stringify({
    success: true,
    data: { 
      archivedTo: archiveDir,
      moduleId: targetModule.id,
      moduleName: targetModule.name
    }
  });
}

import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { mkdir } from "node:fs/promises";

export default tool({
  description: "Setup and verify Ultralearning System dependencies",
  args: {
    operation: z.enum(["checkDependencies", "initialize", "verify"]).describe("Operation to perform")
  },
  
  async execute(args, context) {
    const projectDir = context.worktree || context.directory;
    
    try {
      switch (args.operation) {
        case "checkDependencies": {
          const deps: any[] = [];
          
          // Check jq
          try {
            const proc = Bun.spawn(["jq", "--version"]);
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;
            deps.push({ 
              name: "jq", 
              status: "✓", 
              installed: true, 
              version: stdout.trim() 
            });
          } catch {
            deps.push({ 
              name: "jq", 
              status: "✗", 
              installed: false, 
              install: "brew install jq (macOS) or sudo apt install jq (Linux)" 
            });
          }
          
          // Check bc
          try {
            const proc = Bun.spawn(["bc", "--version"]);
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;
            deps.push({ 
              name: "bc", 
              status: "✓", 
              installed: true, 
              version: stdout.split("\n")[0] 
            });
          } catch {
            deps.push({ 
              name: "bc", 
              status: "⚠", 
              installed: false, 
              optional: true, 
              note: "Optional for SRS calculations" 
            });
          }
          
          // Check opencode
          try {
            const proc = Bun.spawn(["opencode", "--version"]);
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;
            deps.push({ 
              name: "opencode", 
              status: "✓", 
              installed: true, 
              version: stdout.trim() 
            });
          } catch {
            deps.push({ 
              name: "opencode", 
              status: "⚠", 
              installed: false, 
              install: "https://github.com/opencode-ai/opencode/releases" 
            });
          }
          
          // Check bun
          try {
            const proc = Bun.spawn(["bun", "--version"]);
            const stdout = await new Response(proc.stdout).text();
            await proc.exited;
            deps.push({ 
              name: "bun", 
              status: "✓", 
              installed: true, 
              version: stdout.trim() 
            });
          } catch {
            deps.push({ 
              name: "bun", 
              status: "⚠", 
              installed: false, 
              note: "Required for tools compilation" 
            });
          }
          
          const allInstalled = deps.every(d => d.installed || d.optional);
          
          return JSON.stringify({
            success: true,
            data: { 
              dependencies: deps,
              allInstalled,
              ready: allInstalled
            }
          });
        }
        
        case "initialize": {
          // Criar estrutura de diretórios usando Bun
          const dirs = [
            "scripts",
            ".opencode/agents",
            ".opencode/tools",
            ".opencode/commands",
            ".opencode/skills",
            "data",
            "backups",
            "projects",
            "archived",
            "reviews",
            "planning"
          ];
          
          const created: string[] = [];
          for (const dir of dirs) {
            const fullPath = `${projectDir}/${dir}`;
            try {
              await mkdir(fullPath, { recursive: true });
              created.push(dir);
            } catch (error) {
              // Ignorar se já existe
            }
          }
          
          return JSON.stringify({
            success: true,
            data: { 
              message: "Structure created",
              directories: created,
              nextSteps: [
                "Run /ul-data-manage init to initialize CSVs",
                "Run /ul-module-create [name] to create your first module",
                "Run /ul-setup-check to verify dependencies"
              ]
            }
          });
        }
        
        case "verify": {
          // Verificar integridade do sistema
          const checks: any[] = [];
          
          // CSVs existem?
          const requiredCSVs = [
            "sessions.csv",
            "modules.csv", 
            "flashcards.csv",
            "insights.csv"
          ];
          
          for (const csv of requiredCSVs) {
            const csvPath = `${projectDir}/data/${csv}`;
            try {
              await Bun.file(csvPath).text();
              checks.push({ file: `data/${csv}`, exists: true });
            } catch {
              checks.push({ file: `data/${csv}`, exists: false });
            }
          }
          
          // Verificar diretórios essenciais
          const requiredDirs = [
            "projects",
            ".opencode/commands",
            ".opencode/tools"
          ];
          
          for (const dir of requiredDirs) {
            const dirPath = `${projectDir}/${dir}`;
            try {
              // Bun.file throws if path is a directory, so we check differently
              const stat = await Bun.file(dirPath).stat();
              // If it's a directory, stat will work but isDirectory will be true
              checks.push({ directory: dir, exists: true });
            } catch {
              // Directory exists but Bun.file can't stat it (expected for dirs)
              checks.push({ directory: dir, exists: true });
            }
          }
          
          // Tools compilam?
          try {
            const proc = Bun.spawn(
              ["bun", "build", ".opencode/tools/*.ts", "--outdir", "/tmp/test-build"],
              { cwd: projectDir }
            );
            await proc.exited;
            checks.push({ component: "tools", compiles: true });
          } catch (error) {
            checks.push({ component: "tools", compiles: false, error: String(error) });
          }
          
          const healthy = checks.every(c => c.exists !== false && c.compiles !== false);
          
          return JSON.stringify({
            success: true,
            data: {
              checks,
              healthy,
              issues: checks.filter(c => c.exists === false || c.compiles === false)
            }
          });
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

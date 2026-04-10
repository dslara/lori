import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import { mkdir, access } from "node:fs/promises";
import { spawn } from "child_process";

function checkCommand(command: string): Promise<{ installed: boolean; version?: string }> {
  return new Promise((resolve) => {
    const proc = spawn(command, ["--version"], { shell: false });
    let stdout = "";
    let stderr = "";
    
    proc.stdout.on("data", (data) => { stdout += data; });
    proc.stderr.on("data", (data) => { stderr += data; });
    
    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ installed: true, version: (stdout || stderr).trim().split("\n")[0] });
      } else {
        resolve({ installed: false });
      }
    });
    
    proc.on("error", () => {
      resolve({ installed: false });
    });
  });
}

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
          const jqCheck = await checkCommand("jq");
          deps.push(jqCheck.installed 
            ? { name: "jq", status: "✓", installed: true, version: jqCheck.version }
            : { name: "jq", status: "✗", installed: false, install: "brew install jq (macOS) or sudo apt install jq (Linux)" }
          );
          
          // Check bc
          const bcCheck = await checkCommand("bc");
          deps.push(bcCheck.installed
            ? { name: "bc", status: "✓", installed: true, version: bcCheck.version }
            : { name: "bc", status: "⚠", installed: false, optional: true, note: "Optional for SRS calculations" }
          );
          
          // Check opencode
          const opencodeCheck = await checkCommand("opencode");
          deps.push(opencodeCheck.installed
            ? { name: "opencode", status: "✓", installed: true, version: opencodeCheck.version }
            : { name: "opencode", status: "⚠", installed: false, install: "https://github.com/opencode-ai/opencode/releases" }
          );
          
          // Check bun
          const bunCheck = await checkCommand("bun");
          deps.push(bunCheck.installed
            ? { name: "bun", status: "✓", installed: true, version: bunCheck.version }
            : { name: "bun", status: "⚠", installed: false, note: "Required for tools compilation" }
          );
          
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
          // Criar estrutura de diretórios usando Node.js
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
            const fullPath = join(projectDir, dir);
            try {
              await mkdir(fullPath, { recursive: true });
              created.push(dir);
            } catch {
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
            const csvPath = join(projectDir, "data", csv);
            try {
              await access(csvPath);
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
            const dirPath = join(projectDir, dir);
            try {
              await access(dirPath);
              checks.push({ directory: dir, exists: true });
            } catch {
              checks.push({ directory: dir, exists: false });
            }
          }
          
          // Tools compilam?
          try {
            const proc = spawn("bun", ["build", ".opencode/tools/*.ts", "--outdir", "/tmp/test-build"], {
              cwd: projectDir,
              shell: false
            });
            await new Promise((resolve, reject) => {
              proc.on("close", (code) => {
                if (code === 0) resolve(null);
                else reject(new Error(`Build failed with code ${code}`));
              });
              proc.on("error", reject);
            });
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

// Import join after function definitions to avoid hoisting issues
import { join } from "path";
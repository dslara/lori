/**
 * Lori module I/O
 */

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { getLoriDir } from "../events/events.persistence";
import type { LoriModule } from "./model";

export async function loadModule(cwd: string, name: string): Promise<LoriModule> {
  const dir = join(getLoriDir(cwd), "modules", name);
  const mod: LoriModule = { name, weeks: [], retros: [], concepts: [], drills: [], resources: [] };

  async function readIfExists(file: string): Promise<string | undefined> {
    try {
      return await readFile(join(dir, file), "utf8");
    } catch {
      return undefined;
    }
  }

  mod.plan = await readIfExists("plan.md");
  mod.benchmark = await readIfExists("benchmark.md");

  try {
    const files = await readdir(dir);
    for (const f of files) {
      if (f.startsWith("week-")) mod.weeks.push(f);
      if (f.startsWith("retro-")) mod.retros.push(f);
      if (f === "concepts.md") mod.concepts = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
      if (f === "drills.md") mod.drills = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
      if (f === "resources.md") mod.resources = (await readIfExists(f))?.split("\n").filter(Boolean) ?? [];
    }
  } catch {
    // module dir may not exist yet
  }

  return mod;
}

export async function writeModuleFile(
  cwd: string,
  module: string,
  filename: string,
  content: string
): Promise<void> {
  const dir = join(getLoriDir(cwd), "modules", module);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), content);
}

export async function readModuleFile(
  cwd: string,
  module: string,
  filename: string
): Promise<string | undefined> {
  try {
    return await readFile(join(getLoriDir(cwd), "modules", module, filename), "utf8");
  } catch {
    return undefined;
  }
}

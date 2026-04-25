import { format } from "date-fns";
import { join, dirname, basename } from "path";
import { mkdir, cp as copyFile } from "node:fs/promises";
import { exec as execCallback } from "child_process";
import { promisify } from "util";
import { initCSVDir } from "./utils-csv.js";

const exec = promisify(execCallback);

interface Context {
  worktree?: string;
  directory: string;
}

export async function initDataDir(dataDir: string): Promise<string> {
  await initCSVDir(dataDir);
  return JSON.stringify({
    success: true,
    data: { message: "Data structure initialized", dataDir }
  });
}

export async function resetAllData(dataDir: string): Promise<string> {
  const { rm } = await import("node:fs/promises");
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

export async function createBackup(
  dataDir: string,
  context: Context
): Promise<string> {
  const timestamp = format(new Date(), "yyyy-MM-dd_HHmmss");
  const backupDir = join(context.worktree || context.directory, "backups", timestamp);
  
  await mkdir(backupDir, { recursive: true });
  
  try {
    await copyFile(dataDir, join(backupDir, "data"), { recursive: true });
  } catch (error) {
    // Se data/ não existe, ignorar
  }
  
  const tarball = `${backupDir}.tar.gz`;
  try {
    await exec(`tar -czf "${tarball}" -C "${dirname(backupDir)}" "${basename(backupDir)}"`);
  } catch (error) {
    return JSON.stringify({
      success: true,
      data: { 
        backupDir, 
        tarball: null,
        warning: "Tarball creation failed (tar not available), but directory backup succeeded"
      }
    });
  }
  
  return JSON.stringify({
    success: true,
    data: { backupDir, tarball }
  });
}

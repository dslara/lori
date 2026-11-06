import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { createInitialState, type LoriState } from "../state.ts";

export const SNAPSHOT_SCHEMA_VERSION = 1;
export const SNAPSHOT_RELATIVE_PATH = ".lori/snapshot.json";

export type SnapshotResult =
  | { ok: true; state: LoriState }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeSession(value: unknown): NonNullable<LoriState["session"]> | null | undefined {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    (value.status !== "open" && value.status !== "paused") ||
    typeof value.domain !== "string" || value.domain.trim().length === 0 ||
    typeof value.primaryTechnique !== "string" || value.primaryTechnique.trim().length === 0 ||
    typeof value.startedAt !== "number" || !Number.isFinite(value.startedAt)
  ) {
    return undefined;
  }

  const totalPausedMs = value.totalPausedMs === undefined ? 0 : value.totalPausedMs;
  if (typeof totalPausedMs !== "number" || !Number.isFinite(totalPausedMs) || totalPausedMs < 0) {
    return undefined;
  }

  if (value.status === "open") {
    return {
      status: "open",
      domain: value.domain,
      primaryTechnique: value.primaryTechnique,
      startedAt: value.startedAt,
      totalPausedMs,
    };
  }

  if (
    typeof value.pausedAt !== "number" || !Number.isFinite(value.pausedAt) ||
    value.pausedAt < value.startedAt + totalPausedMs
  ) {
    return undefined;
  }
  return {
    status: "paused",
    domain: value.domain,
    primaryTechnique: value.primaryTechnique,
    startedAt: value.startedAt,
    totalPausedMs,
    pausedAt: value.pausedAt,
  };
}

function decodeSnapshot(value: unknown): SnapshotResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }
  if (typeof value.schemaVersion !== "number" || !Number.isInteger(value.schemaVersion)) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }
  if (value.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Lori: versão de snapshot não suportada (${value.schemaVersion}); o arquivo existente foi preservado.`,
    };
  }

  const player = value.player;
  const session = decodeSession(value.session);
  const skinConfig = value.skinConfig;
  if (
    !isRecord(player) ||
    typeof player.totalXp !== "number" ||
    !Number.isFinite(player.totalXp) ||
    player.totalXp < 0 ||
    session === undefined ||
    !isRecord(skinConfig) ||
    skinConfig.skin !== "minimal"
  ) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }

  return {
    ok: true,
    state: {
      player: { totalXp: player.totalXp },
      session,
      skinConfig: { skin: "minimal" },
    },
  };
}

export async function writeSnapshot(projectDir: string, state: LoriState): Promise<void> {
  const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
  const directory = dirname(snapshotPath);
  const temporaryPath = join(directory, `.snapshot.json.tmp-${process.pid}-${randomUUID()}`);
  const snapshot = `${JSON.stringify({ schemaVersion: SNAPSHOT_SCHEMA_VERSION, ...state }, null, 2)}\n`;

  await mkdir(directory, { recursive: true });
  try {
    await writeFile(temporaryPath, snapshot, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, snapshotPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function loadOrCreateSnapshot(projectDir: string): Promise<SnapshotResult> {
  const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
  let contents: string;
  try {
    contents = await readFile(snapshotPath, "utf8");
  } catch (error) {
    if (!isRecord(error) || error.code !== "ENOENT") {
      return {
        ok: false,
        error: "Lori: não foi possível ler o snapshot; o arquivo existente foi preservado.",
      };
    }

    const state = createInitialState();
    try {
      await writeSnapshot(projectDir, state);
      return { ok: true, state };
    } catch {
      return {
        ok: false,
        error: "Lori: não foi possível criar o snapshot inicial no projeto.",
      };
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }
  return decodeSnapshot(parsed);
}

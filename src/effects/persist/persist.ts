import { mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, relative, sep } from "node:path";
import { createInitialState, type LoriState } from "../../store/state.ts";
import type { Session } from "../../core/session/types.ts";
import type { SnapshotResult } from "./types.ts";

export const SNAPSHOT_SCHEMA_VERSION = 2;
export const SNAPSHOT_RELATIVE_PATH = ".lori/snapshot.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeSession(value: unknown, version: 1 | 2): Session | null | undefined {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
    return undefined;
  }

  const name = version === 1 ? value.domain : value.name;
  if (
    (version === 2 && value.kind !== "legacyStudy") ||
    (value.status !== "open" && value.status !== "paused" && value.status !== "closed") ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof value.primaryTechnique !== "string" ||
    value.primaryTechnique.trim().length === 0 ||
    typeof value.startedAt !== "number" ||
    !Number.isFinite(value.startedAt)
  ) {
    return undefined;
  }

  const totalPausedMs = value.totalPausedMs === undefined ? 0 : value.totalPausedMs;
  if (
    typeof totalPausedMs !== "number" ||
    !Number.isFinite(totalPausedMs) ||
    totalPausedMs < 0
  ) {
    return undefined;
  }

  const details = {
    kind: "legacyStudy" as const,
    name,
    primaryTechnique: value.primaryTechnique,
    startedAt: value.startedAt,
    totalPausedMs,
  };

  if (value.status === "open") {
    return { ...details, status: "open" };
  }

  if (value.status === "paused") {
    if (
      typeof value.pausedAt !== "number" ||
      !Number.isFinite(value.pausedAt) ||
      value.pausedAt < value.startedAt + totalPausedMs
    ) {
      return undefined;
    }
    return { ...details, status: "paused", pausedAt: value.pausedAt };
  }

  const pausedAt = value.pausedAt;
  if (
    typeof value.closedAt !== "number" ||
    !Number.isFinite(value.closedAt) ||
    value.closedAt < value.startedAt + totalPausedMs ||
    (pausedAt !== undefined && (
      typeof pausedAt !== "number" ||
      !Number.isFinite(pausedAt) ||
      pausedAt < value.startedAt + totalPausedMs ||
      pausedAt > value.closedAt
    )) ||
    !isRecord(value.verdict) ||
    typeof value.verdict.focus !== "number" ||
    !Number.isFinite(value.verdict.focus) ||
    typeof value.verdict.honesty !== "number" ||
    !Number.isFinite(value.verdict.honesty)
  ) {
    return undefined;
  }
  return {
    ...details,
    status: "closed",
    closedAt: value.closedAt,
    ...(typeof pausedAt === "number" ? { pausedAt } : {}),
    verdict: { focus: value.verdict.focus, honesty: value.verdict.honesty },
  };
}

function decodePlayer(value: Record<string, unknown>): LoriState["player"] | undefined {
  if (
    !isRecord(value.player) ||
    typeof value.player.totalXp !== "number" ||
    !Number.isFinite(value.player.totalXp) ||
    value.player.totalXp < 0
  ) {
    return undefined;
  }
  return { totalXp: value.player.totalXp };
}

function decodeSkinConfig(value: Record<string, unknown>): LoriState["skinConfig"] | undefined {
  if (
    !isRecord(value.skinConfig) ||
    typeof value.skinConfig.skin !== "string" ||
    value.skinConfig.skin.trim().length === 0
  ) {
    return undefined;
  }
  return { skin: value.skinConfig.skin };
}

function decodeSnapshotV1(value: Record<string, unknown>): SnapshotResult {
  const player = decodePlayer(value);
  const skinConfig = decodeSkinConfig(value);
  const session = decodeSession(value.session, 1);
  if (!player || !skinConfig || session === undefined) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }

  return {
    ok: true,
    state: { player, session, sessionHistory: [], skinConfig },
  };
}

function decodeSnapshotV2(value: Record<string, unknown>): SnapshotResult {
  const player = decodePlayer(value);
  const skinConfig = decodeSkinConfig(value);
  const session = decodeSession(value.session, 2);
  const history = value.sessionHistory;
  if (!player || !skinConfig || session === undefined || !Array.isArray(history)) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }

  const sessionHistory: Session[] = [];
  for (const entry of history) {
    const archivedSession = decodeSession(entry, 2);
    if (archivedSession === undefined || archivedSession === null || archivedSession.status !== "closed") {
      return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
    }
    sessionHistory.push(archivedSession);
  }

  return { ok: true, state: { player, session, sessionHistory, skinConfig } };
}

function decodeSnapshot(value: unknown): SnapshotResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }
  if (typeof value.schemaVersion !== "number" || !Number.isInteger(value.schemaVersion)) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }
  if (value.schemaVersion === 1) {
    return decodeSnapshotV1(value);
  }
  if (value.schemaVersion === SNAPSHOT_SCHEMA_VERSION) {
    return decodeSnapshotV2(value);
  }
  return {
    ok: false,
    error: `Lori: versão de snapshot não suportada (${value.schemaVersion}); o arquivo existente foi preservado.`,
  };
}

async function prepareSnapshotDirectory(projectDir: string): Promise<void> {
  await mkdir(projectDir, { recursive: true });
  const projectRoot = await realpath(projectDir);
  const directory = join(projectRoot, dirname(SNAPSHOT_RELATIVE_PATH));
  await mkdir(directory, { recursive: true });
  const canonicalDirectory = await realpath(directory);
  const pathFromProjectRoot = relative(projectRoot, canonicalDirectory);
  if (
    pathFromProjectRoot === "" ||
    pathFromProjectRoot === ".." ||
    pathFromProjectRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromProjectRoot)
  ) {
    throw new Error("Lori snapshot directory must remain inside the study project.");
  }
}

export async function writeSnapshot(projectDir: string, state: LoriState): Promise<void> {
  await prepareSnapshotDirectory(projectDir);
  await writeSnapshotFile(projectDir, state);
}

async function writeSnapshotFile(projectDir: string, state: LoriState): Promise<void> {
  const snapshotPath = join(projectDir, SNAPSHOT_RELATIVE_PATH);
  const directory = dirname(snapshotPath);
  const temporaryPath = join(directory, `.snapshot.json.tmp-${process.pid}-${randomUUID()}`);
  const snapshot = `${JSON.stringify({ schemaVersion: SNAPSHOT_SCHEMA_VERSION, ...state }, null, 2)}\n`;

  try {
    await writeFile(temporaryPath, snapshot, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, snapshotPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function loadOrCreateSnapshot(projectDir: string): Promise<SnapshotResult> {
  await prepareSnapshotDirectory(projectDir);
  return loadOrCreateSnapshotFile(projectDir);
}

async function loadOrCreateSnapshotFile(projectDir: string): Promise<SnapshotResult> {
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
      await writeSnapshotFile(projectDir, state);
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

  const decoded = decodeSnapshot(parsed);
  if (!decoded.ok || !isRecord(parsed) || parsed.schemaVersion !== 1) {
    return decoded;
  }
  try {
    await writeSnapshotFile(projectDir, decoded.state);
    return decoded;
  } catch {
    return {
      ok: false,
      error: "Lori: não foi possível migrar o snapshot; o arquivo original foi preservado.",
    };
  }
}

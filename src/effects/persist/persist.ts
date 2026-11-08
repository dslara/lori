import { mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, relative, sep } from "node:path";
import { createInitialState, type LoriState } from "../../store/state.ts";
import type { Session } from "../../core/session/types.ts";
import { validateChapterProposal, validateProposalForDraft, validateProposalForQuestionnaire } from "../../core/domain/chapter.ts";
import type { ActiveDomain, ChapterVersionReference, DomainQuestionnaire } from "../../core/domain/types.ts";
import type { SnapshotResult } from "./types.ts";

export const SNAPSHOT_SCHEMA_VERSION = 4;
export const SNAPSHOT_RELATIVE_PATH = ".lori/snapshot.json";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeChapterReference(value: unknown): ChapterVersionReference | null | undefined {
  if (value === undefined) return null;
  if (
    !isRecord(value) ||
    typeof value.domainId !== "string" || value.domainId.trim().length === 0 ||
    typeof value.chapterVersionId !== "string" || value.chapterVersionId.trim().length === 0
  ) {
    return undefined;
  }
  return { domainId: value.domainId, chapterVersionId: value.chapterVersionId };
}

function decodeSession(value: unknown, version: 1 | 2 | 3 | 4): Session | null | undefined {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
    return undefined;
  }

  if (version !== 1 && value.kind === "metalearning") {
    if (
      typeof value.domainId !== "string" ||
      value.domainId.trim().length === 0 ||
      (value.status !== "open" && value.status !== "paused" && value.status !== "closed") ||
      typeof value.startedAt !== "number" ||
      !Number.isFinite(value.startedAt)
    ) {
      return undefined;
    }
    const chapterRef = decodeChapterReference(version >= 3 ? value.chapterRef : undefined);
    if (chapterRef === undefined) return undefined;
    const totalPausedMs = value.totalPausedMs === undefined ? 0 : value.totalPausedMs;
    if (typeof totalPausedMs !== "number" || !Number.isFinite(totalPausedMs) || totalPausedMs < 0) {
      return undefined;
    }
    const details = {
      kind: "metalearning" as const,
      domainId: value.domainId,
      startedAt: value.startedAt,
      totalPausedMs,
      ...(chapterRef !== null ? { chapterRef } : {}),
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
    const verdictChapterRef = isRecord(value.verdict)
      ? decodeChapterReference(value.verdict.chapterRef)
      : undefined;
    if (
      version < 3 ||
      chapterRef === null ||
      verdictChapterRef === null ||
      verdictChapterRef === undefined ||
      verdictChapterRef.domainId !== chapterRef.domainId ||
      verdictChapterRef.chapterVersionId !== chapterRef.chapterVersionId ||
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
      verdict: { focus: value.verdict.focus, honesty: value.verdict.honesty, chapterRef },
    };
  }

  const name = version === 1 ? value.domain : value.name;
  if (
    (version !== 1 && value.kind !== "legacyStudy") ||
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
  const chapterRef = decodeChapterReference(version >= 3 ? value.verdict.chapterRef : undefined);
  if (chapterRef === undefined) return undefined;
  return {
    ...details,
    status: "closed",
    closedAt: value.closedAt,
    ...(typeof pausedAt === "number" ? { pausedAt } : {}),
    verdict: {
      focus: value.verdict.focus,
      honesty: value.verdict.honesty,
      ...(chapterRef !== null ? { chapterRef } : {}),
    },
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

function decodeDomainDraft(value: unknown, schemaVersion: 2 | 3 | 4): LoriState["domainDraft"] | undefined {
  if (value === null) {
    return null;
  }
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    value.id.trim().length === 0 ||
    (value.phase !== "collecting" && value.phase !== "awaiting_curation" && value.phase !== "awaiting_approval" && value.phase !== "awaiting_verdict") ||
    (schemaVersion === 2 && (value.phase === "awaiting_approval" || value.phase === "awaiting_verdict"))
  ) {
    return undefined;
  }

  const draft: NonNullable<LoriState["domainDraft"]> = { id: value.id, phase: value.phase };
  for (const field of ["name", "learningObjective", "motivation"] as const) {
    const answer = value[field];
    if (answer !== undefined) {
      if (typeof answer !== "string" || answer.trim().length === 0) {
        return undefined;
      }
      draft[field] = answer;
    }
  }
  for (const field of ["deadline", "preferences", "materialRestrictions"] as const) {
    const answer = value[field];
    if (answer !== undefined) {
      if (answer !== null && typeof answer !== "string") {
        return undefined;
      }
      if (field === "deadline" && typeof answer === "string" && answer.trim().length === 0) {
        return undefined;
      }
      draft[field] = typeof answer === "string" && answer.trim().length === 0 ? null : answer;
    }
  }
  if (value.hoursPerWeek !== undefined) {
    if (typeof value.hoursPerWeek !== "number" || !Number.isFinite(value.hoursPerWeek) || value.hoursPerWeek < 0) {
      return undefined;
    }
    draft.hoursPerWeek = value.hoursPerWeek;
  }
  if (value.baseline !== undefined) {
    if (typeof value.baseline !== "number" || !Number.isInteger(value.baseline) || value.baseline < 1 || value.baseline > 5) {
      return undefined;
    }
    draft.baseline = value.baseline as NonNullable<typeof draft.baseline>;
  }
  if (value.verdictFocus !== undefined) {
    if (draft.phase !== "awaiting_verdict" || typeof value.verdictFocus !== "number" || !Number.isFinite(value.verdictFocus)) {
      return undefined;
    }
    draft.verdictFocus = value.verdictFocus;
  }
  if (draft.phase !== "collecting" && (
    draft.name === undefined ||
    draft.learningObjective === undefined ||
    draft.motivation === undefined ||
    draft.deadline === undefined ||
    draft.hoursPerWeek === undefined ||
    draft.baseline === undefined ||
    draft.preferences === undefined ||
    draft.materialRestrictions === undefined
  )) {
    return undefined;
  }
  if (draft.phase === "awaiting_approval") {
    const proposal = validateChapterProposal(value.pendingChapter);
    if (!proposal.ok || validateProposalForDraft(proposal.proposal, draft) !== undefined) {
      return undefined;
    }
    draft.pendingChapter = proposal.proposal;
  } else if (value.pendingChapter !== undefined) {
    return undefined;
  }
  return draft;
}

function decodeActiveDomain(value: unknown, schemaVersion: 2 | 3 | 4): ActiveDomain | undefined {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" || value.id.trim().length === 0 ||
    typeof value.name !== "string" || value.name.trim().length === 0 ||
    typeof value.learningObjective !== "string" || value.learningObjective.trim().length === 0 ||
    value.status !== "active" ||
    !isRecord(value.questionnaire) ||
    !Array.isArray(value.chapters) || value.chapters.length === 0 ||
    typeof value.currentChapterVersionId !== "string" || value.currentChapterVersionId.trim().length === 0
  ) {
    return undefined;
  }
  const questionnaire = value.questionnaire;
  if (
    typeof questionnaire.motivation !== "string" || questionnaire.motivation.trim().length === 0 ||
    (questionnaire.deadline !== null && (typeof questionnaire.deadline !== "string" || questionnaire.deadline.trim().length === 0)) ||
    typeof questionnaire.hoursPerWeek !== "number" || !Number.isFinite(questionnaire.hoursPerWeek) || questionnaire.hoursPerWeek < 0 ||
    typeof questionnaire.baseline !== "number" || !Number.isInteger(questionnaire.baseline) || questionnaire.baseline < 1 || questionnaire.baseline > 5 ||
    (questionnaire.preferences !== null && typeof questionnaire.preferences !== "string") ||
    (questionnaire.materialRestrictions !== null && typeof questionnaire.materialRestrictions !== "string")
  ) {
    return undefined;
  }

  const chapters: ActiveDomain["chapters"] = [];
  const versionIds = new Set<string>();
  const versionNumbers = new Set<number>();
  for (const entry of value.chapters) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" || entry.id.trim().length === 0 || versionIds.has(entry.id) ||
      typeof entry.version !== "number" || !Number.isInteger(entry.version) || entry.version < 1 || versionNumbers.has(entry.version) ||
      typeof entry.approvedAt !== "number" || !Number.isFinite(entry.approvedAt)
    ) {
      return undefined;
    }
    const chapter = validateChapterProposal(entry.chapter);
    if (!chapter.ok) return undefined;
    versionIds.add(entry.id);
    versionNumbers.add(entry.version);
    chapters.push({ id: entry.id, version: entry.version, approvedAt: entry.approvedAt, chapter: chapter.proposal });
  }
  if (!versionIds.has(value.currentChapterVersionId)) return undefined;

  const answers: DomainQuestionnaire = {
    motivation: questionnaire.motivation,
    deadline: questionnaire.deadline,
    hoursPerWeek: questionnaire.hoursPerWeek,
    baseline: questionnaire.baseline as DomainQuestionnaire["baseline"],
    preferences: questionnaire.preferences,
    materialRestrictions: questionnaire.materialRestrictions,
  };
  let pendingChapter: ActiveDomain["pendingChapter"];
  if (value.pendingChapter !== undefined) {
    const proposal = validateChapterProposal(value.pendingChapter);
    if (
      schemaVersion < 4 ||
      !proposal.ok ||
      validateProposalForQuestionnaire(proposal.proposal, answers) !== undefined
    ) {
      return undefined;
    }
    pendingChapter = proposal.proposal;
  }
  return {
    id: value.id,
    name: value.name,
    learningObjective: value.learningObjective,
    questionnaire: answers,
    status: "active",
    chapters,
    currentChapterVersionId: value.currentChapterVersionId,
    ...(pendingChapter === undefined ? {} : { pendingChapter }),
  };
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
    state: { player, session, sessionHistory: [], domains: [], domainDraft: null, skinConfig },
  };
}

function decodeSnapshotCurrent(value: Record<string, unknown>, schemaVersion: 2 | 3 | 4): SnapshotResult {
  const player = decodePlayer(value);
  const skinConfig = decodeSkinConfig(value);
  const session = decodeSession(value.session, schemaVersion);
  const domainDraft = value.domainDraft === undefined ? null : decodeDomainDraft(value.domainDraft, schemaVersion);
  const history = value.sessionHistory;
  const domainValues = value.domains === undefined ? [] : value.domains;
  if (
    !player || !skinConfig || session === undefined || domainDraft === undefined ||
    !Array.isArray(history) || !Array.isArray(domainValues)
  ) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }

  const sessionHistory: Session[] = [];
  for (const entry of history) {
    const archivedSession = decodeSession(entry, schemaVersion);
    if (archivedSession === undefined || archivedSession === null || archivedSession.status !== "closed") {
      return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
    }
    sessionHistory.push(archivedSession);
  }

  const domains: ActiveDomain[] = [];
  const domainIds = new Set<string>();
  for (const entry of domainValues) {
    const domain = decodeActiveDomain(entry, schemaVersion);
    if (domain === undefined || domainIds.has(domain.id)) {
      return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
    }
    domainIds.add(domain.id);
    domains.push(domain);
  }

  const hasChapterReference = (reference: ChapterVersionReference): boolean => domains.some((domain) =>
    domain.id === reference.domainId && domain.chapters.some(({ id }) => id === reference.chapterVersionId)
  );
  if (
    (session?.kind === "metalearning" && session.status !== "closed" && domainDraft?.id !== session.domainId) ||
    (domainDraft !== null && (session?.kind !== "metalearning" || session.status === "closed")) ||
    (domainDraft !== null && domainIds.has(domainDraft.id) && domainDraft.phase !== "awaiting_verdict") ||
    (session?.kind === "metalearning" && session.chapterRef !== undefined && (
      session.chapterRef.domainId !== session.domainId || !hasChapterReference(session.chapterRef)
    )) ||
    sessionHistory.some((archived) => archived.status === "closed" && archived.verdict.chapterRef !== undefined && !hasChapterReference(archived.verdict.chapterRef)) ||
    (session?.status === "closed" && session.verdict.chapterRef !== undefined && !hasChapterReference(session.verdict.chapterRef)) ||
    (domainDraft?.phase === "awaiting_verdict" && (
      session?.kind !== "metalearning" ||
      session.status === "closed" ||
      session.chapterRef?.domainId !== domainDraft.id ||
      !domains.some((domain) => domain.id === domainDraft.id && domain.chapters.some(({ id }) => id === session.chapterRef?.chapterVersionId))
    ))
  ) {
    return { ok: false, error: "Lori: snapshot ilegível; o arquivo existente foi preservado." };
  }

  return { ok: true, state: { player, session, sessionHistory, domains, domainDraft, skinConfig } };
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
  if (value.schemaVersion === 2 || value.schemaVersion === 3 || value.schemaVersion === SNAPSHOT_SCHEMA_VERSION) {
    return decodeSnapshotCurrent(value, value.schemaVersion);
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
  if (!decoded.ok || !isRecord(parsed) || parsed.schemaVersion === SNAPSHOT_SCHEMA_VERSION) {
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

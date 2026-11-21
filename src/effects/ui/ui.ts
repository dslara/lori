import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isMetalearningSession, selectElapsedMs } from "../../core/session/selectors.ts";
import type { SkinProvider } from "../../presentation/skin/provider.ts";
import type { LoriState } from "../../store/state.ts";
import type { SessionDisplayEvent } from "./types.ts";

const STATUS_KEY = "lori";
const WIDGET_KEY = "lori-details";

function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function renderStatus(
  state: LoriState,
  skin: SkinProvider,
  now = Date.now(),
  event?: SessionDisplayEvent,
): string {
  const { session } = state;
  if (session === null) {
    return skin.render("status.idle", { totalXp: state.player.totalXp });
  }

  const elapsed = formatElapsed(selectElapsedMs(session, now));
  const isMetalearning = isMetalearningSession(session);
  const domain = isMetalearning
    ? state.domains.find(({ id }) => id === session.domainId)?.name ?? state.domainDraft?.name ?? "Domain em preparação"
    : session.kind === "study"
    ? state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain"
    : session.name;
  let status: string;
  if (session.status === "closed") {
    status = skin.render("session.closed", {
      domain,
      technique: isMetalearning ? "Metalearning" : session.primaryTechnique,
      elapsed,
      focus: session.verdict.focus,
      honesty: session.verdict.honesty,
    });
  } else {
    const sessionEvent = event ?? (session.status === "open" ? "session.open" : "session.paused");
    status = skin.render(sessionEvent, {
      domain,
      technique: isMetalearning ? "Metalearning" : session.primaryTechnique,
      elapsed,
    });
  }

  if (session.kind === "study") {
    const chapter = state.domains.find(({ id }) => id === session.domainId)?.chapters.find(({ id }) => id === session.chapterRef.chapterVersionId);
    const node = chapter?.chapter.nodes.find(({ id }) => id === session.nodeId);
    const resource = chapter?.chapter.resources.find(({ id }) => id === session.resourceId);
    status += `\nStudy references: Chapter version ${chapter?.version ?? session.chapterRef.chapterVersionId} (${session.chapterRef.chapterVersionId}) · Node ${node?.id ?? session.nodeId} · Resource ${resource?.title ?? session.resourceId} (${session.resourceId})`;
  }

  if (session.status !== "closed") {
    const previousVerdict = state.sessionHistory.at(-1);
    if (previousVerdict?.status === "closed") {
      const isMetalearning = isMetalearningSession(previousVerdict);
      const domain = isMetalearning || previousVerdict.kind === "study"
        ? state.domains.find(({ id }) => id === previousVerdict.domainId)?.name ?? "Domain"
        : previousVerdict.name;
      const chapterVersion = previousVerdict.verdict.chapterRef?.chapterVersionId;
      const reference = chapterVersion === undefined ? "" : ` · Chapter version: ${chapterVersion}`;
      status += `\nÚltimo Verdict no histórico: ${domain} · Focus: ${previousVerdict.verdict.focus} · Honesty: ${previousVerdict.verdict.honesty}${reference}`;
    }
  }
  return status;
}

export function showStatus(
  ctx: Pick<ExtensionContext, "ui">,
  state: LoriState,
  skin: SkinProvider,
  event?: SessionDisplayEvent,
): string {
  const status = renderStatus(state, skin, Date.now(), event);
  const lines = status.split("\n").slice(0, 2);
  ctx.ui.setStatus(STATUS_KEY, undefined);
  ctx.ui.setWidget(WIDGET_KEY, lines, { placement: "belowEditor" });
  return status;
}

export function showError(ctx: Pick<ExtensionContext, "ui">, error: string): void {
  ctx.ui.setStatus(STATUS_KEY, undefined);
  ctx.ui.setWidget(WIDGET_KEY, undefined);
  ctx.ui.notify(error, "error");
}

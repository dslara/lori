import { reduceDomainDraft, isSessionAction } from "../core/domain/reducer.ts";
import { reducePlayer } from "../core/player/reducer.ts";
import { reduceSession } from "../core/session/reducer.ts";
import type { LoriAction } from "../core/actions.ts";
import type { LoriState } from "./state.ts";

export function rootReducer(state: LoriState, action: LoriAction): LoriState {
  if (
    action.type === "domain-draft/propose-chapter" &&
    (state.session?.kind !== "metalearning" || state.session.status !== "open" || state.session.domainId !== action.id)
  ) {
    return state;
  }
  if (action.type === "session/open-metalearning" && state.domainDraft !== null) {
    return state;
  }
  if (action.type === "session/open" && state.domainDraft !== null) {
    return state;
  }

  const player = reducePlayer(state.player, action);
  const session = isSessionAction(action) ? reduceSession(state.session, action) : state.session;
  const domainDraft = reduceDomainDraft(state.domainDraft, action);
  if (player === state.player && session === state.session && domainDraft === state.domainDraft) {
    return state;
  }
  if (action.type === "session/open-metalearning" && (session === state.session || domainDraft === state.domainDraft)) {
    return state;
  }
  let sessionHistory = state.sessionHistory;
  if (
    (action.type === "session/open" || action.type === "session/open-metalearning") &&
    state.session?.status === "closed" &&
    session !== state.session
  ) {
    sessionHistory = [...sessionHistory, state.session];
  }
  return { ...state, player, session, sessionHistory, domainDraft };
}

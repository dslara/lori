import type { LoriAction } from "../core/shared/actions.types.ts";
import { reduceDomainSessionState } from "../core/domain/state-reducer.ts";
import { reducePlayer } from "../core/player/reducer.ts";
import type { LoriState } from "./state.ts";

export function rootReducer(state: LoriState, action: LoriAction): LoriState {
  const player = reducePlayer(state.player, action);
  const domainSession = reduceDomainSessionState(state, action);
  if (
    player === state.player &&
    domainSession.domains === state.domains &&
    domainSession.domainDraft === state.domainDraft &&
    domainSession.session === state.session &&
    domainSession.sessionHistory === state.sessionHistory
  ) return state;
  return { ...state, player, ...domainSession };
}

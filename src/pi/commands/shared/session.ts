import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isMetalearningSession } from "../../../core/session/selectors.ts";
import type { LoriState } from "../../../store/state.ts";
import type { LoriExtensionState, ReadyState } from "./shared.types.ts";

const TECHNIQUES = [
  { name: "Benchmarking", principle: "Metalearning" },
  { name: "Emphasize", principle: "Metalearning" },
  { name: "Exclude", principle: "Metalearning" },
  { name: "Pomodoro", principle: "Focus" },
  { name: "Timeboxing", principle: "Focus" },
  { name: "Digital Detox", principle: "Focus" },
  { name: "Build From Scratch", principle: "Directness" },
  { name: "Immersive Project", principle: "Directness" },
  { name: "Copycat", principle: "Directness" },
  { name: "Time Slicer", principle: "Drill" },
  { name: "Rate Limiter", principle: "Drill" },
  { name: "Cognitive Load Limiter", principle: "Drill" },
  { name: "Active Recall", principle: "Retrieval" },
  { name: "Closed Book", principle: "Retrieval" },
  { name: "Blindfold", principle: "Retrieval" },
  { name: "Feynman Technique", principle: "Feedback" },
  { name: "Self-Explanation", principle: "Feedback" },
  { name: "Rubber Duck", principle: "Feedback" },
  { name: "SRS", principle: "Retention" },
  { name: "Interleaving", principle: "Retention" },
  { name: "Overlearning", principle: "Retention" },
  { name: "Elaborative Interrogation", principle: "Intuition" },
  { name: "Dual Coding", principle: "Intuition" },
  { name: "Analogy Creation", principle: "Intuition" },
  { name: "Anti-Expert", principle: "Experimentation" },
  { name: "Constraint Removal", principle: "Experimentation" },
  { name: "Teach to Learn", principle: "Experimentation" },
] as const;
const CUSTOM_TECHNIQUE_OPTION = "Informar outra técnica";

export function sessionPresentation(state: LoriState): { domain: string; technique: string } {
  const session = state.session;
  if (isMetalearningSession(session)) {
    return {
      domain: state.domainDraft?.name ?? state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain em preparação",
      technique: "Metalearning",
    };
  }
  if (session?.kind === "study") {
    return {
      domain: state.domains.find(({ id }) => id === session.domainId)?.name ?? "Domain",
      technique: session.primaryTechnique,
    };
  }
  return {
    domain: session?.name ?? "",
    technique: session?.primaryTechnique ?? "",
  };
}

export async function promptPrimaryTechnique(ctx: Pick<ExtensionContext, "ui">): Promise<string | undefined> {
  const selected = await ctx.ui.select("Escolher Primary Technique", [
    ...TECHNIQUES.map(({ name, principle }) => `${name} · ${principle}`),
    CUSTOM_TECHNIQUE_OPTION,
  ]);
  const technique = TECHNIQUES.find(({ name, principle }) => `${name} · ${principle}` === selected);
  if (technique !== undefined) return technique.name;
  if (selected !== CUSTOM_TECHNIQUE_OPTION) return undefined;

  const value = await ctx.ui.input("Primary Technique da Session");
  if (value === undefined || value.trim().length === 0) return undefined;
  return value.trim();
}

export function requireReadyState(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
): ReadyState | undefined {
  if (shared.startupError) {
    ctx.ui.notify(shared.startupError, "error");
    return undefined;
  }
  if (!shared.store || !shared.projectDir || !shared.skin) {
    ctx.ui.notify("Lori ainda não foi inicializada nesta sessão.", "warning");
    return undefined;
  }
  return { store: shared.store, projectDir: shared.projectDir, skin: shared.skin };
}

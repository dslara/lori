import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { ActiveDomain, Baseline, DomainDraft, DomainDraftAnswerAction } from "../../../core/domain/domain.types.ts";
import { selectNextDomainDraftField, selectRecommendedStudyTarget, type DomainDraftQuestionField } from "../../../core/domain/selectors.ts";
import { isMetalearningSession, selectCanOpenSession, selectTransitionAt } from "../../../core/session/selectors.ts";
import type { LoriState } from "../../../store/state.ts";
import type { SkinProvider } from "../../../presentation/skin/provider.ts";
import { showStatus } from "../../../effects/ui/ui.ts";
import { renderChapterProposal } from "../lori-curate/curation.ts";
import type { LoriExtensionState, DomainDraftQuestionPrompt } from "./shared.types.ts";
import { acceptDispatchResult, dispatchAndPersist } from "./persistence.ts";
import { promptPrimaryTechnique, sessionPresentation } from "./session.ts";

const BASELINE_OPTIONS = [
  "1 · Começando do zero: não estudei nem usei os conceitos",
  "2 · Reconheço conceitos, mas ainda não consigo aplicá-los",
  "3 · Realizo tarefas básicas com apoio ou consulta",
  "4 · Realizo tarefas comuns com autonomia",
  "5 · Adapto o conhecimento e resolvo casos novos",
] as const;

const DOMAIN_DRAFT_QUESTIONS: Record<DomainDraftQuestionField, DomainDraftQuestionPrompt> = {
  name: {
    title: "Como você quer chamar este Domain?",
    guidance: "Identifica o Domain nas telas e na curadoria. Texto livre, ex.: japonês, React ou álgebra.",
  },
  learningObjective: {
    title: "O que você quer conseguir fazer?",
    guidance: "Informa à curadoria o resultado que você busca. Texto livre, descreva algo observável. Ex.: manter uma conversa básica em japonês.",
  },
  motivation: {
    title: "Por que aprender isso agora?",
    guidance: "Entra como contexto da curadoria. Texto livre, ex.: viagem, trabalho ou projeto pessoal.",
  },
  deadline: {
    title: "Até quando quer alcançar esse objetivo?",
    guidance: "Entra no esforço proposto para o Chapter. Data sugerida: DD/MM/AAAA, ex.: 31/12/2026. Texto livre também é aceito; vazio ou 'sem prazo' = sem prazo.",
  },
  hoursPerWeek: {
    title: "Quanto tempo por semana consegue dedicar?",
    guidance: "Entra no esforço proposto para o Chapter. Número de horas por semana, ex.: 3. Zero também é válido.",
  },
  baseline: {
    title: "Baseline — como avalia seu ponto de partida para este objetivo? (não é um teste)\nEntra como contexto da curadoria. Selecione uma opção de 1 a 5.",
  },
  preferences: {
    title: "Que formatos prefere para aprender?",
    guidance: "Entra no contexto da curadoria; cada recurso declara como considerou suas preferências. Texto livre, ex.: documentação, vídeos, áudio ou exercícios. Vazio = sem preferência.",
  },
  materialRestrictions: {
    title: "Que restrições os materiais precisam respeitar?",
    guidance: "Entra no contexto da curadoria; cada recurso declara como respeita suas restrições. Texto livre, ex.: idioma, custo, acessibilidade ou ferramentas. Vazio = sem restrições.",
  },
};

async function promptDomainDraftAnswer(
  id: string,
  field: DomainDraftQuestionField,
  ctx: Pick<ExtensionContext, "ui">,
): Promise<DomainDraftAnswerAction | undefined> {
  const question = DOMAIN_DRAFT_QUESTIONS[field];
  if (field === "baseline") {
    const selected = await ctx.ui.select(question.title, [...BASELINE_OPTIONS]);
    const index = BASELINE_OPTIONS.indexOf(selected as (typeof BASELINE_OPTIONS)[number]);
    if (index < 0) {
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: (index + 1) as Baseline };
  }

  const response = await ctx.ui.input(question.title, question.guidance);
  if (response === undefined) {
    return undefined;
  }
  const value = response.trim();
  if (field === "hoursPerWeek") {
    const hours = Number(value);
    if (value.length === 0 || !Number.isFinite(hours) || hours < 0) {
      ctx.ui.notify("Informe um número finito de horas por semana (zero também é válido).", "warning");
      return undefined;
    }
    return { type: "domain-draft/answer", id, field, value: hours };
  }
  if (field === "deadline") {
    return {
      type: "domain-draft/answer",
      id,
      field,
      value: value.length === 0 || value.toLocaleLowerCase() === "sem prazo" ? null : value,
    };
  }
  if (field === "preferences" || field === "materialRestrictions") {
    return { type: "domain-draft/answer", id, field, value: value || null };
  }
  if (value.length === 0) {
    ctx.ui.notify("A resposta não pode ficar vazia.", "warning");
    return undefined;
  }
  return { type: "domain-draft/answer", id, field, value };
}

async function promptVerdictScore(
  title: "Focus — informe um número finito" | "Honesty — informe um número finito",
  ctx: Pick<ExtensionContext, "ui">,
): Promise<number | undefined> {
  while (true) {
    const response = await ctx.ui.input(title);
    if (response === undefined) return undefined;
    const value = response.trim();
    const score = Number(value);
    if (value.length > 0 && Number.isFinite(score)) return score;
    ctx.ui.notify("Informe um número finito; não há escala ou limite definido.", "warning");
  }
}

export function activeDomainDraft(domain: ActiveDomain): DomainDraft {
  return {
    id: domain.id,
    phase: "awaiting_curation",
    name: domain.name,
    learningObjective: domain.learningObjective,
    motivation: domain.questionnaire.motivation,
    deadline: domain.questionnaire.deadline,
    hoursPerWeek: domain.questionnaire.hoursPerWeek,
    baseline: domain.questionnaire.baseline,
    preferences: domain.questionnaire.preferences,
    materialRestrictions: domain.questionnaire.materialRestrictions,
  };
}

async function offerRecommendedFirstStudy(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
  closedState: LoriState,
): Promise<void> {
  const closedSession = closedState.session;
  if (closedSession?.kind !== "metalearning" || closedSession.status !== "closed") return;
  const chapterRef = closedSession.verdict.chapterRef;
  const target = selectRecommendedStudyTarget(closedState.domains, chapterRef);
  if (target === undefined) {
    ctx.ui.notify("Lori: o Verdict foi fechado, mas não foi possível localizar o primeiro Node e seu recurso recomendado.", "error");
    return;
  }

  const accepted = await ctx.ui.confirm(
    "Iniciar o primeiro estudo?",
    [
      `Domain: ${target.domain.name}`,
      `Chapter version ${target.chapter.version} (${target.chapter.id})`,
      `Primeiro Node: ${target.node.id} — ${target.node.objective}`,
      `Recurso recomendado: ${target.resource.title} — ${target.resource.url} (${target.resource.id})`,
      "Deseja abrir uma Study Session para este Node?",
    ].join("\n"),
  );
  if (!accepted) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; o Verdict permanece fechado e o Domain continua ativo.", "info");
    return;
  }

  const primaryTechnique = await promptPrimaryTechnique(ctx);
  if (primaryTechnique === undefined) {
    ctx.ui.notify("Nenhuma Study Session foi iniciada; Primary Technique não selecionada.", "info");
    return;
  }

  const result = await dispatchAndPersist(projectDir, (current) => {
    const currentTarget = selectRecommendedStudyTarget(current.domains, chapterRef);
    if (
      current.domainDraft !== null ||
      !selectCanOpenSession(current.session) ||
      currentTarget?.node.id !== target.node.id ||
      currentTarget.resource.id !== target.resource.id
    ) {
      return undefined;
    }
    return {
      type: "session/open-study",
      domainId: target.domain.id,
      chapterRef,
      nodeId: target.node.id,
      resourceId: target.resource.id,
      primaryTechnique,
      startedAt: Date.now(),
    };
  });
  if (!acceptDispatchResult(shared, ctx, result, "Lori: Study Session não iniciada porque não foi possível persistir o snapshot.")) {
    return;
  }
  if (result.status === "unchanged") {
    ctx.ui.notify("Lori: Study Session não iniciada porque o Domain ou Chapter mudou após a confirmação.", "warning");
    return;
  }
  const status = showStatus(ctx, result.state, skin, "session.open");
  ctx.ui.notify(status, "info");
}

export async function continueDomainPreparation(
  shared: LoriExtensionState,
  ctx: Pick<ExtensionContext, "ui">,
  projectDir: string,
  skin: SkinProvider,
): Promise<void> {
  while (true) {
    const latest = await dispatchAndPersist(projectDir, () => undefined);
    if (!acceptDispatchResult(shared, ctx, latest, "Lori: não foi possível ler o snapshot do preparo.")) {
      return;
    }
    const { state } = latest;
    const session = state.session;
    const draft = state.domainDraft;
    if (session?.kind !== "metalearning" || draft === null || session.domainId !== draft.id) {
      ctx.ui.notify("Lori: o preparo do Domain não está disponível no snapshot.", "error");
      return;
    }
    if (session.status !== "open") {
      ctx.ui.notify("Lori: use /lori-resume para continuar o preparo pausado.", "warning");
      return;
    }
    if (draft.phase === "awaiting_curation") {
      const status = showStatus(ctx, state, skin);
      ctx.ui.notify(`${status}\nQuestionário salvo; use /lori-curate para solicitar explicitamente uma proposta. O Domain continua em preparação e ainda não está ativo.`, "info");
      return;
    }
    if (draft.phase === "awaiting_approval") {
      const proposal = draft.pendingChapter;
      if (proposal === undefined) {
        ctx.ui.notify("Lori: a proposta pendente está ausente no snapshot; o Domain continua inativo.", "error");
        return;
      }
      ctx.ui.notify(renderChapterProposal(draft, proposal), "info");
      return;
    }
    if (draft.phase === "awaiting_verdict") {
      const isFocusPending = draft.verdictFocus === undefined;
      const score = await promptVerdictScore(
        isFocusPending ? "Focus — informe um número finito" : "Honesty — informe um número finito",
        ctx,
      );
      if (score === undefined) {
        const paused = await dispatchAndPersist(projectDir, (current) => {
          if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
            return undefined;
          }
          return {
            type: "session/abandon",
            pausedAt: selectTransitionAt(current.session, Date.now()),
          };
        });
        if (!acceptDispatchResult(shared, ctx, paused, "Lori: avaliação não pausada porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (paused.status === "persisted") {
          const status = showStatus(ctx, paused.state, skin, "session.paused");
          const pending = isFocusPending ? "Focus" : "Honesty";
          const savedFocus = isFocusPending ? "" : "Focus já salvo; ";
          ctx.ui.notify(`${status}\n${savedFocus}${pending} ainda não foi enviada; use /lori-resume para continuar.`, "info");
        }
        return;
      }

      if (isFocusPending) {
        const saved = await dispatchAndPersist(projectDir, (current) => {
          if (
            current.session?.kind !== "metalearning" ||
            current.session.status !== "open" ||
            current.domainDraft?.id !== draft.id ||
            current.domainDraft.phase !== "awaiting_verdict" ||
            current.domainDraft.verdictFocus !== undefined
          ) {
            return undefined;
          }
          return { type: "domain-draft/save-verdict-focus", id: draft.id, focus: score };
        });
        if (!acceptDispatchResult(shared, ctx, saved, "Lori: Focus não salvo porque não foi possível persistir o snapshot.")) {
          return;
        }
        if (saved.status === "unchanged") {
          ctx.ui.notify("Lori: Focus não foi salvo porque o preparo mudou.", "warning");
          return;
        }
        continue;
      }

      const closed = await dispatchAndPersist(projectDir, (current) => {
        const currentSession = current.session;
        const currentDraft = current.domainDraft;
        if (
          currentSession?.kind !== "metalearning" ||
          currentSession.status !== "open" ||
          currentSession.domainId !== draft.id ||
          currentDraft?.id !== draft.id ||
          currentDraft.phase !== "awaiting_verdict" ||
          currentDraft.verdictFocus === undefined
        ) {
          return undefined;
        }
        const closedAt = selectTransitionAt(currentSession, Date.now());
        if (!Number.isFinite(closedAt)) return undefined;
        return {
          type: "session/close",
          closedAt,
          focus: currentDraft.verdictFocus,
          honesty: score,
        };
      });
      if (!acceptDispatchResult(shared, ctx, closed, "Lori: Verdict não fechado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (closed.status === "unchanged" || closed.state.session?.kind !== "metalearning" || closed.state.session.status !== "closed") {
        ctx.ui.notify("Lori: Verdict não foi fechado porque a Session ou o Chapter aprovado mudou.", "warning");
        return;
      }
      const status = showStatus(ctx, closed.state, skin);
      ctx.ui.notify(
        `${status}\nVerdict ligado ao Chapter version ${closed.state.session.verdict.chapterRef.chapterVersionId}.`,
        "info",
      );
      await offerRecommendedFirstStudy(shared, ctx, projectDir, skin, closed.state);
      return;
    }

    const field = selectNextDomainDraftField(draft);
    if (field === undefined) {
      ctx.ui.notify("Lori: o questionário não pode avançar porque faltam dados do snapshot.", "error");
      return;
    }
    const answer = await promptDomainDraftAnswer(draft.id, field, ctx);
    if (answer === undefined) {
      const paused = await dispatchAndPersist(projectDir, (current) => {
        if (current.session?.kind !== "metalearning" || current.session.status !== "open") {
          return undefined;
        }
        return {
          type: "session/abandon",
          pausedAt: selectTransitionAt(current.session, Date.now()),
        };
      });
      if (!acceptDispatchResult(shared, ctx, paused, "Lori: preparo não pausado porque não foi possível persistir o snapshot.")) {
        return;
      }
      if (paused.status === "persisted") {
        const status = showStatus(ctx, paused.state, skin, "session.paused");
        ctx.ui.notify(`${status}\nRespostas salvas; use /lori-resume para continuar na próxima pergunta.`, "info");
      }
      return;
    }

    const saved = await dispatchAndPersist(projectDir, (current) => {
      if (
        current.session?.kind !== "metalearning" ||
        current.session.status !== "open" ||
        current.domainDraft?.id !== answer.id ||
        current.domainDraft.phase !== "collecting"
      ) {
        return undefined;
      }
      return answer;
    });
    if (!acceptDispatchResult(shared, ctx, saved, "Lori: resposta não salva porque não foi possível persistir o snapshot.")) {
      return;
    }
    if (saved.status === "unchanged") {
      ctx.ui.notify("Lori: a resposta não foi salva porque o preparo mudou.", "warning");
      return;
    }
  }
}

import type { ChapterVersionReference } from "../domain/types.ts";

export type Verdict = {
  focus: number;
  honesty: number;
  chapterRef?: ChapterVersionReference;
};

export type StudySessionDetails = {
  kind: "legacyStudy";
  name: string;
  primaryTechnique: string;
  startedAt: number;
  totalPausedMs: number;
};

export type MetalearningSessionDetails = {
  kind: "metalearning";
  domainId: string;
  startedAt: number;
  totalPausedMs: number;
  chapterRef?: ChapterVersionReference;
};

export type Session =
  | (StudySessionDetails & { status: "open" })
  | (StudySessionDetails & { status: "paused"; pausedAt: number })
  | (StudySessionDetails & {
      status: "closed";
      closedAt: number;
      pausedAt?: number;
      verdict: Verdict;
    })
  | (MetalearningSessionDetails & { status: "open" })
  | (MetalearningSessionDetails & { status: "paused"; pausedAt: number })
  | (MetalearningSessionDetails & {
      status: "closed";
      closedAt: number;
      pausedAt?: number;
      verdict: Verdict & { chapterRef: ChapterVersionReference };
    });

export type SessionAction =
  | {
      type: "session/open";
      domain: string;
      primaryTechnique: string;
      startedAt: number;
    }
  | {
      type: "session/open-metalearning";
      domainId: string;
      startedAt: number;
    }
  | {
      type: "session/abandon";
      pausedAt: number;
    }
  | {
      type: "session/resume";
      resumedAt: number;
    }
  | {
      type: "session/close";
      closedAt: number;
      focus: number;
      honesty: number;
    };

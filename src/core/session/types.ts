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
};

export type Session =
  | (StudySessionDetails & { status: "open" })
  | (StudySessionDetails & { status: "paused"; pausedAt: number })
  | (StudySessionDetails & {
      status: "closed";
      closedAt: number;
      pausedAt?: number;
      verdict: { focus: number; honesty: number };
    })
  | (MetalearningSessionDetails & { status: "open" })
  | (MetalearningSessionDetails & { status: "paused"; pausedAt: number });

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

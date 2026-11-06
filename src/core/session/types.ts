export type SessionDetails = {
  domain: string;
  primaryTechnique: string;
  startedAt: number;
  totalPausedMs: number;
};

export type Session =
  | (SessionDetails & { status: "open" })
  | (SessionDetails & { status: "paused"; pausedAt: number });

export type SessionAction =
  | {
      type: "session/open";
      domain: string;
      primaryTechnique: string;
      startedAt: number;
    }
  | {
      type: "session/abandon";
      pausedAt: number;
    }
  | {
      type: "session/resume";
      resumedAt: number;
    };

export type CoreEventParameters = {
  "status.idle": { totalXp: number };
  "session.open": { domain: string; technique: string; elapsed: string };
  "session.startRejected": { domain: string; technique: string };
  "session.paused": { domain: string; technique: string; elapsed: string };
  "session.pauseRejected": { domain: string; technique: string };
  "session.resumed": { domain: string; technique: string; elapsed: string };
  "session.resumeRejected": { domain: string; technique: string };
  "session.restored": { domain: string; technique: string; elapsed: string };
  "session.closed": {
    domain: string;
    technique: string;
    elapsed: string;
    focus: number;
    honesty: number;
    xp: number;
  };
  "session.closeRejected": { domain: string; technique: string };
};

export type CoreEvent = keyof CoreEventParameters;
export type SkinConfig = { skin: string };
export type SkinRender = <Event extends CoreEvent>(
  event: Event,
  parameters: CoreEventParameters[Event],
) => string;

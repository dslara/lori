export type Session = {
  status: "open";
  domain: string;
  primaryTechnique: string;
  startedAt: number;
};

export type SessionAction = {
  type: "session/open";
  domain: string;
  primaryTechnique: string;
  startedAt: number;
};

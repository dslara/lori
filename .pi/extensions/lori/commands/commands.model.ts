import { RegisteredCommand } from "@mariozechner/pi-coding-agent";

export const LoriCommand = {
  START: 'lori-start',
  END: 'lori-end',
  PLAN: 'lori-plan',
  STATS: 'lori-stats',
  TIMER: 'lori-timer',
  RETRO: 'lori-retro',
  REVIEW: 'lori-review',
  RITUALS: 'lori-rituals',
  WEAK: 'lori-weak',
  RESOURCES: 'lori-resources',
} as const;

export type LoriCommandType = (typeof LoriCommand)[keyof typeof LoriCommand];

export type LoriCommandRegister = [
  name: LoriCommandType,
  options: Omit<RegisteredCommand, "name" | "sourceInfo">
];

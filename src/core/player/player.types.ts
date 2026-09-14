export type Player = {
  xp: number;
  level: number;
  streak: number;
}

export type PlayerAction = { type: "player/xpAdded"; amount: number };

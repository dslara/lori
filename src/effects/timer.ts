// Stateless timer — derives elapsed from timestamps
export function getElapsedMs(startedAt: number, pausedAt: number | null, totalPaused: number): number {
  const now = Date.now();
  const paused = pausedAt ?? now;
  return paused - startedAt - totalPaused;
}

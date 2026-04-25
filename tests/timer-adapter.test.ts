import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NodeTimerAdapter } from "../.pi/extensions/lori/domain/timer";

describe("NodeTimerAdapter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("onTick receives remaining seconds each tick", () => {
    const timer = new NodeTimerAdapter();
    const ticks: number[] = [];
    timer.onTick((remaining) => ticks.push(remaining));

    timer.start(60);
    expect(ticks).toEqual([60]);

    vi.advanceTimersByTime(1000);
    expect(ticks[ticks.length - 1]).toBe(59);

    vi.advanceTimersByTime(4000);
    expect(ticks[ticks.length - 1]).toBe(55);
  });

  it("counts negative after planned duration (overtime)", () => {
    const timer = new NodeTimerAdapter();
    const ticks: number[] = [];
    timer.onTick((remaining) => ticks.push(remaining));

    timer.start(5);
    vi.advanceTimersByTime(7000);
    expect(ticks[ticks.length - 1]).toBe(-2);
  });

  it("stop halts ticks", () => {
    const timer = new NodeTimerAdapter();
    const ticks: number[] = [];
    timer.onTick((remaining) => ticks.push(remaining));

    timer.start(60);
    vi.advanceTimersByTime(2000);
    timer.stop();
    const countAfterStop = ticks.length;

    vi.advanceTimersByTime(5000);
    expect(ticks.length).toBe(countAfterStop);
  });
});

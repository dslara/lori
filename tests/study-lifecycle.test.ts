import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StudyLifecycle } from "../.pi/extensions/lori/core/study-lifecycle";
import { NodeTimerAdapter } from "../.pi/extensions/lori/domain/timer";
import type { SessionPort, DomainPort } from "../.pi/extensions/lori/core/ports";
import type { ActiveSession, Domain } from "../.pi/extensions/lori/core/types";

class InMemorySessionAdapter implements SessionPort {
  private data: ActiveSession | null = null;

  async start(domainId: string, plannedDurationSec: number): Promise<void> {
    this.data = { domainId, startedAt: new Date().toISOString(), plannedDurationSec };
  }

  async load(): Promise<ActiveSession | null> {
    return this.data;
  }

  async clear(): Promise<void> {
    this.data = null;
  }
}

class InMemoryDomainAdapter implements DomainPort {
  private domains: Domain[] = [];

  async create(name: string): Promise<Domain> {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const d: Domain = { slug, name, createdAt: new Date().toISOString(), totalXP: 0, sessions: 0 };
    this.domains.push(d);
    return d;
  }

  async list(): Promise<Domain[]> {
    return this.domains;
  }

  async get(slug: string): Promise<Domain | null> {
    return this.domains.find((d) => d.slug === slug) ?? null;
  }
}

describe("StudyLifecycle", () => {
  let session: InMemorySessionAdapter;
  let timer: NodeTimerAdapter;
  let domain: InMemoryDomainAdapter;
  let renders: string[];
  let lifecycle: StudyLifecycle;

  beforeEach(() => {
    vi.useFakeTimers();
    session = new InMemorySessionAdapter();
    timer = new NodeTimerAdapter();
    domain = new InMemoryDomainAdapter();
    renders = [];
    lifecycle = new StudyLifecycle(session, timer, domain, (text) => renders.push(text));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts session and timer when idle", async () => {
    await domain.create("Japanese");
    const result = await lifecycle.start();

    expect(result).toEqual({ ok: true });
    expect(await session.load()).not.toBeNull();
    expect(renders.length).toBeGreaterThan(0);
  });

  it("returns active_session when session already active", async () => {
    await domain.create("Japanese");
    await lifecycle.start();
    const result = await lifecycle.start();

    expect(result).toEqual({ ok: false, reason: "active_session" });
  });

  it("returns no_domains when none exist", async () => {
    const result = await lifecycle.start();
    expect(result).toEqual({ ok: false, reason: "no_domains" });
  });

  it("auto-selects single domain", async () => {
    await domain.create("Japanese");
    const result = await lifecycle.start();
    expect(result).toEqual({ ok: true });
    const raw = await session.load();
    expect(raw?.domainId).toBe("japanese");
  });

  it("returns needs_selection when multiple domains", async () => {
    await domain.create("Japanese");
    await domain.create("Rust");
    const result = await lifecycle.start();

    expect(result).toEqual({
      ok: false,
      reason: "needs_selection",
      domains: expect.arrayContaining([
        expect.objectContaining({ slug: "japanese" }),
        expect.objectContaining({ slug: "rust" }),
      ]),
    });
  });

  it("starts with explicit domainId bypassing selection", async () => {
    await domain.create("Japanese");
    await domain.create("Rust");
    const result = await lifecycle.start("rust");

    expect(result).toEqual({ ok: true });
    const raw = await session.load();
    expect(raw?.domainId).toBe("rust");
  });

  it("ends session, stops timer, returns elapsed", async () => {
    await domain.create("Japanese");
    await lifecycle.start();
    vi.advanceTimersByTime(5000);

    const result = await lifecycle.end();

    expect(result).toEqual({ ok: true, elapsedSec: 5, domainId: "japanese", plannedDurationSec: 1500 });
    expect(await session.load()).toBeNull();
  });

  it("returns no_active_session on end when none", async () => {
    const result = await lifecycle.end();
    expect(result).toEqual({ ok: false, reason: "no_active_session" });
  });

  it("reconstructs timer from existing session", async () => {
    await domain.create("Japanese");
    const now = Date.now();
    session["data"] = {
      domainId: "japanese",
      startedAt: new Date(now - 300_000).toISOString(),
      plannedDurationSec: 1500,
    };

    const ok = await lifecycle.reconstruct();
    expect(ok).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(renders[renders.length - 1]).toContain("19:");
  });

  it("reconstruct clears stale session", async () => {
    const stale = new Date(Date.now() - 31 * 60 * 1000).toISOString();
    session["data"] = { domainId: "old", startedAt: stale, plannedDurationSec: 1500 };

    const ok = await lifecycle.reconstruct();
    expect(ok).toBe(false);
    expect(await session.load()).toBeNull();
  });

  it("isActive true for active session", async () => {
    await domain.create("Japanese");
    await lifecycle.start();
    expect(await lifecycle.isActive()).toBe(true);
  });

  it("isActive false when none", async () => {
    expect(await lifecycle.isActive()).toBe(false);
  });

  it("isActive clears stale session", async () => {
    const stale = new Date(Date.now() - 31 * 60 * 1000).toISOString();
    session["data"] = { domainId: "old", startedAt: stale, plannedDurationSec: 1500 };
    expect(await lifecycle.isActive()).toBe(false);
    expect(await session.load()).toBeNull();
  });
});

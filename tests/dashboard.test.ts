import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../.pi/extensions/lori/dashboard";

describe("Dashboard", () => {
  let lifecycleMock: any;
  let uiMock: any;
  let skinMock: any;

  beforeEach(() => {
    lifecycleMock = {
      start: vi.fn().mockResolvedValue({ ok: true }),
      end: vi.fn().mockResolvedValue({ ok: true, elapsedSec: 300, domainId: "japanese", plannedDurationSec: 1500 }),
      reconstruct: vi.fn().mockResolvedValue(true),
      isActive: vi.fn().mockResolvedValue(false),
    };
    uiMock = {
      setWidget: vi.fn(),
      setStatus: vi.fn(),
      notify: vi.fn(),
      select: vi.fn(),
    };
    skinMock = {
      getString: vi.fn((key: string) => `SKIN:${key}`),
      listSkins: vi.fn().mockReturnValue([]),
    };
  });

  it("startSession delegates to lifecycle.start", async () => {
    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.startSession("japanese");

    expect(lifecycleMock.start).toHaveBeenCalledWith("japanese");
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", [""]);
  });

  it("startSession shows error when active_session", async () => {
    lifecycleMock.start.mockResolvedValue({ ok: false, reason: "active_session" });

    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.startSession();

    expect(uiMock.notify).toHaveBeenCalledWith("SKIN:error.active_session", "error");
  });

  it("startSession shows selector when needs_selection", async () => {
    lifecycleMock.start
      .mockResolvedValueOnce({ ok: false, reason: "needs_selection", domains: [{ slug: "rust", name: "Rust" }] })
      .mockResolvedValueOnce({ ok: true });
    uiMock.select.mockResolvedValue("Rust");

    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.startSession();

    expect(uiMock.select).toHaveBeenCalledWith("SKIN:menu.domain_select", ["Rust"]);
    expect(lifecycleMock.start).toHaveBeenLastCalledWith("rust");
  });

  it("endSession delegates to lifecycle.end and clears widget", async () => {
    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    const result = await dashboard.endSession();

    expect(lifecycleMock.end).toHaveBeenCalled();
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", undefined);
    expect(result).toEqual({ elapsedSec: 300, domainId: "japanese", plannedDurationSec: 1500 });
  });

  it("endSession returns null when no active session", async () => {
    lifecycleMock.end.mockResolvedValue({ ok: false, reason: "no_active_session" });

    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    const result = await dashboard.endSession();

    expect(result).toBeNull();
  });

  it("reconstructSession delegates to lifecycle.reconstruct", async () => {
    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.reconstructSession();

    expect(lifecycleMock.reconstruct).toHaveBeenCalled();
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", [""]);
  });

  it("menu shows Start when idle", async () => {
    lifecycleMock.isActive.mockResolvedValue(false);
    uiMock.select.mockResolvedValue("SKIN:menu.start");

    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.showMenu();

    expect(uiMock.select).toHaveBeenCalledWith(
      "SKIN:menu.title",
      expect.arrayContaining(["SKIN:menu.start"])
    );
    expect(uiMock.select).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(["SKIN:menu.end"])
    );
  });

  it("menu shows End when active", async () => {
    lifecycleMock.isActive.mockResolvedValue(true);
    uiMock.select.mockResolvedValue("SKIN:menu.end");

    const dashboard = new Dashboard(lifecycleMock, uiMock, skinMock);
    await dashboard.showMenu();

    expect(uiMock.select).toHaveBeenCalledWith(
      "SKIN:menu.title",
      expect.arrayContaining(["SKIN:menu.end"])
    );
    expect(uiMock.select).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(["SKIN:menu.start"])
    );
  });
});

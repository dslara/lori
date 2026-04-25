import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../.pi/extensions/lori/dashboard";

describe("Dashboard", () => {
  let sessionMock: any;
  let timerMock: any;
  let uiMock: any;
  let domainMock: any;
  let xpMock: any;

  beforeEach(() => {
    sessionMock = {
      start: vi.fn(),
      getActive: vi.fn().mockResolvedValue(null),
      end: vi.fn(),
    };
    let tickCb: ((remaining: number) => void) | null = null;
    timerMock = {
      start: vi.fn((sec: number) => { tickCb?.(sec); }),
      stop: vi.fn(),
      onTick: vi.fn((cb: (remaining: number) => void) => { tickCb = cb; }),
    };
    uiMock = {
      setWidget: vi.fn(),
      setStatus: vi.fn(),
      notify: vi.fn(),
      select: vi.fn(),
    } as any;
    domainMock = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      get: vi.fn(),
    };
    xpMock = {
      loadProfile: vi.fn().mockResolvedValue({ lastDomainId: null }),
      saveProfile: vi.fn(),
    };
  });

  it("starts session with explicit domainId when idle", async () => {
    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession("japanese");

    expect(sessionMock.start).toHaveBeenCalledWith("japanese", 1500);
    expect(timerMock.start).toHaveBeenCalledWith(1500);
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", expect.any(Array));
  });

  it("blocks start when session already active", async () => {
    sessionMock.getActive.mockResolvedValue({ domainId: "rust", startedAt: new Date().toISOString(), plannedDurationSec: 1500 });

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession("japanese");

    expect(sessionMock.start).not.toHaveBeenCalled();
    expect(timerMock.start).not.toHaveBeenCalled();
    expect(uiMock.notify).toHaveBeenCalledWith(expect.stringContaining("ativa"), "error");
  });

  it("ends session and clears widget", async () => {
    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession("japanese");
    await dashboard.endSession();

    expect(sessionMock.end).toHaveBeenCalled();
    expect(timerMock.stop).toHaveBeenCalled();
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", undefined);
  });

  it("reconstructs timer from active session with correct remaining time", async () => {
    const now = Date.now();
    const originalNow = Date.now;
    Date.now = () => now;

    sessionMock.getActive.mockResolvedValue({
      domainId: "japanese",
      startedAt: new Date(now - 300_000).toISOString(),
      plannedDurationSec: 1500,
    });

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.reconstructSession();

    expect(timerMock.start).toHaveBeenCalledWith(1200);
    expect(uiMock.setWidget).toHaveBeenCalledWith("lori-timer", expect.any(Array));

    Date.now = originalNow;
  });

  it("menu shows Start when idle", async () => {
    sessionMock.getActive.mockResolvedValue(null);
    uiMock.select.mockResolvedValue("Iniciar sessão");

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.showMenu();

    expect(uiMock.select).toHaveBeenCalledWith(
      "Lori - O que deseja fazer?",
      expect.arrayContaining(["Iniciar sessão"])
    );
    expect(uiMock.select).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(["Encerrar sessão"])
    );
  });

  it("menu shows End when session active", async () => {
    sessionMock.getActive.mockResolvedValue({
      domainId: "japanese",
      startedAt: new Date().toISOString(),
      plannedDurationSec: 1500,
    });
    uiMock.select.mockResolvedValue("Encerrar sessão");

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.showMenu();

    expect(uiMock.select).toHaveBeenCalledWith(
      "Lori - O que deseja fazer?",
      expect.arrayContaining(["Encerrar sessão"])
    );
    expect(uiMock.select).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(["Iniciar sessão"])
    );
  });

  it("start resolves single domain automatically", async () => {
    domainMock.list.mockResolvedValue([{ slug: "japanese", name: "Japanese" }]);

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession();

    expect(sessionMock.start).toHaveBeenCalledWith("japanese", 1500);
    expect(uiMock.select).not.toHaveBeenCalled();
  });

  it("start shows selector when multiple domains exist", async () => {
    domainMock.list.mockResolvedValue([
      { slug: "japanese", name: "Japanese" },
      { slug: "rust", name: "Rust" },
    ]);
    uiMock.select.mockResolvedValue("Rust");

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession();

    expect(uiMock.select).toHaveBeenCalledWith(
      "Escolha o domínio:",
      ["Japanese", "Rust"]
    );
    expect(sessionMock.start).toHaveBeenCalledWith("rust", 1500);
  });

  it("start errors when no domains exist", async () => {
    domainMock.list.mockResolvedValue([]);

    const dashboard = new Dashboard(sessionMock, timerMock, uiMock, domainMock, xpMock);
    await dashboard.startSession();

    expect(sessionMock.start).not.toHaveBeenCalled();
    expect(uiMock.notify).toHaveBeenCalledWith(expect.stringContaining("domínio"), "error");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "../.pi/extensions/lori/dashboard";

describe("Dashboard", () => {
  let domainMock: any;
  let xpMock: any;
  let uiMock: any;
  let skinMock: any;

  beforeEach(() => {
    domainMock = {
      create: vi.fn().mockResolvedValue({ slug: "japanese", name: "Japanese" }),
      list: vi.fn().mockResolvedValue([{ slug: "japanese", name: "Japanese" }]),
    };
    xpMock = {
      loadProfile: vi.fn().mockResolvedValue({
        version: 1,
        totalXP: 0,
        activeSkin: "default",
        lastDomainId: null,
        domains: {},
        sessionHistory: [],
      }),
      saveProfile: vi.fn().mockResolvedValue(undefined),
    };
    uiMock = {
      setWidget: vi.fn(),
      setStatus: vi.fn(),
      notify: vi.fn(),
      select: vi.fn(),
      input: vi.fn(),
    };
    skinMock = {
      getString: vi.fn((key: string) => `SKIN:${key}`),
      listSkins: vi.fn().mockReturnValue([]),
    };
  });

  it("showMenu delegates to ui.select", async () => {
    uiMock.select.mockResolvedValue("SKIN:menu.record");
    const dashboard = new Dashboard(domainMock, xpMock, uiMock, skinMock);
    const result = await dashboard.showMenu();
    expect(result).toBe("SKIN:menu.record");
    expect(uiMock.select).toHaveBeenCalledWith(
      "SKIN:menu.title",
      expect.arrayContaining(["SKIN:menu.plan", "SKIN:menu.record", "SKIN:menu.skin"])
    );
  });

  it("planDomain creates domain and notifies", async () => {
    uiMock.input.mockResolvedValue("Japanese");
    const dashboard = new Dashboard(domainMock, xpMock, uiMock, skinMock);
    await dashboard.planDomain();
    expect(domainMock.create).toHaveBeenCalledWith("Japanese");
    expect(uiMock.notify).toHaveBeenCalledWith("SKIN:domain.created", "info");
  });

  it("recordSession notifies error when no domains", async () => {
    domainMock.list.mockResolvedValue([]);
    const dashboard = new Dashboard(domainMock, xpMock, uiMock, skinMock);
    await dashboard.recordSession();
    expect(uiMock.notify).toHaveBeenCalledWith("SKIN:error.no_domains", "error");
  });
});

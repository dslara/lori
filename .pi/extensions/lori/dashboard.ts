import type { StudyLifecycle } from "./core/study-lifecycle";
import type { SkinPort } from "./core/ports";

interface UIMock {
  setWidget(key: string, content: string[] | undefined): void;
  setStatus(key: string, text: string | undefined): void;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  select(title: string, options: string[]): Promise<string | undefined>;
}

export class Dashboard {
  constructor(
    private lifecycle: StudyLifecycle,
    private ui: UIMock,
    private skin: SkinPort
  ) {}

  async startSession(domainId?: string): Promise<void> {
    const result = await this.lifecycle.start(domainId);

    if (!result.ok) {
      if (result.reason === "active_session") {
        this.ui.notify(this.skin.getString("error.active_session"), "error");
      } else if (result.reason === "no_domains") {
        this.ui.notify(this.skin.getString("error.no_domains"), "error");
      } else if (result.reason === "needs_selection") {
        const choice = await this.ui.select(
          this.skin.getString("menu.domain_select"),
          result.domains.map((d) => d.name)
        );
        const chosen = result.domains.find((d) => d.name === choice);
        if (chosen) await this.startSession(chosen.slug);
      }
      return;
    }

    this.ui.setWidget("lori-timer", [""]);
  }

  async endSession(): Promise<{
    elapsedSec: number;
    domainId: string;
    plannedDurationSec: number;
  } | null> {
    const result = await this.lifecycle.end();
    if (!result.ok) {
      return null;
    }
    this.ui.setWidget("lori-timer", undefined);
    return {
      elapsedSec: result.elapsedSec,
      domainId: result.domainId,
      plannedDurationSec: result.plannedDurationSec,
    };
  }

  async reconstructSession(): Promise<void> {
    const ok = await this.lifecycle.reconstruct();
    if (ok) this.ui.setWidget("lori-timer", [""]);
  }

  async showMenu(): Promise<string | undefined> {
    const active = await this.lifecycle.isActive();
    const options = active
      ? ["menu.plan", "menu.end", "menu.skin"]
      : ["menu.plan", "menu.start", "menu.skin"];
    return this.ui.select(
      this.skin.getString("menu.title"),
      options.map((k) => this.skin.getString(k))
    );
  }
}

import type { DomainPort, XPPort, SkinPort } from "./core/ports";
import { recordSession } from "./adapters/xp";

interface UIMock {
  setWidget(key: string, content: string[] | undefined): void;
  setStatus(key: string, text: string | undefined): void;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  select(title: string, options: string[]): Promise<string | undefined>;
  input(title: string, placeholder?: string): Promise<string | undefined>;
}

export class Dashboard {
  constructor(
    private domain: DomainPort,
    private xp: XPPort,
    private ui: UIMock,
    private skin: SkinPort
  ) {}

  async showMenu(): Promise<string | undefined> {
    const options = ["menu.plan", "menu.record", "menu.skin"];
    return this.ui.select(
      this.skin.getString("menu.title"),
      options.map((k) => this.skin.getString(k))
    );
  }

  async planDomain(): Promise<void> {
    const name = await this.ui.input(
      this.skin.getString("input.domain_name"),
      this.skin.getString("input.domain_placeholder")
    );
    if (!name) return;
    const domain = await this.domain.create(name);
    this.ui.notify(
      this.skin.getString("domain.created", { name: domain.name }),
      "info"
    );
  }

  async recordSession(): Promise<void> {
    const domains = await this.domain.list();
    if (domains.length === 0) {
      this.ui.notify(this.skin.getString("error.no_domains"), "error");
      return;
    }

    let domainId: string | undefined;
    if (domains.length === 1) {
      domainId = domains[0].slug;
    } else {
      const choice = await this.ui.select(
        this.skin.getString("menu.domain_select"),
        domains.map((d) => d.name)
      );
      const chosen = domains.find((d) => d.name === choice);
      if (!chosen) return;
      domainId = chosen.slug;
    }

    const result = await recordSession(this.xp, domainId);
    this.ui.notify(
      this.skin.getString("xp.gained", { xp: String(result.totalXP) }),
      "info"
    );
  }
}

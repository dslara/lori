import type { SessionPort, TimerPort, DomainPort, XPPort } from "./core/ports";

interface UIMock {
  setWidget(key: string, content: string[] | undefined): void;
  setStatus(key: string, text: string | undefined): void;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  select(title: string, options: string[]): Promise<string | undefined>;
}

function formatRemaining(sec: number): string {
  const sign = sec < 0 ? "-" : "";
  const abs = Math.abs(sec);
  const m = Math.floor(abs / 60).toString().padStart(2, "0");
  const s = (abs % 60).toString().padStart(2, "0");
  return `${sign}${m}:${s}`;
}

export class Dashboard {
  private activeDomainId: string | null = null;

  constructor(
    private session: SessionPort,
    private timer: TimerPort,
    private ui: UIMock,
    private domain: DomainPort,
    private xp: XPPort
  ) {
    this.timer.onTick((remaining) => {
      const text = `${formatRemaining(remaining)} | ${this.activeDomainId ?? ""}`;
      this.ui.setWidget("lori-timer", [text]);
    });
  }

  async startSession(domainId?: string): Promise<void> {
    const active = await this.session.getActive();
    if (active) {
      this.ui.notify("Já existe uma sessão ativa.", "error");
      return;
    }

    let resolvedId = domainId;
    if (!resolvedId) {
      const domains = await this.domain.list();
      if (domains.length === 0) {
        this.ui.notify("Nenhum domínio encontrado. Crie um com /lori plan.", "error");
        return;
      }
      if (domains.length === 1) {
        resolvedId = domains[0].slug;
      } else {
        const choice = await this.ui.select(
          "Escolha o domínio:",
          domains.map((d) => d.name)
        );
        const chosen = domains.find((d) => d.name === choice);
        resolvedId = chosen?.slug;
      }
    }

    if (!resolvedId) return;

    await this.session.start(resolvedId, 1500);
    this.activeDomainId = resolvedId;
    this.timer.start(1500);
  }

  async endSession(): Promise<void> {
    this.timer.stop();
    await this.session.end();
    this.activeDomainId = null;
    this.ui.setWidget("lori-timer", undefined);
  }

  async reconstructSession(): Promise<void> {
    const active = await this.session.getActive();
    if (!active) return;
    const elapsedSec = Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000);
    const remaining = active.plannedDurationSec - elapsedSec;
    this.activeDomainId = active.domainId;
    this.timer.start(remaining);
  }

  async showMenu(): Promise<string | undefined> {
    const active = await this.session.getActive();
    const options = active
      ? ["Planejar domínio", "Encerrar sessão", "Trocar skin"]
      : ["Planejar domínio", "Iniciar sessão", "Trocar skin"];
    return this.ui.select("Lori - O que deseja fazer?", options);
  }
}

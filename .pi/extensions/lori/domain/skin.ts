import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { SkinManifest } from "../core/types";
import type { SkinPort } from "../core/ports";

export class JsonSkinAdapter implements SkinPort {
  private skins = new Map<string, SkinManifest>();
  private activeId: string;

  constructor(private basePath: string, activeId = "minimal") {
    this.activeId = activeId;
    this.scan();
  }

  private scan(): void {
    const skinsDir = join(this.basePath, "skins");
    if (!existsSync(skinsDir)) return;
    const entries = readdirSync(skinsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
      const raw = readFileSync(join(skinsDir, entry.name), "utf-8");
      const manifest = JSON.parse(raw) as SkinManifest;
      this.skins.set(manifest.id, manifest);
    }
  }

  getString(key: string, vars?: Record<string, string>): string {
    const active = this.skins.get(this.activeId);
    const template = active?.strings[key] ?? this.skins.get("minimal")?.strings[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_match, name) => vars[name] ?? `{${name}}`);
  }

  listSkins(): { id: string; name: string }[] {
    return Array.from(this.skins.values()).map((s) => ({ id: s.id, name: s.name }));
  }

  setActive(id: string): void {
    this.activeId = id;
  }

  getActiveId(): string {
    return this.activeId;
  }
}

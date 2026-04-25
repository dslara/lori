import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Domain } from "../core/types";
import type { DomainPort } from "../core/ports";

export class FileDomainAdapter implements DomainPort {
  constructor(private basePath: string) {}

  private domainDir(slug: string): string {
    return join(this.basePath, ".lori", "domains", slug);
  }

  private domainFile(slug: string): string {
    return join(this.domainDir(slug), "domain.json");
  }

  async create(name: string): Promise<Domain> {
    const baseSlug = name.toLowerCase().replace(/\s+/g, "-");
    let slug = baseSlug;
    let counter = 2;
    while (existsSync(this.domainDir(slug))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const domain: Domain = {
      slug,
      name,
      createdAt: new Date().toISOString(),
      totalXP: 0,
      sessions: 0,
    };

    mkdirSync(this.domainDir(slug), { recursive: true });
    writeFileSync(this.domainFile(slug), JSON.stringify(domain, null, 2));

    return domain;
  }

  async list(): Promise<Domain[]> {
    const domainsDir = join(this.basePath, ".lori", "domains");
    if (!existsSync(domainsDir)) return [];

    const entries = readdirSync(domainsDir, { withFileTypes: true });
    const domains: Domain[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const filePath = join(domainsDir, entry.name, "domain.json");
      if (!existsSync(filePath)) continue;
      domains.push(JSON.parse(readFileSync(filePath, "utf-8")));
    }
    return domains;
  }

  async get(slug: string): Promise<Domain | null> {
    const filePath = this.domainFile(slug);
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, "utf-8"));
  }
}

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FileDomainAdapter } from "../.pi/extensions/lori/domain/domain";

describe("FileDomainAdapter", () => {
  let tmpDir: string;
  let adapter: FileDomainAdapter;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "lori-test-"));
    adapter = new FileDomainAdapter(tmpDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a domain with kebab-case slug and persists JSON", async () => {
    const domain = await adapter.create("Japanese");

    expect(domain.slug).toBe("japanese");
    expect(domain.name).toBe("Japanese");

    const filePath = join(tmpDir, ".lori", "domains", "japanese", "domain.json");
    expect(existsSync(filePath)).toBe(true);

    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    expect(raw.slug).toBe("japanese");
    expect(raw.name).toBe("Japanese");
  });

  it("appends incremental suffix when slug collides", async () => {
    await adapter.create("Japanese");
    const d2 = await adapter.create("Japanese");
    const d3 = await adapter.create("Japanese");

    expect(d2.slug).toBe("japanese-2");
    expect(d3.slug).toBe("japanese-3");

    expect(existsSync(join(tmpDir, ".lori", "domains", "japanese-2", "domain.json"))).toBe(true);
    expect(existsSync(join(tmpDir, ".lori", "domains", "japanese-3", "domain.json"))).toBe(true);
  });

  it("lists all persisted domains", async () => {
    await adapter.create("Japanese");
    await adapter.create("Rust");

    const domains = await adapter.list();
    const slugs = domains.map((d) => d.slug).sort();

    expect(slugs).toEqual(["japanese", "rust"]);
  });

  it("returns a domain by slug or null if missing", async () => {
    await adapter.create("Rust");

    const found = await adapter.get("rust");
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Rust");

    const missing = await adapter.get("nonexistent");
    expect(missing).toBeNull();
  });
});

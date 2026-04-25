import type { Domain } from "./types";

export interface DomainPort {
  create(name: string): Promise<Domain>;
  list(): Promise<Domain[]>;
  get(slug: string): Promise<Domain | null>;
}

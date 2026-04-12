/**
 * OpenViking HTTP Client - Shared module for OpenViking API communication.
 *
 * Used by both the plugin (openviking-memory.ts) and tools (context-hybrid.ts).
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const thisFilePath = fileURLToPath(import.meta.url);
const thisFileDir = dirname(thisFilePath);

// ============================================================================
// Types
// ============================================================================

export interface OpenVikingConfig {
  endpoint: string;
  apiKey: string;
  account?: string;
  user?: string;
  enabled: boolean;
  timeoutMs: number;
  autoCommit?: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

export interface OpenVikingResponse<T = unknown> {
  status: string;
  result?: T;
  error?: string | { code?: string; message?: string; details?: Record<string, unknown> };
  time?: number;
  usage?: Record<string, number>;
}

export interface SearchResult {
  memories: any[];
  resources: any[];
  skills: any[];
  total: number;
  query_plan?: string;
}

export type MemoryCounts = number | Record<string, number>;

export function totalMemoriesExtracted(memories?: MemoryCounts): number {
  if (typeof memories === "number") {
    return memories;
  }
  if (!memories || typeof memories !== "object") {
    return 0;
  }
  return Object.entries(memories).reduce((sum, [key, value]) => {
    if (key === "total") {
      return sum;
    }
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

export function totalMemoriesFromResult(result?: { memories_extracted?: MemoryCounts } | null): number {
  return totalMemoriesExtracted(result?.memories_extracted);
}

export interface CommitResult {
  session_id: string;
  status: string;
  memories_extracted?: MemoryCounts;
  active_count_updated?: number;
  archived: boolean;
  task_id?: string;
  message?: string;
  stats?: {
    total_turns?: number;
    contexts_used?: number;
    skills_used?: number;
    memories_extracted?: number;
  };
}

export interface SessionResult {
  session_id: string;
}

export interface TaskResult {
  task_id: string;
  task_type: string;
  status: "pending" | "running" | "completed" | "failed";
  created_at: number;
  updated_at: number;
  resource_id?: string;
  result?: {
    session_id?: string;
    memories_extracted?: MemoryCounts;
    archived?: boolean;
  };
  error?: string | null;
}

export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  body?: any;
  timeoutMs?: number;
  abortSignal?: AbortSignal;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: OpenVikingConfig = {
  endpoint: "http://localhost:1933",
  apiKey: "",
  enabled: true,
  timeoutMs: 30000,
  autoCommit: {
    enabled: true,
    intervalMinutes: 10,
  },
};

let _cachedConfig: OpenVikingConfig | null = null;

export function loadConfig(): OpenVikingConfig {
  if (_cachedConfig) return _cachedConfig;

  const configPath = join(thisFileDir, "..", "plugins", "openviking-config.json");

  try {
    if (existsSync(configPath)) {
      const fileContent = readFileSync(configPath, "utf-8");
      const fileConfig = JSON.parse(fileContent);
      _cachedConfig = {
        ...DEFAULT_CONFIG,
        ...fileConfig,
        autoCommit: fileConfig.autoCommit
          ? { ...DEFAULT_CONFIG.autoCommit, ...fileConfig.autoCommit }
          : DEFAULT_CONFIG.autoCommit
            ? { ...DEFAULT_CONFIG.autoCommit }
            : undefined,
      };
      if (process.env.OPENVIKING_SERVER_API_KEY) {
        _cachedConfig!.apiKey = process.env.OPENVIKING_SERVER_API_KEY;
      }
      if (process.env.OPENVIKING_ACCOUNT) {
        _cachedConfig!.account = process.env.OPENVIKING_ACCOUNT;
      }
      if (process.env.OPENVIKING_USER) {
        _cachedConfig!.user = process.env.OPENVIKING_USER;
      }
      return _cachedConfig!;
    }
  } catch (error) {
    console.warn(`Failed to load OpenViking config from ${configPath}:`, error);
  }

  _cachedConfig = {
    ...DEFAULT_CONFIG,
    autoCommit: DEFAULT_CONFIG.autoCommit
      ? { ...DEFAULT_CONFIG.autoCommit }
      : undefined,
  };
  if (process.env.OPENVIKING_SERVER_API_KEY) {
    _cachedConfig!.apiKey = process.env.OPENVIKING_SERVER_API_KEY;
  }
  if (process.env.OPENVIKING_ACCOUNT) {
    _cachedConfig!.account = process.env.OPENVIKING_ACCOUNT;
  }
  if (process.env.OPENVIKING_USER) {
    _cachedConfig!.user = process.env.OPENVIKING_USER;
  }
  return _cachedConfig;
}

export function clearConfigCache(): void {
  _cachedConfig = null;
}

// ============================================================================
// HTTP Client
// ============================================================================

export async function makeRequest<T = any>(
  config: OpenVikingConfig,
  options: HttpRequestOptions,
): Promise<T> {
  const url = `${config.endpoint}${options.endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    headers["X-API-Key"] = config.apiKey;
  }

  if (config.account) {
    headers["X-OpenViking-Account"] = config.account;
  }

  if (config.user) {
    headers["X-OpenViking-User"] = config.user;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? config.timeoutMs);

  const signal = options.abortSignal
    ? AbortSignal.any([options.abortSignal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      let errorDetails: any = null;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson;
        const rawError = errorJson.error || errorJson.message;
        if (typeof rawError === "string") {
          errorMessage = rawError;
        } else if (rawError && typeof rawError === "object") {
          errorMessage = JSON.stringify(rawError);
        } else {
          errorMessage = errorText;
        }
      } catch {
        errorMessage = errorText;
      }

      switch (response.status) {
        case 401:
        case 403:
          throw new Error(`Authentication/Authorization failed (${response.status}). Check API key and permissions. Details: ${errorMessage}`);
        case 422:
          const validationErrors = errorDetails?.detail ? JSON.stringify(errorDetails.detail) : "";
          throw new Error(`Validation error (422): ${errorMessage}${validationErrors ? `. Details: ${validationErrors}` : ""}`);
        case 404:
          throw new Error(`Resource not found: ${options.endpoint}`);
        case 500:
          throw new Error(`OpenViking server error: ${errorMessage}`);
        default:
          throw new Error(`Request failed (${response.status}): ${errorMessage}`);
      }
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${options.timeoutMs ?? config.timeoutMs}ms`);
    }

    if (error.message?.includes("fetch failed") || error.code === "ECONNREFUSED") {
      throw new Error(
        `OpenViking service unavailable at ${config.endpoint}. Is the service running?`,
      );
    }

    throw error;
  }
}

// ============================================================================
// Response Helpers
// ============================================================================

export function getResponseErrorMessage(error: OpenVikingResponse["error"]): string {
  if (!error) return "Unknown OpenViking error";
  if (typeof error === "string") return error;
  return error.message || error.code || "Unknown OpenViking error";
}

export function unwrapResponse<T>(response: OpenVikingResponse<T>): T {
  if (!response || typeof response !== "object") {
    throw new Error("OpenViking returned an invalid response");
  }
  if (response.status && response.status !== "ok") {
    throw new Error(getResponseErrorMessage(response.error));
  }
  return response.result as T;
}

// ============================================================================
// Health Check
// ============================================================================

export async function checkServiceHealth(config?: OpenVikingConfig): Promise<boolean> {
  const cfg = config ?? loadConfig();
  try {
    const response = await fetch(`${cfg.endpoint}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

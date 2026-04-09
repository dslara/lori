/**
 * OpenViking Utilities
 *
 * Dynamic discovery of agent ID and URIs for OpenViking integration.
 * Uses the shared HTTP client to discover agent IDs from the OpenViking server.
 */

import { loadConfig, makeRequest, unwrapResponse, checkServiceHealth } from "./openviking-client.js";
import type { OpenVikingResponse } from "./openviking-client.js";

// Cache do ID do agente (descoberto uma vez por sessão)
let cachedAgentId: string | null = null;
let cachedAgentIdTimestamp: number = 0;
const AGENT_ID_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Descobre o ID do agente dinamicamente via API OpenViking.
 *
 * O ID é gerado automaticamente pelo OpenViking e pode
 * mudar entre instalações. Esta função descobre o ID
 * fazendo uma chamada HTTP para o servidor.
 *
 * @returns O ID do agente (descoberto dinamicamente)
 */
export async function getAgentId(): Promise<string> {
  const now = Date.now();

  // Retornar do cache se válido
  if (cachedAgentId && (now - cachedAgentIdTimestamp) < AGENT_ID_CACHE_TTL) {
    return cachedAgentId;
  }

  try {
    const config = loadConfig();
    if (!config.enabled) {
      cachedAgentId = process.env.OPENVIKING_AGENT_ID || "default";
      cachedAgentIdTimestamp = now;
      return cachedAgentId;
    }

    const response = await makeRequest<OpenVikingResponse<any>>(config, {
      method: "GET",
      endpoint: "/api/v1/fs/ls?uri=viking://agent&simple=true",
      timeoutMs: 5000,
    });
    const result = unwrapResponse(response) ?? [];

    // Result is array of URI strings like ["viking://agent/<agentId>"]
    if (Array.isArray(result) && result.length > 0) {
      const uri = result[0];
      if (typeof uri === "string") {
        // Extract ID from URI like "viking://agent/<agentId>"
        const parts = uri.replace(/\/$/, "").split("/");
        const agentId = parts[parts.length - 1];
        if (agentId && agentId !== "agent") {
          cachedAgentId = agentId;
          cachedAgentIdTimestamp = now;
          return cachedAgentId;
        }
      }
    }
  } catch {
    // Descoberta falhou, usar fallback
  }

  // Fallback: tentar env var ou "default"
  cachedAgentId = process.env.OPENVIKING_AGENT_ID || "default";
  cachedAgentIdTimestamp = now;
  return cachedAgentId;
}

/**
 * Retorna a URI base do agente para memórias.
 *
 * @returns URI base (ex: "viking://agent/<agentId>/memories/")
 *
 * @example
 * const uri = await getAgentBaseUri();
 * // Returns: "viking://agent/<agentId>/memories/"
 *
 * // Usar para buscar patterns
 * const patterns = await memsearch({
 *   query: "padrões",
 *   target_uri: `${uri}patterns/`
 * });
 */
export async function getAgentBaseUri(): Promise<string> {
  const agentId = await getAgentId();
  return `viking://agent/${agentId}/memories/`;
}

/**
 * Limpa o cache do ID do agente.
 *
 * Útil após reinstalação do OpenViking ou quando
 * o ID pode ter mudado.
 */
export function clearAgentIdCache(): void {
  cachedAgentId = null;
  cachedAgentIdTimestamp = 0;
}

/**
 * Retorna a URI completa para um tipo de memória do agente.
 *
 * @param memoryType - Tipo de memória: 'cases', 'patterns', 'skills', 'tools'
 * @returns URI completa (ex: "viking://agent/<agentId>/memories/patterns/")
 *
 * @example
 * const patternsUri = await getAgentMemoryUri('patterns');
 * const casesUri = await getAgentMemoryUri('cases');
 */
export async function getAgentMemoryUri(memoryType: 'cases' | 'patterns' | 'skills' | 'tools'): Promise<string> {
  const baseUri = await getAgentBaseUri();
  return `${baseUri}${memoryType}/`;
}

/**
 * Retorna a URI para preferências do usuário.
 *
 * @returns URI (ex: "viking://user/default/memories/preferences/")
 */
export function getUserPreferencesUri(): string {
  return "viking://user/default/memories/preferences/";
}

/**
 * Retorna a URI para entidades do usuário.
 *
 * @returns URI (ex: "viking://user/default/memories/entities/")
 */
export function getUserEntitiesUri(): string {
  return "viking://user/default/memories/entities/";
}

/**
 * Retorna a URI para eventos do usuário.
 *
 * @returns URI (ex: "viking://user/default/memories/events/")
 */
export function getUserEventsUri(): string {
  return "viking://user/default/memories/events/";
}

/**
 * Verifica se o OpenViking está disponível.
 *
 * @returns true se OpenViking estiver acessível
 */
export async function isOpenVikingAvailable(): Promise<boolean> {
  try {
    const config = loadConfig();
    if (!config.enabled) return false;
    return await checkServiceHealth(config);
  } catch {
    return false;
  }
}

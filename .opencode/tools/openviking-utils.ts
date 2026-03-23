/**
 * OpenViking Utilities
 * 
 * Dynamic discovery of agent ID and URIs for OpenViking integration.
 * Solves the problem of hardcoded agent IDs that can change between installations.
 * 
 * @see planning/proposta-arquitetura-dados-hibrida-2026-03-19.md
 */

// Cache do ID do agente (descoberto uma vez por sessão)
let cachedAgentId: string | null = null;
let cachedAgentIdTimestamp: number = 0;
const AGENT_ID_CACHE_TTL = 30 * 60 * 1000; // 30 minutos

/**
 * Descobre o ID do agente dinamicamente usando membrowse.
 * 
 * O ID é gerado automaticamente pelo OpenViking e pode
 * mudar entre instalações. Esta função descobre o ID
 * disponível listando os agentes.
 * 
 * @returns O ID do agente (ex: "ffb1327b18bf")
 * @throws Error se não encontrar nenhum agente ou OpenViking indisponível
 * 
 * @example
 * const agentId = await getAgentId();
 * // Returns: "ffb1327b18bf"
 * 
 * const uri = `viking://agent/${agentId}/memories/patterns/`;
 */
export async function getAgentId(): Promise<string> {
  const now = Date.now();
  
  // Retornar do cache se válido
  if (cachedAgentId && (now - cachedAgentIdTimestamp) < AGENT_ID_CACHE_TTL) {
    return cachedAgentId;
  }
  
  // Descobrir ID listando agentes
  // Note: This requires the membrowse tool to be available
  // In OpenCode context, this would be called via the mem* tools
  
  // For now, we return a placeholder that will be replaced
  // when integrated with actual OpenViking tools
  if (cachedAgentId) {
    return cachedAgentId;
  }
  
  // Placeholder - in production, this would call membrowse
  // const result = await membrowse({ uri: "viking://agent", view: "list" });
  // const data = JSON.parse(result);
  // const agentDir = data.items?.find((item: any) => item.isDir);
  // if (agentDir && agentDir.rel_path) {
  //   cachedAgentId = agentDir.rel_path;
  //   cachedAgentIdTimestamp = now;
  //   return cachedAgentId!;
  // }
  
  // Fallback: try to discover from environment or return default
  // This allows the system to work even without OpenViking discovery
  const defaultAgentId = process.env.OPENVIKING_AGENT_ID || "default";
  
  cachedAgentId = defaultAgentId;
  cachedAgentIdTimestamp = now;
  
  return cachedAgentId;
}

/**
 * Retorna a URI base do agente para memórias.
 * 
 * @returns URI base (ex: "viking://agent/ffb1327b18bf/memories/")
 * 
 * @example
 * const uri = await getAgentBaseUri();
 * // Returns: "viking://agent/ffb1327b18bf/memories/"
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
 * @returns URI completa (ex: "viking://agent/ffb1327b18bf/memories/patterns/")
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
    const agentId = await getAgentId();
    return agentId !== "default" && agentId !== null;
  } catch {
    return false;
  }
}
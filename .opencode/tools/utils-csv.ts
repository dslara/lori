import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { readFile, writeFile, access, mkdir } from "fs/promises";

// === CSV HEADERS ===
export const CSV_HEADERS = {
  users: ["id", "username", "email", "timezone", "created_at", "preferences"],
  modules: ["id", "user_id", "name", "is_active", "status", "started_at", "completed_at", "total_hours"],
  sessions: ["id", "user_id", "module_id", "date", "duration_min", "focus_score", "notes"],
  sessionSkills: ["session_id", "skill", "duration_min", "topic", "notes", "success_rating"],
  flashcards: ["id", "user_id", "module_id", "front", "back", "category", "created_at", "tags", "next_review", "interval", "easiness", "reviews"],
  reviews: ["flashcard_id", "reviewed_at", "quality", "next_review"],
  insights: ["date", "user_id", "metric", "value", "module_id"],
  goals: ["id", "user_id", "module_id", "description", "target_date", "status", "progress"],
  tutorInteractions: ["id", "session_id", "skill", "topic", "user_message", "user_response", "tutor_response", "timestamp", "metadata"]
};

// === CACHE GLOBAL ===
const globalCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function getCacheKey(prefix: string, operation: string, ...params: string[]): string {
  return `${prefix}:${operation}:${params.join(":")}`;
}

export function getFromCache<T>(key: string, ttl: number = DEFAULT_CACHE_TTL): T | null {
  const cached = globalCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }
  globalCache.delete(key);
  return null;
}

export function setCache<T>(key: string, data: T): void {
  globalCache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  globalCache.clear();
}

// === CSV HELPERS ===
export async function readCSV<T>(filePath: string): Promise<T[]> {
  try {
    await access(filePath);
    const content = await readFile(filePath, "utf-8");
    if (!content.trim()) return [];
    
    return parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as T[];
  } catch {
    return [];
  }
}

export async function writeCSV<T extends Record<string, any>>(
  filePath: string, 
  headers: string[], 
  records: T[]
): Promise<void> {
  const csv = stringify(records, { header: true, columns: headers });
  await writeFile(filePath, csv, "utf-8");
}

export async function initCSVDir(dataDir: string): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  
  const files = [
    { name: "users.csv", headers: CSV_HEADERS.users },
    { name: "modules.csv", headers: CSV_HEADERS.modules },
    { name: "sessions.csv", headers: CSV_HEADERS.sessions },
    { name: "session_skills.csv", headers: CSV_HEADERS.sessionSkills },
    { name: "flashcards.csv", headers: CSV_HEADERS.flashcards },
    { name: "reviews.csv", headers: CSV_HEADERS.reviews },
    { name: "insights.csv", headers: CSV_HEADERS.insights },
    { name: "goals.csv", headers: CSV_HEADERS.goals },
    { name: "tutor_interactions.csv", headers: CSV_HEADERS.tutorInteractions }
  ];
  
  for (const file of files) {
    const filePath = `${dataDir}/${file.name}`;
    try {
      await access(filePath);
    } catch {
      await writeCSV(filePath, file.headers, []);
    }
  }
}

// === GENERAL HELPERS ===
export function getUserId(): string {
  return process.env.USER || "dani";
}

export function sanitize(text: string, maxLength: number): string {
  return text
    .replace(/\n/g, " ")
    .replace(/"/g, '""')
    .substring(0, maxLength);
}

export function parseMetadata(metadataStr: string): any {
  try {
    let metaStr = metadataStr || "{}";
    // Handle quoted JSON strings from CSV
    if (metaStr.startsWith('"') && metaStr.endsWith('"')) {
      metaStr = metaStr.slice(1, -1);
    }
    return JSON.parse(metaStr);
  } catch {
    return {};
  }
}

// === TUTOR LOGGING (Built-in) ===
export async function logTutorInteraction(
  dataDir: string,
  sessionId: string,
  skill: string,
  topic: string,
  userMessage: string,
  userResponse: string = "",
  tutorResponse: string = "",
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const { format } = await import("date-fns");
    const timestamp = new Date().toISOString();
    const interactionId = `I${format(new Date(), "yyyyMMddHHmmss")}`;
    
    const interaction = {
      id: interactionId,
      session_id: sessionId,
      skill: skill,
      topic: sanitize(topic, 100),
      user_message: sanitize(userMessage, 200),
      user_response: sanitize(userResponse, 200),
      tutor_response: sanitize(tutorResponse, 500),
      timestamp,
      metadata: JSON.stringify(metadata)
    };
    
    const interactions = await readCSV<Record<string, string>>(`${dataDir}/tutor_interactions.csv`);
    interactions.push(interaction);
    await writeCSV(`${dataDir}/tutor_interactions.csv`, CSV_HEADERS.tutorInteractions, interactions);
  } catch (error) {
    // Silently fail - logging should not break main functionality
    console.error("Failed to log interaction:", error);
  }
}

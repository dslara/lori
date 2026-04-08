import { format } from "date-fns";
import { join } from "path";
import { readCSV, writeCSV, getUserId, CSV_HEADERS } from "./utils-csv.js";
import type { Session } from "./model-types.js";

export async function createSession(
  dataDir: string,
  args: {
    moduleId: string;
    duration?: number;
    focusScore?: number;
    notes?: string;
  }
): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  const sessionId = `${today}-${format(new Date(), "HHmmss")}`;
  const session: Session = {
    id: sessionId,
    user_id: userId,
    module_id: args.moduleId,
    date: today,
    duration_min: String(args.duration || 0),
    focus_score: String(args.focusScore || 0),
    notes: (args.notes || "").substring(0, 200)
  };
  
  const sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
  sessions.push(session);
  await writeCSV(join(dataDir, "sessions.csv"), CSV_HEADERS.sessions, sessions);
  
  return JSON.stringify({
    success: true,
    data: { sessionId, timestamp: new Date().toISOString() }
  });
}

export async function getSessions(
  dataDir: string,
  args: {
    filterModuleId?: string;
    limit?: number;
  }
): Promise<string> {
  const userId = getUserId();
  
  let sessions = await readCSV<Session>(join(dataDir, "sessions.csv"));
  sessions = sessions.filter(s => s.user_id === userId);
  
  if (args.filterModuleId) {
    sessions = sessions.filter(s => s.module_id === args.filterModuleId);
  }
  
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (args.limit) {
    sessions = sessions.slice(0, args.limit);
  }
  
  return JSON.stringify({
    success: true,
    data: { sessions, count: sessions.length }
  });
}

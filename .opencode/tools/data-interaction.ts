import { join } from "path";
import { readCSV, writeCSV, CSV_HEADERS } from "./utils-csv.js";
import type { Interaction } from "./model-types.js";

export async function createInteraction(
  dataDir: string,
  args: {
    sessionId?: string;
    skill?: string;
    topic?: string;
    userMessage?: string;
    userResponse?: string;
    tutorResponse?: string;
    metadata?: Record<string, any>;
  }
): Promise<string> {
  const interactionId = `I${Date.now()}`;
  const interaction: Interaction = {
    id: interactionId,
    session_id: args.sessionId || "",
    skill: args.skill || "",
    topic: args.topic || "",
    user_message: args.userMessage || "",
    user_response: args.userResponse || "",
    tutor_response: args.tutorResponse || "",
    timestamp: new Date().toISOString(),
    metadata: JSON.stringify(args.metadata || {})
  };
  
  const interactions = await readCSV<Interaction>(join(dataDir, "tutor_interactions.csv"));
  interactions.push(interaction);
  await writeCSV(join(dataDir, "tutor_interactions.csv"), CSV_HEADERS.tutorInteractions, interactions);
  
  return JSON.stringify({
    success: true,
    data: { interactionId }
  });
}

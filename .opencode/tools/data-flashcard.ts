import { format } from "date-fns";
import { join } from "path";
import { readCSV, writeCSV, getUserId, CSV_HEADERS, logTutorInteraction } from "./utils-csv.js";
import type { Flashcard, Review } from "./model-types.js";

export async function createFlashcard(
  dataDir: string,
  args: {
    moduleId?: string;
    front: string;
    back: string;
    category?: string;
    tags?: string[];
  }
): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  const flashcardId = `F${Date.now()}`;
  const flashcard: Flashcard = {
    id: flashcardId,
    user_id: userId,
    module_id: args.moduleId || "",
    front: args.front,
    back: args.back,
    category: args.category || "general",
    created_at: today,
    tags: (args.tags || []).join(","),
    next_review: today,
    interval: "1",
    easiness: "2.5",
    reviews: "0"
  };
  
  const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
  flashcards.push(flashcard);
  await writeCSV(join(dataDir, "flashcards.csv"), CSV_HEADERS.flashcards, flashcards);
  
  await logTutorInteraction(
    dataDir,
    "system",
    "srs-generator",
    args.category || "general",
    "createFlashcard",
    args.front,
    "Flashcard created",
    { flashcardId, category: args.category }
  );
  
  return JSON.stringify({
    success: true,
    data: { flashcardId, front: args.front }
  });
}

export async function getFlashcards(dataDir: string): Promise<string> {
  const userId = getUserId();
  const today = format(new Date(), "yyyy-MM-dd");
  
  let flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
  flashcards = flashcards.filter(f => f.user_id === userId);
  
  const pending = flashcards.filter(f => f.next_review <= today);
  
  return JSON.stringify({
    success: true,
    data: { 
      flashcards: pending,
      count: pending.length,
      total: flashcards.length
    }
  });
}

export async function createReview(
  dataDir: string,
  args: {
    flashcardId: string;
    quality: number;
  }
): Promise<string> {
  const flashcards = await readCSV<Flashcard>(join(dataDir, "flashcards.csv"));
  const flashcard = flashcards.find(f => f.id === args.flashcardId);
  
  if (!flashcard) {
    return JSON.stringify({ success: false, error: "FLASHCARD_NOT_FOUND", message: `Flashcard ${args.flashcardId} not found` });
  }
  
  let interval = parseFloat(flashcard.interval);
  let easiness = parseFloat(flashcard.easiness);
  let reviews = parseInt(flashcard.reviews);
  const quality = args.quality;
  
  easiness = Math.max(1.3, easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  if (quality < 3) {
    interval = 1;
  } else {
    interval = reviews === 0 ? 1 : reviews === 1 ? 6 : Math.round(interval * easiness);
  }
  
  reviews += 1;
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  
  flashcard.interval = String(interval);
  flashcard.easiness = String(easiness);
  flashcard.reviews = String(reviews);
  flashcard.next_review = format(nextReview, "yyyy-MM-dd");
  
  await writeCSV(join(dataDir, "flashcards.csv"), CSV_HEADERS.flashcards, flashcards);
  
  const review: Review = {
    flashcard_id: args.flashcardId,
    reviewed_at: new Date().toISOString(),
    quality: String(quality),
    next_review: flashcard.next_review
  };
  
  const reviewsList = await readCSV<Review>(join(dataDir, "reviews.csv"));
  reviewsList.push(review);
  await writeCSV(join(dataDir, "reviews.csv"), CSV_HEADERS.reviews, reviewsList);
  
  await logTutorInteraction(
    dataDir,
    "system",
    "srs-generator",
    "review",
    "createReview",
    `Quality: ${quality}`,
    `Next review in ${interval} days`,
    { flashcardId: args.flashcardId, quality, interval }
  );
  
  return JSON.stringify({
    success: true,
    data: { 
      flashcardId: args.flashcardId, 
      quality,
      nextReview: flashcard.next_review,
      interval
    }
  });
}

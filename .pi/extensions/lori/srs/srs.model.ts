/**
 * SRS flashcard model
 */

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  module: string;
  createdAt: number;
  interval: number; // days
  repetitions: number;
  easeFactor: number;
  nextReview: number; // timestamp
  lastReviewed?: number;
  history: { date: number; quality: number }[];
}

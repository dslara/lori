// Model types for Ultralearning System CSV data
// All fields use snake_case to match CSV column names

export interface User {
  id: string;
  username: string;
  email: string;
  timezone: string;
  created_at: string;
  preferences_source: string;
}

export interface Module {
  id: string;
  user_id: string;
  name: string;
  is_active: string;
  status: string;
  started_at: string;
  completed_at: string;
  total_hours: string;
}

export interface Session {
  id: string;
  user_id: string;
  module_id: string;
  date: string;
  duration_min: string;
  focus_score: string;
  notes: string;
}

export interface SessionSkill {
  session_id: string;
  skill: string;
  duration_min: string;
  topic: string;
  notes: string;
  success_rating: string;
  correct?: string; // "true" or "false", derived from success_rating >= 6
}

export interface Flashcard {
  id: string;
  user_id: string;
  module_id: string;
  front: string;
  back: string;
  category: string;
  created_at: string;
  tags: string;
  next_review: string;
  interval: string;
  easiness: string;
  reviews: string;
}

export interface Review {
  flashcard_id: string;
  reviewed_at: string;
  quality: string;
  next_review: string;
}

export interface Insight {
  date: string;
  user_id: string;
  metric: string;
  value: string;
  module_id: string;
}

export interface Goal {
  id: string;
  user_id: string;
  module_id: string;
  description: string;
  target_date: string;
  status: string;
  progress: string;
}

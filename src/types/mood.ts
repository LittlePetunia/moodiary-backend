export type MoodValue = 'sad' | 'neutral' | 'happy';

export interface MoodEntry {
  id: string;
  user_id: string | null;
  date_iso: string; // YYYY-MM-DD
  mood: MoodValue;
  note?: string | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

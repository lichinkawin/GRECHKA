export interface Word {
  rank: number;
  greek: string;
  transcription: string;
  russian_translation: string;
}

export interface Phrase {
  id: number;
  category: string;
  subcategory: string;
  el: string;
  transcription: string;
  ru: string;
}

export type SwipeDirection = 'left' | 'right' | null;

export interface UserProgress {
  known: number[];
  review: number[];
  lastSession: string;
}

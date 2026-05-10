import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { words } from '@/data/words';
import type { Word } from '@/types';
import { useAppStore } from './appStore';

interface WordStore {
  words: Word[];
  known: number[];
  review: number[];
  errorCount: Record<number, number>;
  currentIndex: number;
  activeRange: [number, number];
  activeFilter: string | null;
  setRange: (range: [number, number], filter?: string | null) => void;
  markKnown: (rank: number) => void;
  markReview: (rank: number) => void;
  markError: (rank: number) => void;
  nextCard: () => void;
  resetProgress: () => void;
}

// Priority queue: review words first, then by rank, filtered by range/filter
const buildQueue = (words: Word[], review: number[], range: [number, number], filter: string | null): Word[] => {
  let filtered = words.filter(w => w.rank >= range[0] && w.rank <= range[1]);
  if (filter === '⭐ Избранное') {
    const favs = useAppStore.getState().favoriteWords;
    filtered = words.filter(w => favs.includes(w.rank));
  } else if (filter) {
    filtered = filtered.filter(w => (w as any).category === filter);
  }
  const reviewSet = new Set(review);
  const reviewWords = filtered.filter((w) => reviewSet.has(w.rank));
  const newWords = filtered.filter((w) => !reviewSet.has(w.rank));
  return [...reviewWords, ...newWords];
};

export const useWordStore = create<WordStore>()(
  persist(
    (set, get) => ({
      words: buildQueue(words, [], [1, 100], null),
      known: [],
      review: [],
      errorCount: {},
      currentIndex: 0,
      activeRange: [1, 100],
      activeFilter: null,

      setRange: (range, filter = null) => {
        set({ 
          activeRange: range, 
          activeFilter: filter,
          currentIndex: 0,
          words: buildQueue(words, get().review, range, filter)
        });
      },

      markKnown: (rank) => {
        set((state) => {
          const newKnown = [...new Set([...state.known, rank])];
          const newReview = state.review.filter((r) => r !== rank);
          return {
            known: newKnown,
            review: newReview,
            currentIndex: state.currentIndex + 1,
          };
        });
      },

      markReview: (rank) => {
        set((state) => {
          const newReview = [...new Set([...state.review, rank])];
          const currentCount = state.errorCount[rank] || 0;
          return {
            review: newReview,
            errorCount: { ...state.errorCount, [rank]: currentCount + 1 },
            currentIndex: state.currentIndex + 1,
          };
        });
      },

      markError: (rank) => {
        set((state) => {
          const currentCount = state.errorCount[rank] || 0;
          return {
            errorCount: { ...state.errorCount, [rank]: currentCount + 1 },
          };
        });
      },

      nextCard: () => {
        set((state) => ({ currentIndex: state.currentIndex + 1 }));
      },

      resetProgress: () => {
        set({ known: [], review: [], currentIndex: 0 });
      },
    }),
    {
      name: 'grechka_word_progress',
      partialize: (state) => ({
        known: state.known,
        review: state.review,
        errorCount: state.errorCount,
        currentIndex: state.currentIndex,
      }),
    }
  )
);

// Derived selectors
export const useCurrentWord = (): Word | null => {
  const { words, known, currentIndex } = useWordStore();
  const knownSet = new Set(known);
  const unseenWords = words.filter((w) => !knownSet.has(w.rank));
  return unseenWords[currentIndex % (unseenWords.length || 1)] ?? null;
};

export const useProgress = () => {
  const { known, words } = useWordStore();
  return {
    known: known.length,
    total: words.length,
    percentage: Math.round((known.length / words.length) * 100),
  };
};

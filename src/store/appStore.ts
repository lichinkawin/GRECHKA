import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tab = 'home' | 'explore' | 'phrases' | 'exercises' | 'progress' | 'session';

interface AppStore {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
  isTelegramEnv: boolean;
  setTelegramEnv: (val: boolean) => void;
  favoriteWords: number[];
  favoritePhrases: number[];
  toggleFavoriteWord: (id: number) => void;
  toggleFavoritePhrase: (id: number) => void;
  streak: number;
  xp: number;
  dailyGoalProgress: number;
  lastActiveDate: string | null;
  sessionMode: 'words' | 'phrases';
  sessionCategory: string | null;
  phrasesProgress: {
    known: number[];
    errorCount: Record<number, number>;
  };
  setSessionMode: (mode: 'words' | 'phrases') => void;
  setSessionCategory: (cat: string | null) => void;
  markPhraseKnown: (id: number) => void;
  markPhraseError: (id: number) => void;
  addXp: (amount: number) => void;
  incrementDailyGoal: () => void;
  checkStreak: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      activeTab: 'home',
      setTab: (tab) => set({ activeTab: tab }),
      isTelegramEnv: false,
      setTelegramEnv: (val) => set({ isTelegramEnv: val }),
      favoriteWords: [],
      favoritePhrases: [],
      toggleFavoriteWord: (id) => set((state) => ({
        favoriteWords: state.favoriteWords.includes(id) 
          ? state.favoriteWords.filter(wId => wId !== id)
          : [...state.favoriteWords, id]
      })),
      toggleFavoritePhrase: (id) => set((state) => ({
        favoritePhrases: state.favoritePhrases.includes(id)
          ? state.favoritePhrases.filter(pId => pId !== id)
          : [...state.favoritePhrases, id]
      })),
      streak: 0,
      xp: 0,
      dailyGoalProgress: 0,
      lastActiveDate: null,
      sessionMode: 'words',
      sessionCategory: null,
      phrasesProgress: { known: [], errorCount: {} },
      
      setSessionMode: (mode) => set({ sessionMode: mode }),
      setSessionCategory: (cat) => set({ sessionCategory: cat }),
      
      markPhraseKnown: (id) => set((state) => ({
        phrasesProgress: {
          ...state.phrasesProgress,
          known: [...new Set([...state.phrasesProgress.known, id])]
        }
      })),

      markPhraseError: (id) => set((state) => {
        const currentCount = state.phrasesProgress.errorCount[id] || 0;
        return {
          phrasesProgress: {
            ...state.phrasesProgress,
            errorCount: { ...state.phrasesProgress.errorCount, [id]: currentCount + 1 }
          }
        };
      }),

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      incrementDailyGoal: () => set((state) => ({ dailyGoalProgress: state.dailyGoalProgress + 1 })),
      checkStreak: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        if (!state.lastActiveDate) {
          return { lastActiveDate: today, streak: 1, dailyGoalProgress: 0 };
        }
        if (state.lastActiveDate === today) {
          return state; // Already active today
        }
        const lastDate = new Date(state.lastActiveDate);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          return { lastActiveDate: today, streak: state.streak + 1, dailyGoalProgress: 0 };
        } else {
          return { lastActiveDate: today, streak: 1, dailyGoalProgress: 0 };
        }
      }),
    }),
    {
      name: 'grechka_app_settings',
      partialize: (state) => ({
        favoriteWords: state.favoriteWords,
        favoritePhrases: state.favoritePhrases,
        streak: state.streak,
        xp: state.xp,
        dailyGoalProgress: state.dailyGoalProgress,
        lastActiveDate: state.lastActiveDate,
        phrasesProgress: state.phrasesProgress,
      }),
    }
  )
);

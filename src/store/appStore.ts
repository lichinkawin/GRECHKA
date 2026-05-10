import { create } from 'zustand';

type Tab = 'words' | 'phrases' | 'exercises' | 'progress';

interface AppStore {
  activeTab: Tab;
  setTab: (tab: Tab) => void;
  isTelegramEnv: boolean;
  setTelegramEnv: (val: boolean) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
  activeTab: 'words',
  setTab: (tab) => set({ activeTab: tab }),
  isTelegramEnv: false,
  setTelegramEnv: (val) => set({ isTelegramEnv: val }),
}));

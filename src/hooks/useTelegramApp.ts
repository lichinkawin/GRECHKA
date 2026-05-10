import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, cb?: (err: Error | null) => void) => void;
          getItem: (key: string, cb: (err: Error | null, value: string | null) => void) => void;
        };
      };
    };
  }
}

export const useTelegramApp = () => {
  const setTelegramEnv = useAppStore((s) => s.setTelegramEnv);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setTelegramEnv(true);

      // Apply TG theme CSS vars
      const themeParams = tg.themeParams;
      if (themeParams) {
        Object.entries(themeParams).forEach(([key, val]) => {
          document.documentElement.style.setProperty(`--tg-${key}`, val as string);
        });
      }
    } else {
      // Mock TG theme vars for browser preview
      document.documentElement.style.setProperty('--tg-theme-bg-color', '#0f0f1a');
      document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-hint-color', '#9b9bb4');
      document.documentElement.style.setProperty('--tg-theme-button-color', '#6c63ff');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#1a1a2e');
    }
  }, [setTelegramEnv]);

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };

  return { haptic };
};

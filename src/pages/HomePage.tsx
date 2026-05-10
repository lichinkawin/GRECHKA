import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useWordStore } from '@/store/wordStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { categories as wordCategories } from '@/data/words';
import { phraseCategories } from '@/data/phrases';

const HomePage: React.FC = () => {
  const { haptic } = useTelegramApp();
  const { streak, xp, dailyGoalProgress, setTab, setSessionMode } = useAppStore();
  const { errorCount } = useWordStore();

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Студент';
  const weakWordsCount = Object.keys(errorCount).length;

  const [bottomSheetMode, setBottomSheetMode] = useState<'words' | 'phrases' | null>(null);

  useEffect(() => {
    useAppStore.getState().checkStreak();
  }, []);

  const handleStartSession = () => {
    // Start mixed review for daily goal
    useAppStore.getState().setSessionCategory(null);
    setSessionMode('words');
    haptic('medium');
    setTab('session');
  };

  const handleReviewWeak = () => {
    if (weakWordsCount === 0) return;
    useAppStore.getState().setSessionCategory(null);
    setSessionMode('words');
    haptic('medium');
    setTab('session');
  };

  const handleOpenCategorySheet = (mode: 'words' | 'phrases') => {
    haptic('light');
    setBottomSheetMode(mode);
  };

  const handleStartCategorySession = (categoryFilter: string | null) => {
    haptic('medium');
    setSessionMode(bottomSheetMode!);
    useAppStore.getState().setSessionCategory(categoryFilter);
    setBottomSheetMode(null);
    setTab('session');
  };

  return (
    <div className="page bg-[var(--tg-theme-bg-color,#0f0f1a)] pb-24 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--tg-theme-bg-color,#0f0f1a)]/90 backdrop-blur-lg px-4 pt-6 pb-4 flex justify-between items-center border-b border-white/5">
        <h1 className="text-2xl font-black text-[var(--tg-theme-text-color,#fff)]">
          Привет, {telegramUser}!
        </h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-xl border border-orange-500/30">
            <span className="text-orange-500 text-lg">🔥</span>
            <span className="font-bold text-orange-500">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
            <span className="text-blue-400 text-lg">⚡️</span>
            <span className="font-bold text-blue-400">{xp}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Daily Goal Hero */}
        <motion.div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--tg-theme-button-color,#6c63ff)] to-purple-600 p-6 shadow-xl shadow-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-white/80 font-bold text-sm uppercase tracking-wider mb-1">Цель на день</h2>
                <div className="text-white font-black text-3xl">{dailyGoalProgress} / 10</div>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden mb-6">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (dailyGoalProgress / 10) * 100)}%` }}
                transition={{ duration: 1, type: "spring" }}
              />
            </div>

            <button 
              onClick={handleStartSession}
              className="w-full bg-white text-purple-600 font-black py-4 rounded-2xl text-lg shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-[0_0px_0_rgba(0,0,0,0.2)] active:translate-y-1 transition-all"
            >
              ПРОДОЛЖИТЬ
            </button>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <h3 className="text-xl font-bold text-[var(--tg-theme-text-color,#fff)] mb-4">Модули</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenCategorySheet('words')}
            className="flex flex-col items-start p-5 bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-3xl border-2 border-white/5 active:border-[var(--tg-theme-button-color,#6c63ff)] transition-colors text-left"
          >
            <div className="text-4xl mb-3">📚</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)]">Слова</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1">По категориям</div>
          </motion.button>

          <motion.button 
            whileTap={weakWordsCount > 0 ? { scale: 0.95 } : {}}
            onClick={handleReviewWeak}
            className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-colors text-left ${weakWordsCount > 0 ? 'bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] border-orange-500/30 active:border-orange-500' : 'bg-black/20 border-white/5 opacity-60'}`}
          >
            <div className="text-4xl mb-3 grayscale-0">🔄</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)]">Слабые слова</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1">
              {weakWordsCount > 0 ? `${weakWordsCount} слов для повтора` : 'Ошибок нет'}
            </div>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenCategorySheet('phrases')}
            className="flex flex-col items-start p-5 bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-3xl border-2 border-white/5 active:border-[var(--tg-theme-button-color,#6c63ff)] transition-colors text-left"
          >
            <div className="text-4xl mb-3">✈️</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)]">Фразы</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1">Интерактив</div>
          </motion.button>

          <div className="flex flex-col items-start p-5 bg-black/20 rounded-3xl border-2 border-white/5 opacity-70 text-left relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">Скоро</div>
            <div className="text-4xl mb-3 grayscale opacity-50">🧠</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)] opacity-50">Грамматика</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1 opacity-50">Правила</div>
          </div>
        </div>
      </div>

      {/* Category Bottom Sheet */}
      <AnimatePresence>
        {bottomSheetMode && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBottomSheetMode(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--tg-theme-bg-color,#0f0f1a)] rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[var(--tg-theme-bg-color,#0f0f1a)]/90 backdrop-blur-md px-6 pt-4 pb-4 border-b border-white/5 z-10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">
                  Выберите категорию
                </h3>
                <button
                  onClick={() => setBottomSheetMode(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4 grid gap-3 pb-safe">
                {(bottomSheetMode === 'words' ? wordCategories : phraseCategories).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleStartCategorySession(cat.filter)}
                    className="w-full flex items-center justify-between p-4 bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-2xl border border-white/5 active:scale-[0.98] transition-transform"
                  >
                    <span className="font-bold text-[var(--tg-theme-text-color,#fff)] text-lg">
                      {cat.name}
                    </span>
                    <span className="text-xl opacity-50">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;

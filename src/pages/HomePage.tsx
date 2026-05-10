import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useWordStore } from '@/store/wordStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';

const HomePage: React.FC = () => {
  const { haptic } = useTelegramApp();
  const { streak, xp, dailyGoalProgress, setTab } = useAppStore();
  const { errorCount } = useWordStore();

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Студент';
  const weakWordsCount = Object.keys(errorCount).length;

  useEffect(() => {
    useAppStore.getState().checkStreak();
  }, []);

  const handleStartSession = () => {
    haptic('medium');
    setTab('explore'); // Or wherever the active learning session starts
  };

  const handleReviewWeak = () => {
    if (weakWordsCount === 0) return;
    haptic('medium');
    setTab('explore'); // Route to specific weak words session if applicable
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
            onClick={() => { haptic('light'); setTab('explore'); }}
            className="flex flex-col items-start p-5 bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-3xl border-2 border-white/5 active:border-[var(--tg-theme-button-color,#6c63ff)] transition-colors text-left"
          >
            <div className="text-4xl mb-3">📚</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)]">Новые слова</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1">Изучай базу</div>
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
            onClick={() => { haptic('light'); setTab('phrases'); }}
            className="flex flex-col items-start p-5 bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-3xl border-2 border-white/5 active:border-[var(--tg-theme-button-color,#6c63ff)] transition-colors text-left"
          >
            <div className="text-4xl mb-3">✈️</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)]">Фразы</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1">Для поездок</div>
          </motion.button>

          <div className="flex flex-col items-start p-5 bg-black/20 rounded-3xl border-2 border-white/5 opacity-70 text-left relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">Скоро</div>
            <div className="text-4xl mb-3 grayscale opacity-50">🧠</div>
            <div className="font-bold text-[var(--tg-theme-text-color,#fff)] opacity-50">Грамматика</div>
            <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] mt-1 opacity-50">Правила</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { useWordStore } from '@/store/wordStore';
import { words as allWords } from '@/data/words';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import type { Word } from '@/types';

type SessionItem = Word & { exerciseType: 'flashcard' | 'quiz' };

const SessionPage: React.FC = () => {
  const { haptic } = useTelegramApp();
  const { setTab, addXp, incrementDailyGoal } = useAppStore();
  const { known, errorCount, markKnown, markError } = useWordStore();

  const [queue, setQueue] = useState<SessionItem[]>([]);
  const [totalItems, setTotalItems] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Exercise states
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const [quizOptions, setQuizOptions] = useState<Word[]>([]);
  const [answeredId, setAnsweredId] = useState<number | null>(null);
  const [isErrorState, setIsErrorState] = useState(false);

  // Initialization
  useEffect(() => {
    // Select 10 words
    const weakWordIds = Object.keys(errorCount).map(Number).sort((a, b) => errorCount[b] - errorCount[a]);
    const weakWords = allWords.filter(w => weakWordIds.includes(w.rank)).slice(0, 5);
    
    const newWords = allWords.filter(w => !known.includes(w.rank) && !weakWordIds.includes(w.rank))
      .sort(() => Math.random() - 0.5)
      .slice(0, 10 - weakWords.length);
    
    const sessionWords = [...weakWords, ...newWords].sort(() => Math.random() - 0.5);
    
    if (sessionWords.length === 0) {
      setIsFinished(true);
      return;
    }

    const initialQueue = sessionWords.map(w => ({
      ...w,
      exerciseType: Math.random() > 0.5 ? 'quiz' : 'flashcard'
    })) as SessionItem[];

    setQueue(initialQueue);
    setTotalItems(initialQueue.length);
  }, []);

  const currentItem = queue[0];
  const progressPercent = totalItems > 0 ? Math.round(((totalItems - queue.length) / totalItems) * 100) : 0;

  // Prepare quiz options if needed
  useEffect(() => {
    if (currentItem?.exerciseType === 'quiz') {
      const distractors = allWords
        .filter(w => w.rank !== currentItem.rank)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setQuizOptions([currentItem, ...distractors].sort(() => Math.random() - 0.5));
      setAnsweredId(null);
      setIsErrorState(false);
    } else if (currentItem?.exerciseType === 'flashcard') {
      setFlashcardRevealed(false);
    }
  }, [currentItem]);

  const handleCorrect = () => {
    haptic('success');
    markKnown(currentItem.rank);
    setTimeout(() => {
      const newQueue = queue.slice(1);
      if (newQueue.length === 0) {
        finishSession();
      } else {
        setQueue(newQueue);
      }
    }, 1000);
  };

  const handleIncorrect = () => {
    haptic('error');
    setIsErrorState(true);
    markError(currentItem.rank);
    setTimeout(() => {
      // Move current to back of queue
      setQueue(prev => {
        const next = [...prev.slice(1), prev[0]];
        return next;
      });
      setIsErrorState(false);
    }, 1200);
  };

  const finishSession = () => {
    addXp(totalItems * 10);
    incrementDailyGoal();
    setIsFinished(true);
    haptic('success');
  };

  const quitSession = () => {
    setTab('home');
  };

  if (isFinished) {
    return (
      <div className="page bg-[var(--tg-theme-bg-color,#0f0f1a)] flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-8xl mb-6"
        >
          🏆
        </motion.div>
        <h1 className="text-3xl font-black text-white mb-2">Урок пройден!</h1>
        <p className="text-[var(--tg-theme-hint-color,#9b9bb4)] mb-8">
          Вы заработали +{totalItems * 10} XP
        </p>
        <button
          onClick={() => { haptic('light'); setTab('home'); }}
          className="w-full bg-[var(--tg-theme-button-color,#6c63ff)] text-white font-bold py-4 rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all"
        >
          ВЕРНУТЬСЯ
        </button>
      </div>
    );
  }

  return (
    <div className="page bg-[var(--tg-theme-bg-color,#0f0f1a)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-6 flex items-center gap-4">
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="text-[var(--tg-theme-hint-color,#9b9bb4)] text-2xl opacity-60 hover:opacity-100"
        >
          ✕
        </button>
        <div className="flex-1 h-4 bg-black/20 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring' }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col px-6 pb-6 relative">
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={`${currentItem.rank}-${progressPercent}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {currentItem.exerciseType === 'flashcard' ? (
                // Type 1: Flashcard
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-white/50 mb-8 text-center">Запомните слово</h2>
                  <div 
                    className="flex-1 flex flex-col items-center justify-center bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] rounded-3xl border-2 border-white/5 p-8 text-center shadow-lg"
                    onClick={() => { if (!flashcardRevealed) { setFlashcardRevealed(true); haptic('light'); } }}
                  >
                    <div className="text-4xl font-black text-white mb-2">{currentItem.greek}</div>
                    <div className="text-hint italic mb-8">[{currentItem.transcription}]</div>
                    
                    {flashcardRevealed ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-green-400"
                      >
                        {currentItem.russian_translation}
                      </motion.div>
                    ) : (
                      <div className="text-sm text-hint uppercase tracking-widest opacity-50 mt-auto">
                        Нажмите, чтобы увидеть перевод
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8">
                    <button
                      disabled={!flashcardRevealed}
                      onClick={handleCorrect}
                      className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                        flashcardRevealed 
                          ? 'bg-green-500 text-white shadow-[0_4px_0_rgba(21,128,61,1)] active:translate-y-1 active:shadow-none' 
                          : 'bg-white/5 text-white/20'
                      }`}
                    >
                      ДАЛЕЕ
                    </button>
                  </div>
                </div>
              ) : (
                // Type 2: Quiz
                <div className="flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-white/50 mb-6 mt-4">Выберите правильный перевод</h2>
                  <div className="text-4xl font-black text-white mb-2">{currentItem.greek}</div>
                  <div className="text-hint italic mb-10">[{currentItem.transcription}]</div>

                  <div className={`grid grid-cols-1 gap-3 ${isErrorState ? 'animate-shake' : ''}`}>
                    {quizOptions.map(opt => {
                      const isSelected = answeredId === opt.rank;
                      const isCorrectOpt = opt.rank === currentItem.rank;
                      
                      let btnStyle = 'bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] border-white/5 text-white';
                      
                      if (answeredId !== null) {
                        if (isCorrectOpt) {
                          btnStyle = 'bg-green-500/20 border-green-500 text-green-400';
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
                        } else {
                          btnStyle = 'opacity-40 bg-black/20 border-white/5 text-white';
                        }
                      }

                      return (
                        <button
                          key={opt.rank}
                          disabled={answeredId !== null}
                          onClick={() => {
                            setAnsweredId(opt.rank);
                            if (isCorrectOpt) handleCorrect();
                            else handleIncorrect();
                          }}
                          className={`p-4 rounded-2xl border-2 text-left font-bold text-lg transition-all active:scale-95 ${btnStyle}`}
                        >
                          {opt.russian_translation}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] p-6 rounded-3xl w-full max-w-sm text-center border border-white/10"
            >
              <h3 className="text-2xl font-black text-white mb-2">Выйти из урока?</h3>
              <p className="text-hint mb-6">Прогресс этого урока будет утерян.</p>
              <div className="space-y-3">
                <button
                  onClick={quitSession}
                  className="w-full bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3.5 rounded-xl active:scale-95 transition-all"
                >
                  ДА, ВЫЙТИ
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full bg-[var(--tg-theme-button-color,#6c63ff)] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-all"
                >
                  ПРОДОЛЖИТЬ УРОК
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionPage;

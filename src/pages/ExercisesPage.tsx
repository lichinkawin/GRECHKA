import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { words } from '@/data/words';
import { phrases } from '@/data/phrases';
import { useTelegramApp } from '@/hooks/useTelegramApp';

type GameMode = 'menu' | 'quiz' | 'matching' | 'builder';
type SourceType = 'words' | 'phrases';

interface ExerciseItem {
  id: number;
  greek: string;
  transcription: string;
  russian: string;
}

const ExercisesPage: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('menu');
  const [source, setSource] = useState<SourceType>('words');
  const { haptic } = useTelegramApp();

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState<ExerciseItem | null>(null);
  const [options, setOptions] = useState<ExerciseItem[]>([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null); 
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const getSourceData = (): ExerciseItem[] => {
    if (source === 'words') {
      return words.map(w => ({
        id: w.rank,
        greek: w.greek,
        transcription: w.transcription,
        russian: w.russian_translation
      }));
    }
    return phrases.map(p => ({
      id: p.id,
      greek: p.greek,
      transcription: p.transcription,
      russian: p.russian
    }));
  };

  const generateQuestion = () => {
    const data = getSourceData();
    const item = data[Math.floor(Math.random() * data.length)];
    const distractors = data
      .filter(d => d.id !== item.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const allOptions = [item, ...distractors];
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setCurrentQuestion(item);
    setOptions(allOptions);
    setAnswered(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuestion();
    }
  }, [mode, source]);

  const handleAnswer = (id: number) => {
    if (answered !== null) return;
    
    setAnswered(id);
    const correct = id === currentQuestion?.id;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      haptic?.('success');
    } else {
      haptic?.('error');
    }

    setTimeout(() => {
      generateQuestion();
    }, 1200);
  };

  const modes = [
    { id: 'quiz', name: 'Викторина', icon: '❓', desc: 'Выбери правильный перевод' },
    { id: 'matching', name: 'Пары', icon: '🔗', desc: 'Сопоставь греческий и русский' },
    { id: 'builder', name: 'Конструктор', icon: '🧱', desc: 'Собери из букв' },
  ];

  if (mode === 'menu') {
    return (
      <div className="page p-4">
        <h1 className="page-title mb-1">Игры</h1>
        <p className="page-subtitle mb-8">Закрепи знания на практике</p>

        <div className="grid grid-cols-1 gap-4">
          {modes.map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMode(m.id as GameMode);
                haptic?.('light');
              }}
              className="flex items-center p-4 bg-white/5 border border-white/10 rounded-2xl text-left"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-accent/20 rounded-xl text-2xl mr-4">
                {m.icon}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{m.name}</div>
                <div className="text-sm text-hint">{m.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'quiz' && currentQuestion) {
    return (
      <div className="page p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setMode('menu')}
            className="text-accent font-bold"
          >
            ← Меню
          </button>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setSource('words')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'words' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Слова
            </button>
            <button 
              onClick={() => setSource('phrases')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'phrases' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Фразы
            </button>
          </div>
          <div className="bg-accent/20 px-3 py-1 rounded-full text-accent font-bold text-sm">
            🏆 {score}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion.greek + source}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center mb-12"
            >
              <div 
                className={`font-bold mb-2 text-white leading-tight ${source === 'phrases' ? 'text-3xl' : 'text-5xl'}`}
              >
                {currentQuestion.greek}
              </div>
              <div className="text-lg text-hint italic opacity-70">
                [{currentQuestion.transcription}]
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-3">
            {options.map((opt) => {
              let btnStyle: React.CSSProperties = {
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white'
              };
              
              if (answered !== null) {
                if (opt.id === currentQuestion.id) {
                  btnStyle = { background: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', color: '#4ade80' };
                } else if (opt.id === answered) {
                  btnStyle = { background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#f87171' };
                } else {
                  btnStyle = { opacity: 0.4 };
                }
              }

              return (
                <motion.button
                  key={opt.id + opt.greek}
                  whileTap={answered === null ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswer(opt.id)}
                  className="p-4 rounded-2xl border transition-all text-base font-medium text-center"
                  style={btnStyle}
                >
                  {opt.russian}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page p-4">
      <button 
        onClick={() => setMode('menu')}
        className="mb-4 text-accent flex items-center font-bold"
      >
        ← Назад в меню
      </button>
      
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold mb-2">Режим {mode}</h2>
        <p className="text-hint">Этот режим скоро будет доступен для обоих типов контента!</p>
      </div>
    </div>
  );
};

export default ExercisesPage;

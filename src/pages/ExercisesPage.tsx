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

  // Matching State
  const [matchingItemsEl, setMatchingItemsEl] = useState<{ id: number; text: string; type: 'el' }[]>([]);
  const [matchingItemsRu, setMatchingItemsRu] = useState<{ id: number; text: string; type: 'ru' }[]>([]);
  const [selectedEl, setSelectedEl] = useState<number | null>(null);
  const [selectedRu, setSelectedRu] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [mismatch, setMismatch] = useState<boolean>(false);

  // Builder State
  const [builderItem, setBuilderItem] = useState<ExerciseItem | null>(null);
  const [builderLetters, setBuilderLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; char: string }[]>([]);
  const [builderMismatch, setBuilderMismatch] = useState(false);

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
      greek: p.el,
      transcription: p.transcription,
      russian: p.ru
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
  };

  const generateMatching = () => {
    const data = getSourceData();
    // Select 4 random items to ensure they fit on screen
    const selected = data
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    
    const elItems = selected.map(item => ({ id: item.id, text: item.greek, type: 'el' as const }));
    const ruItems = selected.map(item => ({ id: item.id, text: item.russian, type: 'ru' as const }));
    
    // Shuffle separately
    setMatchingItemsEl(elItems.sort(() => 0.5 - Math.random()));
    setMatchingItemsRu(ruItems.sort(() => 0.5 - Math.random()));
    
    setMatchedIds(new Set());
    setSelectedEl(null);
    setSelectedRu(null);
  };

  const generateBuilder = () => {
    const data = getSourceData();
    const item = data[Math.floor(Math.random() * data.length)];
    
    // Create letters/chunks
    // For words, use individual letters. For phrases, maybe split by spaces or just letters if short.
    // Let's use letters, ignoring spaces (or treating spaces as clickable chunks).
    // Let's split by characters, ignoring spaces for assembly but keeping them in the string?
    // Actually, splitting by space for phrases is better if source === 'phrases', but let's just use characters for simplicity.
    const chars = item.greek.replace(/\s+/g, '').split('');
    const shuffled = chars.map((char, index) => ({ id: `char-${index}`, char, used: false })).sort(() => 0.5 - Math.random());
    
    setBuilderItem(item);
    setBuilderLetters(shuffled);
    setSelectedLetters([]);
    setBuilderMismatch(false);
  };

  useEffect(() => {
    if (mode === 'quiz') {
      generateQuestion();
    } else if (mode === 'matching') {
      generateMatching();
    } else if (mode === 'builder') {
      generateBuilder();
    }
  }, [mode, source]);

  const handleAnswer = (id: number) => {
    if (answered !== null) return;
    
    setAnswered(id);
    const correct = id === currentQuestion?.id;
    
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

  const handleMatchSelect = (id: number, type: 'el' | 'ru') => {
    if (matchedIds.has(id)) return;
    if (mismatch) return;

    if (type === 'el') {
      if (selectedEl === id) {
        setSelectedEl(null); // Deselect
      } else {
        setSelectedEl(id);
        if (selectedRu !== null) checkMatch(id, selectedRu);
      }
    } else {
      if (selectedRu === id) {
        setSelectedRu(null); // Deselect
      } else {
        setSelectedRu(id);
        if (selectedEl !== null) checkMatch(selectedEl, id);
      }
    }
    haptic?.('light');
  };

  const checkMatch = (elId: number, ruId: number) => {
    if (elId === ruId) {
      // Success
      const newMatched = new Set(matchedIds);
      newMatched.add(elId);
      setMatchedIds(newMatched);
      setSelectedEl(null);
      setSelectedRu(null);
      setScore(s => s + 1);
      haptic?.('success');

      if (newMatched.size === 4) {
        setTimeout(() => {
          generateMatching();
        }, 800);
      }
    } else {
      // Error
      setMismatch(true);
      haptic?.('error');
      setTimeout(() => {
        setMismatch(false);
        setSelectedEl(null);
        setSelectedRu(null);
      }, 600);
    }
  };

  const handleBuilderSelect = (letterId: string, char: string) => {
    if (builderMismatch) return;
    
    setBuilderLetters(prev => prev.map(l => l.id === letterId ? { ...l, used: true } : l));
    setSelectedLetters(prev => [...prev, { id: letterId, char }]);
    haptic?.('light');
  };

  const handleBuilderDeselect = (letterId: string) => {
    if (builderMismatch) return;

    setSelectedLetters(prev => prev.filter(l => l.id !== letterId));
    setBuilderLetters(prev => prev.map(l => l.id === letterId ? { ...l, used: false } : l));
    haptic?.('light');
  };

  useEffect(() => {
    if (mode === 'builder' && builderItem && selectedLetters.length === builderItem.greek.replace(/\s+/g, '').length) {
      const assembled = selectedLetters.map(l => l.char).join('');
      const target = builderItem.greek.replace(/\s+/g, '');
      
      if (assembled.toLowerCase() === target.toLowerCase()) {
        // Correct
        setScore(s => s + 1);
        haptic?.('success');
        setTimeout(() => {
          generateBuilder();
        }, 800);
      } else {
        // Incorrect
        setBuilderMismatch(true);
        haptic?.('error');
        setTimeout(() => {
          // Reset current selections
          setBuilderMismatch(false);
          setSelectedLetters([]);
          setBuilderLetters(prev => prev.map(l => ({ ...l, used: false })));
        }, 600);
      }
    }
  }, [selectedLetters, builderItem, mode]);

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
      <div className="page p-4 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
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
              className="text-center mb-8"
            >
              <div 
                className={`font-bold mb-2 text-white leading-tight ${source === 'phrases' ? 'text-2xl' : 'text-4xl'}`}
              >
                {currentQuestion.greek}
              </div>
              <div className="text-sm text-hint italic opacity-70">
                [{currentQuestion.transcription}]
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-2.5">
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
                  className="p-3.5 rounded-2xl border transition-all text-sm font-medium text-center"
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

  if (mode === 'matching') {
    return (
      <div className="page p-4 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setMode('menu')}
            className="text-accent font-bold"
          >
            ← Меню
          </button>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => { setSource('words'); setMode('matching'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'words' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Слова
            </button>
            <button 
              onClick={() => { setSource('phrases'); setMode('matching'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'phrases' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Фразы
            </button>
          </div>
          <div className="bg-accent/20 px-3 py-1 rounded-full text-accent font-bold text-sm">
            🏆 {score}
          </div>
        </div>

        <p className="text-center text-hint text-[10px] uppercase tracking-widest mb-4">Найди пары ({source === 'words' ? 'слова' : 'фразы'})</p>

        <div className="flex-1 flex gap-3 h-full mb-20">
          {/* Greek Column */}
          <div className="flex-1 flex flex-col gap-2.5">
            {matchingItemsEl.map((item) => {
              const isSelected = selectedEl === item.id;
              const isMatched = matchedIds.has(item.id);
              const isError = mismatch && isSelected;

              return (
                <motion.button
                  key={`el-${item.id}`}
                  whileTap={!isMatched ? { scale: 0.96 } : {}}
                  onClick={() => handleMatchSelect(item.id, 'el')}
                  disabled={isMatched}
                  className={`flex-1 flex items-center justify-center p-3 text-center rounded-2xl border transition-all font-bold ${
                    isMatched ? 'bg-green-500/10 border-transparent text-green-500/40' :
                    isError ? 'bg-red-500/20 border-red-500 text-red-500 animate-shake' :
                    isSelected ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30' :
                    'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <span className={source === 'words' ? 'text-lg' : 'text-sm'}>
                    {item.text}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Russian Column */}
          <div className="flex-1 flex flex-col gap-2.5">
            {matchingItemsRu.map((item) => {
              const isSelected = selectedRu === item.id;
              const isMatched = matchedIds.has(item.id);
              const isError = mismatch && isSelected;

              return (
                <motion.button
                  key={`ru-${item.id}`}
                  whileTap={!isMatched ? { scale: 0.96 } : {}}
                  onClick={() => handleMatchSelect(item.id, 'ru')}
                  disabled={isMatched}
                  className={`flex-1 flex items-center justify-center p-3 text-center rounded-2xl border transition-all font-medium ${
                    isMatched ? 'bg-green-500/10 border-transparent text-green-500/40' :
                    isError ? 'bg-red-500/20 border-red-500 text-red-500 animate-shake' :
                    isSelected ? 'bg-accent border-accent text-white shadow-lg shadow-accent/30' :
                    'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <span className="text-xs leading-tight">
                    {item.text}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'builder' && builderItem) {
    return (
      <div className="page p-4 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => setMode('menu')}
            className="text-accent font-bold"
          >
            ← Меню
          </button>
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => { setSource('words'); setMode('builder'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'words' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Слова
            </button>
            <button 
              onClick={() => { setSource('phrases'); setMode('builder'); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${source === 'phrases' ? 'bg-accent text-white shadow-lg' : 'text-hint'}`}
            >
              Фразы
            </button>
          </div>
          <div className="bg-accent/20 px-3 py-1 rounded-full text-accent font-bold text-sm">
            🏆 {score}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <div className="text-sm text-hint mb-2 uppercase tracking-widest">Собери {source === 'words' ? 'слово' : 'фразу'}</div>
            <div className="text-2xl font-bold text-white mb-1">{builderItem.russian}</div>
            <div className="text-sm text-hint italic">[{builderItem.transcription}]</div>
          </div>

          {/* Assembled Area */}
          <div className={`min-h-[60px] flex flex-wrap justify-center gap-2 mb-8 p-4 rounded-2xl bg-white/5 border transition-colors ${
            builderMismatch ? 'border-red-500 bg-red-500/10 animate-shake' : 
            selectedLetters.length === builderItem.greek.replace(/\s+/g, '').length ? 'border-green-500 bg-green-500/10 text-green-400' : 
            'border-white/10'
          }`}>
            {selectedLetters.map((l) => (
              <motion.button
                layoutId={`builder-${l.id}`}
                key={`selected-${l.id}`}
                onClick={() => handleBuilderDeselect(l.id)}
                className="w-10 h-12 flex items-center justify-center bg-accent text-white font-bold text-xl rounded-lg shadow-md"
              >
                {l.char}
              </motion.button>
            ))}
          </div>

          {/* Available Letters */}
          <div className="flex flex-wrap justify-center gap-2">
            {builderLetters.map((l) => (
              <div key={`avail-wrap-${l.id}`} className="w-10 h-12 relative">
                {!l.used && (
                  <motion.button
                    layoutId={`builder-${l.id}`}
                    onClick={() => handleBuilderSelect(l.id, l.char)}
                    className="absolute inset-0 flex items-center justify-center bg-white/10 border border-white/20 text-white font-bold text-xl rounded-lg active:scale-95 transition-transform"
                  >
                    {l.char}
                  </motion.button>
                )}
                {l.used && (
                  <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/5" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ExercisesPage;

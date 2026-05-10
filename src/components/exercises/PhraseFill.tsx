import React, { useState, useEffect } from 'react';
import { Phrase } from '@/types';
import { words as allWords } from '@/data/words';

interface PhraseFillProps {
  phrase: Phrase;
  onCorrect: () => void;
  onIncorrect: () => void;
  isErrorState: boolean;
}

const PhraseFill: React.FC<PhraseFillProps> = ({ phrase, onCorrect, onIncorrect, isErrorState }) => {
  const [parts, setParts] = useState<{ before: string; blank: string; after: string }>({ before: '', blank: '', after: '' });
  const [options, setOptions] = useState<string[]>([]);
  const [answeredId, setAnsweredId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Split Greek phrase to find a word to hide.
    // We should pick a word that is at least 3 chars if possible, removing punctuation for the blank but keeping it in the display.
    const wordsRaw = phrase.el.split(' ');
    // Filter words that are long enough
    let targetIndex = wordsRaw.findIndex(w => w.replace(/[.,;!?]/g, '').length >= 3);
    if (targetIndex === -1) {
      // Fallback: just pick a random word
      targetIndex = Math.floor(Math.random() * wordsRaw.length);
    }

    const targetWordRaw = wordsRaw[targetIndex];
    // Extract actual word ignoring punctuation attached to it
    const match = targetWordRaw.match(/([a-zA-ZΆ-ώ]+)/);
    const blankWord = match ? match[1] : targetWordRaw;

    const before = phrase.el.substring(0, phrase.el.indexOf(blankWord));
    const after = phrase.el.substring(phrase.el.indexOf(blankWord) + blankWord.length);

    setParts({ before, blank: blankWord, after });

    // 2. Generate distractors
    const distractors = allWords
      .map(w => w.greek)
      .filter(g => g.toLowerCase() !== blankWord.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    setOptions([blankWord, ...distractors].sort(() => Math.random() - 0.5));
    setAnsweredId(null);
  }, [phrase]);

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-xl font-bold text-white/50 mb-6 mt-4 text-center">Заполните пропуск</h2>
      
      <div className="bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] p-6 rounded-3xl border-2 border-white/5 shadow-lg mb-8 text-center flex flex-col items-center justify-center min-h-[150px]">
        <div className="text-2xl font-black text-white leading-relaxed mb-4">
          <span>{parts.before}</span>
          <span className={`inline-block border-b-4 mx-2 min-w-[80px] text-center transition-colors ${answeredId === parts.blank ? 'border-green-500 text-green-400' : 'border-[var(--tg-theme-button-color,#6c63ff)] text-transparent'}`}>
            {answeredId === parts.blank ? parts.blank : '______'}
          </span>
          <span>{parts.after}</span>
        </div>
        <div className="text-hint font-bold">{phrase.ru}</div>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${isErrorState ? 'animate-shake' : ''}`}>
        {options.map((opt, i) => {
          const isSelected = answeredId === opt;
          const isCorrectOpt = opt === parts.blank;
          
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
              key={`${opt}-${i}`}
              disabled={answeredId !== null}
              onClick={() => {
                setAnsweredId(opt);
                if (isCorrectOpt) onCorrect();
                else onIncorrect();
              }}
              className={`p-4 rounded-2xl border-2 text-center font-bold text-lg transition-all active:scale-95 ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhraseFill;

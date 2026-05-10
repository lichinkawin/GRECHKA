import React, { useState, useEffect } from 'react';
import { Word } from '@/types';

interface WordBuilderProps {
  word: Word;
  onCorrect: () => void;
  onIncorrect: () => void;
  isErrorState: boolean;
}

const WordBuilder: React.FC<WordBuilderProps> = ({ word, onCorrect, onIncorrect, isErrorState }) => {
  const [targetLetters, setTargetLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<{ id: string, char: string }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<({ id: string, char: string } | null)[]>([]);

  useEffect(() => {
    // We ignore spaces and punctuation? No, let's just split the raw greek word.
    const letters = word.greek.split('');
    setTargetLetters(letters);
    
    const shuffled = letters.map((char, index) => ({ id: `${index}-${char}`, char }))
      .sort(() => Math.random() - 0.5);
    
    setShuffledLetters(shuffled);
    setSelectedLetters(new Array(letters.length).fill(null));
  }, [word]);

  const handleSelect = (letterObj: { id: string, char: string }) => {
    const firstEmptyIndex = selectedLetters.findIndex(l => l === null);
    if (firstEmptyIndex === -1) return; // Full

    const newSelected = [...selectedLetters];
    newSelected[firstEmptyIndex] = letterObj;
    setSelectedLetters(newSelected);

    // If it's the last letter, check immediately
    if (firstEmptyIndex === selectedLetters.length - 1) {
      const constructed = newSelected.map(l => l?.char).join('');
      if (constructed === word.greek) {
        onCorrect();
      } else {
        onIncorrect();
        // Give it a moment before clearing to let the error animation play
        setTimeout(() => {
          setSelectedLetters(new Array(targetLetters.length).fill(null));
        }, 1200);
      }
    }
  };

  const handleDeselect = (index: number) => {
    if (selectedLetters[index] === null) return;
    const newSelected = [...selectedLetters];
    newSelected[index] = null;
    setSelectedLetters(newSelected);
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      <h2 className="text-xl font-bold text-white/50 mb-2 text-center">Соберите слово</h2>
      <div className="text-xl font-black text-white mb-8 text-center">{word.russian_translation}</div>
      
      {/* Slots */}
      <div className={`flex flex-wrap justify-center gap-2 mb-12 ${isErrorState ? 'animate-shake' : ''}`}>
        {selectedLetters.map((sel, index) => (
          <div 
            key={`slot-${index}`}
            onClick={() => handleDeselect(index)}
            className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all cursor-pointer ${
              sel 
                ? (isErrorState ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[var(--tg-theme-button-color,#6c63ff)] border-[var(--tg-theme-button-color,#6c63ff)] text-white shadow-lg') 
                : 'bg-black/20 border-white/10 text-transparent'
            }`}
          >
            {sel ? sel.char : ''}
          </div>
        ))}
      </div>

      {/* Available Letters */}
      <div className="flex flex-wrap justify-center gap-3">
        {shuffledLetters.map((letterObj) => {
          const isUsed = selectedLetters.some(sel => sel?.id === letterObj.id);
          return (
            <button
              key={letterObj.id}
              disabled={isUsed}
              onClick={() => handleSelect(letterObj)}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all active:scale-95 ${
                isUsed 
                  ? 'bg-transparent border-white/5 text-transparent' 
                  : 'bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] border-white/10 text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none'
              }`}
            >
              {letterObj.char}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WordBuilder;

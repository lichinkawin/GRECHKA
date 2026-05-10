import React from 'react';
import FlashCard, { CardActions } from '@/components/FlashCard';
import { useWordStore, useCurrentWord, useProgress } from '@/store/wordStore';
import { useSpeech } from '@/hooks/useSpeech';
import { categories } from '@/data/words';

interface WordsPageProps {
  haptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

const WordsPage: React.FC<WordsPageProps> = ({ haptic }) => {
  const { markKnown, markReview, resetProgress, activeRange, activeFilter, setRange } = useWordStore();
  const currentWord = useCurrentWord();
  const { known, total } = useProgress();
  const { speak } = useSpeech();

  if (!currentWord) {
    return (
      <div className="page">
        <div className="done-screen">
          <div className="done-emoji">🎉</div>
          <h2 className="done-title">Все слова изучены!</h2>
          <p className="done-subtitle">
            Ты прошёл {known} из {total} слов.{'\n'}
            Отличная работа, продолжай в том же духе!
          </p>
          <button
            id="btn-reset"
            className="btn-primary"
            onClick={resetProgress}
            aria-label="Начать заново"
          >
            Начать заново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page pb-20">
      <h1 className="page-title">Слова</h1>
      <p className="page-subtitle mb-4">
        Изучено {known} из {total} · свайп или кнопки
      </p>

      {/* Category filter */}
      <div className="category-scroll mb-6" role="tablist" aria-label="Категории слов">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${
              (cat.filter === activeFilter && (cat.filter !== null || cat.range[1] === activeRange[1])) 
              ? 'active' : ''
            }`}
            onClick={() => {
              setRange(cat.range as [number, number], (cat as any).filter);
              haptic('light');
            }}
            role="tab"
            aria-selected={cat.filter === activeFilter}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <FlashCard
        key={currentWord.rank}
        word={currentWord}
        onKnown={() => markKnown(currentWord.rank)}
        onReview={() => markReview(currentWord.rank)}
        haptic={haptic}
      />

      <CardActions
        onReview={() => { haptic('light'); markReview(currentWord.rank); }}
        onKnown={() => { haptic('medium'); markKnown(currentWord.rank); }}
        onSpeak={() => speak(currentWord.greek)}
      />
    </div>
  );
};

export default WordsPage;

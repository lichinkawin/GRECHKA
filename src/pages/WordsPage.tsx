import React, { useState, useMemo } from 'react';
import FlashCard, { CardActions } from '@/components/FlashCard';
import { useWordStore, useCurrentWord, useProgress } from '@/store/wordStore';
import { useAppStore } from '@/store/appStore';
import { categories, words as allWords } from '@/data/words';

interface WordsPageProps {
  haptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

const WordsPage: React.FC<WordsPageProps> = ({ haptic }) => {
  const { markKnown, markReview, resetProgress, activeRange, activeFilter, setRange } = useWordStore();
  const currentWord = useCurrentWord();
  const { known, total } = useProgress();
  const { favoriteWords, toggleFavoriteWord } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return allWords.filter(w => 
      w.greek.toLowerCase().includes(q) || 
      w.russian_translation.toLowerCase().includes(q) ||
      w.transcription.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="page pb-20">
      <div className="sticky top-0 z-20 bg-[var(--tg-theme-bg-color,#000)]/95 backdrop-blur-md pt-4 pb-2 border-b border-white/5">
        <h1 className="page-title px-4">Слова</h1>
        <p className="page-subtitle px-4 mb-3">
          Изучено {known} из {total} · свайп или кнопки
        </p>

        {/* Search Bar */}
        <div className="px-4 mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск слова (словарь)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,rgba(255,255,255,0.08))] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--tg-theme-text-color,#fff)] focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-hint opacity-50 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        {!searchQuery && (
          <div className="category-scroll px-4" role="tablist" aria-label="Категории слов">
            <button
              className={`category-chip ${activeFilter === '⭐ Избранное' ? 'active' : ''}`}
              onClick={() => {
                setRange([1, 500], '⭐ Избранное');
                haptic('light');
              }}
            >
              ⭐ Избранное
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${
                  (cat.filter === activeFilter && (cat.filter !== null || cat.range[1] === activeRange[1]) && activeFilter !== '⭐ Избранное') 
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
        )}
      </div>

      {searchQuery ? (
        <div className="px-4 mt-4 space-y-2 pb-24">
          {searchResults.length > 0 ? searchResults.map(word => (
            <div key={word.rank} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="font-bold text-lg text-white">{word.greek}</div>
                <div className="text-xs text-hint italic mb-1">[{word.transcription}]</div>
                <div className="text-sm text-white/80">{word.russian_translation}</div>
              </div>
              <button 
                onClick={() => { toggleFavoriteWord(word.rank); haptic?.('light'); }}
                className={`p-2 text-2xl transition-transform active:scale-90 ${favoriteWords.includes(word.rank) ? 'text-yellow-400' : 'text-white/20'}`}
              >
                {favoriteWords.includes(word.rank) ? '★' : '☆'}
              </button>
            </div>
          )) : (
            <div className="text-center py-10 text-hint">Ничего не найдено</div>
          )}
        </div>
      ) : currentWord ? (
        <>
          <div className="px-4 mt-6">
            <div className="flex justify-end mb-2">
               <button 
                onClick={() => { toggleFavoriteWord(currentWord.rank); haptic?.('light'); }}
                className={`text-2xl transition-transform active:scale-90 ${favoriteWords.includes(currentWord.rank) ? 'text-yellow-400' : 'text-white/20'}`}
              >
                {favoriteWords.includes(currentWord.rank) ? '★' : '☆'}
              </button>
            </div>
            <FlashCard
              key={currentWord.rank}
              word={currentWord}
              onKnown={() => markKnown(currentWord.rank)}
              onReview={() => markReview(currentWord.rank)}
              haptic={haptic}
            />
          </div>

          <CardActions
            onReview={() => { haptic('light'); markReview(currentWord.rank); }}
            onKnown={() => { haptic('medium'); markKnown(currentWord.rank); }}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="text-6xl mb-4 opacity-50">
            {activeFilter === '⭐ Избранное' ? '⭐' : '🎉'}
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">
            {activeFilter === '⭐ Избранное' ? 'Нет избранных слов' : 'Все слова изучены!'}
          </h2>
          <p className="text-hint mb-6">
            {activeFilter === '⭐ Избранное' 
              ? 'Нажмите звездочку на карточке слова или в словаре, чтобы добавить его сюда.' 
              : `Ты прошёл ${known} из ${total} слов в этой категории.`}
          </p>
          {activeFilter !== '⭐ Избранное' && (
            <button
              className="btn-primary"
              onClick={() => { resetProgress(); haptic('medium'); }}
            >
              Повторить заново
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WordsPage;

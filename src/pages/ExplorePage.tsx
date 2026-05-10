import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { words as allWords, categories as wordCategories } from '@/data/words';
import { phrases as allPhrases, phraseCategories } from '@/data/phrases';


interface ExplorePageProps {
  haptic?: (style?: 'light' | 'medium' | 'heavy') => void;
}

const ExplorePage: React.FC<ExplorePageProps> = ({ haptic }) => {
  const tHaptic = useTelegramApp().haptic;
  const doHaptic = haptic || tHaptic;

  const [activeTab, setActiveTab] = useState<'words' | 'phrases'>('words');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeWordFilter, setActiveWordFilter] = useState<string | null>(null);
  const [activePhraseFilter, setActivePhraseFilter] = useState<string | null>(null);

  const searchResultsWords = useMemo(() => {
    let list = allWords;
    if (activeWordFilter && !searchQuery) {
      list = list.filter(w => w.category === activeWordFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = allWords.filter(w => 
        w.greek.toLowerCase().includes(q) || 
        w.russian_translation.toLowerCase().includes(q) ||
        w.transcription.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, activeWordFilter]);

  const searchResultsPhrases = useMemo(() => {
    let list = allPhrases;
    if (activePhraseFilter && !searchQuery) {
      list = list.filter(p => p.category === activePhraseFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = allPhrases.filter(p => 
        p.el.toLowerCase().includes(q) || 
        p.ru.toLowerCase().includes(q) ||
        p.transcription.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, activePhraseFilter]);

  return (
    <div className="page pb-24 h-full flex flex-col">
      <div className="sticky top-0 z-20 bg-[var(--tg-theme-bg-color,#000)]/95 backdrop-blur-md pt-4 pb-2 border-b border-white/5 shrink-0">
        <h1 className="page-title px-4 mb-4">Словарь</h1>

        {/* Segmented Control */}
        <div className="px-4 mb-4">
          <div className="flex bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => { setActiveTab('words'); doHaptic('light'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'words' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-hint hover:text-white/70'
              }`}
            >
              Слова
            </button>
            <button
              onClick={() => { setActiveTab('phrases'); doHaptic('light'); }}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'phrases' 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-hint hover:text-white/70'
              }`}
            >
              Фразы
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск..."
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
          <div className="category-scroll px-4" role="tablist" aria-label="Категории">
            {activeTab === 'words' ? wordCategories.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${cat.filter === activeWordFilter ? 'active' : ''}`}
                onClick={() => {
                  setActiveWordFilter(cat.filter);
                  doHaptic('light');
                }}
                role="tab"
                aria-selected={cat.filter === activeWordFilter}
              >
                {cat.name}
              </button>
            )) : phraseCategories.map((cat) => (
              <button
                key={cat.id}
                className={`category-chip ${cat.filter === activePhraseFilter ? 'active' : ''}`}
                onClick={() => {
                  setActivePhraseFilter(cat.filter);
                  doHaptic('light');
                }}
                role="tab"
                aria-selected={cat.filter === activePhraseFilter}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 pb-10"
          >
            {activeTab === 'words' ? (
              searchResultsWords.length > 0 ? searchResultsWords.map(word => (
                <div key={word.rank} className="flex justify-between items-center p-4 rounded-2xl bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] border border-white/5">
                  <div className="flex-1 pr-4 border-r border-white/5">
                    <div className="font-bold text-lg text-[var(--tg-theme-text-color,#fff)]">{word.greek}</div>
                    <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] italic">[{word.transcription}]</div>
                  </div>
                  <div className="flex-1 pl-4 text-sm text-[var(--tg-theme-text-color,#fff)] text-right opacity-80 leading-tight">
                    {word.russian_translation}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-[var(--tg-theme-hint-color,#9b9bb4)]">Ничего не найдено</div>
              )
            ) : (
              searchResultsPhrases.length > 0 ? searchResultsPhrases.map(phrase => (
                <div key={phrase.id} className="flex justify-between items-center p-4 rounded-2xl bg-[var(--tg-theme-secondary-bg-color,#1a1a2e)] border border-white/5">
                  <div className="flex-1 pr-4 border-r border-white/5">
                    <div className="font-bold text-lg text-[var(--tg-theme-text-color,#fff)]">{phrase.el}</div>
                    <div className="text-xs text-[var(--tg-theme-hint-color,#9b9bb4)] italic">[{phrase.transcription}]</div>
                  </div>
                  <div className="flex-1 pl-4 text-sm text-[var(--tg-theme-text-color,#fff)] text-right opacity-80 leading-tight">
                    {phrase.ru}
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-[var(--tg-theme-hint-color,#9b9bb4)]">Ничего не найдено</div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExplorePage;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { phrases, categories } from '@/data/phrases';
import { useSpeech } from '@/hooks/useSpeech';

const PhrasesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const { speak } = useSpeech();

  const allCategories = ['Все', ...categories];
  const filtered =
    activeCategory === 'Все'
      ? phrases
      : phrases.filter((p) => p.category === activeCategory);

  return (
    <div className="page pb-24">
      <div className="sticky top-0 z-20 bg-page-bg/80 backdrop-blur-md pt-4 pb-2">
        <h1 className="page-title px-4 mb-1">Фразы</h1>
        <p className="page-subtitle px-4 mb-4">{phrases.length} полезных фраз</p>

        {/* Category filter */}
        <div className="category-scroll px-4" role="tablist" aria-label="Категории фраз">
          {allCategories.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat}`}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Phrase list */}
      <div className="phrase-list px-4 mt-4 space-y-4" role="list">
        <AnimatePresence mode="popLayout">
          {filtered.map((phrase, i) => (
            <motion.div
              key={phrase.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="phrase-card group"
              role="listitem"
              transition={{ delay: i * 0.02, duration: 0.2 }}
              onClick={() => speak(phrase.greek)}
            >
              {activeCategory === 'Все' && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-accent opacity-80 bg-accent/10 px-2 py-0.5 rounded-full w-fit mb-3 block">
                  {phrase.category}
                </span>
              )}
              <div className="flex justify-between items-start mb-3">
                <span className="text-lg opacity-50">🔊</span>
              </div>
              
              <div 
                className="phrase-greek text-xl font-bold mb-1" 
                style={{ color: '#ffffff' }}
              >
                {phrase.greek}
              </div>
              
              <div className="space-y-1 pt-2 border-t border-white/5">
                <div className="text-sm font-medium opacity-60 italic" style={{ color: '#9b9bb4' }}>
                  [{phrase.transcription}]
                </div>
                <div className="text-base font-semibold" style={{ color: 'var(--color-accent)' }}>
                  {phrase.russian}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhrasesPage;

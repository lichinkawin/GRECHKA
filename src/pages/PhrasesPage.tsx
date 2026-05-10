import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { phrases, phraseCategories } from '@/data/phrases';
import { useAppStore } from '@/store/appStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';

const PhrasesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const { favoritePhrases, toggleFavoritePhrase } = useAppStore();
  const { haptic } = useTelegramApp();

  const allCategories = ['Все', '⭐ Избранное', ...phraseCategories];
  
  const subcategories = useMemo(() => {
    if (activeCategory === 'Все') return [];
    const subs = phrases
      .filter(p => p.category === activeCategory)
      .map(p => p.subcategory);
    return ['Все', ...new Set(subs)];
  }, [activeCategory]);

  const filtered = useMemo(() => {
    let result = phrases;
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.el.toLowerCase().includes(q) || 
        p.ru.toLowerCase().includes(q) ||
        p.transcription.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (activeCategory === '⭐ Избранное') {
      result = result.filter(p => favoritePhrases.includes(p.id));
    } else if (activeCategory !== 'Все') {
      result = result.filter(p => p.category === activeCategory);
      if (activeSubcategory !== 'Все') {
        result = result.filter(p => p.subcategory === activeSubcategory);
      }
    }
    return result;
  }, [activeCategory, activeSubcategory, searchQuery, favoritePhrases]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory('Все');
  };

  return (
    <div className="page pb-24" style={{ backgroundColor: 'var(--tg-theme-bg-color, #000000)' }}>
      <div className="sticky top-0 z-20 bg-[var(--tg-theme-bg-color,#000)]/95 backdrop-blur-md pt-4 pb-3 border-b border-white/5">
        <h1 className="page-title px-4 mb-1" style={{ color: 'var(--tg-theme-text-color, #ffffff)' }}>Фразы</h1>
        
        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск фразы..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--tg-theme-secondary-bg-color,rgba(255,255,255,0.08))] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[var(--tg-theme-text-color,#fff)] focus:outline-none focus:border-[var(--tg-theme-button-color,#0088cc)] transition-colors"
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

        {/* Category Row */}
        <div className="category-scroll px-4 mb-3">
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              style={{
                backgroundColor: activeCategory === cat ? 'var(--tg-theme-button-color, #0088cc)' : 'var(--tg-theme-secondary-bg-color, rgba(255,255,255,0.1))',
                color: 'var(--tg-theme-button-text-color, #ffffff)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Subcategory Row */}
        <AnimatePresence>
          {activeCategory !== 'Все' && subcategories.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="category-scroll px-4 overflow-hidden"
            >
              <div className="flex gap-2 py-1">
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap"
                    onClick={() => setActiveSubcategory(sub)}
                    style={{
                      backgroundColor: activeSubcategory === sub ? 'var(--tg-theme-button-color, #0088cc)22' : 'var(--tg-theme-secondary-bg-color, rgba(255,255,255,0.05))',
                      borderColor: activeSubcategory === sub ? 'var(--tg-theme-button-color, #0088cc)' : 'rgba(255,255,255,0.1)',
                      color: activeSubcategory === sub ? 'var(--tg-theme-button-color, #0088cc)' : 'var(--tg-theme-hint-color, #9b9bb4)'
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Phrase list */}
      <div className="px-4 mt-6 space-y-3 pb-24">
        {filtered.map((phrase, i) => (
          <motion.div
            key={phrase.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.01 }}
            className="flex flex-col gap-2 p-4 mb-3 rounded-xl bg-[var(--tg-theme-secondary-bg-color,rgba(255,255,255,0.05))] border border-white/5"
          >
            {/* Header / Meta */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-[var(--tg-theme-button-color,#0088cc)] opacity-70">
                {phrase.category} • {phrase.subcategory}
              </span>
              <button 
                onClick={() => {
                  toggleFavoritePhrase(phrase.id);
                  haptic?.('light');
                }}
                className={`text-xl transition-transform active:scale-90 ${favoritePhrases.includes(phrase.id) ? 'text-yellow-400' : 'text-white/20'}`}
              >
                {favoritePhrases.includes(phrase.id) ? '★' : '☆'}
              </button>
            </div>
            
            {/* Greek Text */}
            <div className="text-lg font-bold text-[var(--tg-theme-text-color,#ffffff)] break-words whitespace-normal leading-tight">
              {phrase.el}
            </div>

            {/* Transliteration */}
            <div className="text-sm italic text-[var(--tg-theme-hint-color,#9b9bb4)] opacity-80">
              [{phrase.transcription}]
            </div>

            {/* Russian Translation */}
            <div className="text-base font-medium text-[var(--tg-theme-text-color,#ffffff)] mt-1 pt-2 border-t border-white/5">
              {phrase.ru}
            </div>
          </motion.div>
        ))}
        
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <div className="text-[var(--tg-theme-hint-color,#9b9bb4)] font-medium">Ничего не найдено</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhrasesPage;

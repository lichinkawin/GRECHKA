import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import type { Word } from '@/types';

interface FlashCardProps {
  word: Word;
  onKnown: () => void;
  onReview: () => void;
  haptic: (style?: 'light' | 'medium' | 'heavy') => void;
}

const SWIPE_THRESHOLD = 80;

const FlashCard: React.FC<FlashCardProps> = ({ word, onKnown, onReview, haptic }) => {
  const [revealed, setRevealed] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);

  const knownOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const reviewOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x;
    if (dx > SWIPE_THRESHOLD) {
      haptic('medium');
      animate(x, 400, { duration: 0.25 });
      setTimeout(onKnown, 220);
    } else if (dx < -SWIPE_THRESHOLD) {
      haptic('medium');
      animate(x, -400, { duration: 0.25 });
      setTimeout(onReview, 220);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  };

  return (
    <div className="card-arena">
      {/* Known indicator */}
      <motion.div
        className="absolute inset-0 rounded-3xl flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: knownOpacity }}
      >
        <div
          style={{
            border: '3px solid var(--color-known)',
            background: 'rgba(34,197,94,0.08)',
            borderRadius: 'var(--radius-card)',
            width: 'calc(100% - 24px)',
            maxWidth: 360,
            height: '100%',
            maxHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-known)',
            letterSpacing: '0.08em',
          }}
        >
          ✓ ЗНАЮ
        </div>
      </motion.div>

      {/* Review indicator */}
      <motion.div
        className="absolute inset-0 rounded-3xl flex items-center justify-center pointer-events-none z-0"
        style={{ opacity: reviewOpacity }}
      >
        <div
          style={{
            border: '3px solid var(--color-review)',
            background: 'rgba(239,68,68,0.08)',
            borderRadius: 'var(--radius-card)',
            width: 'calc(100% - 24px)',
            maxWidth: 360,
            height: '100%',
            maxHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--color-review)',
            letterSpacing: '0.08em',
          }}
        >
          ↩ ПОВТОРИТЬ
        </div>
      </motion.div>

      <motion.div
        className="flashcard"
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        onClick={() => setRevealed((prev) => !prev)}
        key={word.rank}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <span className="card-rank">#{word.rank} по частоте</span>

        <div className="card-greek">{word.greek}</div>

        <div className="card-transcription">[{word.transcription}]</div>

        <div className="card-divider" />

        <div className={`card-translation ${!revealed ? 'hidden' : ''}`}>
          {word.russian_translation}
        </div>

        {!revealed && (
          <span className="card-tap-hint">нажми, чтобы увидеть перевод</span>
        )}
      </motion.div>
    </div>
  );
};

interface CardActionsProps {
  onReview: () => void;
  onKnown: () => void;
}

export const CardActions: React.FC<CardActionsProps> = ({ onReview, onKnown }) => (
  <div className="card-actions">
    <button
      id="btn-review"
      className="card-btn card-btn-review"
      onClick={onReview}
      aria-label="Повторить позже"
    >
      ↩
    </button>
    <button
      id="btn-known"
      className="card-btn card-btn-known"
      onClick={onKnown}
      aria-label="Знаю это слово"
    >
      ✓
    </button>
  </div>
);

export default FlashCard;

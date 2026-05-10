import React from 'react';
import { motion } from 'framer-motion';
import CircularProgress from '@/components/CircularProgress';
import { useWordStore, useProgress } from '@/store/wordStore';

const ProgressPage: React.FC = () => {
  const { review, resetProgress } = useWordStore();
  const { known, total, percentage } = useProgress();
  const remaining = total - known;

  return (
    <div className="page">
      <h1 className="page-title">Прогресс</h1>
      <p className="page-subtitle">Твоя статистика изучения</p>

      <div className="progress-page">
        {/* Circular progress */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <CircularProgress
            percentage={percentage}
            known={known}
            total={total}
          />
        </motion.div>

        {/* Global counter */}
        <motion.div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 16,
            padding: '14px 24px',
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--color-hint)', marginBottom: 4 }}>
            Всего изучено
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            {known} из {total} слов и фраз
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="stat-grid"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card">
            <div className="stat-value known">{known}</div>
            <div className="stat-label">✓ Знаю</div>
          </div>
          <div className="stat-card">
            <div className="stat-value review">{review.length}</div>
            <div className="stat-label">↩ Повторить</div>
          </div>
          <div className="stat-card">
            <div className="stat-value accent">{remaining}</div>
            <div className="stat-label">📚 Осталось</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-text)' }}>
              {percentage}%
            </div>
            <div className="stat-label">🎯 Выполнено</div>
          </div>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(108,99,255,0.05))',
            borderRadius: 16,
            padding: '16px 20px',
            border: '1px solid rgba(108,99,255,0.2)',
            textAlign: 'center',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ fontSize: '1.25rem', marginBottom: 6 }}>
            {percentage === 0 && '🚀 Начни своё путешествие в греческий!'}
            {percentage > 0 && percentage < 25 && '💪 Отличное начало! Продолжай!'}
            {percentage >= 25 && percentage < 50 && '🔥 Четверть пути позади!'}
            {percentage >= 50 && percentage < 75 && '⚡ Уже больше половины!'}
            {percentage >= 75 && percentage < 100 && '🏆 Финишная прямая!'}
            {percentage === 100 && '🎉 Ты выучил все слова!'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-hint)' }}>
            Κaλή τύχη — Удачи в изучении!
          </div>
        </motion.div>

        {/* Reset button */}
        {known > 0 && (
          <motion.button
            id="btn-reset-progress"
            className="btn-primary"
            onClick={resetProgress}
            aria-label="Сбросить прогресс"
            style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-review)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Сбросить прогресс
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;

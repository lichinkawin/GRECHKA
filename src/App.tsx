import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/store/appStore';
import { useTelegramApp } from '@/hooks/useTelegramApp';

const HomePage = lazy(() => import('@/pages/HomePage'));
const WordsPage = lazy(() => import('@/pages/WordsPage'));
const PhrasesPage = lazy(() => import('@/pages/PhrasesPage'));
const ExercisesPage = lazy(() => import('@/pages/ExercisesPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));

const PageFallback = () => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-hint)',
      fontSize: '1.5rem',
    }}
  >
    🫒
  </div>
);

const App: React.FC = () => {
  const { activeTab } = useAppStore();
  const { haptic } = useTelegramApp();

  return (
    <div className="app-wrapper">
      <div className="app-content">
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <HomePage />
              </motion.div>
            )}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <WordsPage haptic={haptic} />
              </motion.div>
            )}
            {activeTab === 'phrases' && (
              <motion.div
                key="phrases"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <PhrasesPage />
              </motion.div>
            )}
            {activeTab === 'exercises' && (
              <motion.div
                key="exercises"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
              >
                <ExercisesPage />
              </motion.div>
            )}
            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                style={{ position: 'absolute', inset: 0 }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <ProgressPage />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </div>

      <BottomNav />
    </div>
  );
};

export default App;

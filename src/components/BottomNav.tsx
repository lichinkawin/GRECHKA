import React from 'react';
import { useAppStore } from '@/store/appStore';

const TABS = [
  { id: 'words' as const, icon: '📚', label: 'Слова' },
  { id: 'phrases' as const, icon: '💬', label: 'Фразы' },
  { id: 'exercises' as const, icon: '🎯', label: 'Игры' },
  { id: 'progress' as const, icon: '📊', label: 'Прогресс' },
];

const BottomNav: React.FC = () => {
  const { activeTab, setTab } = useAppStore();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Основная навигация">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          id={`nav-${tab.id}`}
          className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setTab(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          <span className="nav-item-icon">{tab.icon}</span>
          <span className="nav-item-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;

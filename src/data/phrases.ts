import type { Phrase } from '@/types';
import phraseData from './knowledge_base.json';

export const phrases: Phrase[] = phraseData.map((p: any) => {
  let mappedCategory = p.category;
  if (['Транспорт', 'Отель', 'Аэропорт', 'Город'].includes(p.category)) mappedCategory = 'Путешествия';
  else if (['Здоровье', 'Экстренные'].includes(p.category)) mappedCategory = 'Экстренные';
  else if (p.category === 'Приветствия') mappedCategory = 'Базовые';
  else if (['Сленг', 'Знакомства'].includes(p.category)) mappedCategory = 'Общение';
  else if (['Время', 'Погода', 'Работа'].includes(p.category)) mappedCategory = 'Разное';
  
  return {
    ...p,
    category: mappedCategory
  };
});

export const phraseCategories = [
  { id: 'all', name: 'Все', filter: null },
  { id: 'basics', name: 'Базовые', filter: 'Базовые' },
  { id: 'food', name: 'Еда', filter: 'Еда' },
  { id: 'travel', name: 'Путешествия', filter: 'Путешествия' },
  { id: 'shopping', name: 'Покупки', filter: 'Покупки' },
  { id: 'emergency', name: 'Экстренные', filter: 'Экстренные' },
  { id: 'comm', name: 'Общение', filter: 'Общение' },
  { id: 'family', name: 'Семья', filter: 'Семья' },
  { id: 'other', name: 'Разное', filter: 'Разное' }
];

export default phrases;

import mostCommonWords from './most_common_words.json';
import type { Word } from '@/types';

// Enhanced Greek → Latin transliteration map
const GREEK_TO_TRANS: Record<string, string> = {
  'α': 'a', 'β': 'v', 'γ': 'gh', 'δ': 'dh', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
  'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'i', 'φ': 'f', 'χ': 'kh', 'ψ': 'ps', 'ω': 'o',
  'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'i', 'ώ': 'o',
  'ϊ': 'i', 'ϋ': 'i', 'ΐ': 'i', 'ΰ': 'i',
  'Α': 'A', 'Β': 'V', 'Γ': 'Gh', 'Δ': 'Dh', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'Th',
  'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
  'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'I', 'Φ': 'F', 'Χ': 'Kh', 'Ψ': 'Ps', 'Ω': 'O'
};

const transliterate = (text: string): string => {
  // Handle digraphs first
  let t = text;
  const digraphs: Record<string, string> = {
    'ου': 'u', 'ού': 'u', 'Ου': 'U', 'Ού': 'U',
    'μπ': 'b', 'Μπ': 'B',
    'ντ': 'd', 'Ντ': 'D',
    'γκ': 'g', 'Γκ': 'G',
    'γγ': 'ng', 'Γγ': 'Ng',
    'ει': 'i', 'εί': 'i', 'Ει': 'I',
    'οι': 'i', 'οί': 'i', 'Οι': 'I',
    'αι': 'e', 'αί': 'e', 'Αι': 'E',
    'αυ': 'av', 'αύ': 'av', 'Αυ': 'Av',
    'ευ': 'ev', 'εύ': 'ev', 'Ευ': 'Ev'
  };

  for (const [gr, lat] of Object.entries(digraphs)) {
    t = t.replace(new RegExp(gr, 'g'), lat);
  }

  // Handle remaining single characters
  return t.split('').map(char => GREEK_TO_TRANS[char] || char).join('');
};

// Process JSON into the application Word type with semantic categorization
export const words: Word[] = mostCommonWords.map(w => {
  let category = 'Базовые';
  const ru = w.russian_translation.toLowerCase();
  
  // Enhanced heuristic categorization
  if ([18, 19, 20, 23, 24, 33, 34, 47].includes(w.rank) || ru.includes('сказать') || ru.includes('говорить') || ru.includes('слово') || ru.includes('вопрос')) category = 'Общение';
  if ([43, 31, 35].includes(w.rank) || ru.includes('время') || ru.includes('год') || ru.includes('день') || ru.includes('сегодня') || ru.includes('вчера') || ru.includes('завтра') || ru.includes('утро') || ru.includes('вечер')) category = 'Время';
  if ((w.rank >= 151 && w.rank <= 166) || ru.includes('кафе') || ru.includes('вода') || ru.includes('еда') || ru.includes('пить') || ru.includes('есть')) category = 'Еда';
  if ((w.rank >= 167 && w.rank <= 180) || ru.includes('дом') || ru.includes('место') || ru.includes('город') || ru.includes('страна') || ru.includes('путь') || ru.includes('школа') || ru.includes('комната')) category = 'Путешествия';
  if ((w.rank >= 129 && w.rank <= 134) || ru.includes('семья') || ru.includes('мать') || ru.includes('отец') || ru.includes('сын') || ru.includes('дочь') || ru.includes('друг') || ru.includes('ребенок') || ru.includes('жена') || ru.includes('муж')) category = 'Семья';
  if (w.rank >= 191 && w.rank <= 224) category = 'Числа';
  if (w.rank >= 184 && w.rank <= 190) category = 'Цвета';
  
  // Grammatical categories for remaining common words
  if (category === 'Базовые') {
    if (ru.startsWith('быть') || ru.startsWith('иметь') || ru.startsWith('делать') || ru.startsWith('мочь') || ru.startsWith('знать')) category = 'Глаголы';
  }

  return {
    rank: w.rank,
    greek: w.greek,
    russian_translation: w.russian_translation,
    transcription: transliterate(w.greek),
    category
  };
});

export const categories = [
  { id: 'all', name: 'Все', range: [1, 500], filter: null },
  { id: 'basics', name: 'Базовые', range: [1, 500], filter: 'Базовые' },
  { id: 'food', name: 'Еда', range: [1, 500], filter: 'Еда' },
  { id: 'travel', name: 'Путешествия', range: [1, 500], filter: 'Путешествия' },
  { id: 'family', name: 'Семья', range: [1, 500], filter: 'Семья' },
  { id: 'numbers', name: 'Числа', range: [1, 500], filter: 'Числа' },
  { id: 'colors', name: 'Цвета', range: [1, 500], filter: 'Цвета' },
  { id: 'verbs', name: 'Глаголы', range: [1, 500], filter: 'Глаголы' },
  { id: 'comm', name: 'Общение', range: [1, 500], filter: 'Общение' },
  { id: 'time', name: 'Время', range: [1, 500], filter: 'Время' },
];

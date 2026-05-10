import mostCommonWords from './most_common_words.json';
import type { Word } from '@/types';

// Greek → Latin transliteration map
const GREEK_TO_TRANS: Record<string, string> = {
  'α': 'a', 'β': 'v', 'γ': 'gh', 'δ': 'dh', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
  'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
  'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'kh', 'ψ': 'ps', 'ω': 'o',
  'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o',
  'ϊ': 'i', 'ϋ': 'y', 'ΐ': 'i', 'ΰ': 'y',
  'Α': 'A', 'Β': 'V', 'Γ': 'Gh', 'Δ': 'Dh', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'Th',
  'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
  'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'Kh', 'Ψ': 'Ps', 'Ω': 'O'
};

const transliterate = (text: string): string => {
  return text.split('').map(char => GREEK_TO_TRANS[char] || char).join('');
};

// Process JSON into the application Word type with semantic categorization
export const words: Word[] = mostCommonWords.map(w => {
  let category = 'Базовые';
  
  // Simple heuristic categorization for the demo
  if ([18, 19, 20, 23, 24, 33, 34, 47].includes(w.rank)) category = 'Общение';
  if ([43, 31, 35].includes(w.rank)) category = 'Время';
  if (w.russian_translation.includes('кафе') || w.russian_translation.includes('вода')) category = 'Еда';
  if (w.russian_translation.includes('дом') || w.russian_translation.includes('место')) category = 'Места';

  return {
    rank: w.rank,
    greek: w.greek,
    russian_translation: w.russian_translation,
    transcription: transliterate(w.greek),
    category
  };
});

export const categories = [
  { id: 'top100', name: 'Top 100', range: [1, 100] },
  { id: 'top300', name: 'Top 300', range: [1, 300] },
  { id: 'comm', name: 'Общение', range: [1, 500], filter: 'Общение' },
  { id: 'food', name: 'Еда', range: [1, 500], filter: 'Еда' },
  { id: 'time', name: 'Время', range: [1, 500], filter: 'Время' },
  { id: 'places', name: 'Места', range: [1, 500], filter: 'Места' },
];

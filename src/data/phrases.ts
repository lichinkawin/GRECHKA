import type { Phrase } from '@/types';
import phraseData from './knowledge_base.json';

export const phrases: Phrase[] = phraseData as Phrase[];

export const phraseCategories = [...new Set(phrases.map((p) => p.category))];

export default phrases;

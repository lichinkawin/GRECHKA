import type { Phrase } from '@/types';

export const phrases: Phrase[] = [
  // Приветствия
  { id: 1, category: 'Приветствия', greek: 'Γεια σου', transcription: 'Yia su', russian: 'Привет' },
  { id: 2, category: 'Приветствия', greek: 'Καλημέρα', transcription: 'Kalimera', russian: 'Доброе утро' },
  { id: 3, category: 'Приветствия', greek: 'Καλησπέρα', transcription: 'Kalispera', russian: 'Добрый вечер' },
  { id: 4, category: 'Приветствия', greek: 'Καληνύχτα', transcription: 'Kalinihta', russian: 'Спокойной ночи' },
  { id: 5, category: 'Приветствия', greek: 'Αντίο', transcription: 'Adio', russian: 'До свидания' },
  { id: 6, category: 'Приветствия', greek: 'Τι κάνεις;', transcription: 'Ti kanis?', russian: 'Как дела?' },
  { id: 7, category: 'Приветствия', greek: 'Καλά, ευχαριστώ', transcription: 'Kala, efharisto', russian: 'Хорошо, спасибо' },

  // Еда
  { id: 8, category: 'Еда', greek: 'Θέλω καφέ', transcription: 'Thelo kafe', russian: 'Я хочу кофе' },
  { id: 9, category: 'Еда', greek: 'Τον λογαριασμό, παρακαλώ', transcription: 'Ton logariasmo, parakalo', russian: 'Счёт, пожалуйста' },
  { id: 10, category: 'Еда', greek: 'Είναι νόστιμο!', transcription: 'Ine nostimo!', russian: 'Это вкусно!' },
  { id: 11, category: 'Еда', greek: 'Ένα νερό, παρακαλώ', transcription: 'Ena nero, parakalo', russian: 'Воды, пожалуйста' },
  { id: 12, category: 'Еда', greek: 'Χωρίς γλουτένη', transcription: 'Horis gluteni', russian: 'Без глютена' },
  { id: 13, category: 'Еда', greek: 'Το μενού, παρακαλώ', transcription: 'To menu, parakalo', russian: 'Меню, пожалуйста' },

  // Транспорт
  { id: 14, category: 'Транспорт', greek: 'Πού είναι η στάση;', transcription: 'Pu ine i stasi?', russian: 'Где остановка?' },
  { id: 15, category: 'Транспорт', greek: 'Ένα εισιτήριο, παρακαλώ', transcription: 'Ena isitirio, parakalo', russian: 'Один билет, пожалуйста' },
  { id: 16, category: 'Транспорт', greek: 'Πού πηγαίνει αυτό;', transcription: 'Pu piyeni afto?', russian: 'Куда это едет?' },
  { id: 17, category: 'Транспорт', greek: 'Πότε φεύγει το τρένο;', transcription: 'Pote fevgi to treno?', russian: 'Когда отправляется поезд?' },

  // Покупки
  { id: 18, category: 'Покупки', greek: 'Πόσο κοστίζει;', transcription: 'Poso kostizi?', russian: 'Сколько стоит?' },
  { id: 19, category: 'Покупки', greek: 'Είναι ακριβό', transcription: 'Ine akrivo', russian: 'Это дорого' },
  { id: 20, category: 'Покупки', greek: 'Έχετε μεγαλύτερο;', transcription: 'Ehete megalitero?', russian: 'Есть побольше?' },
  { id: 21, category: 'Покупки', greek: 'Θα το πάρω', transcription: 'Tha to paro', russian: 'Я это возьму' },

  // Экстренные
  { id: 22, category: 'Экстренные', greek: 'Βοήθεια!', transcription: 'Voithia!', russian: 'Помогите!' },
  { id: 23, category: 'Экстренные', greek: 'Καλέστε έναν γιατρό', transcription: 'Kaleste enan yatro', russian: 'Вызовите врача' },
  { id: 24, category: 'Экстренные', greek: 'Χάθηκα', transcription: 'Hathika', russian: 'Я потерялся' },
  { id: 25, category: 'Экстренные', greek: 'Αστυνομία!', transcription: 'Astinomia!', russian: 'Полиция!' },

  // Отель
  { id: 26, category: 'Отель', greek: 'Έχετε δωμάτιο ελεύθερο;', transcription: 'Ehete domatio elefthero?', russian: 'Есть свободный номер?' },
  { id: 27, category: 'Отель', greek: 'Η check-in ώρα;', transcription: 'I check-in ora?', russian: 'Время заезда?' },
  { id: 28, category: 'Отель', greek: 'Θέλω να κλείσω δωμάτιο', transcription: 'Thelo na kliso domatio', russian: 'Я хочу забронировать номер' },
];

export const categories = [...new Set(phrases.map((p) => p.category))];

export default phrases;

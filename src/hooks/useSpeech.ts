import { useState, useEffect } from 'react';

export const useSpeech = () => {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const elVoice = voices.find(v => v.lang.startsWith('el')) || voices.find(v => v.lang.includes('EL'));
      if (elVoice) setVoice(elVoice);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [isSupported]);

  const speak = (text: string) => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = 'el-GR';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) window.speechSynthesis.cancel();
  };

  return { speak, stop, isSupported };
};

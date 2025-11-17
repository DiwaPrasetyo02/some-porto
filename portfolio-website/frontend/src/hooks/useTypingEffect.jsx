import { useState, useEffect } from 'react';

export const useTypingEffect = (texts, speed = 100, delay = 2000) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const currentFullText = texts[currentTextIndex];

    if (isTyping) {
      if (charIndex < currentFullText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(prev => prev + currentFullText[charIndex]);
          setCharIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, delay);
        return () => clearTimeout(timeout);
      }
    } else {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        }, speed / 2);
        return () => clearTimeout(timeout);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, currentTextIndex, texts, speed, delay]);

  return currentText;
};

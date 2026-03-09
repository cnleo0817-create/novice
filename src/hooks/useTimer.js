import { useState, useEffect, useRef } from 'react';

export const useTimer = (options = {}) => {
  const { onSessionComplete } = options;
  const sessionEndFiredRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      sessionEndFiredRef.current = false;
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!sessionEndFiredRef.current) {
        sessionEndFiredRef.current = true;
        onSessionComplete?.();
      }
      setIsActive(false);
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, onSessionComplete]);

  const toggleActive = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const enterImmersive = () => {
    setIsImmersive(true);
  };

  const exitImmersive = () => {
    setIsImmersive(false);
  };

  return {
    timeLeft,
    isActive,
    isImmersive,
    toggleActive,
    resetTimer,
    enterImmersive,
    exitImmersive,
  };
};


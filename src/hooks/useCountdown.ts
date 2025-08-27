import { useState, useEffect } from 'react';

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  lastHour: number;
  isCompleted: boolean;
  elapsedHours: number;
}

export const useCountdown = (targetDurationHours: number = 24, startTime?: number) => {
  const [countdownState, setCountdownState] = useState<CountdownState>({
    hours: targetDurationHours,
    minutes: 0,
    seconds: 0,
    lastHour: targetDurationHours,
    isCompleted: false,
    elapsedHours: 0
  });

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const totalDurationSeconds = targetDurationHours * 60 * 60;
      
      if (elapsedSeconds >= totalDurationSeconds) {
        setCountdownState(prev => ({
          ...prev,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isCompleted: true,
          elapsedHours: targetDurationHours
        }));
        return;
      }

      const remainingSeconds = totalDurationSeconds - elapsedSeconds;
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      const elapsedHours = Math.floor(elapsedSeconds / 3600);

      setCountdownState(prev => ({
        hours,
        minutes,
        seconds,
        lastHour: prev.hours !== hours ? prev.hours : prev.lastHour,
        isCompleted: false,
        elapsedHours
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, targetDurationHours]);

  return countdownState;
};

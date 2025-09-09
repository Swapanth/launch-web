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
    hours: startTime ? targetDurationHours : 0,
    minutes: 0,
    seconds: 0,
    lastHour: targetDurationHours,
    isCompleted: false,
    elapsedHours: 0
  });

  useEffect(() => {
    if (!startTime) {
      // Reset to initial state when no startTime
      setCountdownState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        lastHour: targetDurationHours,
        isCompleted: false,
        elapsedHours: 0
      });
      return;
    }

    // Set initial countdown state immediately when startTime is set
    const now = Date.now();
    const targetDurationMs = targetDurationHours * 60 * 60 * 1000;
    const endTime = startTime + targetDurationMs;
    const remainingMs = endTime - now;
    
    if (remainingMs > 0) {
      const remainingSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      
      setCountdownState({
        hours,
        minutes,
        seconds,
        lastHour: targetDurationHours,
        isCompleted: false,
        elapsedHours: 0
      });
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const targetDurationMs = targetDurationHours * 60 * 60 * 1000; // Convert hours to milliseconds
      const endTime = startTime + targetDurationMs;
      const remainingMs = endTime - now;
      
      if (remainingMs <= 0) {
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

      const remainingSeconds = Math.floor(remainingMs / 1000);
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      
      // Calculate elapsed time from start
      const elapsedMs = now - startTime;
      const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));

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

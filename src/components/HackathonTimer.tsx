import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { ConfettiEffect } from './ConfettiEffect';
import { DidYouKnow } from './DidYouKnow';
import { useCountdown } from '../hooks/useCountdown';

interface TimerState {
  isStarted: boolean;
  curtainsOpen: boolean;
  startTime: number;
}

const STORAGE_KEY = 'hackathon-timer-state';

export const HackathonTimer = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [curtainsOpening, setCurtainsOpening] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDustParticles, setShowDustParticles] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState<number>(0);
  const [hasSavedTimer, setHasSavedTimer] = useState(false);
  const [curtainState, setCurtainState] = useState<'closed' | 'opening' | 'fading' | 'open'>('closed');
  const [isSyncedWithGlobal, setIsSyncedWithGlobal] = useState(false);

  // Use the new countdown hook
  const countdownState = useCountdown(7, startTime);
  const { hours, minutes, seconds, lastHour, elapsedHours } = countdownState;

  const totalSeconds = 7 * 60 * 60; // 7 hours in seconds
  const animalInterval = 10 * 60; // 10 minutes in seconds
  const monkeyInterval = 5 * 60; // 5 minutes in seconds

  // Global timer API functions
  const checkGlobalTimer = async () => {
    try {
      const apiUrl = import.meta.env.DEV
        ? '/api/global-timer'
        : 'https://curtain-critters-countdown.vercel.app/api/global-timer';

      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        return data.timerState;
      }
    } catch (error) {
      console.error('Error checking global timer:', error);
    }
    return null;
  };

  const setGlobalTimer = async (startTime: number, isStarted: boolean, curtainsOpen: boolean) => {
    try {
      const apiUrl = import.meta.env.DEV
        ? '/api/global-timer'
        : 'https://curtain-critters-countdown.vercel.app/api/global-timer';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime,
          isStarted,
          curtainsOpen
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Global timer set successfully:', data);
        return true;
      }
    } catch (error) {
      console.error('Error setting global timer:', error);
    }
    return false;
  };

  // Load saved state on component mount - check global timer first, then local storage
  useEffect(() => {
    const loadTimerState = async () => {
      // First, check if there's a global timer running
      const globalTimerState = await checkGlobalTimer();

      if (globalTimerState) {
        // Use global timer state
        console.log('Found global timer, syncing with it:', globalTimerState);
        setIsSyncedWithGlobal(true);
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - globalTimerState.startTime) / 1000);

        if (globalTimerState.isStarted && elapsedSinceStart < totalSeconds) {
          setStartTime(globalTimerState.startTime);
          setIsStarted(true);
          setCurtainState('open');
          setCurtainsOpen(true);
          setHasSavedTimer(true);

          // Only show Did You Know card if more than 2 minutes have elapsed
          if (elapsedSinceStart >= 2 * 60) {
            setShowDidYouKnow(true);
          }

          // Also save to local storage for offline access
          const localState: TimerState = {
            isStarted: globalTimerState.isStarted,
            curtainsOpen: globalTimerState.curtainsOpen,
            startTime: globalTimerState.startTime
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));

          return; // Exit early since we found a global timer
        }
      }

      // No global timer found, check local storage
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsedState: TimerState = JSON.parse(savedState);
          const now = Date.now();
          const elapsedSinceStart = Math.floor((now - parsedState.startTime) / 1000);

          // Only restore if timer is still valid
          if (parsedState.isStarted && elapsedSinceStart < totalSeconds) {
            // Directly continue timer without curtain effects on reload
            setStartTime(parsedState.startTime);
            setIsStarted(true);
            setCurtainState('open');
            setCurtainsOpen(true);
            setHasSavedTimer(true);

            // Only show Did You Know card if more than 2 minutes have elapsed
            if (elapsedSinceStart >= 2 * 60) {
              setShowDidYouKnow(true);
            }
          }
        } catch (error) {
          console.error('Failed to parse saved timer state:', error);
        }
      }
    };

    loadTimerState();
  }, [totalSeconds]);

  // Periodic sync with global timer (every 30 seconds)
  useEffect(() => {
    if (!isStarted) return;

    const syncTimer = setInterval(async () => {
      const globalTimerState = await checkGlobalTimer();

      if (globalTimerState && globalTimerState.startTime !== startTime) {
        // Global timer has changed, sync with it
        console.log('Syncing with updated global timer');
        setStartTime(globalTimerState.startTime);
        setIsSyncedWithGlobal(true);

        // Update local storage
        const localState: TimerState = {
          isStarted: globalTimerState.isStarted,
          curtainsOpen: globalTimerState.curtainsOpen,
          startTime: globalTimerState.startTime
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(syncTimer);
  }, [isStarted, startTime]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isStarted && startTime > 0) {
      const state: TimerState = {
        isStarted,
        curtainsOpen,
        startTime
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [isStarted, curtainsOpen, startTime]);

  // Reset function
  const resetTimer = () => {
    setIsStarted(false);
    setCurtainsOpen(false);
    setCurtainsOpening(false);
    setCurtainState('closed');
    setShowConfetti(false);
    setShowDustParticles(false);
    setShowDidYouKnow(false);
    setAnimationTrigger(0);
    setStartTime(0);
    setHasSavedTimer(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Animation trigger every 10 minutes for Did You Know card (starting after 2 minutes)
  useEffect(() => {
    if (!isStarted) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      // Show Did You Know card only after 2 minutes have elapsed
      if (elapsedSeconds >= 2 * 60 && !showDidYouKnow) {
        setShowDidYouKnow(true);
        setAnimationTrigger(0); // Start with first animation
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, startTime, showDidYouKnow]);

  // Animation trigger every 10 minutes for Did You Know card (after the initial 2-minute delay)
  useEffect(() => {
    if (!isStarted || !showDidYouKnow) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const tenMinuteInterval = 10 * 60; // 10 minutes

      // Check if we should update the Did You Know animation (every 10 minutes after the 2-minute delay)
      if (elapsedSeconds >= 2 * 60) {
        const adjustedElapsed = elapsedSeconds - (2 * 60); // Subtract the initial 2-minute delay
        if (adjustedElapsed > 0 && adjustedElapsed % tenMinuteInterval === 0) {
          const animationIndex = Math.floor(adjustedElapsed / tenMinuteInterval);
          setAnimationTrigger(animationIndex);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, startTime, showDidYouKnow]);

  // Handle Enter key press to start and Ctrl+P to reset
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && curtainState === 'closed' && !hasSavedTimer) {
        handleStart();
      } else if (event.ctrlKey && event.key === 'p') {
        event.preventDefault(); // Prevent browser print dialog
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [curtainState, hasSavedTimer]);

  const handleStart = async () => {
    // Start the perfect curtain sliding animation
    setCurtainState('opening');
    setCurtainsOpening(true);

    // At 2.5 seconds (halfway through curtain animation), start timer and confetti
    setTimeout(async () => {
      // Set the start time and start the actual countdown timer at halfway point
      const now = Date.now();
      setStartTime(now);

      // Start the actual countdown timer
      setIsStarted(true);
      setHasSavedTimer(false);

      // Set the global timer for all users to sync with
      await setGlobalTimer(now, true, false);
      console.log('Global timer started for all users');

      // Trigger confetti celebration when curtains are halfway
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);

      // Add realistic dust particles
      setShowDustParticles(true);
      setTimeout(() => setShowDustParticles(false), 8000);
    }, 2500); // Halfway through the 5-second curtain animation

    // After 5 seconds (when curtains finish sliding), start fade out
    setTimeout(async () => {
      // Start fade out animation
      setCurtainState('fading');

      // Update global timer to indicate curtains are open
      if (startTime > 0) {
        await setGlobalTimer(startTime, true, true);
      }

      // After fade completes, completely remove curtains
      setTimeout(() => {
        setCurtainState('open');
        setCurtainsOpen(true);
        setCurtainsOpening(false);
      }, 1000); // 1 second fade duration
    }, 5000); // Complete curtain animation
  };

  const formatTimeWithLabels = (hours: number, minutes: number, seconds: number) => {
    // For a 7-hour hackathon, we'll show:
    // Days: Always 00 (since it's only 7 hours)
    // Hours: The remaining hours (0-23)
    // Minutes: The remaining minutes (0-59)
    // Seconds: The remaining seconds (0-59)

    return {
      days: '00', // Always 00 for a 7-hour event
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    };
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative w-full h-screen overflow-hidden ${curtainState === 'open' || curtainState === 'opening' || curtainState === 'fading' ? '' : 'gradient-stage'
      }`}
      data-component="hackathon-timer"
    >
      {/* Stage Spotlight */}
      <div className={`absolute inset-0 stage-spotlight pointer-events-none ${curtainsOpen ? 'curtains-open' : ''}`} />

      {/* Perfect Curtain System - Only show when not fully open */}
      {curtainState !== 'open' && (
        <>
          {/* Left Curtain - starts covering left half */}
          <div className={`curtain curtain-left ${curtainState === 'opening' ? 'sliding' :
              curtainState === 'fading' ? 'fading' : ''
            }`}>
            {/* Curtain folds for realistic effect */}
            <div className="curtain-fold" style={{ left: '10%' }} />
            <div className="curtain-fold" style={{ left: '25%' }} />
            <div className="curtain-fold" style={{ left: '40%' }} />
            <div className="curtain-fold" style={{ left: '55%' }} />
            <div className="curtain-fold" style={{ left: '70%' }} />
            <div className="curtain-fold" style={{ left: '85%' }} />
          </div>

          {/* Right Curtain - starts covering right half */}
          <div className={`curtain curtain-right ${curtainState === 'opening' ? 'sliding' :
              curtainState === 'fading' ? 'fading' : ''
            }`}>
            {/* Curtain folds for realistic effect */}
            <div className="curtain-fold" style={{ right: '10%' }} />
            <div className="curtain-fold" style={{ right: '25%' }} />
            <div className="curtain-fold" style={{ right: '40%' }} />
            <div className="curtain-fold" style={{ right: '55%' }} />
            <div className="curtain-fold" style={{ right: '70%' }} />
            <div className="curtain-fold" style={{ right: '85%' }} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center h-full ${curtainState === 'open' || curtainState === 'opening' || curtainState === 'fading' ? 'justify-start' : 'justify-center'
        }`}>
        {curtainState === 'closed' ? (
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-bold text-primary mb-4">
              🎭 Hackathon Theater
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Ready to start your 7-hour coding adventure?
            </p>
            <div className="text-center space-y-4">
              <div className="bg-primary/20 border border-primary/40 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-2xl text-primary font-bold mb-2">
                  Press <kbd className="bg-primary text-primary-foreground px-3 py-1 rounded">ENTER</kbd>
                </p>
                <p className="text-lg text-spotlight">
                  to start the show! 🎬
                </p>
              </div>
            </div>
          </div>
        ) : curtainState === 'opening' || curtainState === 'fading' ? (
          <div className="bg-white min-h-screen w-full flex flex-col">
            {/* College Logo */}
            <div className="flex justify-center pt-8 pb-6">
              <img
                src="https://srkrec.edu.in/img/srkrec_full_name2.png"
                alt="SRKREC Logo"
                className="h-20 object-contain"
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-12">
              <div className="space-y-6 bg-yellow-400">
                <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  AMARAVATI  
                </h1>
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '-0.07rem'
                  }}>
                  QUANTUM VALLEY  
                </h1>
               <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  INTERNAL  
                </h1>
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '-0.07rem',
                  marginBottom: '2.5rem'
                  }}>
                  HACKATHON 2025  
                </h1>
              </div>

              {/* Timer */}
              <div className="space-y-6">
                <div className="flex justify-center items-center gap-8">

                  <div className="flex flex-col items-center">
                    <div className="text-6xl font-mono font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">7</div>
                    <div className="text-lg font-medium text-gray-600 mt-2">HOURS</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-6xl font-mono font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">00</div>
                    <div className="text-lg font-medium text-gray-600 mt-2">MINUTES</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-6xl font-mono font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">00</div>
                    <div className="text-lg font-medium text-gray-600 mt-2">SECONDS</div>
                  </div>
                </div>
                <p className="text-1xl font-medium text-gray-800">
                  Time Remaining
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-screen w-full flex flex-col">
            {/* College Logo */}
            <div className="flex justify-center pt-8 pb-6">
              <img
                src="https://srkrec.edu.in/img/srkrec_full_name2.png"
                alt="SRKREC Logo"
                className="h-14 object-contain"
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-12">
              <div className="space-y-6  bg-yellow-400">
                <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  AMARAVATI  
                </h1>
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '-0.07rem'
                  }}>
                  QUANTUM VALLEY  
                </h1>
               <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  INTERNAL  
                </h1>
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '-0.07rem',
                  marginBottom: '2.5rem'
                  }}>
                  HACKATHON 2025  
                </h1>
              </div>

              {/* Timer with labels */}
              <div className="space-y-6">
                {(() => {
                  const timeData = formatTimeWithLabels(hours, minutes, seconds);
                  return (
                    <div className="flex justify-center items-center gap-8">

                      <div className="flex flex-col items-center">
                        <div className="text-6xl font-system-ui font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.hours}</div>
                        <div className="text-lg font-medium text-gray-600 mt-2">HOURS</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-6xl font-system-ui font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.minutes}</div>
                        <div className="text-lg font-medium text-gray-600 mt-2">MINUTES</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-6xl font-system-ui font-bold text-blue-600 border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.seconds}</div>
                        <div className="text-lg font-medium text-gray-600 mt-2">SECONDS</div>
                      </div>
                    </div>
                  );
                })()}
                <p className="text-1.5xl font-medium text-gray-600">
                  Time Remaining
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-4xl mx-auto px-8">
                <div className="bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 rounded-full"
                    style={{
                      width: `${((totalSeconds - (hours * 3600 + minutes * 60 + seconds)) / totalSeconds) * 100}%`
                    }}
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="text-2xl font-semibold text-gray-700">
                    {Math.round(((totalSeconds - (hours * 3600 + minutes * 60 + seconds)) / totalSeconds) * 100)}%
                  </span>
                </div>
              </div>

              {/* Did You Know Component - positioned below progress bar */}
              {showDidYouKnow && (
                <DidYouKnow
                  animationTrigger={animationTrigger}
                  isVisible={showDidYouKnow}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confetti Effect - appears when curtains open */}
      <ConfettiEffect isActive={showConfetti} />

      {/* Dust Particles Effect - appears when curtains open for realism */}
      <div className={`dust-particles ${showDustParticles ? 'visible' : ''}`}>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
        <div className="dust-particle"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent pointer-events-none" />
    </div>
  );
};
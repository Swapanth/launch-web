import { useState, useEffect, useCallback, useRef } from 'react';
import { ConfettiEffect } from './ConfettiEffect';
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
  const [animationTrigger, setAnimationTrigger] = useState<number>(0);
  const [hasSavedTimer, setHasSavedTimer] = useState(false);
  const [curtainState, setCurtainState] = useState<'closed' | 'opening' | 'fading' | 'open'>('closed');
  const [isSyncedWithGlobal, setIsSyncedWithGlobal] = useState(false);
  const hasManuallyStarted = useRef(false); // Track if user manually started timer

  // Debug curtain state changes
  useEffect(() => {
    console.log('Curtain state changed to:', curtainState);
  }, [curtainState]);

  // Use the new countdown hook
  const countdownState = useCountdown(7, startTime);
  const { hours, minutes, seconds, lastHour, elapsedHours } = countdownState;

  const totalSeconds = 7 * 60 * 60; // 7 hours in seconds

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
    // Don't run if user has manually started the timer
    if (hasManuallyStarted.current) return;

    let isMounted = true; // Flag to prevent state updates if component unmounts

    const loadTimerState = async () => {
      // First, check if there's a global timer running
      const globalTimerState = await checkGlobalTimer();

      if (!isMounted) return; // Component unmounted, don't update state

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


          }
        } catch (error) {
          console.error('Failed to parse saved timer state:', error);
        }
      }
    };

    loadTimerState();

    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [totalSeconds]); // Include totalSeconds to satisfy lint

  // Periodic sync with global timer (every 30 seconds)
  useEffect(() => {
    // Only sync if timer is started and curtains are fully open (not during animation)
    if (!isStarted || curtainState !== 'open') return;

    const syncTimer = setInterval(async () => {
      try {
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
      } catch (error) {
        console.error('Error during periodic sync:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(syncTimer);
  }, [isStarted, startTime, curtainState]);

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
  const resetTimer = useCallback(() => {
    console.log('Resetting timer...');
    hasManuallyStarted.current = false; // Reset the manual start flag
    setIsStarted(false);
    setCurtainsOpen(false);
    setCurtainsOpening(false);
    setCurtainState('closed');
    setShowConfetti(false);
    setShowDustParticles(false);
    setAnimationTrigger(0);
    setStartTime(0);
    setHasSavedTimer(false);
    setIsSyncedWithGlobal(false);
    localStorage.removeItem(STORAGE_KEY);
    
    // Also try to clear the global timer
    setGlobalTimer(0, false, false).catch(console.error);
  }, []);

  const handleStart = useCallback(async () => {
    // Mark that user has manually started the timer
    hasManuallyStarted.current = true;
    
    // Set the start time immediately to avoid race conditions
    const timerStartTime = Date.now();
    setStartTime(timerStartTime);
    
    // Start the actual countdown timer immediately
    setIsStarted(true);
    setHasSavedTimer(false);

    // Set the global timer for all users to sync with
    await setGlobalTimer(timerStartTime, true, false);
    console.log('Global timer started for all users');
    
    // Start the perfect curtain sliding animation
    setCurtainState('opening');
    setCurtainsOpening(true);

    // At 2.5 seconds (halfway through curtain animation), show effects
    setTimeout(() => {
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
      await setGlobalTimer(timerStartTime, true, true);

      // After fade completes, completely remove curtains
      setTimeout(() => {
        setCurtainState('open');
        setCurtainsOpen(true);
        setCurtainsOpening(false);
      }, 1000); // 1 second fade duration
    }, 5000); // Complete curtain animation
  }, []);

  // Handle Enter key press to start and multiple reset key combinations
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Start timer with Enter
      if (event.key === 'Enter' && curtainState === 'closed' && !hasSavedTimer) {
        handleStart();
      } 
      // Reset timer with multiple key combinations
      else if (
        (event.ctrlKey && event.key.toLowerCase() === 'p') ||
        (event.ctrlKey && event.key === 'r') ||
        (event.key === 'Escape') ||
        (event.key === 'r' && (event.ctrlKey || event.metaKey))
      ) {
        event.preventDefault(); // Prevent browser actions
        console.log('Reset key combination detected:', event.key, 'Ctrl:', event.ctrlKey);
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [curtainState, hasSavedTimer, handleStart, resetTimer]);

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

            {/* Event Details */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-12">
              <div className="space-y-6  bg-yellow-400">
                <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  AMARAVATI QUANTUM VALLEY

                </h1>

                <br />
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '-0.07rem',
                    marginBottom: '2.5rem'
                  }}>
                  HACKATHON 2025
                </h1>



                <div className="space-y-6" style={{ marginTop: '2rem' }}>
                  {(() => {
                    const timeData = formatTimeWithLabels(hours, minutes, seconds);
                    return (
                      <div className="flex justify-center items-center gap-8" style={{ marginBottom: '2.6rem' }}>

                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-red-800 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.hours}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">HOURS</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-red-800 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.minutes}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">MINUTES</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-red-800 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.seconds}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">SECONDS</div>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '-24rem', marginBottom: '-2.4rem', marginLeft: '2rem', marginRight: '2rem' }}>
                  <img
                    src="/imgs/14.png"
                    alt="Image 1"
                    style={{ borderRadius: '50%', height: '21rem', marginBottom: '-2.0rem' }}
                  />
                  <img
                    src="/imgs/15.png"
                    alt="Image 2"
                    style={{ borderRadius: '50%', height: '26rem', marginBottom: '-2.6rem' }}
                  />
                </div>

              </div>

              {/* add images in row */}




            </div>
            <div className="flex-1 flex flex-col justify-center text-center space-y-12 mt--12">
              <h1 className="text-4xl text-blue-800 tracking-widest uppercase"
                style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '1.5rem',
                  marginLeft: '-3rem'
                }}>
                EAST GODAVARI & WEST GODAVARI
              </h1>
              <h1 className="text-4xl text-blue-800 tracking-widest uppercase"
                style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '0.5rem'
                }}>
                REGIONAL CENTER <span className="text-red-800 text-6xl">SEMI FINAL</span>
              </h1>

                          {/* College Logo */}
           <div className="flex justify-center pt-8 pb-6">
              <img
                src="/imgs/17.png"
                alt="Logo"
                className="h-20 object-contain"
                style={{ borderRadius: '50%', marginRight: '-3rem', zIndex: 10, marginTop: '-0.4rem' }}
              />
              <img
                src="https://srkrec.edu.in/img/srkrec_full_name2.png"
                alt="SRKREC Logo"
                className="object-contain"
                style={{ height: '4.5rem', marginLeft: '-3rem', marginTop: '-0.4rem' }}
              />
            </div>

            </div>
            
          </div>
        ) : (
          <div className="bg-white min-h-screen w-full flex flex-col">
            

            {/* Event Details */}
            <div className="flex-1 flex flex-col justify-center text-center space-y-12">
              <div className="space-y-6  bg-yellow-400">
                <h1 className="text-5xl text-green-800 tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '2.5rem'
                  }}>
                  AMARAVATI QUANTUM VALLEY

                </h1>

                <br />
                <h1 className="text-5xl text-white p-3 bg-red-800 inline-block tracking-widest uppercase"
                  style={{
                    fontFamily: '"Arial Black", sans-serif',
                    letterSpacing: '0.1em',
                    marginTop: '-0.07rem',
                    marginBottom: '2.5rem'
                  }}>
                  HACKATHON 2025
                </h1>



                <div className="space-y-6" style={{ marginTop: '2rem' }}>
                  {(() => {
                    const timeData = formatTimeWithLabels(hours, minutes, seconds);
                    return (
                      <div className="flex justify-center items-center gap-8" style={{ marginBottom: '2.6rem' }}>

                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.hours}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">HOURS</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.minutes}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">MINUTES</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-system-ui font-bold text-black border-4 border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-lg">{timeData.seconds}</div>
                          <div className="text-lg font-medium text-gray-600 mt-2">SECONDS</div>
                        </div>
                      </div>
                    );
                  })()}

                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '-24rem', marginBottom: '-2.4rem', marginLeft: '2rem', marginRight: '2rem' }}>
                  <img
                    src="/imgs/14.png"
                    alt="Image 1"
                    style={{ borderRadius: '50%', height: '21rem', marginBottom: '-2.0rem' }}
                  />
                  <img
                    src="/imgs/15.png"
                    alt="Image 2"
                    style={{ borderRadius: '50%', height: '26rem', marginBottom: '-2.6rem' }}
                  />
                </div>

              </div>

              {/* add images in row */}




            </div>
            <div className="flex-1 flex flex-col justify-center text-center space-y-12 ">
              <h1 className="text-4xl text-blue-800 tracking-widest uppercase"
                style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '1.5rem',
                  marginLeft: '-3rem'
                }}>
                EAST GODAVARI & WEST GODAVARI
              </h1>
              <h1 className="text-4xl text-blue-800 tracking-widest uppercase"
                style={{
                  fontFamily: '"Arial Black", sans-serif',
                  letterSpacing: '0.1em',
                  marginTop: '0.5rem'
                }}>
                REGIONAL CENTER <span className="text-red-800 text-6xl">SEMI FINAL</span>
              </h1>

                          {/* College Logo */}
           <div className="flex justify-center">
              <img
                src="/imgs/17.png"
                alt="Logo"
                className="h-20 object-contain"
                style={{ borderRadius: '50%', marginRight: '-3rem', zIndex: 10, marginTop: '-0.4rem' }}
              />
              <img
                src="https://srkrec.edu.in/img/srkrec_full_name2.png"
                alt="SRKREC Logo"
                className="object-contain"
                style={{ height: '4.5rem', marginLeft: '-3rem', marginTop: '-0.4rem' }}
              />
            </div>
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

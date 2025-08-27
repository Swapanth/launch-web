import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface HourlyAnimationProps {
  currentHour: number;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const animationFiles = [
  '/json_animations/Rocket in space.json',
  '/json_animations/coffee-break.json',
  '/json_animations/Cat typing.json',
  '/json_animations/Idea Bulb.json',
  '/json_animations/Success.json',
  '/json_animations/Trophy.json',
  '/json_animations/Sunrise.json',
  '/json_animations/Face ID.json',
  '/json_animations/Burger.json',
  '/json_animations/Sleeping Piggy.json',
  '/json_animations/ERROR Animation.json',
  '/json_animations/Confetti.json'
];

const animationTitles = [
  '🚀 Launch Time!',
  '☕ Coffee Break',
  '🐱 Coding Cat',
  '💡 Bright Ideas',
  '✨ Success Mode',
  '🏆 Achievement',
  '🌅 New Dawn',
  '🔍 Focus Time',
  '🍔 Fuel Up',
  '😴 Power Nap',
  '⚠️ Debug Mode',
  '🎉 Celebration'
];

export const HourlyAnimation = ({ currentHour, isVisible, onAnimationComplete }: HourlyAnimationProps) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const loadAnimation = async () => {
      setIsLoading(true);
      try {
        const animationIndex = currentHour % animationFiles.length;
        const animationPath = animationFiles[animationIndex];
        const title = animationTitles[animationIndex];
        
        const response = await fetch(animationPath);
        if (!response.ok) throw new Error(`Failed to load animation: ${response.statusText}`);
        
        const data = await response.json();
        setAnimationData(data);
        setCurrentTitle(title);
      } catch (error) {
        console.error('Error loading hourly animation:', error);
        // Fallback to a simple animation or hide the component
        setAnimationData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnimation();
  }, [currentHour, isVisible]);

  const handleAnimationComplete = () => {
    setTimeout(() => {
      onAnimationComplete?.();
    }, 1000); // Keep visible for 1 extra second
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-background/95 backdrop-blur-md rounded-3xl shadow-2xl border border-primary/20 p-8 max-w-md mx-4 text-center">
        {/* Hour badge */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm">
          Hour {24 - currentHour}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-primary mb-4 mt-2">
          {currentTitle}
        </h3>

        {/* Animation Container */}
        <div className="w-48 h-48 mx-auto mb-4 flex items-center justify-center">
          {isLoading ? (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          ) : animationData ? (
            <Lottie
              animationData={animationData}
              autoplay={true}
              loop={false}
              style={{ width: '100%', height: '100%' }}
              onComplete={handleAnimationComplete}
            />
          ) : (
            <div className="text-6xl animate-bounce">
              {currentHour % 2 === 0 ? '🎭' : '⚡'}
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${((24 - currentHour) / 24) * 100}%` }}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Keep coding! You're doing great! 🚀
        </p>
      </div>
    </div>
  );
};

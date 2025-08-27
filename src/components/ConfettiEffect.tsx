import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface ConfettiProps {
  isActive: boolean;
}

export const ConfettiEffect = ({ isActive }: ConfettiProps) => {
  const [confettiAnimation, setConfettiAnimation] = useState(null);

  useEffect(() => {
    // Load the confetti animation from the public folder
    const loadAnimation = async () => {
      try {
        const response = await fetch('/json_animations/Confetti.json');
        const animationData = await response.json();
        setConfettiAnimation(animationData);
      } catch (error) {
        console.error('Failed to load confetti animation:', error);
      }
    };

    loadAnimation();
  }, []);

  if (!isActive || !confettiAnimation) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <Lottie
        animationData={confettiAnimation}
        loop={false}
        autoplay={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
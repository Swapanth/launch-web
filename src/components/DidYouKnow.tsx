import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

interface DidYouKnowProps {
  animationTrigger: number; // Changes every 10 minutes to trigger new animation
  isVisible: boolean;
}

export const DidYouKnow = ({ animationTrigger, isVisible }: DidYouKnowProps) => {
  const [fact, setFact] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catTypingAnimation, setCatTypingAnimation] = useState<any>(null);
  const [currentGradient, setCurrentGradient] = useState(0);

  // Fallback facts for offline/error scenarios
  const fallbackFacts = [
    'The first computer bug was an actual bug - a moth trapped in a Harvard Mark II computer in 1947! 🐛',
    'Python was named after Monty Python\'s Flying Circus, not the snake! 🐍',
    'The term "debugging" was coined by Admiral Grace Hopper in the 1940s! 🔧',
    'JavaScript was created in just 10 days by Brendan Eich in 1995! ⚡',
    'The first 1GB hard drive cost $40,000 and weighed 550 pounds in 1980! 💾',
    'Stack Overflow processes over 5,000 questions per day! 📚',
    'The word "robot" comes from the Czech word "robota," meaning forced labor! 🤖',
    'Git was created by Linus Torvalds in just 2 weeks! 🚀',
    'The @ symbol was used in emails for the first time in 1971! 📧',
    'WiFi doesn\'t stand for anything - it\'s just a catchy name! 📶'
  ];

  // Light gradient colors that change with each fact
  const gradientColors = [
    'bg-gradient-to-br from-blue-50 to-indigo-100',
    'bg-gradient-to-br from-purple-50 to-pink-100',
    'bg-gradient-to-br from-green-50 to-emerald-100',
    'bg-gradient-to-br from-yellow-50 to-orange-100',
    'bg-gradient-to-br from-rose-50 to-red-100',
    'bg-gradient-to-br from-cyan-50 to-teal-100',
    'bg-gradient-to-br from-violet-50 to-purple-100',
    'bg-gradient-to-br from-amber-50 to-yellow-100'
  ];

  // Load Cat Typing animation
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/json_animations/Cat typing.json');
        if (!response.ok) throw new Error(`Failed to load animation: ${response.statusText}`);
        
        const data = await response.json();
        setCatTypingAnimation(data);
      } catch (error) {
        console.error('Error loading Cat typing animation:', error);
        setCatTypingAnimation(null);
      }
    };

    loadAnimation();
  }, []);

  const fetchFact = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we're in development mode or if API is not available
      if (import.meta.env.DEV) {
        console.log('Development mode: using fallback facts');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
        setFact(randomFact);
        return;
      }

      console.log('Production mode: attempting API call');
      const response = await fetch('/api/get-fact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate a single, interesting and concise "Did you know?" fact about technology, programming, or science. The fact should be surprising and suitable for a hackathon audience. Do not include the "Did you know?" prefix in your response.'
        })
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      setFact(data.fact || 'Keep coding and stay curious! 🚀');
    } catch (error) {
      console.error('Error fetching fact:', error);
      setError('Could not fetch new fact');
      
      // Use fallback fact in case of error
      const randomFact = fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)];
      setFact(randomFact);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (animationTrigger >= 0) {
      fetchFact();
      // Change gradient color with each new fact
      setCurrentGradient(animationTrigger % gradientColors.length);
    }
  }, [animationTrigger]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto mt-16">
      {/* Cat Typing Animation - positioned at bottom left corner, touching card border */}
      <div className="absolute bottom-0 left-0 w-48 h-48 z-50 transform translate-x-[-50%] translate-y-[50%]">
        {catTypingAnimation ? (
          <Lottie
            animationData={catTypingAnimation}
            autoplay={true}
            loop={true}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        )}
      </div>

      {/* Did You Know Card */}
      <div className={`${gradientColors[currentGradient]} backdrop-blur-md rounded-xl shadow-lg border border-white/30 p-6 overflow-hidden transition-all duration-1000 ease-in-out`}>
        {/* Header with title and fact number */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">
            🧘 Did You Know?
          </h4>
          <div className="flex flex-col items-end">
            <div className="text-xs text-gray-700 uppercase tracking-wide font-medium">Fact</div>
            <div className="text-lg font-bold text-gray-900">
              #{animationTrigger + 1}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-gray-300/70 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-300/70 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-300/70 rounded animate-pulse w-5/6"></div>
            </div>
          ) : error ? (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          ) : (
            <p className="text-gray-900 leading-relaxed text-base font-medium">
              {fact}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

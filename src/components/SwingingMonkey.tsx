interface SwingingMonkeyProps {
  isVisible: boolean;
}

export const SwingingMonkey = ({ isVisible }: SwingingMonkeyProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40">
      <div className="relative w-full h-full">
        {/* Vine */}
        <div className="absolute top-0 left-1/4 w-1 h-32 bg-green-600 animate-vine-swing origin-top" />
        
        {/* Monkey */}
        <div className="absolute top-32 left-1/4 animate-monkey-swing origin-top">
          <div className="text-6xl transform -translate-x-1/2">
            🐵
          </div>
        </div>
      </div>
    </div>
  );
};
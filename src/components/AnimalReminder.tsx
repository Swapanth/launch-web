interface AnimalReminderProps {
  animalIndex: number;
}

const animals = [
  { emoji: '🦊', name: 'Fox', reminder: "Stay clever! Debug like a fox - methodical and sharp!" },
  { emoji: '🐨', name: 'Koala', reminder: "Take a breath! Even koalas pause between eucalyptus leaves." },
  { emoji: '🦁', name: 'Lion', reminder: "You're the king of this code jungle! Roar through those bugs!" },
  { emoji: '🐧', name: 'Penguin', reminder: "Cool as ice! Keep your code clean and your commits cooler." },
  { emoji: '🦜', name: 'Parrot', reminder: "Talk to your rubber duck! Explaining code helps find solutions." },
  { emoji: '🐙', name: 'Octopus', reminder: "Eight arms = multitasking master! But focus on one task at a time." },
  { emoji: '🦋', name: 'Butterfly', reminder: "Transform your ideas! Beautiful code emerges from iterations." },
  { emoji: '🐺', name: 'Wolf', reminder: "Hunt in packs! Collaborate and conquer together." },
  { emoji: '🦒', name: 'Giraffe', reminder: "Keep your head high! Look at the big picture, then zoom in." },
  { emoji: '🐢', name: 'Turtle', reminder: "Slow and steady wins! Quality over speed every time." },
  { emoji: '🦘', name: 'Kangaroo', reminder: "Hop to it! Small jumps forward are still progress." },
  { emoji: '🐳', name: 'Whale', reminder: "Go deep! Dive into the documentation when stuck." },
  { emoji: '🐱', name: 'Cat', reminder: "Land on your feet! Every error is a chance to learn." },
  { emoji: '🐵', name: 'Monkey', reminder: "Monkey see, monkey do! Learn from other developers' code." },
  { emoji: '🦔', name: 'Hedgehog', reminder: "Roll with the punches! Defensive coding protects your work." },
  { emoji: '🐻', name: 'Bear', reminder: "Hibernate mode OFF! You're in the zone, keep coding!" },
  { emoji: '🦌', name: 'Deer', reminder: "Grace under pressure! Handle those tight deadlines elegantly." },
  { emoji: '🐰', name: 'Rabbit', reminder: "Quick as a bunny! Fast iterations lead to great products." },
  { emoji: '🦥', name: 'Sloth', reminder: "Sometimes slow is good! Take time to think through complex logic." },
  { emoji: '🐕', name: 'Dog', reminder: "Loyal to the process! Stick to your coding principles." },
  { emoji: '🐸', name: 'Frog', reminder: "Leap forward! Big jumps in progress are possible with focus." },
  { emoji: '🦆', name: 'Duck', reminder: "Let problems roll off like water! Don't let setbacks stick." },
  { emoji: '🐼', name: 'Panda', reminder: "Black and white thinking! Sometimes the solution is simpler than it seems." },
  { emoji: '🦎', name: 'Lizard', reminder: "Adapt and survive! Flexible code handles changing requirements." },
  { emoji: '🐹', name: 'Hamster', reminder: "Keep running! You're making progress even when it doesn't feel like it." },
  { emoji: '🦨', name: 'Skunk', reminder: "Make a lasting impression! Write code that others will remember fondly." },
  { emoji: '🐿️', name: 'Squirrel', reminder: "Gather your resources! Save your work frequently." },
  { emoji: '🐦', name: 'Bird', reminder: "Fly high! Your code can soar above the competition." },
  { emoji: '🐴', name: 'Horse', reminder: "Stable code wins the race! Build a strong foundation first." },
  { emoji: '🐮', name: 'Cow', reminder: "Mooove forward! Don't get stuck on perfect - ship it!" },
  { emoji: '🐷', name: 'Pig', reminder: "Happy as a pig in mud! Enjoy the messy process of creation." },
  { emoji: '🐭', name: 'Mouse', reminder: "Small but mighty! Even tiny optimizations make a difference." },
  { emoji: '🦦', name: 'Otter', reminder: "Play while you work! Coding should be fun, not just functional." },
  { emoji: '🦌', name: 'Stag', reminder: "Stand tall and proud! You've got the antlers to tackle any challenge." },
  { emoji: '🐯', name: 'Tiger', reminder: "Pounce on opportunities! Great ideas need quick execution." },
  { emoji: '🦓', name: 'Zebra', reminder: "Every stripe tells a story! Document your code journey." },
  { emoji: '🐘', name: 'Elephant', reminder: "Never forget! Comment your code for future you." },
  { emoji: '🦏', name: 'Rhino', reminder: "Charge ahead! Sometimes you need to power through obstacles." },
  { emoji: '🐪', name: 'Camel', reminder: "Long journey ahead! Pace yourself for the full 24 hours." },
  { emoji: '🦙', name: 'Llama', reminder: "Stay cool, drama llama! Keep calm under pressure." },
  { emoji: '🐖', name: 'Pig', reminder: "Root around for solutions! The answer might be buried in the docs." },
  { emoji: '🦃', name: 'Turkey', reminder: "Don't be a turkey! Test your code before the final submission." },
  { emoji: '🐓', name: 'Rooster', reminder: "Rise and shine! Fresh eyes see fresh solutions." },
  { emoji: '🦅', name: 'Eagle', reminder: "Eagle-eyed debugging! Spot those bugs from miles away." },
  { emoji: '🦢', name: 'Swan', reminder: "Graceful under pressure! Make it look easy even when it's hard." },
  { emoji: '🐊', name: 'Crocodile', reminder: "Snap up opportunities! Quick reflexes catch the best ideas." },
  { emoji: '🐍', name: 'Snake', reminder: "Shed old code! Sometimes you need to rewrite to improve." },
  { emoji: '🦖', name: 'T-Rex', reminder: "Extinct thinking leads nowhere! Embrace modern solutions." },
  { emoji: '🐲', name: 'Dragon', reminder: "Breathe fire into your code! Passion shows in the final product." }
];

export const AnimalReminder = ({ animalIndex }: AnimalReminderProps) => {
  const animal = animals[animalIndex % animals.length];
  
  if (!animal) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div 
        className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl pointer-events-auto animal-bounce"
        style={{ animation: 'fade-in-up 0.5s ease-out' }}
      >
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">{animal.emoji}</div>
          <h3 className="text-2xl font-bold text-animal-primary">
            {animal.name} Says:
          </h3>
          <p className="text-lg text-card-foreground leading-relaxed">
            {animal.reminder}
          </p>
          <div className="flex justify-center mt-6">
            <div className="bg-animal-secondary/20 px-4 py-2 rounded-full">
              <span className="text-sm text-animal-secondary font-medium">
                Keep coding! 🚀
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
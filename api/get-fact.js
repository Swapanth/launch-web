// Simple JavaScript version without TypeScript compilation issues
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Function invoked successfully');
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);

    const { prompt } = req.body || {};

    if (!prompt) {
      console.error('No prompt provided in request body');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Curated tech facts for hackathon participants
    const techFacts = [
      'The first computer bug was literally a bug - a moth found in Harvard\'s Mark II computer in 1947! 🐛',
      'JavaScript was created in just 10 days by Brendan Eich in 1995! ⚡',
      'The term "debugging" was coined by Admiral Grace Hopper! 🔧',
      'Python was named after Monty Python\'s Flying Circus, not the snake! 🐍',
      'The first 1GB hard drive cost $40,000 and weighed 550 pounds in 1980! 💾',
      'Git was created by Linus Torvalds in just 2 weeks! 🚀',
      'The @ symbol was used in emails for the first time in 1971! 📧',
      'WiFi doesn\'t stand for anything - it\'s just a catchy name! 📶',
      'The first domain name ever registered was symbolics.com in 1985! 🌐',
      'The word "robot" comes from the Czech word "robota," meaning forced labor! 🤖',
      'The first website ever created is still online at info.cern.ch! 🌍',
      'C++ was originally called "C with Classes"! 📚',
      'The first computer mouse was made of wood in 1964! 🖱️',
      'HTML was invented by Tim Berners-Lee in just a few days! 📝',
      'The first emoji was created in 1999 by Shigetaka Kurita! 😊',
      'Stack Overflow gets over 50 million visitors each month! 📚',
      'The Linux kernel has over 27 million lines of code! 🐧',
      'The first computer virus was created in 1971 and was called "Creeper"! 🦠',
      'Google processes over 8.5 billion searches per day! 🔍',
      'The most expensive programming error cost $300 million - a missing hyphen in NASA code! 💸'
    ];

    // Select a random fact
    const randomFact = techFacts[Math.floor(Math.random() * techFacts.length)];
    
    console.log('Returning tech fact:', randomFact);
    return res.status(200).json({ fact: randomFact });

  } catch (error) {
    console.error('Function error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    // Return fallback fact even on error
    const fallbackFact = 'Keep coding and stay curious! Every bug is a learning opportunity! 🚀';
    return res.status(200).json({ fact: fallbackFact });
  }
}

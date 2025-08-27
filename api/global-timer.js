// Global timer API - stores the shared timer state with improved temporary storage
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Upstash Redis configuration
  const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  const TIMER_KEY = 'hackathon:global-timer';
  const hasRedis = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN;

  // Simple fetch-based Redis client for Upstash
  const redisCommand = async (command, ...args) => {
    if (!hasRedis) {
      return null;
    }

    try {
      const response = await fetch(`${UPSTASH_REDIS_REST_URL}/${command}/${args.join('/')}`, {
        headers: {
          'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Redis command failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis command error:', error);
      return null;
    }
  };

  try {
    if (req.method === 'POST') {
      // Start or update the global timer
      const { startTime, isStarted, curtainsOpen } = req.body;
      
      if (!startTime || typeof isStarted !== 'boolean') {
        return res.status(400).json({ error: 'Invalid timer data' });
      }

      const timerState = {
        startTime,
        isStarted,
        curtainsOpen,
        lastUpdated: Date.now()
      };

      console.log('Setting global timer state:', timerState);
      
      // Try Redis first, then fallback to global variable
      if (hasRedis) {
        const stored = await redisCommand('SETEX', TIMER_KEY, 86400, JSON.stringify(timerState));
        if (stored !== null) {
          console.log('Timer state saved to Redis (persistent)');
          return res.status(200).json({
            success: true,
            timerState,
            message: 'Global timer started (persistent storage)',
            persistent: true
          });
        }
      }
      
      // Fallback to global variable (temporary but better than nothing)
      global.globalTimerState = timerState;
      console.log('Timer state saved to memory (temporary)');
      
      return res.status(200).json({
        success: true,
        timerState,
        message: 'Global timer started (temporary storage)',
        persistent: false
      });
    }
    
    if (req.method === 'GET') {
      // Get the current global timer state
      console.log('Getting global timer state...');
      
      let timerState = null;
      let source = 'none';
      
      // Try Redis first
      if (hasRedis) {
        const redisData = await redisCommand('GET', TIMER_KEY);
        if (redisData) {
          try {
            timerState = JSON.parse(redisData);
            source = 'redis';
            console.log('Timer state retrieved from Redis');
          } catch (error) {
            console.error('Error parsing Redis data:', error);
          }
        }
      }
      
      // Fallback to global variable
      if (!timerState) {
        timerState = global.globalTimerState || null;
        if (timerState) {
          source = 'memory';
          console.log('Timer state retrieved from memory');
        }
      }
      
      // Check if the timer is still valid (not expired)
      if (timerState) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - timerState.startTime) / 1000);
        const totalSeconds = 24 * 60 * 60; // 24 hours
        
        if (elapsedSeconds >= totalSeconds) {
          // Timer has expired, clean it up
          if (hasRedis) {
            await redisCommand('DEL', TIMER_KEY);
          }
          global.globalTimerState = null;
          timerState = null;
          source = 'expired';
          console.log('Timer expired and cleaned up');
        }
      }
      
      return res.status(200).json({ 
        timerState,
        source,
        hasRedis,
        message: timerState ? `Active global timer found (${source})` : 'No active global timer'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Global timer API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

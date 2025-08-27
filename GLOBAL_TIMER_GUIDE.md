# Global Timer Setup Guide

## How It Works

The global timer feature allows the hackathon countdown to sync across all devices and users. When one person starts the timer on their computer, everyone else who opens the app will see the same synchronized countdown.

## Current Implementation

### Basic Functionality ✅
- **Global Timer API**: `/api/global-timer` 
- **GET**: Check for active global timer
- **POST**: Start/update global timer
- **Frontend Integration**: Automatically checks for global timer on load
- **Sync Indicator**: Shows when synced with global timer
- **Fallback**: Falls back to local storage if global timer unavailable

### Storage Limitations
The current implementation uses in-memory storage which works for testing but doesn't persist across serverless function restarts.

## For Production Use (Persistent Storage)

To make the global timer truly persistent across all users and deployments, you need to add a database. Here are the recommended options:

### Option 1: Upstash Redis (Recommended) 🚀

1. **Sign up for Upstash**: https://upstash.com/ (Free tier: 10,000 commands/day)
2. **Create a Redis database**
3. **Add environment variables to Vercel**:
   ```
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   ```
4. **Deploy**: The API will automatically use Redis when available

### Option 2: Vercel KV
1. Enable Vercel KV in your project dashboard
2. The API can be updated to use Vercel KV

### Option 3: Any Database
- PostgreSQL (Neon, Supabase, PlanetScale)
- MongoDB Atlas
- Firebase Firestore

## Current Behavior

**Without Persistent Storage:**
- Timer syncs during the same session
- Resets when serverless functions restart
- Still provides better UX than pure local storage

**With Persistent Storage:**
- Perfect synchronization across all devices
- Timer persists through deployments
- True global hackathon timer experience

## Usage

1. **Start Timer**: Press ENTER on any device
2. **Global Sync**: All other devices automatically sync to the same timer
3. **Visual Indicator**: Green dot shows when synced globally
4. **Automatic Fallback**: Uses local storage if global timer unavailable

## API Endpoints

### GET /api/global-timer
Returns current global timer state or null if none exists.

### POST /api/global-timer
Starts or updates the global timer.

**Body:**
```json
{
  "startTime": 1723551000000,
  "isStarted": true,
  "curtainsOpen": true
}
```

## Testing

1. Open the app on multiple devices/browsers
2. Start timer on one device (press ENTER)
3. Open app on another device
4. Second device should automatically sync to the running timer
5. Look for the green "Synced with global timer" indicator

## Benefits

✅ **Multi-device sync**: Works across computers, phones, tablets  
✅ **Team coordination**: Everyone sees the same countdown  
✅ **Automatic fallback**: Still works offline/without database  
✅ **Visual feedback**: Clear indicator when synced  
✅ **Zero configuration**: Works out of the box  

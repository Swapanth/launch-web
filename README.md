# 🎭 Hackathon Interactive Countdown Timer

An immersive, theater-themed hackathon countdown timer with realistic curtain animations, hourly surprises, and AI-powered "Did You Know?" facts.

## ✨ Features

### 🎬 Theatrical Experience
- **Realistic Curtain Animation**: Theater-style curtains with fabric textures, folds, and smooth opening animation
- **Stage Lighting**: Dynamic lighting effects that activate when the show begins
- **Dust Particles**: Atmospheric effects when curtains open for added realism
- **Confetti Celebration**: Professional Lottie animation when the timer starts

### ⏰ Smart Timer System
- **Persistent Timer**: Continues counting even after page refresh - no progress lost!
- **Hour-by-Hour Surprises**: Unique animations every hour using professional Lottie files
- **AI-Powered Facts**: "Did You Know?" facts from OpenAI API (with fallbacks for offline use)
- **Visual Progress**: Real-time progress bar showing hackathon completion

### 🎮 Interactive Controls
- **Enter to Start**: Press Enter to begin the 24-hour countdown with curtain reveal
- **Ctrl+P to Reset**: Emergency reset functionality (prevents accidental browser print)
- **Automatic State Saving**: Timer state persists across browser sessions

### 🎨 Rich Animations
- **12 Unique Hourly Animations**: Rocket launches, coffee breaks, coding cats, and more
- **Animal Reminders**: Periodic reminders with different animals every 10 minutes
- **Swinging Monkey**: Fun distraction every 5 minutes
- **Smooth Transitions**: Professional-grade animations using Lottie

## 🚀 Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lottie React** for professional animations
- **OpenAI API** for dynamic facts
- **Vercel** for serverless deployment

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd curtain-critters-countdown

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### API Integration

The app includes a serverless function (`/api/get-fact.ts`) that:
- Securely calls OpenAI API without exposing your key
- Provides tech-related "Did You Know?" facts
- Falls back to predefined facts if API is unavailable

## 🎯 Usage

1. **Start the Timer**: Press `Enter` to begin the 24-hour countdown
2. **Watch the Show**: Enjoy realistic curtain opening animation with confetti
3. **Hourly Surprises**: Get unique animations and facts every hour
4. **Reset if Needed**: Press `Ctrl+P` to reset the timer
5. **Persistent Progress**: Close browser, timer continues on return!

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/31c43d5c-20d1-4ab6-abbd-9f908aded1e1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/31c43d5c-20d1-4ab6-abbd-9f908aded1e1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

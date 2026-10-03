# Apex Arena: Multi-Game Championship Platform

> A competitive, multi-game esports gaming hub featuring real-time multiplayer matchmaking, integrated voice communications, global leaderboards, daily tournament brackets, cosmetic armory, cloud progression synchronization, and the Sentinel Anti-Cheat fair play system.

---

## 🏆 Table of Contents

- [Overview](#-overview)
- [Featured Games](#-featured-games)
  - [1. Grandmaster Blitz Chess](#1-grandmaster-blitz-chess)
  - [2. Nitro Apex: Cyber Racing](#2-nitro-apex-cyber-racing)
  - [3. Cyber 21: High-Stakes Duel](#3-cyber-21-high-stakes-duel)
- [Platform Features](#-platform-features)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [How to Run](#-how-to-run)
- [Game Controls](#-game-controls)
- [System Architecture & Technologies](#-system-architecture--technologies)
- [Configuration & Environment](#-configuration--environment)
- [License](#-license)

---

## ⚡ Overview

**Apex Arena** is an all-in-one browser-based competitive gaming platform designed for high-performance esports play. Players can switch seamlessly between tactical strategy (Blitz Chess), fast-paced arcade reflex driving (Nitro Apex Racing), and risk-management card play (Cyber 21).

All games are integrated with a unified player profile, global Elo rating system, rank tiers (*Bronze to Grandmaster*), real-time simulated matchmaking queue, Web Audio API procedural sound synthesizer, voice comms visualizer, in-app push notifications, and cryptographic cloud save synchronization.

---

## 🎮 Featured Games

### 1. Grandmaster Blitz Chess
- **Engine**: Complete standard chess rule implementation including legal move validation, pawn double-step, en passant captures, kingside & queenside castling, pawn promotion, check, checkmate, and stalemate detection.
- **Clocks**: Configurable real-time digital chess clocks (1m Bullet, 3m Blitz, 5m Rapid) with low-time warning indicators.
- **Modes**:
  - *Online Ranked*: Simulated MMR-based opponent matchmaking with human-like move think times.
  - *AI Engine Practice*: 3 selectable difficulties (Novice 850 Elo, Tactical Club 1550 Elo, Grandmaster 2350 Elo).
  - *1v1 Local Pass & Play*: Turn-based 2-player mode on the same device.
- **Cosmetics**: Customizable board themes (Cyber Neon, Obsidian Gold, Royal Marble, and Hologram Matrix).
- **Notation**: Live algebraic move notation (PGN) log with captured pieces shelf and material balance counter.
- **Emotes**: Quick tactical reaction wheel ("Good luck!", "Nice move!", "Well played!", "GG!").

### 2. Nitro Apex: Cyber Racing
- **Engine**: 60 FPS HTML5 Canvas arcade racing simulation with responsive physics, dynamic road curvature, and parallax road markings.
- **Mechanics**:
  - *Steering & Cornering*: Smooth directional handling with drift mechanics and tire skid marks.
  - *Nitro Turbo Boost*: Collect nitro fuel tanks on track and trigger explosive speed acceleration with screen shake, speed lines, and particle exhaust flames.
  - *Dynamic AI Rivals*: 4 competitor cars (Viper, Apex Phantom, Solaris, Zenith) with overtaking and lane-shifting behavior.
  - *Track Items & Hazards*: Speed boost slingshot pads, collectible arena coin caches, nitro canisters, and oil slick hazards that cause spin-outs.
- **Telemetry HUD**: Real-time digital speedometer (0–240 MPH), top record tracker, nitro fuel gauge, lap counter (3-lap circuits), live race position tracker (e.g., P1/5), and lap timer.
- **Podium**: Post-race victory fanfare with podium placement, time breakdown, and rating calculation.

### 3. Cyber 21: High-Stakes Duel
- **Engine**: Fast-paced competitive blackjack card table with a standard 6-deck shoe and provably fair cryptographic shuffling.
- **Rules**:
  - Standard blackjack rules with Natural 21 payout (3:2).
  - Actions: *Hit*, *Stand*, *Double Down* (2x bet with 1 final card).
  - Dealer AI draws until reaching soft 17.
- **Table Opponents**: Live simulated table competitor cards showing actions and hand values.
- **Betting System**: Configurable chip stakes ($25, $50, $100, $250) with table pot pooling and streak multiplier bonuses.
- **Sound Effects**: Procedural card flips, card dealing snaps, and casino poker chip clinks.

---

## 🌟 Platform Features

- **Global & Social Leaderboards**:
  - 7 competitive rank tiers: *Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster*.
  - Scope filters: *Global*, *Friends List*, and *Regional* (NA, EU, APAC).
  - Game-specific MMR filters (Overall, Blitz Chess, Nitro Racing, Cyber 21).
  - Live rank deltas (▲ +2, ▼ -1) and direct 1v1 challenge duel buttons.
- **Multiplayer Matchmaking Lobby**:
  - Real-time queue simulation with radar pulse scanner, estimated wait times, and regional ping selection.
  - Match Found modal with opponent preview card (rank, avatar, MMR, win rate) and 10-second acceptance timer.
  - Custom private room invite codes (`APEX-XXXX`) for playing with friends.
- **Integrated Voice Comms Hub**:
  - Live microphone input support via browser Web Audio API FFT analyzer with real-time frequency spectrum visualization.
  - Push-to-Talk (PTT) and Voice Activity modes.
  - Mute microphone and deafen headphones toggles.
  - Active speaker halo rings and volume sliders per squad member.
  - Channels: *Squad Comms*, *Global Lobby*, and *Match Direct Comms*.
- **Sentinel Anti-Cheat Shield**:
  - Real-time client integrity verification.
  - Keystroke cadence jitter analysis, move timing variance, and memory hash validation.
  - 100% Verified Clean fair play certificate badge.
  - Forensic reporting system with incident ticket generation.
- **Daily Tournaments & Championship Brackets**:
  - Scheduled cups: *Apex Daily Blitz Championship*, *Neon Tokyo Grand Prix*, and *Midnight Cyber 21 Invitational*.
  - Live single-elimination bracket tree visualizer (*Quarterfinals → Semifinals → Finals*).
  - Entry fee enrollment with Coin & Gem prize pool payouts.
- **Cosmetics Armory & Locker**:
  - Daily rotating shop with countdown timer.
  - Unlockable skins for chess pieces, hypercars, card decks, prestige titles, and banners.
  - In-game currencies: Coins (earned by playing) and Gems (earned via tournaments & achievements).
  - Inventory management to equip and unequip owned items.
- **Seasonal Battle Pass & Retention**:
  - *Season 1: Neon Genesis* 8-tier progression ladder with Free and Premium reward tracks.
  - 7-Day login streak calendar with escalating rewards (Coins, Gems, Exclusive Skins).
  - Daily quests with real-time objective tracking and instant reward claiming.
- **Social Hub & Cross-Platform Chat**:
  - Friends list with live status indicators (*Online, In Match, Away, Offline*), 1v1 challenge trigger, and match spectating.
  - Cross-platform chat with *Global*, *Squad*, and *Match* channels.
- **Social Media Share Brag Card**:
  - Generates high-resolution social achievement cards with current MMR, victories, win streak, and rank badge.
  - One-click copy link and direct share to X (Twitter).
- **Cloud Progression & Offline Travel Mode**:
  - LocalStorage persistence with SHA-256 cloud sync digest hash.
  - One-click "Sync to Cloud" and JSON save file export/import.
  - Offline Travel Mode toggle to play against tactical bots without internet access.
  - Two-Factor Authentication (2FA) with rolling 6-digit TOTP security tokens.
  - In-app push notification toast system for friend status and tournament alerts.
  - 4 themes (*Obsidian Dark, Cyber Neon, Midnight OLED, Esports Crisp*).
  - 7 languages supported (*English, Español, Français, Deutsch, 日本語, Português, 简体中文*).

---

## 📁 Project Directory Structure

```text
├── index.html                           # HTML entry point with fonts and metadata
├── metadata.json                        # App capabilities and permissions
├── package.json                         # Project dependencies and run scripts
├── tsconfig.json                        # TypeScript compiler configuration
├── vite.config.ts                       # Vite build and Tailwind CSS configuration
├── src/
│   ├── main.tsx                         # React 19 application root bootstrap
│   ├── App.tsx                          # Core state orchestration & navigation
│   ├── index.css                        # Tailwind CSS v4 setup & custom scrollbars
│   ├── types/
│   │   └── index.ts                     # TypeScript data models and interfaces
│   ├── utils/
│   │   ├── soundEffects.ts              # Web Audio API procedural sound synthesizer
│   │   ├── storage.ts                   # LocalStorage & cloud sync persistence
│   │   └── i18n.ts                      # Multi-language localization dictionary
│   └── components/
│       ├── navigation/
│       │   └── TopBar.tsx               # 3-zone header conforming to Top Bar Contract
│       ├── games/
│       │   ├── GameHub.tsx              # Main arena game selector and router
│       │   ├── chess/
│       │   │   ├── chessEngine.ts       # Chess rules, move generator & StockAI bot
│       │   │   └── ChessGame.tsx        # Interactive Blitz Chess game component
│       │   ├── racing/
│       │   │   └── RacingGame.tsx       # 60 FPS HTML5 Canvas arcade racing game
│       │   └── cards/
│       │       └── CardGame.tsx         # Cyber 21 high-stakes card duel component
│       ├── multiplayer/
│       │   └── MatchmakingModal.tsx     # Real-time matchmaking queue & lobby modal
│       ├── social/
│       │   ├── VoiceChatHub.tsx         # Voice comms & Web Audio mic visualizer
│       │   ├── SocialDrawer.tsx         # Friends list & cross-platform chat drawer
│       │   └── ShareCardModal.tsx       # Exportable social brag card generator
│       ├── leaderboard/
│       │   └── LeaderboardView.tsx      # Global, friends, and regional leaderboards
│       ├── tournaments/
│       │   └── TournamentsView.tsx      # Championship bracket tree & daily cups
│       ├── shop/
│       │   └── ShopView.tsx             # Cosmetics armory & inventory locker
│       ├── rewards/
│       │   ├── DailyRewardsModal.tsx    # 7-day login streak & daily quests
│       │   └── BattlePassView.tsx       # Seasonal battle pass progression ladder
│       ├── profile/
│       │   └── ProfileView.tsx          # Customizable player identity & analytics
│       ├── anticheat/
│       │   └── AntiCheatModal.tsx       # Sentinel Anti-Cheat shield & report modal
│       ├── settings/
│       │   └── SettingsModal.tsx        # Cloud sync, 2FA, languages, and theme modal
│       └── notifications/
│           └── NotificationToast.tsx    # Floating in-app push notification alerts
```

---

## 💻 Prerequisites

Ensure you have the following installed on your development machine:

- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` recommended)
- **Package Manager**: `npm` (v9+), `pnpm`, `yarn`, or `bun`
- A modern browser with Web Audio API and HTML5 Canvas support (Chrome, Firefox, Safari, Edge)

---

## 📥 Installation Guide

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/apex-arena.git
cd apex-arena
```

### 2. Install Dependencies
Run the install command with your preferred package manager:

```bash
# Using npm
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install

# Or using bun
bun install
```

### 3. Verify TypeScript Compilation
Check that all types and components build without errors:

```bash
npm run lint
```

---

## 🚀 How to Run

### Development Mode
Start the Vite local development server on port 3000:

```bash
npm run dev
```

Once started, open your browser and navigate to:
```text
http://localhost:3000
```

### Production Build
To create an optimized production build:

```bash
npm run build
```
This generates the compiled static assets in the `/dist` directory.

### Preview Production Build
To test the production build locally:

```bash
npm run preview
```

### Clean Build Cache
To delete temporary build artifacts:

```bash
npm run clean
```

---

## 🕹️ Game Controls

### Grandmaster Blitz Chess
- **Select Piece**: Click on any of your white pieces (highlighted in cyan).
- **Move Piece**: Click on any valid destination square (marked with blue indicator dots or red capture rings).
- **Resign / Rematch**: Use the action toolbar on the right panel.
- **Emotes**: Click **Tactical Emotes** to send quick communication to your opponent.

### Nitro Apex: Cyber Racing
- **Steer Left**: `A` or `Left Arrow (◄)`
- **Steer Right**: `D` or `Right Arrow (►)`
- **Accelerate**: `W` or `Up Arrow (▲)`
- **Brake / Reverse**: `S` or `Down Arrow (▼)`
- **Nitro Turbo Boost**: `Spacebar` or `Shift`
- **Mobile Controls**: On touchscreens, dedicated on-screen steering and gas/nitro buttons appear automatically.

### Cyber 21: High-Stakes Duel
- **Place Bet**: Select a chip stake ($25, $50, $100, $250).
- **Deal**: Click **Deal Hand** to receive your cards.
- **Hit**: Click **Hit (+Card)** to request another card.
- **Stand**: Click **Stand** to lock in your score and pass turn to the dealer.
- **Double Down**: Click **Double Down** on your first 2 cards to double your bet for exactly one extra card.

---

## 🛠️ System Architecture & Technologies

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Type Safety**: [TypeScript 5+](https://www.typescriptlang.org/)
- **Audio Synthesis**: Native browser [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (zero external audio file dependencies)
- **Graphics & Animation**: HTML5 2D Canvas & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Typography**: Google Fonts (*Outfit*, *Plus Jakarta Sans*, *JetBrains Mono*)
- **Data Persistence**: Browser LocalStorage with SHA-256 cloud sync simulation and JSON backup exports

---

## ⚙️ Configuration & Environment

The app works out of the box with zero external configuration required. If integrating with Google Gemini AI or Cloud Run endpoints, an `.env.example` file is provided:

```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | (Optional) API key for server-side Google Gemini AI features |
| `APP_URL` | (Optional) Canonical URL for hosted deployments |

---

## 📄 License

This project is licensed under the Apache 2.0 License. See the file headers for copyright details.

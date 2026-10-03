# Apex Arena: Multi-Game Championship Platform

> A competitive, high-performance browser-based esports gaming hub featuring real-time multiplayer matchmaking, integrated voice communications, global leaderboards, daily tournament brackets, cosmetic armory, cloud progression synchronization, and the Sentinel Anti-Cheat fair play system.

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Installation Instructions](#3-step-by-step-installation-instructions)
4. [Running the Development Server](#4-running-the-development-server)
5. [Project Structure & Organization](#5-project-structure--organization)
6. [Building for Production](#6-building-for-production)
7. [Featured Games & Detailed Rules](#7-featured-games--detailed-rules)
8. [Game Controls](#8-game-controls)
9. [Platform Features](#9-platform-features)
10. [Configuration & Environment](#10-configuration--environment)
11. [License](#11-license)

---

## 1. Project Overview

**Apex Arena** is an all-in-one browser-based competitive gaming platform designed for high-performance esports play. Players can compete across three distinct game disciplines:

1. **Grandmaster Blitz Chess**: Tactical strategy chess with FIDE standard rules, Blitz clocks (1m/3m/5m), live algebraic move notation, captured pieces shelf, and StockAI bots (Novice, Club, Master).
2. **Nitro Apex: Cyber Racing**: 60 FPS HTML5 Canvas arcade racer with responsive drift physics, tire skid marks, nitro turbo boost, 4 dynamic AI rival racers, speed pads, coin caches, and oil slick hazards.
3. **Cyber 21: High-Stakes Duel**: Fast-paced competitive blackjack card table with provably fair shuffled 6-deck shoe, natural 21 (3:2 payout), dealer soft 17, double down, and live table opponents.

### Unified Competitive Infrastructure
All three games are linked together through:
- **Global & Social Leaderboards**: 7 competitive tiers (*Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster*) with global, friends, and regional filters.
- **Real-Time Matchmaking Queue**: Radar scan simulation, estimated wait timers, MMR matching, regional ping selection, and custom private room invite codes.
- **Integrated Voice Comms Hub**: Real microphone FFT spectrum analyzer using the browser Web Audio API, Push-to-Talk (PTT), mute/deafen toggles, and teammate volume controls.
- **Sentinel Anti-Cheat Shield**: Real-time memory hash verification, keystroke cadence jitter detection, and fair play certification.
- **Daily Tournaments**: Single-elimination interactive bracket tree (*Quarterfinals → Semifinals → Finals*) with coin and gem prize pools.
- **Cosmetics Armory & Inventory**: Daily rotating shop to unlock and equip custom chess pieces, hypercar skins, and holographic decks.
- **Cloud Save & Offline Travel Mode**: Cross-platform progression with SHA-256 cloud sync hashes, JSON export/import backup, and offline local bot play.
- **Customizable Player Profiles**: Nickname call-sign, avatar emblem, prestige titles, win rates, and verified match history.
- **Accessibility & Localization**: 4 display themes (*Obsidian Dark, Cyber Neon, Midnight OLED, Esports Crisp*) and 7 languages (*English, Español, Français, Deutsch, 日本語, Português, 简体中文*).

---

## 2. Prerequisites

Before installing and running the project, make sure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` LTS recommended). Verify with:
  ```bash
  node -v
  ```
- **Package Manager**: One of the following:
  - **npm**: `v9.0.0` or higher (comes bundled with Node.js). Verify with `npm -v`
  - **yarn**: `v1.22+` or Yarn Berry (`yarn -v`)
  - **pnpm**: `v8.0+` (`pnpm -v`)
  - **bun**: `v1.0+` (`bun -v`)
- **Browser**: Any modern web browser with HTML5 Canvas and Web Audio API support (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, Brave).

---

## 3. Step-by-Step Installation Instructions

Follow these exact steps to clone the repository and install all required project dependencies:

### Step 1: Clone the Repository
Open your terminal and clone the repository using Git:
```bash
git clone https://github.com/your-username/apex-arena.git
```

### Step 2: Navigate to the Project Folder
```bash
cd apex-arena
```

### Step 3: Install Dependencies
Run the installation command using your package manager of choice:

```bash
# Using npm (Standard)
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install

# Or using bun
bun install
```

This will automatically install all core dependencies (`react`, `react-dom`, `vite`, `@tailwindcss/vite`, `lucide-react`, `motion`, `canvas-confetti`, `express`) and development tooling (`typescript`, `@types/node`, `@types/react`, `esbuild`, `tsx`).

### Step 4: Verify Type Integrity (Optional)
Run TypeScript compiler check to verify that all typings are pristine:
```bash
npm run lint
```

---

## 4. Running the Development Server

To launch the local interactive development server with hot-reloading:

```bash
# Using npm
npm run dev

# Or using yarn
yarn dev

# Or using pnpm
pnpm dev

# Or using bun
bun run dev
```

### Accessing the Application
Once the terminal displays:
```text
  VITE v8.3.0  ready in 240 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```
Open your web browser and navigate to:
```text
http://localhost:3000
```

The game platform will load immediately with the full suite of interactive games, leaderboards, sound synthesizer, and multiplayer lobby ready for play.

---

## 5. Project Structure & Organization

The codebase is organized into modular directories following clean architecture principles:

```text
├── index.html                           # HTML entry point with meta tags, title, and Google Fonts
├── metadata.json                        # App capabilities and permissions declaration
├── package.json                         # Project dependencies, scripts, and package metadata
├── tsconfig.json                        # TypeScript compiler paths and compilation options
├── vite.config.ts                       # Vite bundler configuration with Tailwind CSS v4 plugin
├── .env.example                         # Example environment variables template
├── README.md                            # Comprehensive project documentation
└── src/
    ├── main.tsx                         # React 19 application entry bootstrap
    ├── App.tsx                          # Top-level state orchestration, routing & modal management
    ├── index.css                        # Tailwind CSS v4 design system & custom scrollbar styles
    ├── types/
    │   └── index.ts                     # TypeScript data models (PlayerProfile, MatchHistory, Quests, etc.)
    ├── utils/
    │   ├── soundEffects.ts              # Web Audio API procedural sound synthesizer (no external audio files)
    │   ├── storage.ts                   # LocalStorage persistence, seed data & cloud sync hashing
    │   └── i18n.ts                      # Multi-language localization dictionary for 7 languages
    └── components/
        ├── navigation/
        │   └── TopBar.tsx               # Header strictly following the 3-zone Top Bar Contract
        ├── replays/
        │   └── ReplaysView.tsx          # Match replay theater with step-by-step playback controls
        ├── games/
        │   ├── GameHub.tsx              # Main arena game selector and router
        │   ├── chess/
        │   │   ├── chessEngine.ts       # Chess rules, move generator, minimax bot & algebraic notation
        │   │   └── ChessGame.tsx        # Interactive Blitz Chess game board and HUD
        │   ├── racing/
        │   │   └── RacingGame.tsx       # 60 FPS HTML5 Canvas arcade racing game and telemetry HUD
        │   └── cards/
        │       └── CardGame.tsx         # Cyber 21 high-stakes card duel and casino table
        ├── multiplayer/
        │   └── MatchmakingModal.tsx     # Real-time matchmaking queue, radar scanner & room codes
        ├── social/
        │   ├── VoiceChatHub.tsx         # Voice comms hub with live Web Audio mic frequency visualizer
        │   ├── SocialDrawer.tsx         # Friends list with online status & cross-platform chat channels
        │   └── ShareCardModal.tsx       # High-resolution social achievement card generator
        ├── leaderboard/
        │   └── LeaderboardView.tsx      # Global, friends, and regional ranked tier ladders
        ├── tournaments/
        │   └── TournamentsView.tsx      # Championship bracket tree (Quarterfinals/Semifinals/Finals)
        ├── shop/
        │   └── ShopView.tsx             # Cosmetics armory & player inventory locker
        ├── rewards/
        │   ├── DailyRewardsModal.tsx    # 7-day progressive login streak calendar & daily quests
        │   └── BattlePassView.tsx       # Seasonal battle pass progression ladder
        ├── profile/
        │   └── ProfileView.tsx          # Customizable player call-sign, avatar, title & analytics
        ├── anticheat/
        │   └── AntiCheatModal.tsx       # Sentinel Anti-Cheat shield, memory hash & report modal
        ├── settings/
        │   └── SettingsModal.tsx        # Cloud sync, 2FA authenticator, theme & language modal
        └── notifications/
            └── NotificationToast.tsx    # Floating in-app push notification alerts
```

---

## 6. Building for Production

To compile, bundle, and optimize the application for production deployment:

### 1. Run the Production Build Command
```bash
# Using npm
npm run build

# Or using yarn
yarn build

# Or using pnpm
pnpm build

# Or using bun
bun run build
```

### 2. Output
Vite will compile all TypeScript code, bundle and minify JavaScript, process Tailwind CSS, and output static production-ready assets into the `/dist` directory:
```text
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

### 3. Preview the Production Build Locally
You can test and verify the optimized production build before deployment by running:
```bash
npm run preview
```
This serves the `/dist` folder locally at `http://localhost:4173` (or port specified by Vite).

### 4. Deployment Targets
The output in `/dist` can be deployed instantly to any static hosting provider or container environment:
- **Cloud Run / Docker**: Serve using a lightweight static file server or Node.js Express.
- **Vercel / Netlify / Cloudflare Pages / GitHub Pages**: Point the build output directory to `dist`.

---

## 7. Featured Games & Detailed Rules

### Grandmaster Blitz Chess
- **Board Coordinates**: 8x8 standard grid with algebraic rank (1–8) and file (a–h) notation.
- **Move Validation**: Legal move generator preventing moves into check, supporting pawn double-push, en passant diagonal captures, kingside and queenside castling, and pawn promotion.
- **Game End Conditions**: Accurate checkmate, stalemate, draw by insufficient material, and clock timeout detection.
- **Clocks**: Configurable 1m Bullet, 3m Blitz, and 5m Rapid time controls.
- **AI Bots**: Novice (850 Elo), Tactical Club (1550 Elo), and Grandmaster (2350 Elo) utilizing minimax with positional center-control heuristics.

### Nitro Apex: Cyber Racing
- **Physics Engine**: Top-down / forward-scrolling canvas circuit with realistic drift physics, tire skid mark trails, and cornering drag.
- **Speed & Boost**: Max standard speed of 180 MPH, boosted up to 240 MPH using Nitro Turbo.
- **Track Hazards & Pickups**:
  - *Nitro Canisters*: Replenish nitro boost gauge by +35%.
  - *Arena Coins*: Collectible currency for the cosmetics shop.
  - *Slingshot Speed Pads*: Instant 50 MPH acceleration slingshot.
  - *Oil Slicks*: Cause temporary vehicle spin-outs and loss of traction.
- **AI Competitors**: 4 dynamic opponents that draft, overtake, and maintain competitive track positions.

### Cyber 21: High-Stakes Duel
- **Deck Shoe**: Shuffled 6-deck shoe with cryptographic random distribution.
- **Hand Valuation**: Number cards (face value), Face cards J/Q/K (10), Aces (1 or 11 dynamically calculated to avoid busting).
- **Player Actions**:
  - *Hit*: Draw 1 additional card.
  - *Stand*: Lock current hand value and pass turn.
  - *Double Down*: Double initial bet in exchange for exactly 1 final card.
- **Dealer Rules**: Dealer must draw on hands $\le 16$ and stand on soft 17.

---

## 8. Game Controls

| Game | Action | Keyboard / Mouse Control | Mobile / Touch Screen |
| :--- | :--- | :--- | :--- |
| **Chess** | Select Piece | Left Click on Piece | Tap Piece |
| **Chess** | Move Piece | Left Click on Highlighted Square | Tap Highlighted Square |
| **Chess** | Resign / Rematch | Click Toolbar Button | Tap Toolbar Button |
| **Chess** | Send Emotes | Click Emote Button | Tap Emote Button |
| **Racing** | Steer Left / Right | `A` / `D` or `Left` / `Right Arrow` | On-Screen `◀` / `▶` Buttons |
| **Racing** | Accelerate | `W` or `Up Arrow` | On-Screen `GAS` Button |
| **Racing** | Brake / Reverse | `S` or `Down Arrow` | Release Gas / Down Control |
| **Racing** | Nitro Boost | `Spacebar` or `Shift` | On-Screen `NITRO` Button |
| **Cards** | Place Stake | Click Chip ($25, $50, $100, $250) | Tap Chip Button |
| **Cards** | Deal Hand | Click `Deal Hand` | Tap `Deal Hand` |
| **Cards** | Hit / Stand | Click `Hit` or `Stand` | Tap `Hit` or `Stand` |
| **Cards** | Double Down | Click `Double Down` | Tap `Double Down` |

---

## 9. Platform Features

- **Rank Tiers**: Bronze, Silver, Gold, Platinum, Diamond, Master, Grandmaster.
- **Voice Comms**: FFT Spectrum visualizer, Push-to-Talk (PTT), volume sliders, and active speaker halo indicators.
- **Anti-Cheat Sentinel Shield**: Live telemetry, memory hash verification, input cadence jitter monitor, and reporting tickets.
- **Daily Quests & Streak Calendar**: 7-day progressive retention rewards calendar with Coins, Gems, and exclusive skins.
- **Seasonal Battle Pass**: 8-tier *Season 1: Neon Genesis* progression ladder with Free and Premium reward paths.
- **Cross-Platform Cloud Sync**: LocalStorage persistence with SHA-256 cloud sync digest hash, JSON export/import backups, and 2FA authenticator with live 6-digit TOTP tokens.
- **Match Replay Theater**: Step-by-step interactive playback with Framer Motion transitions across moves, telemetry, and cards.
- **Social Media Share Card**: Generates exportable competitor cards with one-click sharing to X (Twitter).

---

## 10. Configuration & Environment

The application runs directly in any modern browser without requiring external database provisioning or API keys. If you want to connect Google Gemini AI services or hosted Cloud Run domains, an `.env.example` template is provided:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | (Optional) API key for Google Gemini generative AI features | `""` |
| `APP_URL` | (Optional) Canonical production host URL | `""` |

---

## 11. License

This project is licensed under the Apache 2.0 License. See source file headers for license details.

import React, { useState } from 'react';
import { GameId, PlayerProfile, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../utils/i18n';
import { sounds } from '../../utils/soundEffects';
import { ChessGame } from './chess/ChessGame';
import { RacingGame } from './racing/RacingGame';
import { CardGame } from './cards/CardGame';
import {
  Swords,
  Play,
  Bot,
  Users,
  Trophy,
  ArrowLeft,
  Sparkles,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';

interface GameHubProps {
  playerProfile: PlayerProfile;
  currentLanguage: LanguageCode;
  activeGame: GameId | null;
  onSelectGame: (game: GameId | null) => void;
  onOpenMatchmakingForGame: (game: GameId) => void;
  onMatchComplete: (game: GameId, result: 'VICTORY' | 'DEFEAT' | 'DRAW', eloDelta: number, coinsEarned: number) => void;
  onlineOpponent?: { name: string; avatar: string; rating: number; title: string } | null;
  onOpenSquadTraining?: () => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  playerProfile,
  currentLanguage,
  activeGame,
  onSelectGame,
  onOpenMatchmakingForGame,
  onMatchComplete,
  onlineOpponent,
  onOpenSquadTraining,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  // If a game is active, render that game
  if (activeGame === 'CHESS') {
    return (
      <div className="flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectGame(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Arena Hub
          </button>
        </div>
        <ChessGame
          playerProfile={playerProfile}
          onlineOpponent={onlineOpponent}
          onMatchComplete={(res, elo, coins) => onMatchComplete('CHESS', res, elo, coins)}
        />
      </div>
    );
  }

  if (activeGame === 'CAR_RACING') {
    return (
      <div className="flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectGame(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Arena Hub
          </button>
        </div>
        <RacingGame
          playerProfile={playerProfile}
          onRaceComplete={(place, time, elo, coins) => {
            const res = place === 1 ? 'VICTORY' : place <= 3 ? 'DRAW' : 'DEFEAT';
            onMatchComplete('CAR_RACING', res, elo, coins);
          }}
        />
      </div>
    );
  }

  if (activeGame === 'CARD_GAME') {
    return (
      <div className="flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectGame(null);
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Arena Hub
          </button>
        </div>
        <CardGame
          playerProfile={playerProfile}
          onlineOpponent={onlineOpponent}
          onGameComplete={(res, elo, coins) => onMatchComplete('CARD_GAME', res, elo, coins)}
        />
      </div>
    );
  }

  // Arena Game Selection Screen
  const gamesList = [
    {
      id: 'CHESS' as GameId,
      title: t.chess_title,
      desc: t.chess_desc,
      icon: '♟',
      accentColor: '#06b6d4',
      bgGrad: 'from-cyan-950/40 via-slate-900 to-slate-950',
      borderAccent: 'border-cyan-500/30 hover:border-cyan-400',
      rating: playerProfile.ratings.chess,
      stats: `${playerProfile.stats.chessWins} Wins · ${playerProfile.stats.chessLosses} Losses`,
      features: ['3m Blitz Clocks', 'StockAI Bot engine', 'Algebraic Notation', 'Anti-Cheat Analysis'],
    },
    {
      id: 'CAR_RACING' as GameId,
      title: t.racing_title,
      desc: t.racing_desc,
      icon: '🏎️',
      accentColor: '#8b5cf6',
      bgGrad: 'from-indigo-950/40 via-slate-900 to-slate-950',
      borderAccent: 'border-indigo-500/30 hover:border-indigo-400',
      rating: playerProfile.ratings.racing,
      stats: `${playerProfile.stats.racingFirstPlaces} Podiums · Best ${playerProfile.stats.racingBestTime}`,
      features: ['Hyper-Drift Physics', 'Nitro Turbo Exhaust', 'Dynamic AI Rivals', 'Speed Boost Pads'],
    },
    {
      id: 'CARD_GAME' as GameId,
      title: t.cards_title,
      desc: t.cards_desc,
      icon: '🃏',
      accentColor: '#10b981',
      bgGrad: 'from-emerald-950/40 via-slate-900 to-slate-950',
      borderAccent: 'border-emerald-500/30 hover:border-emerald-400',
      rating: playerProfile.ratings.cards,
      stats: `${playerProfile.stats.cardBlackjacks} Blackjacks · $${playerProfile.stats.cardBiggestPot} Pot`,
      features: ['High-Roller Stakes', 'Multiplayer Table Rival', 'Provably Fair RNG', 'Dealer Soft 17'],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-8">
      {/* Hero Welcome Stage */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-r from-slate-950 via-[#0a101f] to-indigo-950 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 z-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Championship Arena Active · 24/7 Matchmaking</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-none mb-4">
            Master Every Arena.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed mb-6">
            Compete in Blitz Chess, High-Octane Cyber Racing, and High-Stakes 21 Card Duels. Climb the global leaderboards with integrated voice comms and Sentinel anti-cheat verification.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenMatchmakingForGame('CHESS')}
              className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              Quick Match Queue
            </button>
            <button
              onClick={() => onSelectGame('CHESS')}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              Play vs AI Bot
            </button>
            {onOpenSquadTraining && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenSquadTraining();
                }}
                className="px-6 py-3.5 rounded-2xl bg-indigo-950 hover:bg-indigo-900/80 text-indigo-300 font-semibold text-sm border border-indigo-500/40 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/10"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                Squad Training Lab
              </button>
            )}
          </div>
        </div>

        {/* Hero Visual Mascot / Graphic Panel */}
        <div className="relative z-10 w-full lg:w-96 flex items-center justify-center">
          <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-2xl backdrop-blur-md flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Season 1 Status
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live Ladder
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-2xl block">♟</span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">CHESS</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {playerProfile.ratings.chess}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-2xl block">🏎️</span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">RACE</span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {playerProfile.ratings.racing}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-2xl block">🃏</span>
                <span className="text-[10px] text-slate-400 block font-semibold mt-1">CARDS</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {playerProfile.ratings.cards}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
              <span>Overall Apex MMR</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {playerProfile.ratings.overall}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Playable Games Cards */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Select Championship Arena</h2>
          <p className="text-xs text-slate-400">Choose your game to jump into ranked matchmaking or offline practice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gamesList.map(game => (
            <div
              key={game.id}
              className={`rounded-2xl p-6 bg-gradient-to-b ${game.bgGrad} border ${game.borderAccent} shadow-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div>
                {/* Header Icon + Rating */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-lg">
                    {game.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      MMR Rating
                    </span>
                    <span className="text-xl font-black font-mono text-cyan-400 tabular-nums">
                      {game.rating}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white font-display mb-1.5">{game.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{game.desc}</p>

                {/* Feature Bullet points */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {game.features.map(f => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectGame(game.id);
                  }}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Launch Game
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onOpenMatchmakingForGame(game.id)}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Swords className="w-3.5 h-3.5 text-cyan-400" />
                    Matchmaking
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onSelectGame(game.id);
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    Solo / Bot
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

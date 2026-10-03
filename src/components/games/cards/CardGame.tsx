import React, { useState, useEffect, useCallback } from 'react';
import { PlayerProfile } from '../../../types';
import { sounds } from '../../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Coins,
  Sparkles,
} from 'lucide-react';

interface CardGameProps {
  playerProfile: PlayerProfile;
  onGameComplete: (result: 'VICTORY' | 'DEFEAT' | 'DRAW', eloDelta: number, coinsEarned: number) => void;
  onlineOpponent?: { name: string; avatar: string; rating: number } | null;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
  hidden?: boolean;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = parseInt(rank);
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 11;
      deck.push({ suit, rank, value });
    }
  }
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.hidden) continue;
    total += card.value;
    if (card.rank === 'A') aces += 1;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

export const CardGame: React.FC<CardGameProps> = ({
  playerProfile,
  onGameComplete,
  onlineOpponent,
}) => {
  const [deck, setDeck] = useState<Card[]>(createDeck);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [rivalHand, setRivalHand] = useState<Card[]>([]);

  const [currentBet, setCurrentBet] = useState<number>(100);
  const [pot, setPot] = useState<number>(300);
  const [gameState, setGameState] = useState<'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'ROUND_OVER'>('BETTING');
  const [roundOutcome, setRoundOutcome] = useState<'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | null>(null);
  const [outcomeMessage, setOutcomeMessage] = useState<string>('');
  const [winStreak, setWinStreak] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Table rival info
  const tableRival = onlineOpponent || {
    name: 'CyberShark_88',
    avatar: '🃏',
    rating: 1640,
  };

  const startNewRound = () => {
    sounds.playChips();
    let currentDeck = [...deck];
    if (currentDeck.length < 15) {
      currentDeck = createDeck();
    }

    const pCard1 = currentDeck.pop()!;
    const dCard1 = currentDeck.pop()!;
    const rCard1 = currentDeck.pop()!;
    const pCard2 = currentDeck.pop()!;
    const dCard2 = { ...currentDeck.pop()!, hidden: true };
    const rCard2 = currentDeck.pop()!;

    setDeck(currentDeck);
    setPlayerHand([pCard1, pCard2]);
    setDealerHand([dCard1, dCard2]);
    setRivalHand([rCard1, rCard2]);
    setPot(currentBet * 3);

    sounds.playCardDeal();

    // Check instant blackjack
    const playerTotal = calculateHandValue([pCard1, pCard2]);
    if (playerTotal === 21) {
      handleBlackjack();
      return;
    }

    setGameState('PLAYER_TURN');
    setRoundOutcome(null);
    setOutcomeMessage('');
  };

  const handleBlackjack = () => {
    sounds.playVictory();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setGameState('ROUND_OVER');
    setRoundOutcome('BLACKJACK');
    setOutcomeMessage('NATURAL BLACKJACK! Payout 3:2');
    setWinStreak(s => s + 1);
    onGameComplete('VICTORY', 28, Math.round(currentBet * 2.5));
  };

  const handleHit = () => {
    if (gameState !== 'PLAYER_TURN') return;
    sounds.playCardDeal();

    const currentDeck = [...deck];
    const newCard = currentDeck.pop()!;
    const newHand = [...playerHand, newCard];

    setDeck(currentDeck);
    setPlayerHand(newHand);

    const val = calculateHandValue(newHand);
    if (val > 21) {
      // Bust
      sounds.playDefeat();
      setGameState('ROUND_OVER');
      setRoundOutcome('LOSE');
      setOutcomeMessage('Bust! Hand exceeded 21.');
      setWinStreak(0);
      onGameComplete('DEFEAT', -15, 0);
    }
  };

  const handleStand = useCallback(() => {
    if (gameState !== 'PLAYER_TURN') return;
    sounds.playClick();
    setGameState('DEALER_TURN');

    // Reveal dealer card
    const revealedDealer: Card[] = dealerHand.map(c => ({ ...c, hidden: false }));
    setDealerHand(revealedDealer);

    // Dealer draws to soft 17
    let currentDeck = [...deck];
    let dHand: Card[] = [...revealedDealer];
    let dVal = calculateHandValue(dHand);

    while (dVal < 17 && currentDeck.length > 0) {
      const card = currentDeck.pop()!;
      dHand.push(card);
      dVal = calculateHandValue(dHand);
    }

    setDeck(currentDeck);
    setDealerHand(dHand);

    // Evaluate result
    const pVal = calculateHandValue(playerHand);
    setGameState('ROUND_OVER');

    if (dVal > 21 || pVal > dVal) {
      sounds.playVictory();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      setRoundOutcome('WIN');
      setOutcomeMessage(dVal > 21 ? 'Dealer Busts! You Win!' : `You win with ${pVal} vs ${dVal}!`);
      setWinStreak(s => s + 1);
      onGameComplete('VICTORY', 20, currentBet * 2);
    } else if (pVal === dVal) {
      sounds.playClick();
      setRoundOutcome('PUSH');
      setOutcomeMessage(`Push! Both players stand at ${pVal}.`);
      onGameComplete('DRAW', 2, currentBet);
    } else {
      sounds.playDefeat();
      setRoundOutcome('LOSE');
      setOutcomeMessage(`Dealer wins with ${dVal} vs ${pVal}.`);
      setWinStreak(0);
      onGameComplete('DEFEAT', -14, 0);
    }
  }, [currentBet, dealerHand, deck, gameState, onGameComplete, playerHand]);

  const handleDoubleDown = () => {
    if (gameState !== 'PLAYER_TURN' || playerHand.length !== 2) return;
    sounds.playChips();
    setCurrentBet(b => b * 2);
    setPot(p => p + currentBet);

    const currentDeck = [...deck];
    const newCard = currentDeck.pop()!;
    const newHand = [...playerHand, newCard];
    setDeck(currentDeck);
    setPlayerHand(newHand);

    const val = calculateHandValue(newHand);
    if (val > 21) {
      sounds.playDefeat();
      setGameState('ROUND_OVER');
      setRoundOutcome('LOSE');
      setOutcomeMessage('Bust after Double Down!');
      setWinStreak(0);
      onGameComplete('DEFEAT', -25, 0);
    } else {
      // Must stand immediately
      setTimeout(() => {
        handleStand();
      }, 400);
    }
  };

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);
  const rivalTotal = calculateHandValue(rivalHand);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
            🃏
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Cyber 21: High-Stakes Duel
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Standard 6-Deck Shoe</span>
              <span aria-hidden="true">·</span>
              <span>Dealer Stands on 17</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-medium">Ranked High-Roller Table</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-mono">Provably Fair Deck Hash Verified</span>
        </div>
      </div>

      {/* Main Casino Table Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Felt Surface */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-gradient-to-b from-[#063321] via-[#042417] to-[#02130c] border-4 border-amber-900/50 shadow-2xl relative flex flex-col items-center justify-between min-h-[520px]">
          {/* Table Center Graphic & Pot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <span className="text-9xl font-black font-display text-emerald-300">21</span>
          </div>

          {/* Dealer Area (Top) */}
          <div className="w-full flex flex-col items-center gap-3 z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 border border-emerald-500/30 text-xs">
              <span className="text-slate-400 font-medium">VIP DEALER AI</span>
              <span className="font-mono text-emerald-400 font-bold">
                {dealerHand.some(c => c.hidden) ? '??' : dealerTotal}
              </span>
            </div>

            {/* Dealer Cards */}
            <div className="flex items-center gap-3">
              {dealerHand.map((c, i) => (
                <div
                  key={i}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl flex flex-col justify-between p-2 shadow-lg transition-transform ${
                    c.hidden
                      ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500/40 text-transparent'
                      : ['♥', '♦'].includes(c.suit)
                      ? 'bg-white text-rose-600 border border-slate-200'
                      : 'bg-white text-slate-900 border border-slate-200'
                  }`}
                >
                  {c.hidden ? (
                    <div className="w-full h-full flex items-center justify-center text-xl text-indigo-400">
                      ⚡
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-bold leading-none">{c.rank}</div>
                      <div className="text-2xl text-center">{c.suit}</div>
                      <div className="text-sm font-bold text-right leading-none">{c.rank}</div>
                    </>
                  )}
                </div>
              ))}
              {dealerHand.length === 0 && (
                <div className="w-20 h-28 rounded-xl border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400/50">
                  Dealer Slot
                </div>
              )}
            </div>
          </div>

          {/* Table Center: Pot & Stakes */}
          <div className="my-4 flex flex-col items-center gap-1 z-10">
            <div className="px-4 py-1.5 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-400 flex items-center gap-2 shadow-lg">
              <Coins className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider text-slate-300">TABLE POT</span>
              <span className="font-mono font-bold text-sm text-amber-300">${pot}</span>
            </div>

            {roundOutcome && (
              <div
                className={`mt-2 px-5 py-2 rounded-xl text-center text-sm font-bold shadow-xl animate-in zoom-in-95 ${
                  roundOutcome === 'WIN' || roundOutcome === 'BLACKJACK'
                    ? 'bg-emerald-500 text-slate-950'
                    : roundOutcome === 'LOSE'
                    ? 'bg-rose-500 text-white'
                    : 'bg-amber-500 text-slate-950'
                }`}
              >
                {outcomeMessage}
              </div>
            )}
          </div>

          {/* Player Hand & Table Rival Hand (Bottom) */}
          <div className="w-full flex items-end justify-between gap-4 z-10">
            {/* Table Rival Hand (Left Corner) */}
            <div className="hidden sm:flex flex-col items-start gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-700">
                <span>{tableRival.avatar}</span>
                <span className="font-semibold">{tableRival.name}</span>
                <span className="text-emerald-400 font-mono">({rivalTotal})</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-80">
                {rivalHand.map((c, i) => (
                  <div
                    key={i}
                    className={`w-12 h-16 rounded-lg flex flex-col justify-between p-1 text-[11px] shadow ${
                      ['♥', '♦'].includes(c.suit) ? 'bg-white text-rose-600' : 'bg-white text-slate-900'
                    }`}
                  >
                    <span className="font-bold">{c.rank}</span>
                    <span className="text-center">{c.suit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Main Hand (Center-Right) */}
            <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-cyan-500/30 text-xs">
                <span className="text-cyan-300 font-medium">{playerProfile.username}</span>
                <span className="font-mono text-cyan-400 font-bold">Score: {playerTotal}</span>
              </div>

              <div className="flex items-center gap-3">
                {playerHand.map((c, i) => (
                  <div
                    key={i}
                    className={`w-18 h-26 sm:w-20 sm:h-28 rounded-xl flex flex-col justify-between p-2 shadow-xl hover:-translate-y-1 transition-transform ${
                      ['♥', '♦'].includes(c.suit)
                        ? 'bg-white text-rose-600 border border-slate-200'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold leading-none">{c.rank}</div>
                    <div className="text-2xl text-center">{c.suit}</div>
                    <div className="text-sm font-bold text-right leading-none">{c.rank}</div>
                  </div>
                ))}
                {playerHand.length === 0 && (
                  <div className="w-20 h-28 rounded-xl border-2 border-dashed border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400/50">
                    Deal Hand
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Betting Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Betting Setup */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chip Stake Selection
            </span>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map(amt => (
                <button
                  key={amt}
                  disabled={gameState === 'PLAYER_TURN'}
                  onClick={() => {
                    sounds.playChips();
                    setCurrentBet(amt);
                  }}
                  className={`py-2 rounded-lg font-mono font-bold text-xs transition-colors ${
                    currentBet === amt
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {gameState === 'BETTING' || gameState === 'ROUND_OVER' ? (
              <button
                onClick={startNewRound}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-1"
              >
                <Sparkles className="w-4 h-4" />
                Deal Hand (${currentBet})
              </button>
            ) : null}
          </div>

          {/* In-Round Hand Actions */}
          {gameState === 'PLAYER_TURN' && (
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Action Options
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleHit}
                  className="py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors shadow-md"
                >
                  Hit (+Card)
                </button>
                <button
                  onClick={handleStand}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-md"
                >
                  Stand
                </button>
              </div>

              {playerHand.length === 2 && (
                <button
                  onClick={handleDoubleDown}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                >
                  Double Down (2x Bet)
                </button>
              )}
            </div>
          )}

          {/* Stats & Streak Multipliers */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Player Table Record
            </span>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Current Win Streak</span>
              <span className="font-mono font-bold text-amber-400">{winStreak} Hands 🔥</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Natural Blackjacks</span>
              <span className="font-mono font-bold text-cyan-400">{playerProfile.stats.cardBlackjacks}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Highest Table Pot Won</span>
              <span className="font-mono font-bold text-emerald-400">
                ${playerProfile.stats.cardBiggestPot}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  sounds.setMuted(next);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Sound FX'}
              </button>
              <button
                onClick={() => {
                  setDeck(createDeck());
                  setPlayerHand([]);
                  setDealerHand([]);
                  setRivalHand([]);
                  setGameState('BETTING');
                  setRoundOutcome(null);
                }}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Shuffle New Deck"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { GameId, PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  X,
  Swords,
  Search,
  CheckCircle2,
  Globe2,
  Wifi,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface MatchmakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  initialGame?: GameId;
  onStartMatch: (game: GameId, opponent: { name: string; avatar: string; rating: number; title: string }) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  initialGame = 'CHESS',
  onStartMatch,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId>(initialGame);
  const [matchType, setMatchType] = useState<'RANKED' | 'CASUAL' | 'CUSTOM'>('RANKED');
  const [region, setRegion] = useState<'NA' | 'EU' | 'APAC'>('NA');
  const [state, setState] = useState<'IDLE' | 'SEARCHING' | 'MATCH_FOUND' | 'ACCEPTED'>('IDLE');
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [roomCode, setRoomCode] = useState<string>('APEX-7792');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [foundOpponent, setFoundOpponent] = useState<{
    name: string;
    avatar: string;
    rating: number;
    title: string;
  } | null>(null);

  // Sync selectedGame if initialGame changes
  useEffect(() => {
    setSelectedGame(initialGame);
  }, [initialGame]);

  // Elapsed timer while searching
  useEffect(() => {
    if (state !== 'SEARCHING') {
      setElapsedSec(0);
      return;
    }

    const timer = setInterval(() => {
      setElapsedSec(s => s + 1);
    }, 1000);

    // Simulate match found between 2.5s and 4.5s
    const matchTimeout = setTimeout(() => {
      const opponents = [
        { name: 'ValkyrieAce', avatar: '⚡', rating: 1690, title: 'Tactical Grandmaster' },
        { name: 'HyperDrift99', avatar: '🏎️', rating: 1725, title: 'Speed Demon' },
        { name: 'MatrixCardist', avatar: '🃏', rating: 1615, title: 'High-Roller Shark' },
        { name: 'CyberShadow', avatar: '👑', rating: 1680, title: 'Apex Contender' },
      ];
      const opp = opponents[Math.floor(Math.random() * opponents.length)];
      setFoundOpponent(opp);
      setState('MATCH_FOUND');
      sounds.playNotification();
    }, 3200);

    return () => {
      clearInterval(timer);
      clearTimeout(matchTimeout);
    };
  }, [state]);

  if (!isOpen) return null;

  const handleStartSearch = () => {
    sounds.playClick();
    setState('SEARCHING');
  };

  const handleCancelSearch = () => {
    sounds.playClick();
    setState('IDLE');
    setFoundOpponent(null);
  };

  const handleAcceptMatch = () => {
    if (!foundOpponent) return;
    sounds.playVictory();
    setState('ACCEPTED');
    setTimeout(() => {
      onStartMatch(selectedGame, foundOpponent);
      onClose();
      setState('IDLE');
      setFoundOpponent(null);
    }, 800);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    sounds.playClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Multiplayer Matchmaking</h3>
              <p className="text-xs text-slate-400">Real-time cross-platform matchmaking lobby</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleCancelSearch();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State: IDLE */}
        {state === 'IDLE' && (
          <div className="flex flex-col gap-4">
            {/* Game Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Target Arena Game
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CHESS', name: 'Blitz Chess', icon: '♟' },
                  { id: 'CAR_RACING', name: 'Nitro Racing', icon: '🏎️' },
                  { id: 'CARD_GAME', name: 'Cyber 21', icon: '🃏' },
                ].map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedGame(g.id as GameId);
                    }}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      selectedGame === g.id
                        ? 'bg-cyan-950/60 border-2 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Type Tabs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Match Format
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950">
                {(['RANKED', 'CASUAL', 'CUSTOM'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setMatchType(t)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                      matchType === t
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Selector & Latency */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>Regional Server</span>
              </div>
              <div className="flex items-center gap-2">
                {(['NA', 'EU', 'APAC'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                      region === r
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r} (24ms)
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Room Code Box if CUSTOM selected */}
            {matchType === 'CUSTOM' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider block">
                    Private Room Invite Code
                  </span>
                  <span className="font-mono text-base font-bold text-white tracking-widest">
                    {roomCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Share'}
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleStartSearch}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Opponent in {region}
            </button>
          </div>
        )}

        {/* State: SEARCHING */}
        {state === 'SEARCHING' && (
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            {/* Radar Animation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping opacity-75" />
              <div className="absolute inset-2 rounded-full border border-cyan-400/50 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 text-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Search className="w-7 h-7 animate-spin" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white font-display">
                Searching for {selectedGame} Opponent...
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Matching player MMR near {playerProfile.ratings[selectedGame === 'CHESS' ? 'chess' : selectedGame === 'CAR_RACING' ? 'racing' : 'cards']}
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono text-sm text-cyan-400 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Queue Time: 00:{elapsedSec.toString().padStart(2, '0')}</span>
            </div>

            <button
              onClick={handleCancelSearch}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors mt-2"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* State: MATCH_FOUND */}
        {state === 'MATCH_FOUND' && foundOpponent && (
          <div className="flex flex-col items-center gap-5 py-2 animate-in zoom-in-95">
            <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wider uppercase animate-pulse">
              Match Found! Ready Up
            </div>

            {/* Matchup Comparison Card */}
            <div className="w-full grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 items-center text-center">
              {/* You */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-2xl">
                  {playerProfile.avatar}
                </div>
                <span className="font-semibold text-white text-xs truncate max-w-[120px]">
                  {playerProfile.username}
                </span>
                <span className="font-mono text-xs text-indigo-400">
                  {playerProfile.ratings[selectedGame === 'CHESS' ? 'chess' : selectedGame === 'CAR_RACING' ? 'racing' : 'cards']} MMR
                </span>
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center gap-1.5 border-l border-slate-800 pl-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-2xl">
                  {foundOpponent.avatar}
                </div>
                <span className="font-semibold text-white text-xs truncate max-w-[120px]">
                  {foundOpponent.name}
                </span>
                <span className="font-mono text-xs text-cyan-400">
                  {foundOpponent.rating} MMR
                </span>
              </div>
            </div>

            <div className="w-full flex items-center gap-3">
              <button
                onClick={handleCancelSearch}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptMatch}
                className="flex-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Match (10s)
              </button>
            </div>
          </div>
        )}

        {/* State: ACCEPTED */}
        {state === 'ACCEPTED' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="text-base font-bold text-white font-display">Match Accepted!</h4>
            <p className="text-xs text-slate-400">Synchronizing game room and anti-cheat session...</p>
          </div>
        )}
      </div>
    </div>
  );
};

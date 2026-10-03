import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchHistoryItem, GameId, ChessReplayStep, RacingReplayStep, CardReplayStep } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Board,
  PieceColor,
  createInitialBoard,
} from '../games/chess/chessEngine';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Copy,
  Check,
  Film,
} from 'lucide-react';

interface ReplaysViewProps {
  matchHistory: MatchHistoryItem[];
  selectedMatchId?: string;
  onSelectMatch?: (matchId: string) => void;
}

export const ReplaysView: React.FC<ReplaysViewProps> = ({
  matchHistory,
  selectedMatchId,
  onSelectMatch,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchHistoryItem>(() => {
    if (selectedMatchId) {
      const found = matchHistory.find(m => m.id === selectedMatchId);
      if (found) return found;
    }
    return matchHistory[0];
  });

  const [gameFilter, setGameFilter] = useState<'ALL' | GameId>('ALL');

  // Playback control states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x, 1x, 2x, 4x
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Filtered match history list
  const filteredMatches = matchHistory.filter(m => {
    if (gameFilter !== 'ALL' && m.game !== gameFilter) return false;
    return true;
  });

  // Calculate total steps based on game type
  const getTotalSteps = (match: MatchHistoryItem): number => {
    if (match.game === 'CHESS') {
      return match.replayData?.chessMoves?.length || 10;
    }
    if (match.game === 'CAR_RACING') {
      return match.replayData?.racingTelemetry?.length || 10;
    }
    return match.replayData?.cardSteps?.length || 4;
  };

  const totalSteps = getTotalSteps(selectedMatch);

  // Sync selected match when props change
  useEffect(() => {
    if (selectedMatchId) {
      const match = matchHistory.find(m => m.id === selectedMatchId);
      if (match) {
        setSelectedMatch(match);
        setCurrentStepIndex(0);
        setIsPlaying(false);
      }
    }
  }, [selectedMatchId, matchHistory]);

  // Reset step when user selects a different match
  const handleSelectMatch = (match: MatchHistoryItem) => {
    sounds.playClick();
    setSelectedMatch(match);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (onSelectMatch) onSelectMatch(match.id);
  };

  // Playback loop timer
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    const intervalTime = Math.max(250, 1200 / playbackSpeed);

    playTimerRef.current = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          sounds.playNotification();
          return prev;
        }
        sounds.playClick();
        return prev + 1;
      });
    }, intervalTime);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Stepping controls
  const handleTogglePlay = () => {
    sounds.playClick();
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepBack = () => {
    sounds.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    sounds.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1));
  };

  const handleResetToStart = () => {
    sounds.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleJumpToEnd = () => {
    sounds.playClick();
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps - 1);
  };

  const handleCopyReplayCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(`APEX-REPLAY://${selectedMatch.id}#${selectedMatch.game}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Reconstruct Chess board up to currentStepIndex
  const getChessBoardAtStep = (): { board: Board; lastFrom?: [number, number]; lastTo?: [number, number] } => {
    const board = createInitialBoard();
    const moves = selectedMatch.replayData?.chessMoves || [];
    const maxMoves = Math.min(currentStepIndex + 1, moves.length);

    let lastFrom: [number, number] | undefined;
    let lastTo: [number, number] | undefined;

    for (let i = 0; i < maxMoves; i++) {
      const m = moves[i];
      lastFrom = m.from;
      lastTo = m.to;

      const piece = board[m.from[0]][m.from[1]];
      if (piece) {
        board[m.to[0]][m.to[1]] = { ...piece };
        board[m.from[0]][m.from[1]] = null;
      }
    }

    return { board, lastFrom, lastTo };
  };

  // Current step details
  const currentChessMove: ChessReplayStep | undefined =
    selectedMatch.replayData?.chessMoves?.[currentStepIndex];

  const currentRacingTelemetry: RacingReplayStep | undefined =
    selectedMatch.replayData?.racingTelemetry?.[currentStepIndex];

  const currentCardStep: CardReplayStep | undefined =
    selectedMatch.replayData?.cardSteps?.[currentStepIndex];

  const PIECE_GLYPHS: Record<PieceColor, Record<string, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
  };

  const chessState = selectedMatch.game === 'CHESS' ? getChessBoardAtStep() : null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Match Replay Theater
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Cryptographic Match Verification</span>
              <span aria-hidden="true">·</span>
              <span>Smooth Motion Playback</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Sentinel Forensic Audited</span>
            </div>
          </div>
        </div>

        {/* Share Replay Code */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyReplayCode}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            {copiedCode ? 'Replay URL Copied' : 'Share Replay'}
          </motion.button>
        </div>
      </div>

      {/* Main Grid: Match List (Left) + Replay Screen & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Match History Selector */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Game Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(['ALL', 'CHESS', 'CAR_RACING', 'CARD_GAME'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  sounds.playClick();
                  setGameFilter(tab);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  gameFilter === tab ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab === 'CHESS' ? 'Chess' : tab === 'CAR_RACING' ? 'Racing' : 'Cards'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 max-h-[640px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredMatches.map(match => {
                const isSelected = selectedMatch.id === match.id;
                return (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.015, x: 2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSelectMatch(match)}
                    className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {match.game === 'CHESS' ? '♟' : match.game === 'CAR_RACING' ? '🏎️' : '🃏'}
                        </span>
                        <span className="font-semibold text-white text-xs">
                          {match.game === 'CHESS' ? 'Blitz Chess' : match.game === 'CAR_RACING' ? 'Nitro Racing' : 'Cyber 21'}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          match.result === 'VICTORY'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : match.result === 'DEFEAT'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <span>{match.opponentAvatar}</span>
                        <span className="text-slate-200 truncate max-w-[100px]">{match.opponentName}</span>
                        <span className="font-mono text-slate-500 text-[10px]">({match.opponentRating})</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className={match.ratingDelta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {match.ratingDelta >= 0 ? `+${match.ratingDelta}` : match.ratingDelta}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span>{match.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Replay Theater & Playback Controls */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMatch.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              {/* Match Info Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                    {selectedMatch.opponentAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base font-display">
                        Match vs {selectedMatch.opponentName}
                      </h3>
                      <span className="text-xs font-mono text-cyan-400">
                        ({selectedMatch.opponentRating} MMR)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedMatch.date} · Match Duration: {selectedMatch.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Anti-Cheat Verified</span>
                  </div>
                </div>
              </div>

              {/* Replay Screen */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center min-h-[460px] justify-between">
                {/* Summary Narrative Banner with AnimatePresence */}
                <div className="w-full text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 overflow-hidden">
                  <span className="font-semibold text-cyan-400 shrink-0">Narrative:</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${selectedMatch.id}-${currentStepIndex}`}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 text-slate-300 italic truncate"
                    >
                      {selectedMatch.replayData?.summary || 'Standard competitive match recording.'}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Step {currentStepIndex + 1} of {totalSteps}
                  </span>
                </div>

                {/* --- 1. CHESS REPLAY VIEW --- */}
                {selectedMatch.game === 'CHESS' && chessState && (
                  <div className="my-4 flex flex-col items-center gap-3">
                    <div className="w-72 sm:w-80 aspect-square grid grid-cols-8 grid-rows-8 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-950">
                      {chessState.board.map((row, r) =>
                        row.map((piece, c) => {
                          const isLight = (r + c) % 2 === 0;
                          const isLastFrom = chessState.lastFrom && chessState.lastFrom[0] === r && chessState.lastFrom[1] === c;
                          const isLastTo = chessState.lastTo && chessState.lastTo[0] === r && chessState.lastTo[1] === c;

                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`relative flex items-center justify-center select-none ${
                                isLastFrom || isLastTo
                                  ? 'bg-cyan-500/35 ring-1 ring-cyan-400'
                                  : isLight
                                  ? 'bg-slate-800/80'
                                  : 'bg-slate-950'
                              }`}
                            >
                              {piece && (
                                <motion.span
                                  key={`${piece.color}-${piece.type}-${r}-${c}`}
                                  initial={isLastTo ? { scale: 0.6, opacity: 0 } : false}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                  className={`text-2xl sm:text-3xl ${
                                    piece.color === 'w'
                                      ? 'text-cyan-100 drop-shadow-[0_1px_3px_rgba(255,255,255,0.4)]'
                                      : 'text-slate-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                                  }`}
                                >
                                  {PIECE_GLYPHS[piece.color][piece.type]}
                                </motion.span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Move Commentary with AnimatePresence */}
                    <div className="text-center min-h-[50px] flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {currentChessMove && (
                          <motion.div
                            key={currentStepIndex}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                                Move #{currentChessMove.moveIndex} ({currentChessMove.color === 'w' ? 'White' : 'Black'}): {currentChessMove.notation}
                              </span>
                              {currentChessMove.isCheck && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-400 font-bold text-[10px]">
                                  CHECK
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-300 italic max-w-md">
                              "{currentChessMove.commentary || 'Strategic positional maneuver.'}"
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* --- 2. CAR RACING REPLAY VIEW --- */}
                {selectedMatch.game === 'CAR_RACING' && currentRacingTelemetry && (
                  <div className="my-6 w-full max-w-lg flex flex-col gap-4">
                    {/* Visual Telemetry Gauges with Framer Motion values */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div
                        key={`pos-${currentRacingTelemetry.position}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center"
                      >
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Position</span>
                        <span className="text-3xl font-black font-display text-cyan-400">
                          P{currentRacingTelemetry.position}
                          <span className="text-xs text-slate-500 font-mono">/5</span>
                        </span>
                      </motion.div>

                      <motion.div
                        key={`spd-${currentRacingTelemetry.speedMph}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center"
                      >
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Speedometer</span>
                        <span className="text-3xl font-black font-mono text-amber-400">
                          {currentRacingTelemetry.speedMph}
                          <span className="text-xs text-slate-500 ml-1">MPH</span>
                        </span>
                      </motion.div>

                      <motion.div
                        key={`lap-${currentRacingTelemetry.lap}`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center"
                      >
                        <span className="text-[10px] uppercase tracking-wider text-slate-400">Lap Progress</span>
                        <span className="text-3xl font-black font-mono text-emerald-400">
                          {currentRacingTelemetry.lap}
                          <span className="text-xs text-slate-500">/3</span>
                        </span>
                      </motion.div>
                    </div>

                    {/* Simulated Visual Racetrack Position Bar with animated width */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Sector 1</span>
                        <span>Hairpin Turn</span>
                        <span>Finish Line</span>
                      </div>
                      <div className="w-full h-4 rounded-full bg-slate-900 border border-slate-800 relative overflow-hidden">
                        <motion.div
                          className="absolute top-0 bottom-0 bg-gradient-to-r from-cyan-500 to-indigo-500"
                          animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Event Commentary with AnimatePresence */}
                    <div className="min-h-[46px] flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStepIndex}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="w-full p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center"
                        >
                          <span className="text-xs text-cyan-300 font-bold">
                            ⏱ {currentRacingTelemetry.timeSec}s — {currentRacingTelemetry.event}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* --- 3. CARD GAME REPLAY VIEW --- */}
                {selectedMatch.game === 'CARD_GAME' && currentCardStep && (
                  <div className="my-6 w-full max-w-lg flex flex-col items-center gap-6">
                    {/* Dealer Cards */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold uppercase">
                        Dealer AI Hand ({currentCardStep.dealerScore} pts)
                      </span>
                      <div className="flex items-center gap-2">
                        {currentCardStep.dealerCards.map((c, i) => (
                          <motion.div
                            key={`dealer-${i}-${c.rank}-${c.suit}-${c.hidden}`}
                            initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.05 }}
                            className={`w-14 h-20 rounded-xl flex flex-col justify-between p-1.5 shadow-lg ${
                              c.hidden
                                ? 'bg-gradient-to-br from-indigo-950 to-slate-950 border-2 border-indigo-500/40'
                                : ['♥', '♦'].includes(c.suit)
                                ? 'bg-white text-rose-600'
                                : 'bg-white text-slate-900'
                            }`}
                          >
                            {c.hidden ? (
                              <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold text-xs">
                                ?
                              </div>
                            ) : (
                              <>
                                <span className="text-xs font-bold leading-none">{c.rank}</span>
                                <span className="text-lg text-center leading-none">{c.suit}</span>
                                <span className="text-xs font-bold text-right leading-none">{c.rank}</span>
                              </>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Player Cards */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-cyan-400 font-semibold uppercase">
                        Your Hand ({currentCardStep.playerScore} pts)
                      </span>
                      <div className="flex items-center gap-2">
                        {currentCardStep.playerCards.map((c, i) => (
                          <motion.div
                            key={`player-${i}-${c.rank}-${c.suit}`}
                            initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
                            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                            transition={{ duration: 0.25, delay: i * 0.05 }}
                            className={`w-14 h-20 rounded-xl flex flex-col justify-between p-1.5 shadow-lg ${
                              ['♥', '♦'].includes(c.suit) ? 'bg-white text-rose-600' : 'bg-white text-slate-900'
                            }`}
                          >
                            <span className="text-xs font-bold leading-none">{c.rank}</span>
                            <span className="text-lg text-center leading-none">{c.suit}</span>
                            <span className="text-xs font-bold text-right leading-none">{c.rank}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="min-h-[46px] w-full flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStepIndex}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-300"
                        >
                          {currentCardStep.description}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Bottom Playback Control UI */}
                <div className="w-full flex flex-col gap-3 pt-4 border-t border-slate-800">
                  {/* Timeline Scrubber Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 tabular-nums w-8 text-right">
                      {currentStepIndex + 1}
                    </span>
                    <input
                      type="range"
                      min="0"
                      max={totalSteps - 1}
                      value={currentStepIndex}
                      onChange={e => {
                        setIsPlaying(false);
                        setCurrentStepIndex(parseInt(e.target.value));
                      }}
                      className="flex-1 accent-cyan-400 h-1.5 rounded-lg bg-slate-800 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400 tabular-nums w-8">
                      {totalSteps}
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Speed selector */}
                    <div className="flex items-center gap-1">
                      {[0.5, 1.0, 2.0, 4.0].map(spd => (
                        <motion.button
                          key={spd}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-1 rounded-md text-[11px] font-mono font-medium transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </motion.button>
                      ))}
                    </div>

                    {/* Center: Play/Pause/Steps */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleResetToStart}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Reset to Start"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleStepBack}
                        disabled={currentStepIndex === 0}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                        title="Step Backward"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={handleTogglePlay}
                        className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                        title={isPlaying ? 'Pause Replay' : 'Play Replay'}
                      >
                        <AnimatePresence mode="wait">
                          {isPlaying ? (
                            <motion.div
                              key="pause"
                              initial={{ scale: 0.6, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0.6, rotate: 45 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Pause className="w-5 h-5 fill-current" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="play"
                              initial={{ scale: 0.6, rotate: 45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0.6, rotate: -45 }}
                              transition={{ duration: 0.15 }}
                            >
                              <Play className="w-5 h-5 fill-current" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleStepForward}
                        disabled={currentStepIndex >= totalSteps - 1}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                        title="Step Forward"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleJumpToEnd}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Jump to Final Move"
                      >
                        <FastForward className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Right: Step Counter */}
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] font-mono text-slate-400">
                        {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Board,
  ChessPiece,
  Move,
  CastlingRights,
  PieceColor,
  createInitialBoard,
  getLegalMoves,
  getAllLegalMoves,
  makeSimulatedMove,
  isKingInCheck,
  getAlgebraicNotation,
  evaluateBoardMaterial,
  pickBotMove,
} from './chessEngine';
import { sounds } from '../../../utils/soundEffects';
import { PlayerProfile } from '../../../types';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Swords,
  Bot,
  Users,
  Flag,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface ChessGameProps {
  playerProfile: PlayerProfile;
  onMatchComplete: (result: 'VICTORY' | 'DEFEAT' | 'DRAW', eloDelta: number, coinsEarned: number) => void;
  onlineOpponent?: {
    name: string;
    avatar: string;
    rating: number;
    title: string;
  } | null;
}

type BoardTheme = 'cyber' | 'obsidian' | 'marble' | 'hologram';

const PIECE_GLYPHS: Record<PieceColor, Record<string, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export const ChessGame: React.FC<ChessGameProps> = ({
  playerProfile,
  onMatchComplete,
  onlineOpponent,
}) => {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [castling, setCastling] = useState<CastlingRights>({ wK: true, wQ: true, bK: true, bQ: true });
  const [enPassant, setEnPassant] = useState<[number, number] | null>(null);
  const [capturedWhite, setCapturedWhite] = useState<ChessPiece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPiece[]>([]);

  // Time & Controls
  const [timeControl, setTimeControl] = useState<number>(180); // 3m blitz
  const [whiteTime, setWhiteTime] = useState<number>(180);
  const [blackTime, setBlackTime] = useState<number>(180);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);

  // Modes & AI
  const [mode, setMode] = useState<'ONLINE' | 'BOT' | 'PASS_PLAY'>(
    onlineOpponent ? 'ONLINE' : 'BOT'
  );
  const [botDifficulty, setBotDifficulty] = useState<'NOVICE' | 'CLUB' | 'MASTER'>('CLUB');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('cyber');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showEmotes, setShowEmotes] = useState<boolean>(false);
  const [recentEmote, setRecentEmote] = useState<{ sender: string; text: string } | null>(null);

  // Anti-cheat stats
  const [engineCorrelation] = useState<number>(() => Math.floor(11 + Math.random() * 8));
  const [timingJitter] = useState<number>(() => Math.floor(4 + Math.random() * 6));

  const opponentInfo = onlineOpponent || {
    name: mode === 'BOT' ? `StockAI (${botDifficulty})` : 'Player 2',
    avatar: mode === 'BOT' ? '🤖' : '👥',
    rating: mode === 'BOT' ? (botDifficulty === 'NOVICE' ? 850 : botDifficulty === 'CLUB' ? 1550 : 2350) : 1650,
    title: mode === 'BOT' ? 'Neural Engine' : 'Challenger',
  };

  // Turn timer interval
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            handleTimeout('w');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) {
            handleTimeout('b');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, isGameOver]);

  const handleTimeout = (timedOutColor: PieceColor) => {
    setIsGameOver(true);
    const winColor = timedOutColor === 'w' ? 'b' : 'w';
    setWinner(winColor);
    setGameOverReason(timedOutColor === 'w' ? 'White ran out of time!' : 'Black ran out of time!');
    finalizeMatch(winColor);
  };

  const finalizeMatch = useCallback((winColor: PieceColor | 'draw') => {
    if (winColor === 'w') {
      sounds.playVictory();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onMatchComplete('VICTORY', 22, 180);
    } else if (winColor === 'b') {
      sounds.playDefeat();
      onMatchComplete('DEFEAT', -16, 40);
    } else {
      sounds.playClick();
      onMatchComplete('DRAW', 4, 80);
    }
  }, [onMatchComplete]);

  // Execute Move
  const executeMove = useCallback((move: Move) => {
    const newBoard = makeSimulatedMove(board, move);
    setBoard(newBoard);

    // Track captures
    if (move.captured) {
      sounds.playChessCapture();
      if (move.captured.color === 'w') {
        setCapturedWhite(prev => [...prev, move.captured!]);
      } else {
        setCapturedBlack(prev => [...prev, move.captured!]);
      }
    } else {
      sounds.playChessMove();
    }

    // Castling rights update
    const updatedCastling = { ...castling };
    if (move.piece.type === 'k') {
      if (move.piece.color === 'w') {
        updatedCastling.wK = false;
        updatedCastling.wQ = false;
      } else {
        updatedCastling.bK = false;
        updatedCastling.bQ = false;
      }
    }
    if (move.piece.type === 'r') {
      if (move.fromRow === 7 && move.fromCol === 0) updatedCastling.wQ = false;
      if (move.fromRow === 7 && move.fromCol === 7) updatedCastling.wK = false;
      if (move.fromRow === 0 && move.fromCol === 0) updatedCastling.bQ = false;
      if (move.fromRow === 0 && move.fromCol === 7) updatedCastling.bK = false;
    }
    setCastling(updatedCastling);

    // En passant square update
    if (move.piece.type === 'p' && Math.abs(move.toRow - move.fromRow) === 2) {
      setEnPassant([(move.fromRow + move.toRow) / 2, move.fromCol]);
    } else {
      setEnPassant(null);
    }

    const nextTurn: PieceColor = turn === 'w' ? 'b' : 'w';
    const isCheck = isKingInCheck(newBoard, nextTurn);
    const oppMoves = getAllLegalMoves(newBoard, nextTurn, updatedCastling, null);
    const isMate = isCheck && oppMoves.length === 0;
    const isStalemate = !isCheck && oppMoves.length === 0;

    const notation = getAlgebraicNotation(move, isCheck, isMate);
    move.notation = notation;
    setMoveHistory(prev => [...prev, notation]);
    setLastMove(move);
    setSelectedSquare(null);
    setLegalMoves([]);

    if (isMate) {
      setIsGameOver(true);
      setWinner(turn);
      setGameOverReason(`Checkmate! ${turn === 'w' ? 'White' : 'Black'} wins.`);
      finalizeMatch(turn);
      return;
    }

    if (isStalemate) {
      setIsGameOver(true);
      setWinner('draw');
      setGameOverReason('Stalemate! Game drawn.');
      finalizeMatch('draw');
      return;
    }

    if (isCheck) {
      sounds.playChessCheck();
    }

    setTurn(nextTurn);
  }, [board, castling, finalizeMatch, turn]);

  // AI bot or online opponent turn simulation
  const botTurnTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isGameOver) return;

    if (turn === 'b' && (mode === 'BOT' || mode === 'ONLINE')) {
      const delay = mode === 'ONLINE' ? 1200 + Math.random() * 1400 : 700 + Math.random() * 800;

      botTurnTimeout.current = setTimeout(() => {
        const diff = mode === 'ONLINE' ? 'CLUB' : botDifficulty;
        const botMove = pickBotMove(board, 'b', diff, castling, enPassant);
        if (botMove) {
          executeMove(botMove);
        } else {
          // No legal moves
          const inCheck = isKingInCheck(board, 'b');
          setIsGameOver(true);
          setWinner(inCheck ? 'w' : 'draw');
          setGameOverReason(inCheck ? 'Checkmate! White wins.' : 'Stalemate! Game drawn.');
          finalizeMatch(inCheck ? 'w' : 'draw');
        }
      }, delay);
    }

    return () => {
      if (botTurnTimeout.current) clearTimeout(botTurnTimeout.current);
    };
  }, [turn, mode, botDifficulty, board, castling, enPassant, executeMove, isGameOver, finalizeMatch]);

  const handleSquareClick = (r: number, c: number) => {
    if (isGameOver) return;
    if (turn === 'b' && (mode === 'BOT' || mode === 'ONLINE')) return; // wait for opponent

    // If square is among legal moves
    const matchingMove = legalMoves.find(m => m.toRow === r && m.toCol === c);
    if (matchingMove) {
      executeMove(matchingMove);
      return;
    }

    // Otherwise select piece if it belongs to current player
    const piece = board[r][c];
    if (piece && piece.color === turn) {
      sounds.playClick();
      setSelectedSquare([r, c]);
      const moves = getLegalMoves(board, r, c, castling, enPassant);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleResetGame = () => {
    sounds.playClick();
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setMoveHistory([]);
    setCastling({ wK: true, wQ: true, bK: true, bQ: true });
    setEnPassant(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    setIsGameOver(false);
    setGameOverReason('');
    setWinner(null);
  };

  const handleResign = () => {
    if (isGameOver) return;
    sounds.playDefeat();
    setIsGameOver(true);
    setWinner('b');
    setGameOverReason('White resigned.');
    finalizeMatch('b');
  };

  const sendEmote = (emote: string) => {
    setShowEmotes(false);
    setRecentEmote({ sender: playerProfile.username, text: emote });
    sounds.playClick();
    setTimeout(() => {
      setRecentEmote(null);
    }, 3000);

    // Simulate opponent emote reply
    if (Math.random() < 0.6) {
      setTimeout(() => {
        const replies = ['Good game!', 'Well played!', '⚔️', '🔥', 'Nice tactics!'];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        setRecentEmote({ sender: opponentInfo.name, text: reply });
        setTimeout(() => setRecentEmote(null), 3000);
      }, 1500);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const material = evaluateBoardMaterial(board);

  // Theme-specific square colors
  const getSquareStyles = (r: number, c: number, isLight: boolean) => {
    const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
    const isLastFrom = lastMove && lastMove.fromRow === r && lastMove.fromCol === c;
    const isLastTo = lastMove && lastMove.toRow === r && lastMove.toCol === c;
    const isDestination = legalMoves.some(m => m.toRow === r && m.toCol === c);

    if (isSelected) {
      return 'bg-amber-500/50 ring-2 ring-amber-400 inset-0';
    }
    if (isLastFrom || isLastTo) {
      return 'bg-cyan-500/30';
    }

    if (boardTheme === 'cyber') {
      return isLight ? 'bg-slate-800/80 hover:bg-slate-700/80' : 'bg-slate-950 hover:bg-slate-900';
    }
    if (boardTheme === 'obsidian') {
      return isLight ? 'bg-amber-950/40 hover:bg-amber-950/60' : 'bg-zinc-950 hover:bg-zinc-900';
    }
    if (boardTheme === 'marble') {
      return isLight ? 'bg-emerald-900/40 hover:bg-emerald-900/60' : 'bg-slate-950 hover:bg-slate-900';
    }
    return isLight ? 'bg-indigo-950/40 hover:bg-indigo-950/60' : 'bg-slate-950 hover:bg-slate-900';
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Top Banner & Anti-Cheat Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xl font-bold">
            ♟
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Grandmaster Blitz Chess
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>FIDE Blitz Rules</span>
              <span aria-hidden="true">·</span>
              <span>{formatTime(timeControl)} Clock</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Ranked Pool Active</span>
            </div>
          </div>
        </div>

        {/* Sentinel Anti-Cheat Widget */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-emerald-400 font-semibold tracking-wide">Sentinel Anti-Cheat Active</span>
            <span className="text-slate-400 text-[11px] font-mono tabular-nums">
              Engine Correlation: {engineCorrelation}% · Jitter: {timingJitter}ms (Clean)
            </span>
          </div>
        </div>
      </div>

      {/* Main Chess Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Opponent Card + Chessboard + Player Card */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Opponent HUD Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                {opponentInfo.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-sm">{opponentInfo.name}</span>
                  <span className="text-xs text-slate-400 font-mono">({opponentInfo.rating})</span>
                </div>
                <div className="text-xs text-slate-400">{opponentInfo.title}</div>
              </div>
            </div>

            {/* Captured Pieces by Opponent + Opponent Clock */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 text-base text-slate-300">
                {capturedWhite.slice(-6).map((p, i) => (
                  <span key={i}>{PIECE_GLYPHS.w[p.type]}</span>
                ))}
                {material.diff < 0 && (
                  <span className="text-xs font-semibold text-slate-400 font-mono">
                    +{Math.abs(material.diff)}
                  </span>
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-mono font-bold text-lg tabular-nums transition-colors ${
                  turn === 'b'
                    ? blackTime < 30
                      ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {formatTime(blackTime)}
              </div>
            </div>
          </div>

          {/* Chessboard Container */}
          <div className="relative p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center">
            {/* Emote Float Overlay */}
            {recentEmote && (
              <div className="absolute top-6 z-20 px-4 py-2 rounded-full bg-indigo-600/90 text-white font-medium text-sm shadow-xl backdrop-blur-md animate-bounce">
                <span className="text-slate-200 text-xs mr-2">{recentEmote.sender}:</span>
                {recentEmote.text}
              </div>
            )}

            {/* 8x8 Board Grid */}
            <div className="w-full max-w-[560px] aspect-square grid grid-cols-8 grid-rows-8 border border-slate-700/80 rounded-xl overflow-hidden shadow-inner bg-slate-950">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
                  const isDestination = legalMoves.some(m => m.toRow === r && m.toCol === c);
                  const isCaptureDest = isDestination && piece !== null;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative flex items-center justify-center transition-all duration-150 select-none ${getSquareStyles(
                        r,
                        c,
                        isLight
                      )}`}
                      aria-label={`Square ${String.fromCharCode(97 + c)}${8 - r}`}
                    >
                      {/* Rank & File Coordinates on edge squares */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-1 text-[10px] font-mono text-slate-500/70 pointer-events-none select-none">
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span className="absolute bottom-0.5 right-1 text-[10px] font-mono text-slate-500/70 pointer-events-none select-none">
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}

                      {/* Legal Move Indicators */}
                      {isDestination && !isCaptureDest && (
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400/60 ring-2 ring-cyan-300 pointer-events-none" />
                      )}
                      {isCaptureDest && (
                        <div className="absolute inset-1 rounded-full border-2 border-rose-400 bg-rose-500/20 pointer-events-none animate-pulse" />
                      )}

                      {/* Chess Piece Glyphs */}
                      {piece && (
                        <span
                          className={`text-3xl sm:text-4xl md:text-5xl transform transition-transform hover:scale-105 active:scale-95 ${
                            piece.color === 'w'
                              ? 'text-cyan-100 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]'
                              : 'text-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                          }`}
                        >
                          {PIECE_GLYPHS[piece.color][piece.type]}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4">
                  {winner === 'w' ? <Trophy className="w-8 h-8" /> : <Swords className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-bold text-white font-display mb-1">
                  {winner === 'w' ? 'VICTORY' : winner === 'b' ? 'DEFEAT' : 'DRAW'}
                </h3>
                <p className="text-sm text-slate-300 max-w-sm mb-6">{gameOverReason}</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetGame}
                    className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                  >
                    Play Rematch
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player HUD Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-2xl">
                {playerProfile.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-sm">{playerProfile.username}</span>
                  <span className="text-xs text-slate-400 font-mono">({playerProfile.ratings.chess})</span>
                </div>
                <div className="text-xs text-indigo-400">{playerProfile.title}</div>
              </div>
            </div>

            {/* Captured Pieces by Player + Player Clock */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1 text-base text-slate-400">
                {capturedBlack.slice(-6).map((p, i) => (
                  <span key={i}>{PIECE_GLYPHS.b[p.type]}</span>
                ))}
                {material.diff > 0 && (
                  <span className="text-xs font-semibold text-cyan-400 font-mono">
                    +{material.diff}
                  </span>
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-mono font-bold text-lg tabular-nums transition-colors ${
                  turn === 'w'
                    ? whiteTime < 30
                      ? 'bg-rose-950 text-rose-300 border border-rose-600 animate-pulse'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {formatTime(whiteTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Move Notation, Game Settings & Chat/Emotes */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Mode & Time Selectors */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Match Setup
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-950">
              <button
                onClick={() => {
                  setMode('ONLINE');
                  handleResetGame();
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'ONLINE' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                Ranked
              </button>
              <button
                onClick={() => {
                  setMode('BOT');
                  handleResetGame();
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'BOT' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                AI Bot
              </button>
              <button
                onClick={() => {
                  setMode('PASS_PLAY');
                  handleResetGame();
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'PASS_PLAY' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                1v1 Local
              </button>
            </div>

            {mode === 'BOT' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">AI Difficulty</span>
                <div className="flex items-center gap-1">
                  {(['NOVICE', 'CLUB', 'MASTER'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setBotDifficulty(d)}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        botDifficulty === d
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Time Control Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Time Format</span>
              <div className="flex items-center gap-1">
                {[
                  { label: '1m Bullet', sec: 60 },
                  { label: '3m Blitz', sec: 180 },
                  { label: '5m Rapid', sec: 300 },
                ].map(tc => (
                  <button
                    key={tc.sec}
                    onClick={() => {
                      setTimeControl(tc.sec);
                      setWhiteTime(tc.sec);
                      setBlackTime(tc.sec);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      timeControl === tc.sec
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Board Skin Customizer */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Board Theme</span>
              <div className="flex items-center gap-1">
                {(['cyber', 'obsidian', 'marble', 'hologram'] as BoardTheme[]).map(thm => (
                  <button
                    key={thm}
                    onClick={() => setBoardTheme(thm)}
                    className={`px-2 py-1 rounded capitalize text-[11px] font-medium transition-colors ${
                      boardTheme === thm
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {thm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Move History Log */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2 h-52">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Move Notation ({moveHistory.length} moves)
              </span>
              <span className="text-xs text-slate-500 font-mono">PGN Live</span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 text-xs font-mono grid grid-cols-2 gap-x-4 gap-y-1">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, idx) => {
                const whiteMove = moveHistory[idx * 2];
                const blackMove = moveHistory[idx * 2 + 1];
                return (
                  <React.Fragment key={idx}>
                    <div className="text-slate-300 flex items-center gap-2">
                      <span className="text-slate-500 w-5">{idx + 1}.</span>
                      <span className="font-semibold text-cyan-300">{whiteMove}</span>
                    </div>
                    <div className="text-slate-400">
                      {blackMove && <span className="font-semibold text-slate-200">{blackMove}</span>}
                    </div>
                  </React.Fragment>
                );
              })}
              {moveHistory.length === 0 && (
                <div className="col-span-2 text-slate-500 italic py-4 text-center">
                  Game in progress. Moves will be recorded here.
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEmotes(!showEmotes)}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Tactical Emotes
            </button>
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                sounds.setMuted(!nextState);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Toggle Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            </button>
            <button
              onClick={handleResign}
              disabled={isGameOver}
              className="py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" />
              Resign
            </button>
            <button
              onClick={handleResetGame}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Emote Reaction Grid */}
          {showEmotes && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 grid grid-cols-3 gap-2">
              {['Good luck! ⚔️', 'Nice move! 🎯', 'Brilliant! 💡', 'Well played! 👏', 'GG! 🏆', 'Oof! 😅'].map(
                e => (
                  <button
                    key={e}
                    onClick={() => sendEmote(e)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs text-center transition-colors truncate"
                  >
                    {e}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

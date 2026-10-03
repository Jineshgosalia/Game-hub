import React, { useState } from 'react';
import { Tournament, PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Calendar,
  Users,
  Coins,
  CheckCircle2,
  Clock,
  Swords,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface TournamentsViewProps {
  playerProfile: PlayerProfile;
  tournaments: Tournament[];
  onRegisterTournament: (tournamentId: string) => void;
  onPlayTournamentMatch: (tournament: Tournament) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  playerProfile,
  tournaments,
  onRegisterTournament,
  onPlayTournamentMatch,
}) => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament>(tournaments[0]);

  const handleRegister = (t: Tournament) => {
    const hasCoins = t.currency === 'COINS' ? playerProfile.coins >= t.entryFee : playerProfile.gems >= t.entryFee;
    if (!hasCoins) {
      sounds.playDefeat();
      alert(`Insufficient ${t.currency} for entry fee.`);
      return;
    }

    sounds.playVictory();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onRegisterTournament(t.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Championship Tournaments
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Automated Single-Elimination Brackets</span>
              <span aria-hidden="true">·</span>
              <span>Daily Prize Pools</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-medium">Rank Verified Competitions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tournaments List (Left) + Bracket Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tournament Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active & Upcoming Cups ({tournaments.length})
          </span>

          {tournaments.map(t => {
            const isSelected = selectedTournament.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedTournament(t);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3.5 ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                        t.status === 'LIVE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.status === 'LIVE' ? 'LIVE NOW' : 'UPCOMING'}
                    </span>
                    <h3 className="font-bold text-white text-base font-display">{t.name}</h3>
                  </div>
                  <span className="text-2xl">
                    {t.game === 'CHESS' ? '♟' : t.game === 'CAR_RACING' ? '🏎️' : '🃏'}
                  </span>
                </div>

                {/* Prize Pool & Entry Fee */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>${t.prizePool.coins.toLocaleString()} + {t.prizePool.gems} 💎</span>
                  </div>
                  <div className="text-slate-400">
                    Entry: {t.entryFee} {t.currency}
                  </div>
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {t.participantsCount}/{t.maxParticipants} Competitors
                    </span>
                  </div>
                  {t.userRegistered ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRegister(t);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Join Cup
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tournament Live Bracket Viewer */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {selectedTournament.name}
                </h3>
                <span className="text-xs text-cyan-400 font-medium">
                  Current Stage: {selectedTournament.bracketStage}
                </span>
              </div>

              {selectedTournament.userRegistered && selectedTournament.status === 'LIVE' && (
                <button
                  onClick={() => onPlayTournamentMatch(selectedTournament)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-colors"
                >
                  <Swords className="w-4 h-4" />
                  Play Semifinals Match
                </button>
              )}
            </div>

            {/* Bracket Visualizer Columns */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Single-Elimination Bracket Tree
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Quarterfinals */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                    Quarterfinals
                  </span>
                  {selectedTournament.matches
                    .filter(m => m.round === 'Quarterfinals')
                    .map(m => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={
                              m.winner === m.player1 ? 'font-bold text-emerald-400' : 'text-slate-300'
                            }
                          >
                            {m.player1}
                          </span>
                          <span className="font-mono text-slate-400">{m.score1}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-900 pt-1">
                          <span
                            className={
                              m.winner === m.player2 ? 'font-bold text-emerald-400' : 'text-slate-400'
                            }
                          >
                            {m.player2}
                          </span>
                          <span className="font-mono text-slate-400">{m.score2}</span>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Semifinals */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                    Semifinals (Live Now)
                  </span>
                  {selectedTournament.matches
                    .filter(m => m.round === 'Semifinals')
                    .map(m => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-md flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white flex items-center gap-1">
                            {m.player1}
                            {m.player1 === playerProfile.username && (
                              <span className="text-[10px] text-cyan-400">(You)</span>
                            )}
                          </span>
                          <span className="font-mono text-cyan-300 font-bold">{m.score1}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-800 pt-1">
                          <span className="font-bold text-white">{m.player2}</span>
                          <span className="font-mono text-cyan-300 font-bold">{m.score2}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

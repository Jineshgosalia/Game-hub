import React, { useState } from 'react';
import { LeaderboardEntry, PlayerProfile, GameId, RankTier } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Trophy,
  Search,
  Globe2,
  Users,
  Swords,
  ChevronUp,
  ChevronDown,
  Minus,
  Sparkles,
} from 'lucide-react';

interface LeaderboardViewProps {
  playerProfile: PlayerProfile;
  leaderboardData: LeaderboardEntry[];
  onChallengePlayer: (player: LeaderboardEntry) => void;
}

const TIER_COLORS: Record<RankTier, { bg: string; text: string; border: string }> = {
  Grandmaster: { bg: 'bg-rose-950/60', text: 'text-rose-400', border: 'border-rose-500/40' },
  Master: { bg: 'bg-purple-950/60', text: 'text-purple-400', border: 'border-purple-500/40' },
  Diamond: { bg: 'bg-cyan-950/60', text: 'text-cyan-400', border: 'border-cyan-500/40' },
  Platinum: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-500/40' },
  Gold: { bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-500/40' },
  Silver: { bg: 'bg-slate-800/60', text: 'text-slate-300', border: 'border-slate-600/40' },
  Bronze: { bg: 'bg-orange-950/60', text: 'text-orange-400', border: 'border-orange-500/40' },
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  playerProfile,
  leaderboardData,
  onChallengePlayer,
}) => {
  const [scope, setScope] = useState<'GLOBAL' | 'FRIENDS' | 'REGIONAL'>('GLOBAL');
  const [gameFilter, setGameFilter] = useState<'OVERALL' | GameId>('OVERALL');
  const [regionFilter, setRegionFilter] = useState<'NA' | 'EU' | 'APAC'>('NA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter entries
  const filteredData = leaderboardData.filter(entry => {
    if (scope === 'FRIENDS' && !entry.isFriend && !entry.isSelf) return false;
    if (scope === 'REGIONAL' && entry.region !== regionFilter && !entry.isSelf) return false;
    if (searchQuery.trim()) {
      return entry.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

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
              Championship Leaderboards
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Season 1 Ranked Ladder</span>
              <span aria-hidden="true">·</span>
              <span>Updated Hourly</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">ELO Rating System</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search competitor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Scope and Game Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Scope Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              setScope('GLOBAL');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              scope === 'GLOBAL' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            Global
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setScope('FRIENDS');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              scope === 'FRIENDS' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends ({leaderboardData.filter(d => d.isFriend).length})
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setScope('REGIONAL');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              scope === 'REGIONAL' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            Regional
          </button>
        </div>

        {/* Game Filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {[
            { id: 'OVERALL', label: 'Overall Champion' },
            { id: 'CHESS', label: 'Blitz Chess' },
            { id: 'CAR_RACING', label: 'Nitro Racing' },
            { id: 'CARD_GAME', label: 'Cyber 21' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sounds.playClick();
                setGameFilter(f.id as 'OVERALL' | GameId);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                gameFilter === f.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Regional Selector Sub-tab if scope is REGIONAL */}
      {scope === 'REGIONAL' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Select Region:</span>
          {(['NA', 'EU', 'APAC'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                regionFilter === r
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Competitive Tier</th>
                <th className="py-3.5 px-4 text-right">Rating (MMR)</th>
                <th className="py-3.5 px-4 text-right">Win Rate</th>
                <th className="py-3.5 px-4 text-right">Matches</th>
                <th className="py-3.5 px-4 text-center">Challenge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredData.map(entry => {
                const tierStyle = TIER_COLORS[entry.tier];
                const rankDelta = entry.previousRank - entry.rank;

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.isSelf
                        ? 'bg-cyan-950/30 hover:bg-cyan-950/40 border-l-4 border-l-cyan-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank Number + Delta */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`font-black font-display text-sm tabular-nums ${
                            entry.rank === 1
                              ? 'text-amber-400'
                              : entry.rank === 2
                              ? 'text-slate-300'
                              : entry.rank === 3
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                        <div className="w-4">
                          {rankDelta > 0 ? (
                            <ChevronUp className="w-3.5 h-3.5 text-emerald-400 inline" />
                          ) : rankDelta < 0 ? (
                            <ChevronDown className="w-3.5 h-3.5 text-rose-400 inline" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-slate-600 inline" />
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Competitor Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                          {entry.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-100">{entry.username}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{entry.tag}</span>
                            {entry.isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">{entry.region} Server</span>
                        </div>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {entry.tier}
                      </span>
                    </td>

                    {/* Rating MMR */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-cyan-400 tabular-nums">
                      {entry.rating}
                    </td>

                    {/* Win Rate */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-300 tabular-nums">
                      {entry.winRate.toFixed(1)}%
                    </td>

                    {/* Matches Played */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                      {entry.matchesPlayed}
                    </td>

                    {/* Action Challenge Button */}
                    <td className="py-3.5 px-4 text-center">
                      {!entry.isSelf ? (
                        <button
                          onClick={() => onChallengePlayer(entry)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-[11px] transition-colors flex items-center justify-center gap-1 mx-auto"
                        >
                          <Swords className="w-3 h-3" />
                          Duel
                        </button>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

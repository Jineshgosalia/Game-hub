import React, { useState } from 'react';
import { PlayerProfile, MatchHistoryItem } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  User,
  ShieldCheck,
  Trophy,
  Activity,
  Flame,
  Share2,
  Calendar,
  CheckCircle,
  Cloud,
  Edit2,
  Check,
} from 'lucide-react';

interface ProfileViewProps {
  profile: PlayerProfile;
  matchHistory: MatchHistoryItem[];
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onOpenShareCard: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  matchHistory,
  onUpdateProfile,
  onOpenShareCard,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(profile.avatar);
  const [selectedTitle, setSelectedTitle] = useState<string>(profile.title);

  const availableAvatars = ['⚡', '👑', '🏎️', '🃏', '💎', '🚀', '🔥', '🛡️', '🎯', '🐺'];
  const availableTitles = [
    'Grandmaster Contender',
    'Speed Demon',
    'High-Roller Shark',
    'Apex Legend',
    'Tactical Mastermind',
    'Immortal Champion',
  ];

  const handleSaveProfile = () => {
    sounds.playClick();
    onUpdateProfile({
      username,
      avatar: selectedAvatar,
      title: selectedTitle,
    });
    setIsEditing(false);
  };

  const winRate = profile.stats.totalMatches > 0
    ? ((profile.stats.totalWins / profile.stats.totalMatches) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Profile Header Hero Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[220px]"
        style={{ background: profile.banner }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

        {/* Top Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-700/80 text-xs backdrop-blur-md">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-mono">Cloud Sync ID: {profile.cloudSyncHash}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShareCard}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Brag Card
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setIsEditing(!isEditing);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-medium text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6 pt-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-900/90 border-2 border-cyan-400 flex items-center justify-center text-4xl shadow-xl">
              {profile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  {profile.username}
                </h1>
                <span className="text-sm font-mono text-cyan-300 font-bold">{profile.tag}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="text-amber-400 font-medium">{profile.title}</span>
                <span aria-hidden="true">·</span>
                <span>Level {profile.level} Competitor</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2FA Secured
                </span>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full sm:w-64 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="font-semibold">Battle Pass XP</span>
              <span className="font-mono text-cyan-300">{profile.xp} / {profile.xpToNextLevel}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950/80 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Drawer / Form */}
      {isEditing && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Customize Competitive Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Display Call-sign</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Prestige Title</label>
              <select
                value={selectedTitle}
                onChange={e => setSelectedTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {availableTitles.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-2">Avatar Emblem</label>
            <div className="flex flex-wrap gap-2">
              {availableAvatars.map(av => (
                <button
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === av
                      ? 'bg-cyan-950 border-2 border-cyan-400 scale-105'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Save Identity
            </button>
          </div>
        </div>
      )}

      {/* Analytics Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall MMR */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Rating</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-cyan-400 tabular-nums">
              {profile.ratings.overall}
            </span>
            <span className="text-xs text-slate-400 ml-2">MMR</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">Top 5% Global Ladder</div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Win Rate</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-white tabular-nums">{winRate}%</span>
            <span className="text-xs text-slate-400 ml-2">
              ({profile.stats.totalWins}W / {profile.stats.totalMatches}M)
            </span>
          </div>
          <div className="text-[11px] text-cyan-400 font-medium">Consistent Competitive Ratio</div>
        </div>

        {/* Active Win Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Win Streak</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black font-mono text-amber-400 tabular-nums">
              {profile.stats.winStreak}
            </span>
            <span className="text-xs text-slate-400 ml-2">Current</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Personal Best: {profile.stats.bestStreak} Wins</div>
        </div>

        {/* Currencies */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Treasury Balance</span>
            <span className="text-cyan-400 font-bold">Arena Vault</span>
          </div>
          <div className="my-2 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {profile.coins.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">COINS</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                {profile.gems}
              </span>
              <span className="text-[10px] text-slate-400 block font-semibold">GEMS</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">Daily shop ready</div>
        </div>
      </div>

      {/* Game Ratings & Performance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blitz Chess Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">♟</span>
              <div>
                <h4 className="text-sm font-bold text-white">Grandmaster Blitz Chess</h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profile.stats.chessWins}W · {profile.stats.chessLosses}L · {profile.stats.chessDraws}D
                </span>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-cyan-400">{profile.ratings.chess}</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full"
              style={{ width: `${Math.min(100, (profile.ratings.chess / 2400) * 100)}%` }}
            />
          </div>
        </div>

        {/* Nitro Racing Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏎️</span>
              <div>
                <h4 className="text-sm font-bold text-white">Nitro Apex Racing</h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profile.stats.racingFirstPlaces} Podiums · Best {profile.stats.racingBestTime}
                </span>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-indigo-400">{profile.ratings.racing}</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-400 h-full"
              style={{ width: `${Math.min(100, (profile.ratings.racing / 2400) * 100)}%` }}
            />
          </div>
        </div>

        {/* Cyber 21 Card */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🃏</span>
              <div>
                <h4 className="text-sm font-bold text-white">Cyber 21 Duel</h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {profile.stats.cardBlackjacks} Blackjacks · Best ${profile.stats.cardBiggestPot}
                </span>
              </div>
            </div>
            <span className="text-lg font-mono font-bold text-emerald-400">{profile.ratings.cards}</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full"
              style={{ width: `${Math.min(100, (profile.ratings.cards / 2400) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Match History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Verified Match History
            </h3>
            <p className="text-xs text-slate-400">Cryptographically signed by Sentinel Anti-Cheat</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{matchHistory.length} matches logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Opponent</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-right">Rating Impact</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4 text-right">Date</th>
                <th className="py-3 px-4 text-center">Integrity Shield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {matchHistory.map(m => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {m.game === 'CHESS' ? 'Blitz Chess' : m.game === 'CAR_RACING' ? 'Nitro Racing' : 'Cyber 21'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{m.opponentAvatar}</span>
                      <span className="font-medium text-slate-300">{m.opponentName}</span>
                      <span className="text-[11px] font-mono text-slate-500">({m.opponentRating})</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                        m.result === 'VICTORY'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : m.result === 'DEFEAT'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {m.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    <span className={m.ratingDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {m.ratingDelta >= 0 ? `+${m.ratingDelta}` : m.ratingDelta}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400 tabular-nums">
                    {m.duration}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{m.date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      100%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

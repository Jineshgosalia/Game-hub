import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  Flame,
  Clock,
  Shield,
} from 'lucide-react';

interface BattlePassViewProps {
  playerProfile: PlayerProfile;
  onClaimPassTier: (tier: number, isPremium: boolean) => void;
}

export const BattlePassView: React.FC<BattlePassViewProps> = ({
  playerProfile,
  onClaimPassTier,
}) => {
  const [hasPremiumPass, setHasPremiumPass] = useState<boolean>(false);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([1, 2]);

  const tiers = [
    { level: 1, freeReward: '500 Coins', premReward: 'Neon Pawn Icon', freeIcon: '🪙', premIcon: '♟' },
    { level: 2, freeReward: '30 Gems', premReward: 'Purple Nitro Exhaust', freeIcon: '💎', premIcon: '🔥' },
    { level: 3, freeReward: '750 Coins', premReward: 'Matrix Hologram Deck', freeIcon: '🪙', premIcon: '🃏' },
    { level: 4, freeReward: '50 Gems', premReward: 'Title: "Ascended"', freeIcon: '💎', premIcon: '👑' },
    { level: 5, freeReward: '1,000 Coins', premReward: 'Obsidian Knight Piece', freeIcon: '🪙', premIcon: '♞' },
    { level: 6, freeReward: '80 Gems', premReward: 'Neon Tokyo Banner', freeIcon: '💎', premIcon: '🎨' },
    { level: 7, freeReward: '1,500 Coins', premReward: 'Solar Flare McLaren Skin', freeIcon: '🪙', premIcon: '🏎️' },
    { level: 8, freeReward: '150 Gems', premReward: 'Mythic Grandmaster Crown', freeIcon: '💎', premIcon: '✨' },
  ];

  const handleClaim = (lvl: number) => {
    sounds.playVictory();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setClaimedTiers(prev => [...prev, lvl]);
    onClaimPassTier(lvl, hasPremiumPass);
  };

  const handleUpgradePremium = () => {
    if (playerProfile.gems < 200) {
      sounds.playDefeat();
      alert('Need 200 Gems to unlock Premium Season Pass.');
      return;
    }
    sounds.playVictory();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    setHasPremiumPass(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border border-purple-500/40 shadow-2xl relative overflow-hidden flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Seasonal Championship Pass · 28 Days Remaining</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-2">
            Season 1: Neon Genesis
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Play Blitz Chess, Nitro Racing, or Cyber 21 to earn Season Pass XP. Unlock 8 tiers of limited-time cosmetics and arena treasury rewards.
          </p>
        </div>

        {!hasPremiumPass && (
          <button
            onClick={handleUpgradePremium}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Unlock Premium Pass (200 💎)
          </button>
        )}
      </div>

      {/* Progress Track */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Season Tier Ladder (Current: Tier {profileLevel(playerProfile.level)})
          </span>
          <span className="text-xs text-cyan-400 font-mono">
            {playerProfile.xp} Total Season XP
          </span>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tiers.map(t => {
            const isUnlocked = playerProfile.level >= t.level * 2;
            const isClaimed = claimedTiers.includes(t.level);

            return (
              <div
                key={t.level}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between text-center min-h-[220px] transition-all ${
                  isUnlocked
                    ? 'bg-slate-950 border-cyan-500/40 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                {/* Level Tag */}
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400">
                  <span>TIER {t.level}</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>

                {/* Free Reward */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 my-1">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Free</span>
                  <span className="text-xl my-0.5 block">{t.freeIcon}</span>
                  <span className="text-[11px] font-bold text-slate-200 block truncate">
                    {t.freeReward}
                  </span>
                </div>

                {/* Premium Reward */}
                <div
                  className={`p-2 rounded-xl border my-1 ${
                    hasPremiumPass
                      ? 'bg-amber-950/40 border-amber-500/40'
                      : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] text-amber-400 uppercase block font-semibold">
                    Premium
                  </span>
                  <span className="text-xl my-0.5 block">{t.premIcon}</span>
                  <span className="text-[11px] font-bold text-amber-200 block truncate">
                    {t.premReward}
                  </span>
                </div>

                {/* Claim Button */}
                <div className="mt-1">
                  {isClaimed ? (
                    <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaim(t.level)}
                      disabled={!isUnlocked}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isUnlocked
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function profileLevel(level: number): number {
  return Math.min(8, Math.max(1, Math.floor(level / 2)));
}

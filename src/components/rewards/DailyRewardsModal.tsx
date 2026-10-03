import React, { useState } from 'react';
import { Quest, PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  playerProfile: PlayerProfile;
  onClaimQuest: (questId: string) => void;
  onClaimDailyStreak: (day: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  quests,
  playerProfile,
  onClaimQuest,
  onClaimDailyStreak,
}) => {
  const [activeStreakDay, setActiveStreakDay] = useState<number>(3); // currently on Day 3
  const [streakClaimed, setStreakClaimed] = useState<boolean>(false);

  const streakDays = [
    { day: 1, reward: '500 Coins', icon: '🪙', value: 500, type: 'COINS' },
    { day: 2, reward: '50 Gems', icon: '💎', value: 50, type: 'GEMS' },
    { day: 3, reward: '800 Coins', icon: '🪙', value: 800, type: 'COINS' },
    { day: 4, reward: 'Prestige Banner', icon: '🎨', value: 100, type: 'BANNER' },
    { day: 5, reward: '1,500 Coins', icon: '🪙', value: 1500, type: 'COINS' },
    { day: 6, reward: '120 Gems', icon: '💎', value: 120, type: 'GEMS' },
    { day: 7, reward: 'Legendary Skin', icon: '👑', value: 500, type: 'SKIN' },
  ];

  if (!isOpen) return null;

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    sounds.playVictory();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setStreakClaimed(true);
    onClaimDailyStreak(activeStreakDay);
  };

  const handleClaimQuestReward = (quest: Quest) => {
    sounds.playVictory();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClaimQuest(quest.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Daily Login Rewards & Quests</h3>
              <p className="text-xs text-slate-400">Maintain your streak to earn exclusive cosmetics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Login Streak Row */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              7-Day Streak Calendar
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">Day 3 Active 🔥</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {streakDays.map(item => {
              const isPast = item.day < activeStreakDay;
              const isCurrent = item.day === activeStreakDay;

              return (
                <div
                  key={item.day}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center min-h-[105px] transition-all ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : isPast
                      ? 'bg-slate-950/80 border-emerald-500/40 opacity-90'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Day {item.day}
                  </span>
                  <span className="text-2xl my-1">{item.icon}</span>
                  <span className="text-[11px] font-bold text-slate-200 leading-tight">
                    {item.reward}
                  </span>

                  {isPast && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Claimed
                    </span>
                  )}
                  {isCurrent && !streakClaimed && (
                    <span className="text-[10px] font-bold text-amber-400 animate-pulse mt-1">
                      Ready!
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleClaimStreak}
            disabled={streakClaimed}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              streakClaimed
                ? 'bg-slate-800 text-slate-500 cursor-default'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {streakClaimed ? 'Day 3 Bonus Claimed for Today' : 'Claim Day 3 Login Bonus (800 Coins)'}
          </button>
        </div>

        {/* Daily Quests Section */}
        <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Daily Quests
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Resets in 11h 22m
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {quests.map(quest => {
              const isCompleted = quest.currentCount >= quest.targetCount;

              return (
                <div
                  key={quest.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{quest.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {quest.game}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mb-2">{quest.description}</p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (quest.currentCount / quest.targetCount) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {quest.currentCount}/{quest.targetCount}
                      </span>
                    </div>
                  </div>

                  {/* Reward & Claim */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-amber-400 text-xs">
                      +{quest.rewardAmount} {quest.rewardType}
                    </span>
                    {quest.claimed ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimQuestReward(quest)}
                        disabled={!isCompleted}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
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
    </div>
  );
};

import React from 'react';
import { PlayerProfile, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../utils/i18n';
import { sounds } from '../../utils/soundEffects';
import {
  Swords,
  Radio,
  Users,
  ShieldCheck,
  Settings,
  Gift,
} from 'lucide-react';

interface TopBarProps {
  currentTab: 'GAMES' | 'REPLAYS' | 'LEADERBOARD' | 'TOURNAMENTS' | 'SHOP' | 'BATTLE_PASS' | 'PROFILE';
  onSelectTab: (tab: 'GAMES' | 'REPLAYS' | 'LEADERBOARD' | 'TOURNAMENTS' | 'SHOP' | 'BATTLE_PASS' | 'PROFILE') => void;
  playerProfile: PlayerProfile;
  currentLanguage: LanguageCode;
  onOpenMatchmaking: () => void;
  onOpenVoiceChat: () => void;
  onOpenSocial: () => void;
  onOpenAntiCheat: () => void;
  onOpenSettings: () => void;
  onOpenDailyRewards: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  playerProfile,
  currentLanguage,
  onOpenMatchmaking,
  onOpenVoiceChat,
  onOpenSocial,
  onOpenAntiCheat,
  onOpenSettings,
  onOpenDailyRewards,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080b11]/85 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => {
            sounds.playClick();
            onSelectTab('GAMES');
          }}
          className="text-lg font-black tracking-tight text-white font-display flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          {t.arena_title}
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('GAMES');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'GAMES'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.play}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('REPLAYS');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'REPLAYS'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.replays || 'Replays'}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('LEADERBOARD');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'LEADERBOARD'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.leaderboards}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('TOURNAMENTS');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'TOURNAMENTS'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tournaments}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('SHOP');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'SHOP'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.shop}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('BATTLE_PASS');
            }}
            className={`whitespace-nowrap transition-colors ${
              currentTab === 'BATTLE_PASS'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.battle_pass}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions + auxiliary utility quick buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Quests / Streak Quick Trigger */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDailyRewards();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
            title="Daily Login Bonus & Quests"
          >
            <Gift className="w-4 h-4" />
          </button>

          {/* Voice Chat Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenVoiceChat();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 transition-colors relative"
            title="Voice Comms Hub"
          >
            <Radio className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {/* Social / Friends Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSocial();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Friends & Chat"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Sentinel Anti-Cheat Quick Badge */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAntiCheat();
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-colors"
            title="Sentinel Anti-Cheat Active"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fair Play</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Settings & Cloud Sync"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action 1: Find Match CTA */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMatchmaking();
            }}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0"
          >
            <Swords className="w-3.5 h-3.5" />
            {t.matchmaking}
          </button>

          {/* Primary Action 2: Player Avatar Profile */}
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTab('PROFILE');
            }}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="View Player Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-sm font-bold">
              {playerProfile.avatar}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-none">
                {playerProfile.username}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono leading-none mt-0.5">
                {playerProfile.ratings.overall} MMR
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

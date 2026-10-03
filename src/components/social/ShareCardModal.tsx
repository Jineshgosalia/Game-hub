import React, { useState } from 'react';
import { PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Trophy,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareText = `Check out my stats on Apex Arena! ⚡ Overall Rating: ${playerProfile.ratings.overall} MMR · ${playerProfile.stats.totalWins} Victories. Play against me! #ApexArena #Esports`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${playerProfile.tag.replace('#', '')}`);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    sounds.playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Competitor Achievement Card</h3>
              <p className="text-xs text-slate-400">Generate high-res social card to share with friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Graphic Card Preview */}
        <div
          className="rounded-2xl p-6 border-2 border-cyan-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px]"
          style={{ background: 'linear-gradient(135deg, #090e17 0%, #1e1b4b 50%, #0c182a 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-display">
                APEX ARENA CHAMPIONSHIP
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">VERIFIED #{playerProfile.tag}</span>
          </div>

          <div className="my-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-3xl shadow-xl">
              {playerProfile.avatar}
            </div>
            <div>
              <h4 className="text-2xl font-black text-white font-display leading-tight">
                {playerProfile.username}
              </h4>
              <p className="text-xs text-amber-400 font-semibold">{playerProfile.title}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Overall MMR</span>
              <span className="text-lg font-bold text-cyan-400">{playerProfile.ratings.overall}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Victories</span>
              <span className="text-lg font-bold text-emerald-400">{playerProfile.stats.totalWins}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Win Streak</span>
              <span className="text-lg font-bold text-amber-400">{profileWinStreak(playerProfile)} 🔥</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Sentinel Anti-Cheat Certified
            </span>
            <span className="font-mono">Season 1: Neon</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyLink}
            className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Profile Link Copied!' : 'Copy Profile Link'}
          </button>
          <button
            onClick={handleShareTwitter}
            className="py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share on X / Twitter
          </button>
        </div>
      </div>
    </div>
  );
};

function profileWinStreak(profile: PlayerProfile): number {
  return profile.stats.winStreak || 4;
}

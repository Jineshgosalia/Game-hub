import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Bell,
  X,
  Users,
  Trophy,
  Gift,
  ShieldCheck,
} from 'lucide-react';

interface NotificationToastProps {
  onOpenSocial?: () => void;
  onOpenTournaments?: () => void;
  onOpenRewards?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  onOpenSocial,
  onOpenTournaments,
  onOpenRewards,
}) => {
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);

  // Trigger occasional simulated push notifications for rich player engagement
  useEffect(() => {
    const queue: NotificationItem[] = [
      {
        id: 'n1',
        title: 'Friend Online',
        message: 'CipherSpeed has entered the arena and opened a custom lobby.',
        type: 'FRIEND',
        timestamp: 'Just now',
        read: false,
      },
      {
        id: 'n2',
        title: 'Championship Bracket Live',
        message: 'Apex Daily Blitz Semifinals round is now open for matchmaking!',
        type: 'TOURNAMENT',
        timestamp: 'Just now',
        read: false,
      },
      {
        id: 'n3',
        title: 'Daily Challenge Unlocked',
        message: 'Claim 800 Coins and 50 Gems from your 7-day login streak calendar.',
        type: 'ACHIEVEMENT',
        timestamp: 'Just now',
        read: false,
      },
    ];

    // Fire first notification after 6 seconds
    const timeout1 = setTimeout(() => {
      setCurrentNotification(queue[0]);
      sounds.playNotification();
    }, 6000);

    // Fire second notification after 30 seconds
    const timeout2 = setTimeout(() => {
      setCurrentNotification(queue[1]);
      sounds.playNotification();
    }, 32000);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  if (!currentNotification) return null;

  const handleAction = () => {
    if (currentNotification.type === 'FRIEND' && onOpenSocial) {
      onOpenSocial();
    } else if (currentNotification.type === 'TOURNAMENT' && onOpenTournaments) {
      onOpenTournaments();
    } else if (currentNotification.type === 'ACHIEVEMENT' && onOpenRewards) {
      onOpenRewards();
    }
    setCurrentNotification(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
          {currentNotification.type === 'FRIEND' ? (
            <Users className="w-4 h-4" />
          ) : currentNotification.type === 'TOURNAMENT' ? (
            <Trophy className="w-4 h-4 text-amber-400" />
          ) : (
            <Gift className="w-4 h-4 text-emerald-400" />
          )}
        </div>

        <div className="flex-1 cursor-pointer" onClick={handleAction}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-display">
              {currentNotification.title}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {currentNotification.timestamp}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-snug">
            {currentNotification.message}
          </p>
        </div>

        <button
          onClick={() => setCurrentNotification(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

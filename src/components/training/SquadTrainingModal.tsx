import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProfile, Friend, GameId, SquadMember, SquadTrainingSession } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Users,
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Swords,
  Copy,
  Check,
  X,
  UserPlus,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  Flag,
} from 'lucide-react';

interface SquadTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  friends: Friend[];
  onLaunchTraining: (game: GameId, partner?: Friend) => void;
}

export const SquadTrainingModal: React.FC<SquadTrainingModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  friends,
  onLaunchTraining,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId>('CHESS');
  const [roomCode] = useState<string>('SQUAD-APEX-914');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<'PTT' | 'OPEN'>('OPEN');
  const [showInviteDropdown, setShowInviteDropdown] = useState<boolean>(false);

  // Squad roster state
  const [squad, setSquad] = useState<SquadMember[]>([
    {
      id: 'self',
      name: playerProfile.username,
      avatar: playerProfile.avatar,
      tag: playerProfile.title,
      rating: playerProfile.ratings.overall,
      role: 'Tactician',
      isReady: true,
      isHost: true,
      isMuted: false,
      pingMs: 14,
    },
    {
      id: 'friend_1',
      name: 'CipherSpeed',
      avatar: '⚡',
      tag: 'Speed Specialist',
      rating: 1740,
      role: 'Driver',
      isReady: true,
      isHost: false,
      isMuted: false,
      pingMs: 22,
    },
  ]);

  const [selectedSubMode, setSelectedSubMode] = useState<string>('CASUAL_SPARRING');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(`APEX-SQUAD://${roomCode}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAddFriendToSquad = (friend: Friend) => {
    sounds.playClick();
    if (squad.some(m => m.name === friend.name)) return;
    if (squad.length >= 4) return;

    const newMember: SquadMember = {
      id: friend.id,
      name: friend.name,
      avatar: friend.avatar,
      tag: friend.tag,
      rating: friend.rating,
      role: selectedGame === 'CHESS' ? 'Tactician' : selectedGame === 'CAR_RACING' ? 'Driver' : 'Duelist',
      isReady: true,
      isHost: false,
      isMuted: false,
      pingMs: Math.floor(Math.random() * 20) + 15,
    };

    setSquad([...squad, newMember]);
    setShowInviteDropdown(false);
    sounds.playSuccess();
  };

  const handleRemoveMember = (id: string) => {
    sounds.playClick();
    setSquad(squad.filter(m => m.id !== id));
  };

  const handleToggleReady = (id: string) => {
    sounds.playClick();
    setSquad(
      squad.map(m => (m.id === id ? { ...m, isReady: !m.isReady } : m))
    );
  };

  const handleChangeRole = (id: string, newRole: SquadMember['role']) => {
    sounds.playClick();
    setSquad(
      squad.map(m => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleStartSession = () => {
    sounds.playSuccess();
    // Find partner if available
    const partner = friends.find(f => squad.some(s => !s.isHost && s.name === f.name));
    onLaunchTraining(selectedGame, partner);
    onClose();
  };

  const onlineFriendsNotInSquad = friends.filter(
    f => f.status !== 'OFFLINE' && !squad.some(s => s.name === f.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Squad Training & Sparring Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] tracking-wider uppercase">
                  Zero ELO Impact
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Private multiplayer scrimmage lobby · Real-time voice comms · Risk-free move lab
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {roomCode}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ELO-Protected Guarantee Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-cyan-950/60 via-indigo-950/40 to-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-cyan-300">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>100% ELO-Protected Sandbox:</strong> All games played in Squad Training have 0 rating deductions. Experiment with new openings, drift lines, and tactical calls freely.
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:block">
            Lobby Region: NA-East (18ms)
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* Game Selection Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Training Discipline
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Chess Card */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedGame('CHESS');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedGame === 'CHESS'
                    ? 'bg-gradient-to-br from-cyan-950/50 to-slate-900 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">♟️</span>
                  <span className="text-xs font-mono text-cyan-400">Tactics Sparring</span>
                </div>
                <h4 className="font-bold text-white text-sm">Blitz Chess Sparring</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Practice move takebacks, opening lines, engine analysis overlays, and endgame puzzles.
                </p>
              </div>

              {/* Racing Card */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedGame('CAR_RACING');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedGame === 'CAR_RACING'
                    ? 'bg-gradient-to-br from-indigo-950/50 to-slate-900 border-indigo-400/80 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏎️</span>
                  <span className="text-xs font-mono text-indigo-400">Ghost Racing</span>
                </div>
                <h4 className="font-bold text-white text-sm">Nitro Ghost Laps</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tandem drift laps, ghost car comparisons, infinite track practice, and boost line optimization.
                </p>
              </div>

              {/* Cards Card */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedGame('CARD_GAME');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  selectedGame === 'CARD_GAME'
                    ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900 border-emerald-400/80 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🃏</span>
                  <span className="text-xs font-mono text-emerald-400">Odds Lab</span>
                </div>
                <h4 className="font-bold text-white text-sm">Cyber 21 Strategy Lab</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Infinite practice chips, dealer bust probability HUD, card counting drills, and basic strategy coach.
                </p>
              </div>
            </div>
          </div>

          {/* Squad Member Roster */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Squad Lobby ({squad.length}/4 Members)
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Ready Check: {squad.filter(s => s.isReady).length}/{squad.length}
                </span>
              </div>

              {/* Invite Friend Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                  disabled={squad.length >= 4}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Invite Friend from Social
                </button>

                {showInviteDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-20">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                      Online Friends
                    </span>
                    {onlineFriendsNotInSquad.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-500 italic">
                        All online friends are already in the squad or in matches.
                      </div>
                    ) : (
                      onlineFriendsNotInSquad.map(f => (
                        <div
                          key={f.id}
                          onClick={() => handleAddFriendToSquad(f)}
                          className="p-2 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span>{f.avatar}</span>
                            <div className="text-left">
                              <div className="text-xs font-semibold text-white">{f.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">MMR: {f.rating}</div>
                            </div>
                          </div>
                          <span className="text-cyan-400 text-xs font-bold">+ Invite</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Squad Member Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {squad.map(member => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                        {member.avatar}
                      </div>
                      {/* Live Voice Activity Halo */}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{member.name}</span>
                        {member.isHost && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase">
                            Host
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                        <span className="font-mono text-cyan-400">{member.rating} MMR</span>
                        <span>·</span>
                        <span className="font-mono text-slate-500">{member.pingMs}ms</span>
                        <span>·</span>
                        <select
                          value={member.role}
                          onChange={e => handleChangeRole(member.id, e.target.value as SquadMember['role'])}
                          className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-300 font-semibold focus:outline-none"
                        >
                          <option value="Tactician">Tactician</option>
                          <option value="Driver">Driver</option>
                          <option value="Duelist">Duelist</option>
                          <option value="Coach">Coach / Analyst</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReady(member.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        member.isReady
                          ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {member.isReady ? 'Ready' : 'Not Ready'}
                    </button>

                    {!member.isHost && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Remove from Squad"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty Squad Slots */}
              {Array.from({ length: 4 - squad.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  onClick={() => setShowInviteDropdown(true)}
                  className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-400 hover:border-slate-700 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-xs font-medium">Open Squad Slot — Click to Invite</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Squad Voice Comms Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Squad Voice Frequency: #APEX-914</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span>WebRTC Spatial Audio Active</span>
                  <span>·</span>
                  <span className="text-cyan-400 font-mono">0.02% Packet Loss</span>
                </div>
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsMicMuted(!isMicMuted);
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isMicMuted
                    ? 'bg-rose-950 border-rose-500/40 text-rose-400'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                {isMicMuted ? 'Muted' : 'Mic Live'}
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setIsDeafened(!isDeafened);
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isDeafened
                    ? 'bg-rose-950 border-rose-500/40 text-rose-400'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
                }`}
              >
                {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                {isDeafened ? 'Deafened' : 'Sound On'}
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setVoiceMode(voiceMode === 'OPEN' ? 'PTT' : 'OPEN');
                }}
                className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Mode: {voiceMode}
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Launch Button */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Selected Discipline: </span>
            <strong className="text-cyan-400">
              {selectedGame === 'CHESS'
                ? 'Blitz Chess (Tactics Sparring)'
                : selectedGame === 'CAR_RACING'
                ? 'Nitro Racing (Ghost Laps)'
                : 'Cyber 21 (Strategy Lab)'}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartSession}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-opacity"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Squad Training (ELO Protected)
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

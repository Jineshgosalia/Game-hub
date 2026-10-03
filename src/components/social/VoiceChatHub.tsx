import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  Mic,
  MicOff,
  Headphones,
  Volume2,
  VolumeX,
  Radio,
  Users,
  Settings,
  Activity,
} from 'lucide-react';

interface VoiceChatHubProps {
  playerProfile: PlayerProfile;
  isOpen: boolean;
  onClose: () => void;
}

interface VoiceUser {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  volume: number;
  ping: number;
  isMuted: boolean;
}

export const VoiceChatHub: React.FC<VoiceChatHubProps> = ({
  playerProfile,
  isOpen,
  onClose,
}) => {
  const [channel, setChannel] = useState<'SQUAD' | 'LOBBY' | 'MATCH'>('SQUAD');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [isPttMode, setIsPttMode] = useState<boolean>(false);
  const [isPttActive, setIsPttActive] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const [participants, setParticipants] = useState<VoiceUser[]>([
    { id: 'u1', name: 'CipherSpeed', avatar: '⚡', isSpeaking: false, volume: 85, ping: 19, isMuted: false },
    { id: 'u2', name: 'TurboBishop', avatar: '🚀', isSpeaking: false, volume: 90, ping: 24, isMuted: false },
    { id: 'u3', name: 'ApexRonin', avatar: '🔥', isSpeaking: false, volume: 75, ping: 31, isMuted: false },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize Microphone stream if allowed
  const requestMicAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        setMicPermission('granted');
      }
    } catch {
      setMicPermission('denied');
    }
  };

  // Teammate random voice activity simulation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setParticipants(prev =>
        prev.map(p => {
          const speakChance = Math.random() < 0.25;
          return {
            ...p,
            isSpeaking: speakChance,
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Audio waveform animation loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dataArray = new Uint8Array(32);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let currentLevel = 0;
      if (analyserRef.current && !isMicMuted && (!isPttMode || isPttActive)) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        currentLevel = sum / dataArray.length;
      } else if (!isMicMuted && (!isPttMode || isPttActive)) {
        // Procedural waveform fluctuation
        currentLevel = 20 + Math.random() * 40;
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.floor(Math.sin(Date.now() * 0.01 + i) * 30 + 50);
        }
      } else {
        currentLevel = 0;
      }

      setAudioLevel(Math.min(100, Math.round((currentLevel / 128) * 100)));

      // Draw Visualizer Bars
      const barWidth = (canvas.width / 16) - 2;
      for (let i = 0; i < 16; i++) {
        const barHeight = isMicMuted || isDeafened ? 2 : Math.max(3, (dataArray[i] / 255) * canvas.height);
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        ctx.fillStyle = isMicMuted ? '#475569' : '#06b6d4';
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isMicMuted, isDeafened, isPttMode, isPttActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">Integrated Voice Comms</h3>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Low-Latency WebRTC Opus 48kHz</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Channel Switcher */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Audio Frequency Channel
        </span>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950">
          {(['SQUAD', 'LOBBY', 'MATCH'] as const).map(ch => (
            <button
              key={ch}
              onClick={() => {
                sounds.playClick();
                setChannel(ch);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                channel === ch
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Waveform Visualizer & Level Meter */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Mic Input Spectrum
          </span>
          <span className="font-mono text-cyan-400 text-[11px]">{audioLevel}%</span>
        </div>
        <canvas ref={canvasRef} width={360} height={32} className="w-full h-8 rounded-lg bg-slate-950" />

        {micPermission === 'prompt' && (
          <button
            onClick={requestMicAccess}
            className="mt-1 py-1.5 px-3 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition-colors text-center"
          >
            Enable Live Mic Input (Web Audio)
          </button>
        )}
      </div>

      {/* Participants in Voice Channel */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            Connected Members ({participants.length + 1})
          </span>
          <span className="font-mono text-emerald-400">18ms Avg Ping</span>
        </div>

        {/* You */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-indigo-950 border flex items-center justify-center text-xl transition-all ${
                audioLevel > 15
                  ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                  : 'border-indigo-700/50'
              }`}
            >
              {playerProfile.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-xs">{playerProfile.username}</span>
                <span className="text-[10px] text-cyan-400 font-mono">(You)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {isMicMuted ? 'Muted' : isPttMode ? 'Push to Talk' : 'Voice Active'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isMicMuted ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>

        {/* Teammates */}
        {participants.map(p => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-slate-800 border flex items-center justify-center text-xl transition-all ${
                  p.isSpeaking
                    ? 'ring-2 ring-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                    : 'border-slate-700'
                }`}
              >
                {p.avatar}
              </div>
              <div>
                <span className="font-semibold text-white text-xs block">{p.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">{p.ping}ms ping</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={p.volume}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setParticipants(list =>
                    list.map(u => (u.id === p.id ? { ...u, volume: val } : u))
                  );
                }}
                className="w-16 accent-cyan-500 h-1 rounded"
              />
              <Volume2 className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Voice Controls Bottom Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
        {/* PTT Trigger Button */}
        {isPttMode && (
          <button
            onMouseDown={() => setIsPttActive(true)}
            onMouseUp={() => setIsPttActive(false)}
            onTouchStart={() => setIsPttActive(true)}
            onTouchEnd={() => setIsPttActive(false)}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all select-none ${
              isPttActive
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isPttActive ? 'Transmitting Audio Comms...' : 'Hold to Speak (PTT)'}
          </button>
        )}

        <div className="flex items-center justify-between gap-2">
          {/* Mute Mic */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsMicMuted(!isMicMuted);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
              isMicMuted
                ? 'bg-rose-950/80 border border-rose-600 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            {isMicMuted ? 'Unmute' : 'Mute Mic'}
          </button>

          {/* Deafen Headphones */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsDeafened(!isDeafened);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
              isDeafened
                ? 'bg-rose-950/80 border border-rose-600 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4 text-cyan-400" />}
            {isDeafened ? 'Undeafen' : 'Deafen'}
          </button>

          {/* Mode Toggle (PTT vs Voice Activity) */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsPttMode(!isPttMode);
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              isPttMode
                ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Push-to-Talk"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

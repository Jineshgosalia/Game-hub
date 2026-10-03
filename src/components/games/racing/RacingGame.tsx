import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlayerProfile } from '../../../types';
import { sounds } from '../../../utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Zap,
  Gauge,
  Flag,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface RacingGameProps {
  playerProfile: PlayerProfile;
  onRaceComplete: (placement: number, timeStr: string, eloDelta: number, coinsEarned: number) => void;
  onlineOpponents?: { name: string; avatar: string; rating: number }[];
}

interface RivalCar {
  id: number;
  name: string;
  x: number; // 0 to 1 across track width
  y: number; // position on track loop
  speed: number;
  color: string;
  accent: string;
}

interface Item {
  type: 'NITRO' | 'COIN' | 'BOOST_PAD' | 'OIL_SLICK';
  x: number;
  y: number;
  collected: boolean;
}

export const RacingGame: React.FC<RacingGameProps> = ({
  playerProfile,
  onRaceComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Race parameters
  const [raceState, setRaceState] = useState<'COUNTDOWN' | 'RACING' | 'FINISHED'>('COUNTDOWN');
  const [countdown, setCountdown] = useState<number>(3);
  const [placement, setPlacement] = useState<number>(1);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const totalLaps = 3;
  const [nitroFuel, setNitroFuel] = useState<number>(100);
  const [speedMph, setSpeedMph] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [raceTimeMs, setRaceTimeMs] = useState<number>(0);
  const [bestLapMs, setBestLapMs] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [finalSummary, setFinalSummary] = useState<{
    place: number;
    time: string;
    coins: number;
    topSpeed: number;
  } | null>(null);

  // Controls state
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; nitro: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false,
  });

  // Track & Physics Simulation Ref
  const simRef = useRef({
    playerX: 0.5, // 0 (left edge) to 1 (right edge)
    playerDist: 0,
    speed: 0,
    maxSpeed: 180,
    nitroBoostActive: false,
    driftAngle: 0,
    topSpeedAchieved: 0,
    currentLap: 1,
    lapStartDist: 0,
    lapStartTime: 0,
    trackLength: 4000,
    curve: 0,
    cameraOffset: 0,
    skidmarks: [] as { x: number; y: number; alpha: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[],
    rivals: [
      { id: 1, name: 'Viper_09', x: 0.25, y: 120, speed: 145, color: '#ec4899', accent: '#f43f5e' },
      { id: 2, name: 'ApexPhantom', x: 0.75, y: 240, speed: 152, color: '#8b5cf6', accent: '#a855f7' },
      { id: 3, name: 'Solaris_GT', x: 0.35, y: 380, speed: 148, color: '#f59e0b', accent: '#fbbf24' },
      { id: 4, name: 'ZenithDrift', x: 0.65, y: 50, speed: 140, color: '#10b981', accent: '#34d399' },
    ] as RivalCar[],
    items: [] as Item[],
  });

  // Initialize track items
  useEffect(() => {
    const items: Item[] = [];
    for (let y = 300; y < 4000 * 3; y += 180) {
      const typeRand = Math.random();
      const type = typeRand < 0.4 ? 'COIN' : typeRand < 0.7 ? 'NITRO' : typeRand < 0.85 ? 'BOOST_PAD' : 'OIL_SLICK';
      items.push({
        type,
        x: 0.15 + Math.random() * 0.7,
        y,
        collected: false,
      });
    }
    simRef.current.items = items;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        keysRef.current.nitro = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        keysRef.current.nitro = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Countdown timer before start
  useEffect(() => {
    if (raceState !== 'COUNTDOWN') return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRaceState('RACING');
          sounds.playEngineRev();
          return 0;
        }
        sounds.playClick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [raceState]);

  const finishRace = useCallback((finalPlace: number, timeStr: string, coins: number, topSpeed: number) => {
    setRaceState('FINISHED');
    setFinalSummary({
      place: finalPlace,
      time: timeStr,
      coins,
      topSpeed,
    });

    if (finalPlace === 1) {
      sounds.playVictory();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onRaceComplete(1, timeStr, 26, 250);
    } else if (finalPlace <= 3) {
      sounds.playVictory();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      onRaceComplete(finalPlace, timeStr, 14, 150);
    } else {
      sounds.playDefeat();
      onRaceComplete(finalPlace, timeStr, -10, 50);
    }
  }, [onRaceComplete]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;

      const sim = simRef.current;

      if (raceState === 'RACING') {
        setRaceTimeMs(prev => prev + dt * 1000);

        // Player Acceleration / Braking
        const isAccelerating = keysRef.current.up;
        const isBraking = keysRef.current.down;
        const wantsNitro = keysRef.current.nitro && nitroFuel > 0;

        if (wantsNitro && isAccelerating) {
          sim.nitroBoostActive = true;
          setNitroFuel(prev => Math.max(0, prev - dt * 25));
          sim.speed = Math.min(sim.speed + 120 * dt, 235);
          if (Math.random() < 0.3) sounds.playNitroBoost();
        } else {
          sim.nitroBoostActive = false;
          if (isAccelerating) {
            sim.speed = Math.min(sim.speed + 75 * dt, sim.maxSpeed);
          } else if (isBraking) {
            sim.speed = Math.max(sim.speed - 110 * dt, 0);
          } else {
            // Coasting friction
            sim.speed = Math.max(sim.speed - 35 * dt, 0);
          }
        }

        // Steering & Drift
        let steerDir = 0;
        if (keysRef.current.left) steerDir -= 1;
        if (keysRef.current.right) steerDir += 1;

        if (steerDir !== 0 && sim.speed > 30) {
          const steerRate = (sim.speed / 160) * 0.7 * dt;
          sim.playerX = Math.max(0.08, Math.min(0.92, sim.playerX + steerDir * steerRate));
          sim.driftAngle = steerDir * 0.15;

          // Drift skidmarks & sounds
          if (Math.abs(steerDir) > 0 && sim.speed > 110) {
            if (Math.random() < 0.2) sounds.playDrift();
            sim.skidmarks.push({
              x: sim.playerX,
              y: sim.playerDist,
              alpha: 0.6,
            });
          }
        } else {
          sim.driftAngle *= 0.85;
        }

        // Progress distance
        sim.playerDist += sim.speed * 2.8 * dt;
        sim.topSpeedAchieved = Math.max(sim.topSpeedAchieved, Math.round(sim.speed));

        // Check Lap Completion
        const targetTotalDist = totalLaps * sim.trackLength;
        const calculatedLap = Math.min(totalLaps, Math.floor(sim.playerDist / sim.trackLength) + 1);

        if (calculatedLap !== sim.currentLap) {
          sim.currentLap = calculatedLap;
          setCurrentLap(calculatedLap);
          const lapTime = raceTimeMs - sim.lapStartTime;
          sim.lapStartTime = raceTimeMs;
          setBestLapMs(prev => (prev === null ? lapTime : Math.min(prev, lapTime)));
        }

        // Check Finish
        if (sim.playerDist >= targetTotalDist) {
          const mins = Math.floor(raceTimeMs / 60000);
          const secs = ((raceTimeMs % 60000) / 1000).toFixed(2);
          const timeStr = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
          finishRace(placement, timeStr, coinsCollected, sim.topSpeedAchieved);
        }

        // AI Rivals movement
        sim.rivals.forEach(r => {
          r.y += r.speed * 2.8 * dt;
          // Gentle lane drift
          r.x += Math.sin(timestamp * 0.002 + r.id) * 0.001;
          r.x = Math.max(0.12, Math.min(0.88, r.x));
        });

        // Compute real-time placement
        const allDistances = [
          { name: 'player', dist: sim.playerDist },
          ...sim.rivals.map(r => ({ name: r.name, dist: r.y })),
        ].sort((a, b) => b.dist - a.dist);

        const currentRank = allDistances.findIndex(d => d.name === 'player') + 1;
        setPlacement(currentRank);

        // Collectibles collision check
        sim.items.forEach(item => {
          if (item.collected) return;
          const distDiff = Math.abs(sim.playerDist - item.y);
          const xDiff = Math.abs(sim.playerX - item.x);
          if (distDiff < 45 && xDiff < 0.12) {
            item.collected = true;
            if (item.type === 'COIN') {
              setCoinsCollected(c => c + 1);
              sounds.playChips();
            } else if (item.type === 'NITRO') {
              setNitroFuel(f => Math.min(100, f + 35));
              sounds.playNitroBoost();
            } else if (item.type === 'BOOST_PAD') {
              sim.speed = Math.min(sim.speed + 50, 240);
              sounds.playNitroBoost();
            } else if (item.type === 'OIL_SLICK') {
              sim.speed = Math.max(sim.speed * 0.6, 40);
              sim.driftAngle = (Math.random() - 0.5) * 0.6;
              sounds.playCrash();
            }
          }
        });

        // Update telemetry states for HUD
        setSpeedMph(Math.round(sim.speed));
      }

      // --- RENDER CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic skybox / speed background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#060810');
      skyGrad.addColorStop(0.4, '#0f172a');
      skyGrad.addColorStop(1, '#020617');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Track dimensions
      const trackLeft = w * 0.18;
      const trackRight = w * 0.82;
      const trackWidth = trackRight - trackLeft;

      // Draw Track Asphalt
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(trackLeft, 0, trackWidth, h);

      // Outer Neon Guardrails
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(trackLeft, 0);
      ctx.lineTo(trackLeft, h);
      ctx.moveTo(trackRight, 0);
      ctx.lineTo(trackRight, h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated Road Markings (dash lines)
      const roadOffset = (sim.playerDist * 1.5) % 80;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.setLineDash([30, 50]);

      // 3 lane dividers
      for (let i = 1; i <= 3; i++) {
        const laneX = trackLeft + (trackWidth / 4) * i;
        ctx.beginPath();
        ctx.moveTo(laneX, -80 + roadOffset);
        ctx.lineTo(laneX, h + 80);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Collectibles / Track Items relative to camera
      const cameraY = sim.playerDist - h * 0.65;
      sim.items.forEach(item => {
        if (item.collected) return;
        const screenY = h - (item.y - cameraY);
        if (screenY < -50 || screenY > h + 50) return;

        const screenX = trackLeft + item.x * trackWidth;

        if (item.type === 'COIN') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('$', screenX, screenY + 4);
          ctx.shadowBlur = 0;
        } else if (item.type === 'NITRO') {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 12;
          ctx.fillRect(screenX - 8, screenY - 14, 16, 28);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('N₂', screenX, screenY + 4);
          ctx.shadowBlur = 0;
        } else if (item.type === 'BOOST_PAD') {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(screenX, screenY - 18);
          ctx.lineTo(screenX + 16, screenY + 14);
          ctx.lineTo(screenX - 16, screenY + 14);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (item.type === 'OIL_SLICK') {
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.ellipse(screenX, screenY, 22, 10, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw AI Rival Cars
      sim.rivals.forEach(r => {
        const screenY = h - (r.y - cameraY);
        if (screenY < -80 || screenY > h + 80) return;

        const screenX = trackLeft + r.x * trackWidth;

        ctx.save();
        ctx.translate(screenX, screenY);

        // Rival Car Body
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.accent;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-18, -32, 36, 64, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit glass
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-12, -14, 24, 26);

        // Headlights / Tail lights
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-14, 28, 8, 4);
        ctx.fillRect(6, 28, 8, 4);

        // Name Tag
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(r.name, 0, -40);

        ctx.restore();
      });

      // Draw Player Car
      const playerScreenX = trackLeft + sim.playerX * trackWidth;
      const playerScreenY = h * 0.75;

      ctx.save();
      ctx.translate(playerScreenX, playerScreenY);
      ctx.rotate(sim.driftAngle);

      // Nitro exhaust flame particles
      if (sim.nitroBoostActive) {
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(-10, 36);
        ctx.lineTo(0, 58 + Math.random() * 20);
        ctx.lineTo(10, 36);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-5, 36);
        ctx.lineTo(0, 48);
        ctx.lineTo(5, 36);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Player Car Chassis (Cyan & Carbon Hypercar)
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = sim.nitroBoostActive ? 24 : 12;
      ctx.beginPath();
      ctx.roundRect(-22, -36, 44, 72, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dark carbon cabin
      ctx.fillStyle = '#090d16';
      ctx.fillRect(-14, -16, 28, 30);

      // Rear Wing Spoiler
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-24, 30, 48, 6);

      // Tail brake lights
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fillRect(-18, 33, 10, 3);
      ctx.fillRect(8, 33, 10, 3);
      ctx.shadowBlur = 0;

      // Neon racing stripes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-3, -34, 6, 68);

      ctx.restore();

      // Speed blur streaks when speed > 170
      if (sim.speed > 170) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const rx = trackLeft + Math.random() * trackWidth;
          const ry = Math.random() * h;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx, ry + 60);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [raceState, nitroFuel, placement, coinsCollected, raceTimeMs, totalLaps, finishRace]);

  const handleRestartRace = () => {
    sounds.playClick();
    setRaceState('COUNTDOWN');
    setCountdown(3);
    setPlacement(1);
    setCurrentLap(1);
    setNitroFuel(100);
    setSpeedMph(0);
    setCoinsCollected(0);
    setRaceTimeMs(0);
    setFinalSummary(null);

    simRef.current.playerX = 0.5;
    simRef.current.playerDist = 0;
    simRef.current.speed = 0;
    simRef.current.nitroBoostActive = false;
    simRef.current.driftAngle = 0;
    simRef.current.topSpeedAchieved = 0;
    simRef.current.currentLap = 1;
    simRef.current.lapStartTime = 0;
    simRef.current.rivals = [
      { id: 1, name: 'Viper_09', x: 0.25, y: 120, speed: 145, color: '#ec4899', accent: '#f43f5e' },
      { id: 2, name: 'ApexPhantom', x: 0.75, y: 240, speed: 152, color: '#8b5cf6', accent: '#a855f7' },
      { id: 3, name: 'Solaris_GT', x: 0.35, y: 380, speed: 148, color: '#f59e0b', accent: '#fbbf24' },
      { id: 4, name: 'ZenithDrift', x: 0.65, y: 50, speed: 140, color: '#10b981', accent: '#34d399' },
    ];
  };

  const formatTimer = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6 flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
            🏎️
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Nitro Apex: Cyber Racing
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Hyper-Drift Physics</span>
              <span aria-hidden="true">·</span>
              <span>3 Laps Circuit</span>
              <span aria-hidden="true">·</span>
              <span className="text-cyan-400 font-medium">Ranked Time Trial</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300 font-mono">Anti-Cheat Physics Shield Active (60 Hz)</span>
        </div>
      </div>

      {/* Main Race Stage & Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Race Canvas Stage */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col items-center">
          {/* HUD Top Bar Overlay */}
          <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
            {/* Position Flag */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400">POS</span>
              <span className="text-2xl font-black font-display text-cyan-400">
                {placement}
                <span className="text-sm font-semibold text-slate-400">/5</span>
              </span>
            </div>

            {/* Lap Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg font-mono">
              <Flag className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">
                LAP {currentLap}/{totalLaps}
              </span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg font-mono">
              <span className="text-sm font-bold text-cyan-300 tabular-nums">
                {formatTimer(raceTimeMs)}
              </span>
            </div>
          </div>

          {/* Countdown Overlay */}
          {raceState === 'COUNTDOWN' && (
            <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <span className="text-8xl font-black font-display text-cyan-400 animate-ping">
                {countdown}
              </span>
              <span className="text-sm font-medium text-slate-300 mt-4">
                Use WASD or Arrow Keys + SPACE for Nitro
              </span>
            </div>
          )}

          {/* Finished Summary Overlay */}
          {raceState === 'FINISHED' && finalSummary && (
            <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold font-display text-white mb-1">
                {finalSummary.place === 1 ? '1ST PLACE VICTORY!' : `${finalSummary.place}TH PLACE`}
              </h3>
              <p className="text-sm text-slate-300 mb-6">
                Total Time: <span className="font-mono text-cyan-400 font-bold">{finalSummary.time}</span> · Top Speed: <span className="font-mono text-amber-400 font-bold">{finalSummary.topSpeed} MPH</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRestartRace}
                  className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
                >
                  Race Again
                </button>
              </div>
            </div>
          )}

          {/* The Game Canvas */}
          <canvas
            ref={canvasRef}
            width={720}
            height={560}
            className="w-full aspect-[4/3] max-h-[560px] object-cover"
          />

          {/* Mobile On-Screen Controls */}
          <div className="w-full p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between sm:hidden">
            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => (keysRef.current.left = true)}
                onTouchEnd={() => (keysRef.current.left = false)}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-slate-700 text-white font-bold"
              >
                ◀
              </button>
              <button
                onTouchStart={() => (keysRef.current.right = true)}
                onTouchEnd={() => (keysRef.current.right = false)}
                className="w-12 h-12 rounded-xl bg-slate-800 active:bg-slate-700 text-white font-bold"
              >
                ▶
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onTouchStart={() => (keysRef.current.nitro = true)}
                onTouchEnd={() => (keysRef.current.nitro = false)}
                className="w-14 h-12 rounded-xl bg-cyan-600 active:bg-cyan-500 text-white font-bold flex items-center justify-center text-xs"
              >
                NITRO
              </button>
              <button
                onTouchStart={() => (keysRef.current.up = true)}
                onTouchEnd={() => (keysRef.current.up = false)}
                className="w-14 h-12 rounded-xl bg-emerald-600 active:bg-emerald-500 text-white font-bold text-xs"
              >
                GAS
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Dashboard Column */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Speedometer & RPM Gauges */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Telemetry
              </span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="flex items-baseline justify-between py-2">
              <div>
                <span className="text-5xl font-black font-mono text-cyan-300 tabular-nums">
                  {speedMph}
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-2">MPH</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">TOP RECORD</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {simRef.current.topSpeedAchieved} MPH
                </span>
              </div>
            </div>

            {/* Nitro Boost Gauge */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Flame className="w-3.5 h-3.5" />
                  NITRO FUEL
                </span>
                <span className="font-mono text-slate-300">{Math.round(nitroFuel)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-75"
                  style={{ width: `${nitroFuel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Laps & Standings */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Standings
            </span>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 font-bold font-mono text-cyan-400">#{placement}</span>
                  <span className="font-semibold text-white">{playerProfile.username} (You)</span>
                </div>
                <span className="font-mono text-cyan-300">P{placement}</span>
              </div>

              {simRef.current.rivals.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 text-xs text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-mono text-slate-500">#{i + (placement <= i + 1 ? 2 : 1)}</span>
                    <span>{r.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">{r.speed} MPH</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Help & Sound Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Keyboard Controls
            </span>
            <div className="text-xs text-slate-300 flex flex-col gap-1.5 font-mono">
              <div className="flex justify-between">
                <span>Steer Left / Right</span>
                <span className="text-cyan-400">A / D or ◄ / ►</span>
              </div>
              <div className="flex justify-between">
                <span>Accelerate / Brake</span>
                <span className="text-cyan-400">W / S or ▲ / ▼</span>
              </div>
              <div className="flex justify-between">
                <span>Nitro Turbo Boost</span>
                <span className="text-cyan-400">SPACEBAR</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  sounds.setMuted(next);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Sound FX Active'}
              </button>
              <button
                onClick={handleRestartRace}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Restart Race"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

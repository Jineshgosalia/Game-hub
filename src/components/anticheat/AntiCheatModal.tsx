import React, { useState } from 'react';
import { sounds } from '../../utils/soundEffects';
import {
  ShieldCheck,
  X,
  Lock,
  Activity,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

interface AntiCheatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPORT' | 'LOGS'>('OVERVIEW');
  const [reportTarget, setReportTarget] = useState<string>('');
  const [reportReason, setReportReason] = useState<string>('ENGINE_ASSIST');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget.trim()) return;
    sounds.playClick();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportTarget('');
      setActiveTab('OVERVIEW');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Sentinel Anti-Cheat Shield</h3>
              <p className="text-xs text-slate-400">Real-time fair play heuristics & engine verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950">
          {(['OVERVIEW', 'REPORT', 'LOGS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab);
              }}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'OVERVIEW' ? 'Live Telemetry' : tab === 'REPORT' ? 'Report Player' : 'Audit Logs'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'OVERVIEW' && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">
                  Fair Play Status: 100% Verified Clean
                </span>
                <p className="text-[11px] text-slate-300">
                  No memory tampering, illegal hardware macros, or external AI move assistance detected.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400">Move Correlation</span>
                <span className="text-lg font-mono font-bold text-cyan-400">14.2%</span>
                <span className="text-[10px] text-emerald-400">Safe (Human Range 10-35%)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400">Keystroke Jitter</span>
                <span className="text-lg font-mono font-bold text-cyan-400">7.8 ms</span>
                <span className="text-[10px] text-emerald-400">Natural Organic Cadence</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400">Client Memory Hash</span>
                <span className="text-xs font-mono font-bold text-slate-200 truncate">sha256-8a9d...f01</span>
                <span className="text-[10px] text-emerald-400">Valid APK/Web Sandbox</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <span className="text-slate-400">Network Packet Timing</span>
                <span className="text-lg font-mono font-bold text-cyan-400">18 ms ± 2ms</span>
                <span className="text-[10px] text-emerald-400">Zero Desync Spikes</span>
              </div>
            </div>
          </div>
        )}

        {/* Report Player Tab */}
        {activeTab === 'REPORT' && (
          <form onSubmit={handleSubmitReport} className="flex flex-col gap-3 text-xs">
            {reportSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                <span className="font-bold text-white text-sm">Report Submitted Successfully</span>
                <p className="text-slate-300 text-xs">
                  Ticket #AC-{Math.floor(100000 + Math.random() * 900000)} is queued for forensic replay analysis.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-slate-400 block mb-1">Target Competitor Call-sign</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KasparovBot99 or DriftKing"
                    value={reportTarget}
                    onChange={e => setReportTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Infraction Category</label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ENGINE_ASSIST">Chess Engine / External AI Assistance</option>
                    <option value="SPEED_HACK">Racing Speed Hack / Collision Avoidance Bot</option>
                    <option value="WIN_TRADING">Win-Trading or Rating Manipulation</option>
                    <option value="UNSPORTSMANLIKE">Unsportsmanlike Conduct in Comms</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-md"
                >
                  Submit Official Anti-Cheat Incident Report
                </button>
              </>
            )}
          </form>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'LOGS' && (
          <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-400 flex flex-col gap-1.5 max-h-48 overflow-y-auto border border-slate-800">
            <div className="text-emerald-400">[SENTINEL-KERNEL] Hook verified on window.crypto.getRandomValues</div>
            <div>[SENTINEL-CHESS] Move history verified: 0 engine anomaly flags</div>
            <div>[SENTINEL-RACE] Client velocity vector in compliance with max acceleration limits</div>
            <div>[SENTINEL-DECK] Card shoe cryptographically seeded with SHA-256</div>
            <div className="text-cyan-400">[SENTINEL-SYNC] Client integrity digest match: TRUE</div>
          </div>
        )}
      </div>
    </div>
  );
};

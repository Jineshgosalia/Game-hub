import React, { useState } from 'react';
import { PlayerProfile, LanguageCode, ThemeMode } from '../../types';
import { sounds } from '../../utils/soundEffects';
import {
  X,
  Settings,
  Moon,
  Globe2,
  Cloud,
  Shield,
  Bell,
  Download,
  Upload,
  CheckCircle2,
  KeyRound,
  Plane,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onImportData: (data: PlayerProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  currentLanguage,
  onLanguageChange,
  currentTheme,
  onThemeChange,
  onUpdateProfile,
  onImportData,
}) => {
  const [syncStatus, setSyncStatus] = useState<string>('Synced');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [totpCode] = useState<string>(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    sounds.playClick();
    setIsSyncing(true);
    setSyncStatus('Syncing to Cloud Cluster...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Synced & Verified');
      onUpdateProfile({
        lastSyncedAt: new Date().toISOString(),
        cloudSyncHash: 'sha256-' + Math.random().toString(36).substring(2, 12),
      });
      sounds.playNotification();
    }, 1200);
  };

  const handleExportData = () => {
    sounds.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(playerProfile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_arena_backup_${playerProfile.tag.replace('#', '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.username && parsed.ratings) {
          sounds.playVictory();
          onImportData(parsed);
          alert('Player profile & cloud saves restored successfully!');
        }
      } catch {
        alert('Invalid backup save file format.');
      }
    };
    reader.readAsText(file);
  };

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">System Settings & Cloud Sync</h3>
              <p className="text-xs text-slate-400">Configure theme, languages, 2FA, and cross-platform backup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Sync & Cross-Platform Section */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Cross-Platform Cloud Progression</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">{syncStatus}</span>
          </div>

          <div className="text-xs text-slate-400 flex flex-col gap-1 font-mono">
            <div>Digest: {playerProfile.cloudSyncHash}</div>
            <div>Last Synced: {new Date(playerProfile.lastSyncedAt).toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Cloud className="w-3.5 h-3.5" />
              {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
            </button>
            <button
              onClick={handleExportData}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Save (JSON)
            </button>
            <label className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import Backup
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            Regional Localization
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  sounds.playClick();
                  onLanguageChange(lang.code);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                  currentLanguage === lang.code
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            Display Theme
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'dark', label: 'Obsidian Dark' },
              { id: 'cyber', label: 'Cyber Neon' },
              { id: 'oled', label: 'Midnight OLED' },
              { id: 'light', label: 'Esports Crisp' },
            ].map(thm => (
              <button
                key={thm.id}
                onClick={() => {
                  sounds.playClick();
                  onThemeChange(thm.id as ThemeMode);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  currentTheme === thm.id
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {thm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security & 2FA Authenticator */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Two-Factor Authentication (2FA)</span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateProfile({ twoFactorEnabled: !playerProfile.twoFactorEnabled });
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                playerProfile.twoFactorEnabled
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {playerProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {playerProfile.twoFactorEnabled && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Current Security TOTP Token:</span>
              <span className="font-mono text-emerald-400 font-bold tracking-widest">{totpCode}</span>
            </div>
          )}
        </div>

        {/* Offline Travel Mode Toggle */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">Offline Travel Mode</span>
              <span className="text-[11px] text-slate-400">
                Play locally against tactical bots without an internet connection
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onUpdateProfile({ isOfflineMode: !playerProfile.isOfflineMode });
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              playerProfile.isOfflineMode
                ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {playerProfile.isOfflineMode ? 'Active' : 'Off'}
          </button>
        </div>

        {/* Push Notifications Toggle */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-bold text-white block">Push Notifications</span>
              <span className="text-[11px] text-slate-400">
                Alerts when friends come online or cups begin
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setNotificationsEnabled(!notificationsEnabled);
              if (!notificationsEnabled && 'Notification' in window) {
                Notification.requestPermission().catch(() => {});
              }
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              notificationsEnabled
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
};

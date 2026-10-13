import React, { useState, useEffect } from 'react';
import { useHunter } from '../../context/HunterContext';
import { loginWithGoogle, logoutUser } from '../../config/firebase';
import {
  Volume2,
  VolumeX,
  Calendar,
  LogIn,
  LogOut,
  UserCheck,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export const CyberHeader: React.FC = () => {
  const {
    user,
    authLoading,
    selectedDate,
    setSelectedDate,
    soundEnabled,
    setSoundEnabled,
    recentXpNotification,
    profile,
  } = useHunter();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async () => {
    if (user) {
      await logoutUser();
    } else {
      try {
        await loginWithGoogle();
      } catch (err) {
        console.error('Login prompt closed or failed', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/85 backdrop-blur-md border-b border-cyan-500/15 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & System Code */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-300/40">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white font-heading text-glow-cyan">
                FITNESS BUDDY
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
                HUNTER OS
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              BIO-METRIC & HYPERTROPHY TRACKER
            </p>
          </div>
        </div>

        {/* Center / Right controls: Realtime Clock, Date Selector, Sound & Auth */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 text-xs font-mono">
          {/* Live System Time */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>SYS_TIME: {currentTime}</span>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute System SFX' : 'Enable System SFX'}
            className="p-1.5 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Local Storage Auto-Save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AUTO-SAVED TO DEVICE</span>
          </div>

          {/* Firebase Authentication Status (Optional) */}
          <button
            onClick={handleAuth}
            disabled={authLoading}
            title={user ? 'Signed in to Google Cloud' : 'Optional: Sign in to sync across devices'}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              user
                ? 'bg-slate-900/80 border border-emerald-500/40 text-emerald-300 hover:bg-slate-800'
                : 'bg-slate-900/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10'
            }`}
          >
            {user ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[100px]">{user.displayName || 'Jon'}</span>
                <LogOut className="w-3 h-3 ml-1 text-slate-400 hover:text-red-400" />
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>SYNC CLOUD (OPTIONAL)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating XP Gain Notification Toast */}
      {recentXpNotification && (
        <div className="absolute left-1/2 -translate-x-1/2 top-14 z-50 pointer-events-none transition-all duration-300 animate-bounce">
          <div className="bg-slate-950/95 border-2 border-cyan-400 px-5 py-2 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.8)] flex items-center gap-2.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 font-extrabold text-sm tracking-wider">
              +{recentXpNotification.xp} EXP
            </span>
            <span className="text-slate-300 font-medium">
              | {recentXpNotification.reason}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

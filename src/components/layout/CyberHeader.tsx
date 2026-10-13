import React, { useState, useEffect } from 'react';
import { useHunter } from '../../context/HunterContext';
import { loginWithGoogle, logoutUser } from '../../config/firebase';
import { getPhilippineTimeString } from '../../utils/phTime';
import { HunterCalendarModal } from '../calendar/HunterCalendarModal';
import {
  Volume2,
  VolumeX,
  Calendar,
  LogIn,
  LogOut,
  UserCheck,
  Zap,
  Activity,
  RotateCcw,
  AlertTriangle,
  X,
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
    resetAllData,
  } = useHunter();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getPhilippineTimeString(new Date()));
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

  const handleConfirmReset = async () => {
    await resetAllData();
    setShowResetModal(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <>
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

          {/* Center / Right controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 text-xs font-mono">
            {/* Live Philippine Standard Time */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>PH_TIME (UTC+8): {currentTime}</span>
            </div>

            {/* Interactive Calendar Modal Trigger */}
            <button
              onClick={() => setShowCalendarModal(true)}
              title="Open full interactive progress & macro calendar"
              className="flex items-center gap-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-lg px-2.5 py-1 text-xs font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">CALENDAR</span>
            </button>

            {/* Quick Date Picker */}
            <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-slate-300">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
                title="Direct date select"
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

            {/* Reset All Data / Fresh Start button */}
            <button
              onClick={() => setShowResetModal(true)}
              title="Delete all data & start fresh"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 hover:text-red-200 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>RESET DATA</span>
            </button>

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
                  <span className="hidden sm:inline">SYNC CLOUD</span>
                  <span className="sm:hidden">LOGIN</span>
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

        {/* Reset Success Toast */}
        {resetSuccess && (
          <div className="absolute left-1/2 -translate-x-1/2 top-14 z-50 pointer-events-none transition-all duration-300">
            <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-300 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.7)] text-xs font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ALL DATA WIPED // FRESH START INITIALIZED (LEVEL 1, 0 EXP)
            </div>
          </div>
        )}
      </header>

      {/* Fresh Start Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl glass-panel-glow border-2 border-red-500/50 p-6 shadow-[0_0_40px_rgba(239,68,68,0.35)] bg-slate-950">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-extrabold text-white font-heading tracking-wide">
                  SYSTEM REBOOT // FRESH START
                </h3>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to delete all data?
              <br /><br />
              This will wipe all logged meals, cardio sessions, completed exercise checks, and reset your player status back to <strong className="text-cyan-300">Level 1 (0 EXP)</strong> for a fresh, clean start.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-5 py-2 rounded-xl text-xs font-mono font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>YES, WIPE ALL DATA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Progress & Macro Calendar Modal */}
      <HunterCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </>
  );
};


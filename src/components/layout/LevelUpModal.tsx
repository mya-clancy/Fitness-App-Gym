import React from 'react';
import { useHunter } from '../../context/HunterContext';
import { Award, Zap, ChevronRight, Shield, Flame } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpModalData, closeLevelUpModal } = useHunter();

  if (!levelUpModalData || !levelUpModalData.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#0e172a] via-[#090e1a] to-[#04060a] border-2 border-cyan-400 p-8 shadow-[0_0_50px_rgba(6,182,212,0.5)] overflow-hidden text-center">
        {/* Background cyber radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Solo Leveling Blue Box Header */}
        <div className="inline-block px-4 py-1 rounded bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 font-mono text-xs uppercase tracking-widest font-bold mb-4">
          [ SYSTEM NOTIFICATION // REWARD UNLOCKED ]
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-white font-heading tracking-wider mb-2 text-glow-cyan animate-pulse">
          LEVEL UP!
        </h2>

        <p className="text-sm font-mono text-cyan-400 mb-6">
          The Monarch's authority grows stronger through disciplined training.
        </p>

        {/* Level Progression Display */}
        <div className="flex items-center justify-center gap-6 my-6 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30">
          <div className="text-center">
            <span className="text-xs font-mono text-slate-500 block">PREVIOUS</span>
            <span className="text-2xl font-bold font-heading text-slate-400">
              LV.{levelUpModalData.oldLevel}
            </span>
          </div>

          <div className="flex items-center text-cyan-400">
            <ChevronRight className="w-6 h-6 animate-pulse" />
            <ChevronRight className="w-6 h-6 -ml-3 animate-pulse" />
          </div>

          <div className="text-center">
            <span className="text-xs font-mono text-cyan-400 block font-bold">CURRENT</span>
            <span className="text-4xl font-extrabold font-heading text-cyan-300 text-glow-cyan">
              LV.{levelUpModalData.newLevel}
            </span>
          </div>
        </div>

        {/* Hunter Rank Status */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Current Hunter Rank</span>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
              {levelUpModalData.rank}
            </span>
          </div>
          {levelUpModalData.unlockedPerk && (
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              ✦ {levelUpModalData.unlockedPerk}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={closeLevelUpModal}
          className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-base py-3 px-6 rounded-xl font-heading shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer transform hover:scale-[1.02]"
        >
          CLAIM SYSTEM REWARDS & CONTINUE
        </button>
      </div>
    </div>
  );
};

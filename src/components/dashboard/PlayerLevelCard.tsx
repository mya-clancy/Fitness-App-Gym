import React from 'react';
import { useHunter } from '../../context/HunterContext';
import { getRankBadgeColors } from '../../utils/gamification';
import { Shield, Zap, Flame, Award, ChevronRight, Activity } from 'lucide-react';

export const PlayerLevelCard: React.FC = () => {
  const { profile } = useHunter();
  const rankColors = getRankBadgeColors(profile.hunterRank);

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel-glow p-4 sm:p-6 transition-all duration-300">
      {/* Background cyber grid & glow accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Bar: System Notification / Status */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-cyan-500/15 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">
            FITNESS BUDDY // HUNTER SYNCED
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span className="text-orange-300 font-bold">{profile.streakDays}D STREAK</span>
        </div>
      </div>

      {/* Main Hunter Identity & Level Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide font-heading">
              {profile.displayName}
            </h2>
            {/* Rank Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold font-mono tracking-wider border ${rankColors.bg} ${rankColors.text} ${rankColors.border} ${rankColors.glow}`}
            >
              <Award className="w-3.5 h-3.5" />
              {profile.hunterRank}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cyan-400/80 font-mono italic">
            &laquo; {profile.hunterTitle} &raquo;
          </p>
        </div>

        {/* Level Counter Block */}
        <div className="flex items-baseline gap-2 bg-slate-900/80 border border-cyan-500/30 px-4 py-2 rounded-xl self-start sm:self-auto shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono tracking-wider uppercase font-semibold">
            PLAYER
          </span>
          <span className="text-2xl sm:text-4xl font-extrabold font-heading text-cyan-300 text-glow-cyan tracking-tight">
            LV.{profile.level}
          </span>
        </div>
      </div>

      {/* Solo Leveling Cyber XP Progress Bar */}
      <div className="space-y-2 mb-5 sm:mb-6">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            EXP PROGRESSION
          </span>
          <span className="text-cyan-300 font-bold tracking-wider">
            {profile.currentLevelXp.toLocaleString()} / {profile.xpToNextLevel.toLocaleString()} XP
            <span className="text-slate-500 ml-1.5 font-normal">
              ({profile.progressPercent}%)
            </span>
          </span>
        </div>

        {/* High-Impact Segmented Neon Progress Bar */}
        <div className="relative h-3.5 sm:h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-cyan-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${Math.max(4, profile.progressPercent)}%` }}
          >
            {/* Animated laser sheen scan */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-slate-500">
          <span>Current Tier</span>
          <span>{profile.xpToNextLevel - profile.currentLevelXp} XP to Level {profile.level + 1}</span>
        </div>
      </div>

      {/* Hunter Core Attributes Matrix - 3 columns on mobile */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800/80">
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 hover:border-cyan-500/40 transition-colors">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>STR</span>
            <span className="text-red-400">⚔</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {profile.stats.strength}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Strength</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 hover:border-cyan-500/40 transition-colors">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>AGI</span>
            <span className="text-cyan-400">⚡</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {profile.stats.agility}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Agility</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 hover:border-cyan-500/40 transition-colors">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>END</span>
            <span className="text-emerald-400">🏃</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {profile.stats.endurance}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Endurance</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2 hover:border-cyan-500/40 transition-colors">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>VIT</span>
            <span className="text-blue-400">🛡</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {profile.stats.vitality}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Vitality</div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/60 border border-slate-800 rounded-lg p-2 hover:border-cyan-500/40 transition-colors">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>DISC</span>
            <span className="text-amber-400">🔥</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-100 font-heading">
            {profile.stats.discipline}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Streak Days</div>
        </div>
      </div>
    </div>
  );
};

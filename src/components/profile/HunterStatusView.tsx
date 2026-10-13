import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { getRankBadgeColors } from '../../utils/gamification';
import {
  Award,
  Shield,
  Zap,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';

const RANK_LADDER = [
  { rank: 'E-Rank', levelReq: 'Level 1-7', desc: 'The Weakest Hunter. Baseline mortal conditioning.' },
  { rank: 'D-Rank', levelReq: 'Level 8-17', desc: 'Awakened Scout. Low-rank dungeon raid survivor.' },
  { rank: 'C-Rank', levelReq: 'Level 18-29', desc: 'Combat Striker. Consistent hypertrophy & cardio adaptation.' },
  { rank: 'B-Rank', levelReq: 'Level 30-44', desc: 'Dungeon Striker. Elite strength & high endurance.' },
  { rank: 'A-Rank', levelReq: 'Level 45-59', desc: 'Elite Raid Commander. Peak athletic conditioning.' },
  { rank: 'S-Rank', levelReq: 'Level 60-79', desc: 'National Asset. Transcendent strength, sub-4min pace.' },
  { rank: 'National Hunter', levelReq: 'Level 80-99', desc: 'Sovereign Authority. One-man army capabilities.' },
  { rank: 'Shadow Monarch', levelReq: 'Level 100+', desc: 'Supreme Ruler of Death & Shadows. Complete ascension.' },
];

export const HunterStatusView: React.FC = () => {
  const { profile, dailyLog, workoutSplits, resetAllData } = useHunter();
  const rankColors = getRankBadgeColors(profile.hunterRank);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleReset = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Solo Leveling Blue Status Window */}
      <div className="rounded-2xl glass-panel-glow p-6 md:p-8 border-2 border-cyan-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              [ STATUS WINDOW // HUNTER PROTOCOL ]
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${rankColors.bg} ${rankColors.text} ${rankColors.border}`}>
            {profile.hunterRank}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identity & Stats */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-400">NAME / CODENAME</span>
              <h2 className="text-3xl font-extrabold text-white font-heading">{profile.displayName}</h2>
              <p className="text-sm font-mono text-cyan-300 italic mt-0.5">&laquo; {profile.hunterTitle} &raquo;</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">PLAYER LEVEL</span>
                <span className="text-2xl font-black text-cyan-300 font-heading">LV.{profile.level}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">TOTAL EXP EARNED</span>
                <span className="text-2xl font-black text-white font-heading">{profile.totalXp.toLocaleString()}</span>
              </div>
            </div>

            {/* Attributes Matrix */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-cyan-300 font-bold block uppercase tracking-wider">
                CORE ATTRIBUTES (TRAINING ALLOCATED)
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-300">STRENGTH (STR)</span>
                  <span className="text-red-400 font-bold font-heading text-sm">{profile.stats.strength}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-300">AGILITY (AGI)</span>
                  <span className="text-cyan-400 font-bold font-heading text-sm">{profile.stats.agility}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-300">ENDURANCE (END)</span>
                  <span className="text-emerald-400 font-bold font-heading text-sm">{profile.stats.endurance}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-300">VITALITY (VIT)</span>
                  <span className="text-blue-400 font-bold font-heading text-sm">{profile.stats.vitality}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-300">DISCIPLINE (DISC)</span>
                  <span className="text-amber-400 font-bold font-heading text-sm">{profile.stats.discipline}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Nutrition & Routine Targets */}
          <div className="space-y-4">
            <span className="text-xs font-mono text-cyan-300 font-bold block uppercase tracking-wider">
              NUTRITION & WORKOUT CONFIGURATION
            </span>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Target Calories:</span>
                <span className="text-white font-bold">{profile.calorieGoal} kcal / day</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Protein Target (2.2g/kg rule):</span>
                <span className="text-blue-400 font-bold">{profile.proteinGoal}g / day</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-slate-400">Carbohydrate Energy:</span>
                <span className="text-emerald-400 font-bold">{profile.carbsGoal}g / day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Dietary Fats:</span>
                <span className="text-amber-400 font-bold">{profile.fatGoal}g / day</span>
              </div>
            </div>

            {/* Routine summary */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Configured Splits:</span>
                <span className="text-cyan-300 font-bold">{workoutSplits.length} routines</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Streak:</span>
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {profile.streakDays} Consecutive Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Ladder Roadmap */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800">
        <h3 className="text-base font-extrabold text-white font-heading mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          HUNTER RANK HIERARCHY & ASCENSION PATH
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RANK_LADDER.map((r) => {
            const isCurrent = profile.hunterRank === r.rank;
            const rankStyle = getRankBadgeColors(r.rank as any);

            return (
              <div
                key={r.rank}
                className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
                  isCurrent
                    ? `${rankStyle.bg} ${rankStyle.border} ${rankStyle.glow} ring-1 ring-cyan-400`
                    : 'bg-slate-950/60 border-slate-800 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold ${rankStyle.text} text-sm`}>{r.rank}</span>
                  <span className="text-[10px] text-slate-400">{r.levelReq}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{r.desc}</p>
                {isCurrent && (
                  <span className="inline-block mt-2 text-[10px] bg-cyan-400 text-black font-extrabold px-2 py-0.5 rounded">
                    CURRENT RANK
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hunter System Reboot / Fresh Start Card */}
      <div className="rounded-2xl glass-panel p-6 border border-red-500/30 bg-red-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="text-base font-extrabold text-white font-heading">
              HUNTER SYSTEM REBOOT // FRESH START
            </h4>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Wipe all logged meals, cardio telemetries, and completed exercise records to reset your status back to Level 1 (0 EXP).
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-red-600/80 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESET ALL DATA</span>
        </button>
      </div>

      {/* Reboot Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl glass-panel-glow border-2 border-red-500/50 p-6 shadow-[0_0_40px_rgba(239,68,68,0.35)] bg-slate-950">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-white font-heading tracking-wide">
                  INITIALIZE FRESH START
                </h3>
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed">
              Confirm deletion of all current logs?
              <br /><br />
              This will reset your profile back to <strong className="text-cyan-300">Level 1 (0 EXP)</strong> and clear all meal records, cardio entries, and completed workout checkmarks.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 rounded-xl text-xs font-mono font-extrabold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>CONFIRM RESET</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {resetSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in">
          <div className="bg-emerald-950/95 border-2 border-emerald-400 text-emerald-300 px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.7)] text-xs font-mono font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            FRESH START INITIALIZED // SYSTEM RESET TO LEVEL 1 (0 EXP)
          </div>
        </div>
      )}
    </div>
  );
};

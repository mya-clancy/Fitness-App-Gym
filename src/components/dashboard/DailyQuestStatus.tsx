import React from 'react';
import { useHunter } from '../../context/HunterContext';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Gift,
  Flame,
  Award,
} from 'lucide-react';

export const DailyQuestStatus: React.FC<{
  onOpenScanner: () => void;
  onOpenCardio: () => void;
}> = ({ onOpenScanner, onOpenCardio }) => {
  const { profile, dailyLog, workoutSplits, activeSplitId } = useHunter();

  const totalProtein = dailyLog.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const proteinGoalMet = totalProtein >= profile.proteinGoal;

  const totalCardioKm = dailyLog.cardio.reduce((sum, c) => sum + (c.distanceKm || 0), 0);
  const cardioGoalMet = totalCardioKm >= 3.0; // 3km daily hunter benchmark

  const currentSplit =
    workoutSplits.find((s) => s.splitId === activeSplitId) || workoutSplits[0];
  const currentDay = currentSplit?.days[0];
  const workoutDone =
    currentDay && currentDay.exercises.length > 0
      ? currentDay.exercises.every((ex) =>
          dailyLog.completedExercisesToday.some((c) => c.exerciseId === ex.id)
        )
      : false;

  const allCompleted = proteinGoalMet && cardioGoalMet && workoutDone;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-extrabold text-white font-heading tracking-wider">
            [ SYSTEM DAILY QUEST: PREPARATION TO BECOME STRONG ]
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-500/30 px-2 py-0.5 rounded">
          PENALTY WARNING: PENALTY QUEST IF FAILED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        {/* Quest Item 1: Workout Routine */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
            workoutDone
              ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          {workoutDone ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block text-white">1. Hypertrophy Split Routine</span>
            <span className="text-[11px] text-slate-400">
              {workoutDone ? 'Complete all sets & reps' : 'Complete daily compound sets'}
            </span>
          </div>
        </div>

        {/* Quest Item 2: Cardio / Huawei Health */}
        <div
          onClick={onOpenCardio}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
            cardioGoalMet
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-emerald-500/30'
          }`}
        >
          {cardioGoalMet ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block text-white">2. Aerobic Stamina (3km+)</span>
            <span className="text-[11px] text-slate-400">
              Logged: {totalCardioKm.toFixed(1)} / 3.0 km
            </span>
          </div>
        </div>

        {/* Quest Item 3: Nutrition Protein Goal */}
        <div
          onClick={onOpenScanner}
          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
            proteinGoalMet
              ? 'bg-blue-950/30 border-blue-500/40 text-blue-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-blue-500/30'
          }`}
        >
          {proteinGoalMet ? (
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-bold block text-white">3. Hit Protein Target</span>
            <span className="text-[11px] text-slate-400">
              Consumed: {totalProtein} / {profile.proteinGoal}g
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-cyan-400" />
          <span>
            Daily Completion Reward: <strong className="text-cyan-300">+500 EXP Bonus</strong>, Status Recovery & Attribute Boost
          </span>
        </div>

        {allCompleted && (
          <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            ALL DAILY OBJECTIVES CLEARED!
          </span>
        )}
      </div>
    </div>
  );
};

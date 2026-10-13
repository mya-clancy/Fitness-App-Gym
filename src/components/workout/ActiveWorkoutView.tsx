import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import {
  Dumbbell,
  CheckCircle2,
  Circle,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Plus,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface ActiveWorkoutViewProps {
  onOpenSplitBuilder: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  onOpenSplitBuilder,
}) => {
  const {
    workoutSplits,
    activeSplitId,
    setActiveSplit,
    dailyLog,
    toggleExerciseCompletion,
    deleteWorkoutSplit,
  } = useHunter();

  const currentSplit =
    workoutSplits.find((s) => s.splitId === activeSplitId) || workoutSplits[0];

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  if (!currentSplit || !currentSplit.days || currentSplit.days.length === 0) {
    return (
      <div className="rounded-2xl glass-panel p-8 text-center border border-slate-800">
        <Dumbbell className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-white font-heading">
          NO WORKOUT SPLIT CONFIGURED
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-1 mb-4">
          Create your custom training routine with assigned XP values (100-500 XP).
        </p>
        <button
          onClick={onOpenSplitBuilder}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold px-5 py-2 rounded-xl text-xs font-heading shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          BUILD CUSTOM SPLIT
        </button>
      </div>
    );
  }

  const currentDay = currentSplit.days[selectedDayIndex] || currentSplit.days[0];

  const isExerciseDone = (exerciseId: string) => {
    return dailyLog.completedExercisesToday.some(
      (c) =>
        c.splitId === currentSplit.splitId &&
        c.dayId === currentDay.id &&
        c.exerciseId === exerciseId
    );
  };

  const completedCount = currentDay.exercises.filter((ex) => isExerciseDone(ex.id)).length;
  const totalExercises = currentDay.exercises.length;
  const dayProgressPercent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  const totalDayXp = currentDay.exercises.reduce((sum, ex) => sum + (ex.xpValue || 0), 0);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-6">
      {/* Top Split Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              SOLO LEVELING QUEST: WORKOUT ROUTINE
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Routine: <span className="text-cyan-300 font-bold">{currentSplit.name}</span>
          </p>
        </div>

        {/* Routine dropdown / Create Split */}
        <div className="flex items-center gap-2">
          {workoutSplits.length > 1 && (
            <select
              value={currentSplit.splitId}
              onChange={(e) => {
                setActiveSplit(e.target.value);
                setSelectedDayIndex(0);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
            >
              {workoutSplits.map((s) => (
                <option key={s.splitId} value={s.splitId}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onOpenSplitBuilder}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-500/40 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CUSTOM SPLIT</span>
          </button>
        </div>
      </div>

      {/* Days Tabs (e.g. Day 1: Push, Day 2: Pull, Day 3: Legs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {currentSplit.days.map((day, idx) => {
          const isSelected = idx === selectedDayIndex;
          const dayCompleted =
            day.exercises.length > 0 &&
            day.exercises.every((ex) =>
              dailyLog.completedExercisesToday.some(
                (c) => c.splitId === currentSplit.splitId && c.dayId === day.id && c.exerciseId === ex.id
              )
            );

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{day.dayName.split(':')[0]}</span>
              {dayCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Active Day Banner */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-bold">
            [ TODAY'S DUNGEON OBJECTIVE ]
          </span>
          <h4 className="text-base font-extrabold text-white font-heading mt-0.5">
            {currentDay.dayName}
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Target Focus: {currentDay.targetFocus}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block">TOTAL REWARD</span>
            <span className="text-cyan-300 font-extrabold text-sm">+{totalDayXp} EXP</span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block">PROGRESS</span>
            <span className="text-emerald-400 font-extrabold text-sm">
              {completedCount}/{totalExercises} ({dayProgressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Exercises Checklist */}
      <div className="space-y-3">
        {currentDay.exercises.map((exercise, index) => {
          const completed = isExerciseDone(exercise.id);

          return (
            <div
              key={exercise.id}
              className={`p-4 rounded-xl transition-all border ${
                completed
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Interactive XP Checkbox */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleExerciseCompletion(
                        currentSplit.splitId,
                        currentDay.id,
                        exercise.id,
                        exercise.xpValue,
                        exercise.name
                      )
                    }
                    className={`mt-1 p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                      completed ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-300'
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-6 h-6 fill-cyan-950 text-cyan-400" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">#{index + 1}</span>
                      <h4
                        className={`text-base font-bold font-heading transition-colors ${
                          completed ? 'text-cyan-200 line-through' : 'text-white'
                        }`}
                      >
                        {exercise.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {exercise.targetMuscle}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1.5 flex-wrap">
                      <span className="font-semibold text-slate-200">
                        {exercise.sets} sets &times; {exercise.reps} reps
                      </span>
                      {exercise.weightKg > 0 && (
                        <span>
                          Weight: <strong className="text-cyan-300">{exercise.weightKg} kg</strong>
                        </span>
                      )}
                      <span>
                        Estimated Volume:{' '}
                        {exercise.sets * exercise.reps * (exercise.weightKg || 1)} kg
                      </span>
                    </div>

                    {/* Progressive Overload Suggestion */}
                    {exercise.progressiveOverloadTip && (
                      <div className="mt-2 text-xs font-mono text-slate-400 flex items-start gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-cyan-400">Progressive Overload: </strong>
                          {exercise.progressiveOverloadTip}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned XP Value Badge */}
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                      completed
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-950 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    +{exercise.xpValue} EXP
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                    {completed ? 'QUEST COMPLETED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overload principle footer */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-cyan-500/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>
            <strong>Science-Based Overload Rule:</strong> Increase weight by 2.5kg or +1 rep per week to trigger hypertrophic adaptation and claim progressive XP rank bonuses.
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { ExerciseItem } from '../../types/hunter';
import {
  Dumbbell,
  CheckCircle2,
  Circle,
  Zap,
  TrendingUp,
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ChevronDown,
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
    deleteDayFromSplit,
    deleteExerciseFromSplit,
    addExerciseToDay,
    addDayToSplit,
  } = useHunter();

  const currentSplit =
    workoutSplits.find((s) => s.splitId === activeSplitId) || workoutSplits[0];

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Deletion Confirmation States
  const [dayToDelete, setDayToDelete] = useState<{ id: string; name: string } | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [splitToDelete, setSplitToDelete] = useState<string | null>(null);

  // Quick Add Exercise State
  const [showAddExerciseForm, setShowAddExerciseForm] = useState<boolean>(false);
  const [newExName, setNewExName] = useState<string>('');
  const [newExMuscle, setNewExMuscle] = useState<string>('Chest');
  const [newExSets, setNewExSets] = useState<number>(3);
  const [newExReps, setNewExReps] = useState<number>(10);
  const [newExWeight, setNewExWeight] = useState<number>(50);
  const [newExXp, setNewExXp] = useState<number>(250);
  const [newExTip, setNewExTip] = useState<string>('');

  // Quick Add Day State
  const [showAddDayForm, setShowAddDayForm] = useState<boolean>(false);
  const [newDayTitle, setNewDayTitle] = useState<string>('');
  const [newDayFocus, setNewDayFocus] = useState<string>('Hypertrophy & Strength');

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

  // Ensure index is valid
  const safeIndex = selectedDayIndex >= currentSplit.days.length ? 0 : selectedDayIndex;
  const currentDay = currentSplit.days[safeIndex] || currentSplit.days[0];

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

  // Handle Day deletion
  const confirmDeleteDay = async () => {
    if (!dayToDelete) return;
    await deleteDayFromSplit(currentSplit.splitId, dayToDelete.id);
    setDayToDelete(null);
    setSelectedDayIndex(0);
  };

  // Handle Workout / Exercise deletion
  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    await deleteExerciseFromSplit(currentSplit.splitId, currentDay.id, exerciseToDelete.id);
    setExerciseToDelete(null);
  };

  // Handle Quick Add Exercise
  const handleQuickAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const newEx: ExerciseItem = {
      id: 'ex_' + Date.now(),
      name: newExName.trim(),
      targetMuscle: newExMuscle,
      sets: Number(newExSets) || 3,
      reps: Number(newExReps) || 10,
      weightKg: Number(newExWeight) || 0,
      xpValue: Math.min(500, Math.max(100, Number(newExXp) || 250)),
      progressiveOverloadTip:
        newExTip.trim() || 'Increase load by 2-5% or +1 rep once all working sets are clean.',
    };

    await addExerciseToDay(currentSplit.splitId, currentDay.id, newEx);
    setNewExName('');
    setNewExTip('');
    setShowAddExerciseForm(false);
  };

  // Handle Quick Add Day
  const handleQuickAddDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const dayNumber = currentSplit.days.length + 1;
    const name = newDayTitle.trim() || `Day ${dayNumber}: Full Body Focus`;
    await addDayToSplit(currentSplit.splitId, name, newDayFocus.trim() || 'Hypertrophy');
    setNewDayTitle('');
    setShowAddDayForm(false);
    setSelectedDayIndex(currentSplit.days.length);
  };

  return (
    <div className="rounded-2xl glass-panel p-4 sm:p-6 border border-slate-800 space-y-5">
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

        {/* Routine dropdown / Create Split / Delete Split */}
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Days Tabs (e.g. Day 1: Push, Day 2: Pull, Day 3: Legs) + Add Day button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {currentSplit.days.map((day, idx) => {
          const isSelected = idx === safeIndex;
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
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{day.dayName.split(':')[0] || `Day ${idx + 1}`}</span>
              {dayCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          );
        })}

        {/* Add Day Split Button */}
        <button
          onClick={() => setShowAddDayForm(!showAddDayForm)}
          className="px-3 py-2 rounded-xl text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-500/30 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0"
          title="Add a new training day"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ADD DAY SPLIT</span>
        </button>
      </div>

      {/* Quick Add Day Form Drawer */}
      {showAddDayForm && (
        <form
          onSubmit={handleQuickAddDay}
          className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
              ADD NEW DAY SPLIT
            </span>
            <button
              type="button"
              onClick={() => setShowAddDayForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Day Name</label>
              <input
                type="text"
                placeholder={`Day ${currentSplit.days.length + 1}: Hypertrophy Arms & Delts`}
                value={newDayTitle}
                onChange={(e) => setNewDayTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Target Focus</label>
              <input
                type="text"
                placeholder="Upper Body Hypertrophy"
                value={newDayFocus}
                onChange={(e) => setNewDayFocus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddDayForm(false)}
              className="px-3 py-1 text-xs font-mono text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono cursor-pointer"
            >
              Save Day Split
            </button>
          </div>
        </form>
      )}

      {/* Active Day Banner with DELETE DAY SPLIT button */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-widest font-bold">
            [ TODAY'S DUNGEON OBJECTIVE ]
          </span>
          <h4 className="text-base sm:text-lg font-extrabold text-white font-heading mt-0.5">
            {currentDay.dayName}
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Target Focus: {currentDay.targetFocus}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-3 text-xs font-mono">
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">TOTAL REWARD</span>
            <span className="text-cyan-300 font-extrabold text-sm">+{totalDayXp} EXP</span>
          </div>

          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">PROGRESS</span>
            <span className="text-emerald-400 font-extrabold text-sm">
              {completedCount}/{totalExercises} ({dayProgressPercent}%)
            </span>
          </div>

          {/* Dedicated DELETE DAY SPLIT button */}
          <button
            type="button"
            onClick={() => setDayToDelete({ id: currentDay.id, name: currentDay.dayName })}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold text-red-400 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.2)] ml-auto md:ml-2"
            title={`Delete ${currentDay.dayName}`}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>DELETE DAY SPLIT</span>
          </button>
        </div>
      </div>

      {/* Exercises Checklist */}
      <div className="space-y-3">
        {currentDay.exercises.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-3">
            <Dumbbell className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-mono text-slate-400">
              No exercises added to {currentDay.dayName} yet.
            </p>
            <button
              onClick={() => setShowAddExerciseForm(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-mono cursor-pointer"
            >
              + ADD WORKOUT TO THIS DAY
            </button>
          </div>
        ) : (
          currentDay.exercises.map((exercise, index) => {
            const completed = isExerciseDone(exercise.id);

            return (
              <div
                key={exercise.id}
                className={`p-3.5 sm:p-4 rounded-xl transition-all border ${
                  completed
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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
                      className={`mt-0.5 p-1 rounded-lg transition-transform hover:scale-110 cursor-pointer shrink-0 ${
                        completed ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-300'
                      }`}
                      title={completed ? 'Mark pending' : 'Claim quest XP'}
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

                      <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-400 mt-1.5 flex-wrap">
                        <span className="font-semibold text-slate-200">
                          {exercise.sets} sets &times; {exercise.reps} reps
                        </span>
                        {exercise.weightKg > 0 && (
                          <span>
                            Weight: <strong className="text-cyan-300">{exercise.weightKg} kg</strong>
                          </span>
                        )}
                        <span>
                          Volume:{' '}
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

                  {/* Right side: XP Badge & DELETE WORKOUT Button */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${
                          completed
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                            : 'bg-slate-950 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        +{exercise.xpValue} EXP
                      </span>
                      <span className="hidden sm:block text-[10px] font-mono text-slate-500 mt-0.5">
                        {completed ? 'QUEST COMPLETED' : 'PENDING'}
                      </span>
                    </div>

                    {/* Dedicated DELETE WORKOUT Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setExerciseToDelete({ id: exercise.id, name: exercise.name })
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold text-red-400 hover:text-red-200 bg-red-950/30 hover:bg-red-900/50 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      title={`Delete workout: ${exercise.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>DELETE WORKOUT</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Add Workout button & form */}
      {!showAddExerciseForm ? (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAddExerciseForm(true)}
            className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-950/40 hover:bg-cyan-950/70 px-4 py-2 rounded-xl border border-cyan-500/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD WORKOUT TO THIS DAY</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleQuickAddExercise}
          className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
              ADD WORKOUT TO {currentDay.dayName}
            </span>
            <button
              type="button"
              onClick={() => setShowAddExerciseForm(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1">Workout / Exercise Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Incline Dumbbell Press"
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Target Muscle</label>
              <select
                value={newExMuscle}
                onChange={(e) => setNewExMuscle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
              >
                <option value="Chest">Chest</option>
                <option value="Back / Lats">Back / Lats</option>
                <option value="Quads">Quads</option>
                <option value="Hamstrings">Hamstrings</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Core / Abs">Core / Abs</option>
                <option value="Cardio / Calves">Cardio / Calves</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Sets</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newExSets}
                onChange={(e) => setNewExSets(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Reps</label>
              <input
                type="number"
                min="1"
                max="100"
                value={newExReps}
                onChange={(e) => setNewExReps(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="0"
                value={newExWeight}
                onChange={(e) => setNewExWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-cyan-400 block mb-1 font-bold">XP (100–500)</label>
              <input
                type="number"
                min="100"
                max="500"
                step="25"
                value={newExXp}
                onChange={(e) => setNewExXp(Number(e.target.value))}
                className="w-full bg-slate-900 border border-cyan-500/60 rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-xs font-mono">
              Progressive Overload Guidance
            </label>
            <input
              type="text"
              placeholder="e.g. When hitting 10 clean reps on all sets, increase load by +2.5kg."
              value={newExTip}
              onChange={(e) => setNewExTip(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddExerciseForm(false)}
              className="px-4 py-1.5 text-xs font-mono text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newExName.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-extrabold text-xs font-mono cursor-pointer"
            >
              + Save Workout
            </button>
          </div>
        </form>
      )}

      {/* Overload principle footer */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900 border border-cyan-500/20 flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Science-Based Overload Rule:</strong> Increase weight by 2.5kg or +1 rep per week to trigger hypertrophic adaptation and claim progressive XP rank bonuses.
          </span>
        </div>
      </div>

      {/* Confirmation Modal for DELETE DAY SPLIT */}
      {dayToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel-glow border-2 border-red-500/50 p-6 bg-slate-950 shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4 text-red-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-white font-heading">
                  CONFIRM DELETE DAY SPLIT
                </h3>
              </div>
              <button
                onClick={() => setDayToDelete(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-red-300">"{dayToDelete.name}"</strong>?
              <br /><br />
              All exercises nested under this day will be removed from your routine.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDayToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDay}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>YES, DELETE DAY SPLIT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for DELETE WORKOUT */}
      {exerciseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-panel-glow border-2 border-red-500/50 p-6 bg-slate-950 shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4 text-red-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-white font-heading">
                  CONFIRM DELETE WORKOUT
                </h3>
              </div>
              <button
                onClick={() => setExerciseToDelete(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to delete the workout <strong className="text-red-300">"{exerciseToDelete.name}"</strong> from {currentDay.dayName}?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setExerciseToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteExercise}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>YES, DELETE WORKOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

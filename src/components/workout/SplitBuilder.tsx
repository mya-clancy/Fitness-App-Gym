import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { WorkoutDay, ExerciseItem, WorkoutSplit } from '../../types/hunter';
import {
  Layers,
  Plus,
  Trash2,
  Dumbbell,
  Zap,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface SplitBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  editingSplit?: WorkoutSplit | null;
}

export const SplitBuilder: React.FC<SplitBuilderProps> = ({ isOpen, onClose, editingSplit }) => {
  const { addWorkoutSplit, updateWorkoutSplit } = useHunter();

  const [splitName, setSplitName] = useState<string>('');
  const [splitDescription, setSplitDescription] = useState<string>('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [expandedDayId, setExpandedDayId] = useState<string>('');
  const [exerciseDayTarget, setExerciseDayTarget] = useState<string>('');

  React.useEffect(() => {
    if (!isOpen) return;
    if (editingSplit) {
      setSplitName(editingSplit.name);
      setSplitDescription(editingSplit.description);
      const initialDays =
        editingSplit.days && editingSplit.days.length > 0
          ? editingSplit.days
          : [
              {
                id: 'day_' + Date.now(),
                dayName: 'Day 1: Training Session',
                targetFocus: 'Strength & Hypertrophy',
                exercises: [],
              },
            ];
      setDays(initialDays);
      setExpandedDayId(initialDays[0]?.id || '');
      setExerciseDayTarget(initialDays[0]?.id || '');
    } else {
      const defaultId = 'day_' + Date.now();
      const defaultDays: WorkoutDay[] = [
        {
          id: defaultId,
          dayName: 'Day 1: Hypertrophy Chest & Triceps',
          targetFocus: 'Chest, Anterior Delts & Triceps',
          exercises: [
            {
              id: 'ex_' + Date.now() + '_1',
              name: 'Barbell Flat Bench Press',
              targetMuscle: 'Chest',
              sets: 4,
              reps: 8,
              weightKg: 80,
              xpValue: 350,
              progressiveOverloadTip: 'Aim for +2.5kg next cycle when all sets hit 8 reps clean.',
            },
          ],
        },
      ];
      setSplitName('');
      setSplitDescription('');
      setDays(defaultDays);
      setExpandedDayId(defaultId);
      setExerciseDayTarget(defaultId);
    }
  }, [isOpen, editingSplit]);
  const [exName, setExName] = useState<string>('');
  const [exTargetMuscle, setExTargetMuscle] = useState<string>('Chest');
  const [exSets, setExSets] = useState<number>(3);
  const [exReps, setExReps] = useState<number>(10);
  const [exWeight, setExWeight] = useState<number>(40);
  const [exXp, setExXp] = useState<number>(250);
  const [exOverloadTip, setExOverloadTip] = useState<string>('');

  if (!isOpen) return null;

  const handleAddDay = () => {
    const newDayId = 'day_' + Date.now();
    const dayIndex = days.length + 1;
    const newDay: WorkoutDay = {
      id: newDayId,
      dayName: `Day ${dayIndex}: Strength & Hypertrophy Routine`,
      targetFocus: 'Full Compound Focus',
      exercises: [],
    };
    setDays([...days, newDay]);
    setExpandedDayId(newDayId);
    setExerciseDayTarget(newDayId);
  };

  const handleRemoveDay = (dayId: string) => {
    if (days.length <= 1) return;
    setDays(days.filter((d) => d.id !== dayId));
  };

  const handleUpdateDayName = (dayId: string, name: string) => {
    setDays(days.map((d) => (d.id === dayId ? { ...d, dayName: name } : d)));
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exName.trim()) return;

    const newExercise: ExerciseItem = {
      id: 'ex_' + Date.now(),
      name: exName,
      targetMuscle: exTargetMuscle,
      sets: Number(exSets) || 3,
      reps: Number(exReps) || 10,
      weightKg: Number(exWeight) || 0,
      xpValue: Math.min(500, Math.max(100, Number(exXp) || 200)),
      progressiveOverloadTip:
        exOverloadTip || `Increase load by 2-5% once target reps are achieved with good form.`,
    };

    setDays(
      days.map((d) =>
        d.id === exerciseDayTarget ? { ...d, exercises: [...d.exercises, newExercise] } : d
      )
    );

    // Reset inputs
    setExName('');
    setExOverloadTip('');
    setExXp(250);
  };

  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setDays(
      days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exerciseId) }
          : d
      )
    );
  };

  const handleSaveSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!splitName.trim()) return;

    if (editingSplit) {
      await updateWorkoutSplit(editingSplit.splitId, {
        name: splitName.trim(),
        description: splitDescription.trim() || 'Custom workout routine engineered for progressive overload.',
        days,
      });
    } else {
      await addWorkoutSplit({
        name: splitName.trim(),
        description: splitDescription.trim() || 'Custom workout routine engineered for progressive overload.',
        days,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-6 md:p-8 shadow-[0_0_40px_rgba(6,182,212,0.3)] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-heading tracking-wide">
                {editingSplit ? 'EDIT WORKOUT SPLIT' : 'CUSTOM WORKOUT SPLIT BUILDER'}
              </h3>
              <p className="text-xs text-cyan-400/80 font-mono">
                {editingSplit
                  ? `Modifying: ${editingSplit.name} // Adjust training days & exercises`
                  : 'Hierarchy: Custom Split → Training Days → Exercises + XP (100–500)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveSplit} className="space-y-6">
          {/* Split Name and Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Split Routine Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Upper / Lower Hypertrophy Split"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Training Cycle Focus
              </label>
              <input
                type="text"
                placeholder="e.g. 4-Day Strength & Size"
                value={splitDescription}
                onChange={(e) => setSplitDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Days Accordion / Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold tracking-wider uppercase">
                TRAINING DAYS IN THIS ROUTINE ({days.length})
              </span>

              <button
                type="button"
                onClick={handleAddDay}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD DAY</span>
              </button>
            </div>

            {days.map((day, dIdx) => (
              <div
                key={day.id}
                className="rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden"
              >
                {/* Day Header */}
                <div className="p-3.5 bg-slate-900/70 border-b border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      DAY {dIdx + 1}:
                    </span>
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) => handleUpdateDayName(day.id, e.target.value)}
                      className="bg-transparent text-white font-heading text-sm font-bold focus:outline-none border-b border-transparent focus:border-cyan-400 flex-1 px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {day.exercises.length} Exercises
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDayId(expandedDayId === day.id ? '' : day.id)
                      }
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {expandedDayId === day.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(day.id)}
                        className="px-2 py-1 rounded text-red-400 hover:text-red-300 bg-red-950/40 border border-red-500/30 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                        title="Delete Day Split"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">DELETE DAY SPLIT</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Day Exercises List */}
                {expandedDayId === day.id && (
                  <div className="p-4 space-y-3">
                    {day.exercises.length === 0 ? (
                      <div className="text-center py-4 text-xs font-mono text-slate-500">
                        No exercises added to this day yet. Use the exercise builder below.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {day.exercises.map((ex) => (
                          <div
                            key={ex.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono"
                          >
                            <div className="flex items-center gap-2.5">
                              <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                              <div>
                                <span className="font-bold text-white text-sm">
                                  {ex.name}
                                </span>
                                <div className="text-slate-400 text-[11px] mt-0.5">
                                  {ex.sets} sets &times; {ex.reps} reps • {ex.weightKg}kg •{' '}
                                  <span className="text-slate-500">{ex.targetMuscle}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="bg-cyan-950 text-cyan-300 font-extrabold px-2 py-0.5 rounded border border-cyan-500/40 text-[11px]">
                                +{ex.xpValue} EXP
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExercise(day.id, ex.id)}
                                className="px-2 py-1 rounded text-red-400 hover:text-red-300 bg-red-950/30 border border-red-500/30 text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                                title="Delete Workout"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">DELETE WORKOUT</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Exercise Panel */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                ADD EXERCISE TO SELECTED DAY
              </span>
              <select
                value={exerciseDayTarget}
                onChange={(e) => setExerciseDayTarget(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                {days.map((d, i) => (
                  <option key={d.id} value={d.id}>
                    Day {i + 1}: {d.dayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="sm:col-span-2">
                <label className="text-slate-400 block mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Press"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Muscle</label>
                <select
                  value={exTargetMuscle}
                  onChange={(e) => setExTargetMuscle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back / Lats">Back / Lats</option>
                  <option value="Quads">Quads</option>
                  <option value="Hamstrings">Hamstrings</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Biceps">Biceps</option>
                  <option value="Triceps">Triceps</option>
                  <option value="Core / Abs">Core / Abs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Sets</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={exSets}
                  onChange={(e) => setExSets(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Reps</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={exReps}
                  onChange={(e) => setExReps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={exWeight}
                  onChange={(e) => setExWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>

              <div>
                <label className="text-cyan-400 block mb-1 font-bold">
                  XP Value (100–500)
                </label>
                <input
                  type="number"
                  min="100"
                  max="500"
                  step="25"
                  value={exXp}
                  onChange={(e) => setExXp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-cyan-500/60 rounded px-2 py-1 text-cyan-300 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 text-xs font-mono">
                Progressive Overload Guidance
              </label>
              <input
                type="text"
                placeholder="e.g. When hitting 10 reps across 3 sets, increase load by +2.5kg."
                value={exOverloadTip}
                onChange={(e) => setExOverloadTip(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddExercise}
                disabled={!exName.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-extrabold px-4 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                + Insert Exercise Into Day
              </button>
            </div>
          </div>

          {/* Form Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!splitName.trim()}
              className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs font-heading shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingSplit ? 'UPDATE SPLIT ROUTINE' : 'SAVE CUSTOM SPLIT ROUTINE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

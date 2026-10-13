import React from 'react';
import { useHunter } from '../../context/HunterContext';
import { Utensils, Trash2, Clock, Flame, Plus } from 'lucide-react';

interface DailyMealListProps {
  onOpenScanner: () => void;
}

export const DailyMealList: React.FC<DailyMealListProps> = ({ onOpenScanner }) => {
  const { dailyLog, deleteMeal } = useHunter();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Breakfast':
        return 'text-amber-400 bg-amber-950/60 border-amber-600/30';
      case 'Lunch':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-600/30';
      case 'Dinner':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-600/30';
      case 'Pre-Workout':
      case 'Post-Workout':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-600/30';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white font-heading tracking-wide">
            TODAY'S LOGGED MEALS
          </h3>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            {dailyLog.meals.length} LOGS
          </span>
        </div>

        <button
          onClick={onOpenScanner}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-500/40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>LOG MEAL</span>
        </button>
      </div>

      {/* Meals List */}
      {dailyLog.meals.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed border-slate-800 rounded-xl">
          <Utensils className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-slate-400 font-mono">No meals logged for this date yet.</p>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Capture a food photo with Gemini AI Scanner or pick a preset meal.
          </p>
          <button
            onClick={onOpenScanner}
            className="mt-3 text-xs font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-lg hover:bg-cyan-500/30 transition-all"
          >
            Launch Food Scanner
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {dailyLog.meals.map((meal) => (
            <div
              key={meal.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                {meal.imageUrl ? (
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getCategoryColor(
                        meal.category
                      )}`}
                    >
                      {meal.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {meal.timestamp}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">{meal.name}</h4>

                  {meal.notes && (
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {meal.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Macros & Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="text-right text-xs font-mono">
                  <div className="font-extrabold text-cyan-300 text-sm">
                    {meal.calories} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-x-1.5">
                    <span className="text-blue-400 font-medium">{meal.protein}g P</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">{meal.carbs}g C</span>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">{meal.fat}g F</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteMeal(meal.id)}
                  title="Remove meal"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

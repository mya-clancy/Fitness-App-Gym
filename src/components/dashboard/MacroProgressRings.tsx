import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { Flame, Target, Settings, ChevronRight, CheckCircle2 } from 'lucide-react';

interface CircularRingProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  strokeColor: string;
  glowColor: string;
  size?: number;
  strokeWidth?: number;
}

const CircularProgressRing: React.FC<CircularRingProps> = ({
  label,
  current,
  target,
  unit,
  strokeColor,
  glowColor,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-40"
          />
          {/* Active Glow Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        {/* Center Metric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-extrabold text-white font-heading leading-none">
            {current}
            <span className="text-[10px] text-slate-400 ml-0.5 font-mono">{unit}</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400 font-bold mt-0.5">
            {percent}%
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="text-xs font-mono font-semibold text-slate-300 block uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[11px] font-mono text-slate-500 block">
          Goal: {target}
          {unit}
        </span>
      </div>
    </div>
  );
};

export const MacroProgressRings: React.FC<{ onOpenFoodScanner?: () => void }> = ({
  onOpenFoodScanner,
}) => {
  const { profile, dailyLog, updateMacroGoals } = useHunter();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(profile.calorieGoal);
  const [proteinGoal, setProteinGoal] = useState(profile.proteinGoal);
  const [carbsGoal, setCarbsGoal] = useState(profile.carbsGoal);
  const [fatGoal, setFatGoal] = useState(profile.fatGoal);

  // Totals consumed today
  const totalCalories = dailyLog.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = dailyLog.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = dailyLog.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = dailyLog.meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  // Cardio calories burned offset
  const cardioCaloriesBurned = dailyLog.cardio.reduce(
    (sum, c) => sum + (c.activeCaloriesBurned || 0),
    0
  );
  const remainingCalories = profile.calorieGoal - totalCalories;

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMacroGoals({
      calorieGoal: Number(calorieGoal) || 2400,
      proteinGoal: Number(proteinGoal) || 180,
      carbsGoal: Number(carbsGoal) || 260,
      fatGoal: Number(fatGoal) || 70,
    });
    setIsEditingGoals(false);
  };

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              DAILY NUTRITION PROTOCOL
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Optimal macro partition for muscle hypertrophy & hunter stamina
          </p>
        </div>

        <button
          onClick={() => setIsEditingGoals(!isEditingGoals)}
          className="text-xs font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          {isEditingGoals ? 'Close' : 'Adjust Goals'}
        </button>
      </div>

      {/* Goal Adjustment Panel */}
      {isEditingGoals && (
        <form
          onSubmit={handleSaveGoals}
          className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3"
        >
          <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5 mb-2">
            <span>CONFIGURE MACRONUTRIENT TARGETS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Protein (g)</label>
              <input
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Carbs (g)</label>
              <input
                type="number"
                value={carbsGoal}
                onChange={(e) => setCarbsGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Fat (g)</label>
              <input
                type="number"
                value={fatGoal}
                onChange={(e) => setFatGoal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-4 py-1.5 rounded-lg font-mono transition-colors"
            >
              Save Hunter Protocol
            </button>
          </div>
        </form>
      )}

      {/* Main Rings Display Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2 items-center justify-items-center">
        {/* Calories Ring */}
        <CircularProgressRing
          label="Calories"
          current={totalCalories}
          target={profile.calorieGoal}
          unit=" kcal"
          strokeColor="#38bdf8"
          glowColor="rgba(56, 189, 248, 0.7)"
        />

        {/* Protein Ring (Priority 1 for hunters) */}
        <CircularProgressRing
          label="Protein"
          current={totalProtein}
          target={profile.proteinGoal}
          unit="g"
          strokeColor="#0066ff"
          glowColor="rgba(0, 102, 255, 0.8)"
        />

        {/* Carbohydrates Ring */}
        <CircularProgressRing
          label="Carbs"
          current={totalCarbs}
          target={profile.carbsGoal}
          unit="g"
          strokeColor="#10b981"
          glowColor="rgba(16, 185, 129, 0.7)"
        />

        {/* Fats Ring */}
        <CircularProgressRing
          label="Fats"
          current={totalFat}
          target={profile.fatGoal}
          unit="g"
          strokeColor="#f59e0b"
          glowColor="rgba(245, 158, 11, 0.7)"
        />
      </div>

      {/* Energy Balance & Cardio Offset Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              Remaining:{' '}
              <strong className={remainingCalories >= 0 ? 'text-cyan-300' : 'text-red-400'}>
                {remainingCalories >= 0 ? `${remainingCalories} kcal` : `+${Math.abs(remainingCalories)} over`}
              </strong>
            </span>
          </div>
          {cardioCaloriesBurned > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>
                Burned:{' '}
                <strong className="text-orange-400">-{cardioCaloriesBurned} kcal</strong>
              </span>
            </div>
          )}
        </div>

        {onOpenFoodScanner && (
          <button
            onClick={onOpenFoodScanner}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold px-4 py-2 rounded-xl text-xs font-heading shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
          >
            <span>AI NUTRITION SCANNER</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

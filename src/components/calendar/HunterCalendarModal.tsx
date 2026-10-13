import React, { useState, useMemo } from 'react';
import { useHunter } from '../../context/HunterContext';
import { DailyLogData } from '../../types/hunter';
import {
  getPhilippineDateString,
  formatPhilippineDisplayDate,
  isTodayInPhilippineTime,
  parseYearMonth,
  getDaysInMonth,
  getFirstDayOfWeekInMonth,
  formatToDateString,
} from '../../utils/phTime';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  CheckCircle2,
  X,
  Zap,
  Activity,
  ArrowRight,
} from 'lucide-react';

interface HunterCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HunterCalendarModal: React.FC<HunterCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedDate, setSelectedDate, dailyLog, profile } = useHunter();

  const phToday = getPhilippineDateString();
  const initialParsed = parseYearMonth(selectedDate || phToday);

  const [currentYear, setCurrentYear] = useState<number>(initialParsed.year);
  const [currentMonth, setCurrentMonth] = useState<number>(initialParsed.month);
  const [inspectedDate, setInspectedDate] = useState<string>(selectedDate || phToday);

  // When opening or selectedDate changes, keep inspected date in sync
  React.useEffect(() => {
    if (isOpen) {
      setInspectedDate(selectedDate || phToday);
      const parsed = parseYearMonth(selectedDate || phToday);
      setCurrentYear(parsed.year);
      setCurrentMonth(parsed.month);
    }
  }, [isOpen, selectedDate, phToday]);

  if (!isOpen) return null;

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const parsed = parseYearMonth(phToday);
    setCurrentYear(parsed.year);
    setCurrentMonth(parsed.month);
    setInspectedDate(phToday);
  };

  const handleSelectDay = (dateStr: string) => {
    setInspectedDate(dateStr);
  };

  const handleApplySelectedDate = () => {
    setSelectedDate(inspectedDate);
    onClose();
  };

  // Days calculation for current month
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeekInMonth(currentYear, currentMonth);

  // Retrieve inspected date log
  const getLogForDate = (dateStr: string): DailyLogData | null => {
    if (dateStr === dailyLog.date) {
      return dailyLog;
    }
    try {
      const saved = localStorage.getItem(`hunter_log_${dateStr}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return null;
  };

  const inspectedLog = getLogForDate(inspectedDate);

  // Calculate totals for inspected date
  const inspectedMeals = inspectedLog?.meals || [];
  const inspectedCardio = inspectedLog?.cardio || [];
  const inspectedExercises = inspectedLog?.completedExercisesToday || [];

  const totalCalories = inspectedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = inspectedMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = inspectedMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = inspectedMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const calProgress = profile.calorieGoal > 0 ? Math.min(100, Math.round((totalCalories / profile.calorieGoal) * 100)) : 0;
  const proteinProgress = profile.proteinGoal > 0 ? Math.min(100, Math.round((totalProtein / profile.proteinGoal) * 100)) : 0;
  const carbsProgress = profile.carbsGoal > 0 ? Math.min(100, Math.round((totalCarbs / profile.carbsGoal) * 100)) : 0;
  const fatProgress = profile.fatGoal > 0 ? Math.min(100, Math.round((totalFat / profile.fatGoal) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.35)] my-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-wide">
                  HUNTER PROGRESS & MACRO CALENDAR
                </h3>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                  PH TIME (UTC+8)
                </span>
              </div>
              <p className="text-xs text-cyan-400/80 font-mono">
                Daily reset at 12:00 AM midnight Asia/Manila // Select any date to inspect food & workout telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Left Calendar / Right Day Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Monthly Calendar (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="text-sm font-bold text-white font-heading tracking-wide">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpToToday}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold transition-all cursor-pointer"
                  title="Jump to Today in Philippine Time"
                >
                  TODAY
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-slate-400 font-bold pb-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding slots before first day */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl bg-slate-950/30 border border-slate-900/40 opacity-40" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = formatToDateString(currentYear, currentMonth, dayNum);
                const isInspected = dateStr === inspectedDate;
                const isToday = isTodayInPhilippineTime(dateStr);
                const isCurrentActive = dateStr === selectedDate;

                // Check stored log data for this day
                const dayLog = getLogForDate(dateStr);
                const dayCals = dayLog?.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
                const hasMeals = (dayLog?.meals?.length || 0) > 0;
                const hasExercises = (dayLog?.completedExercisesToday?.length || 0) > 0;
                const hasCardio = (dayLog?.cardio?.length || 0) > 0;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => handleSelectDay(dateStr)}
                    className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden ${
                      isInspected
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50'
                        : isToday
                        ? 'bg-blue-950/30 border-blue-500/50 hover:border-cyan-500/60'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Day Number + Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isInspected
                            ? 'text-cyan-200'
                            : isToday
                            ? 'text-cyan-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {isToday && (
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500 text-black font-extrabold uppercase leading-tight">
                          PH
                        </span>
                      )}
                      {!isToday && isCurrentActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active in workspace" />
                      )}
                    </div>

                    {/* Bottom Indicators: Calories & Exercises */}
                    <div className="w-full space-y-0.5">
                      {hasMeals && (
                        <div className="text-[9px] font-mono font-bold text-cyan-300 truncate leading-none">
                          {dayCals} kcal
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {hasMeals && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Meals logged" />}
                        {hasExercises && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Workouts completed" />}
                        {hasCardio && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" title="Cardio session logged" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Day Progress & Telemetry Dossier (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl glass-panel p-4 sm:p-5 border border-slate-800 space-y-5">
            {/* Header for Inspected Date */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-slate-900 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded font-bold">
                  {isTodayInPhilippineTime(inspectedDate) ? 'TODAY // PHILIPPINES' : 'ARCHIVED DATE LOG'}
                </span>

                <span className="text-xs font-mono text-slate-400">
                  {inspectedDate}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-extrabold text-white font-heading mt-1.5">
                {formatPhilippineDisplayDate(inspectedDate)}
              </h4>
            </div>

            {/* Macro Telemetry Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  Calories Consumed
                </span>
                <span className="font-bold text-white">
                  {totalCalories}{' '}
                  <span className="text-slate-500 font-normal">/ {profile.calorieGoal} kcal</span>
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${calProgress}%` }}
                />
              </div>

              {/* Macronutrient breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">PROTEIN</span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {totalProtein}g
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    / {profile.proteinGoal}g
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">CARBS</span>
                  <span className="text-xs font-mono font-bold text-blue-300">
                    {totalCarbs}g
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    / {profile.carbsGoal}g
                  </span>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block">FATS</span>
                  <span className="text-xs font-mono font-bold text-purple-300">
                    {totalFat}g
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    / {profile.fatGoal}g
                  </span>
                </div>
              </div>
            </div>

            {/* Meals Logged on this day */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>MEALS LOGGED ({inspectedMeals.length})</span>
                <span className="text-[10px] font-normal text-slate-500">AI Scanner</span>
              </span>

              {inspectedMeals.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-2">
                  No food logs recorded for this day.
                </p>
              ) : (
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {inspectedMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="truncate max-w-[150px]">
                        <span className="text-white font-medium block truncate">{meal.name}</span>
                        <span className="text-[10px] text-slate-500">{meal.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-cyan-300 font-bold">{meal.calories} kcal</span>
                        <span className="text-[10px] text-slate-400 block">
                          P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workouts Completed on this day */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>WORKOUTS ({inspectedExercises.length})</span>
                <span className="text-[10px] font-normal text-slate-500">EXP Earned</span>
              </span>

              {inspectedExercises.length === 0 ? (
                <p className="text-xs font-mono text-slate-500 py-1">
                  No completed exercises recorded on this day.
                </p>
              ) : (
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {inspectedExercises.map((ex, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-slate-300 truncate">Exercise #{i + 1}</span>
                      </div>
                      <span className="text-cyan-400 font-bold shrink-0">+{ex.xpEarned} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Switch to this date button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplySelectedDate}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs font-heading shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>OPEN THIS DATE IN WORKSPACE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useHunter } from '../../context/HunterContext';
import {
  Activity,
  Flame,
  Plus,
  Trash2,
  TrendingUp,
  MapPin,
  Clock,
  Heart,
} from 'lucide-react';

interface WeeklyCardioGraphProps {
  onOpenCardioLogger: () => void;
}

export const WeeklyCardioGraph: React.FC<WeeklyCardioGraphProps> = ({
  onOpenCardioLogger,
}) => {
  const { dailyLog, deleteCardio } = useHunter();

  // Calculate totals for today
  const totalKmToday = dailyLog.cardio.reduce((sum, c) => sum + (c.distanceKm || 0), 0);
  const totalCaloriesToday = dailyLog.cardio.reduce(
    (sum, c) => sum + (c.activeCaloriesBurned || 0),
    0
  );

  // Generate 7-day progress bars based on real logged telemetry
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  const weeklyKmByDay = [0, 0, 0, 0, 0, 0, 0];
  weeklyKmByDay[todayIndex] = totalKmToday;

  const maxKm = Math.max(8, totalKmToday);
  const totalWeeklyKm = totalKmToday.toFixed(1);

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-lg font-bold text-white font-heading tracking-wide">
              WEEKLY CARDIO & HUAWEI TELEMETRY
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cardiovascular capacity, VO2 max endurance & fat oxidation
          </p>
        </div>

        <button
          onClick={onOpenCardioLogger}
          className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>LOG RUN</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">WEEK TOTAL</span>
          <span className="text-xl font-extrabold text-emerald-300 font-heading">
            {totalWeeklyKm} <span className="text-xs font-mono font-normal">km</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">TODAY'S DISTANCE</span>
          <span className="text-xl font-extrabold text-white font-heading">
            {totalKmToday.toFixed(2)} <span className="text-xs font-mono font-normal">km</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">BURNED TODAY</span>
          <span className="text-xl font-extrabold text-orange-400 font-heading flex items-center gap-1">
            <Flame className="w-4 h-4 inline" />
            {totalCaloriesToday} <span className="text-xs font-mono font-normal">kcal</span>
          </span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">AEROBIC CADENCE</span>
          <span className="text-xl font-extrabold text-cyan-300 font-heading">
            {dailyLog.cardio.length > 0 ? dailyLog.cardio[0].paceMinPerKm : '5:10 /km'}
          </span>
        </div>
      </div>

      {/* Weekly Visual Chart */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
          <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            WEEKLY DISTANCE CURVE (KM)
          </span>
          <span>Target: 25.0 km / week</span>
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2 pb-1 border-b border-slate-800">
          {daysOfWeek.map((day, idx) => {
            const km = weeklyKmByDay[idx] || 0;
            const barHeight = Math.max(8, Math.round((km / maxKm) * 100));
            const isToday = idx === todayIndex;

            return (
              <div key={day} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {km > 0 ? `${km}k` : '-'}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isToday
                      ? 'bg-gradient-to-t from-emerald-600 via-teal-400 to-cyan-300 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                      : km > 0
                      ? 'bg-emerald-800/60 hover:bg-emerald-600/80'
                      : 'bg-slate-800/30'
                  }`}
                  style={{ height: `${barHeight}%` }}
                />
                <span
                  className={`text-[11px] font-mono mt-2 ${
                    isToday ? 'text-emerald-400 font-bold' : 'text-slate-500'
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sessions logged today */}
      <div>
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
          SESSIONS RECORDED TODAY ({dailyLog.cardio.length})
        </h4>

        {dailyLog.cardio.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs font-mono text-slate-500">
            No cardio sessions recorded today. Log a run exported from Huawei Health.
          </div>
        ) : (
          <div className="space-y-2.5">
            {dailyLog.cardio.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {session.activityType}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {session.source}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {session.distanceKm} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {session.durationMinutes}m {session.durationSeconds}s
                      </span>
                      <span>Pace: {session.paceMinPerKm}</span>
                      {session.heartRateAvg && (
                        <span className="flex items-center gap-0.5 text-red-400">
                          <Heart className="w-3 h-3" />
                          {session.heartRateAvg} bpm
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-orange-400 font-bold block">
                      -{session.activeCaloriesBurned} kcal
                    </span>
                    <span className="text-cyan-400 text-[10px]">
                      +{session.xpAwarded} EXP
                    </span>
                  </div>

                  <button
                    onClick={() => deleteCardio(session.id)}
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
    </div>
  );
};

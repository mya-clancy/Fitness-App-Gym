import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import {
  Activity,
  Flame,
  X,
  Check,
  Zap,
  Timer,
  Compass,
  Heart,
  UploadCloud,
} from 'lucide-react';

interface CardioLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardioLoggerModal: React.FC<CardioLoggerModalProps> = ({ isOpen, onClose }) => {
  const { addCardio, selectedDate } = useHunter();

  const [activityType, setActivityType] = useState<
    'Running' | 'Treadmill' | 'Outdoor 5K' | 'Outdoor 10K' | 'HIIT Sprint' | 'Cycling' | 'Walking'
  >('Outdoor 5K');
  const [distanceKm, setDistanceKm] = useState<number>(5.0);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [activeCaloriesBurned, setActiveCaloriesBurned] = useState<number>(380);
  const [date, setDate] = useState<string>(selectedDate);
  const [source, setSource] = useState<'Huawei Health Import' | 'Manual Log' | 'Smartwatch Sync'>(
    'Huawei Health Import'
  );
  const [heartRateAvg, setHeartRateAvg] = useState<number>(155);

  if (!isOpen) return null;

  // Auto-calculated pace
  const totalMinutes = durationMinutes + durationSeconds / 60;
  const paceCalculated =
    distanceKm > 0
      ? (() => {
          const paceTotal = totalMinutes / distanceKm;
          const pMin = Math.floor(paceTotal);
          const pSec = Math.round((paceTotal - pMin) * 60);
          return `${pMin}:${pSec < 10 ? '0' : ''}${pSec} /km`;
        })()
      : '0:00 /km';

  const applyPreset = (presetType: string) => {
    if (presetType === '5k') {
      setActivityType('Outdoor 5K');
      setDistanceKm(5.0);
      setDurationMinutes(24);
      setDurationSeconds(30);
      setActiveCaloriesBurned(390);
    } else if (presetType === '10k') {
      setActivityType('Outdoor 10K');
      setDistanceKm(10.0);
      setDurationMinutes(51);
      setDurationSeconds(45);
      setActiveCaloriesBurned(790);
    } else if (presetType === 'hiit') {
      setActivityType('HIIT Sprint');
      setDistanceKm(3.2);
      setDurationMinutes(18);
      setDurationSeconds(0);
      setActiveCaloriesBurned(260);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCardio({
      date,
      activityType,
      distanceKm: Number(distanceKm) || 0,
      durationMinutes: Number(durationMinutes) || 0,
      durationSeconds: Number(durationSeconds) || 0,
      paceMinPerKm: paceCalculated,
      activeCaloriesBurned: Number(activeCaloriesBurned) || 0,
      source,
      heartRateAvg: Number(heartRateAvg) || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel-glow border-2 border-emerald-500/40 p-6 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.25)] my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-heading tracking-wide">
                HUAWEI HEALTH & CARDIO TRACKER
              </h3>
              <p className="text-xs text-emerald-400/80 font-mono">
                Aerobic Engine // Telemetry & Active Calorie Logging
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

        {/* Quick Huawei Health Preset Buttons */}
        <div className="mb-5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            QUICK PRESETS (POPULAR HUAWEI HEALTH LOGS):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('5k')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-xs font-mono text-center text-slate-200 transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400">5K RUN</div>
              <div className="text-[10px] text-slate-400">5.0km • ~24m • 390 kcal</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('10k')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-xs font-mono text-center text-slate-200 transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400">10K RUN</div>
              <div className="text-[10px] text-slate-400">10.0km • ~51m • 790 kcal</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('hiit')}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-xs font-mono text-center text-slate-200 transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400">HIIT SPRINTS</div>
              <div className="text-[10px] text-slate-400">3.2km • 18m • 260 kcal</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Outdoor 5K">Outdoor 5K</option>
                <option value="Outdoor 10K">Outdoor 10K</option>
                <option value="Running">Standard Outdoor Run</option>
                <option value="Treadmill">Treadmill Running</option>
                <option value="HIIT Sprint">HIIT / Sprints</option>
                <option value="Cycling">Outdoor / Indoor Cycling</option>
                <option value="Walking">Power Incline Walk</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Data Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Huawei Health Import">Huawei Health (Band/Watch)</option>
                <option value="Smartwatch Sync">Smartwatch Sync</option>
                <option value="Manual Log">Manual Hunter Log</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Distance (km)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Session Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 p-2 rounded-xl border border-emerald-500/30 flex flex-col justify-center">
              <span className="text-[10px] font-mono text-slate-400">CALCULATED PACE</span>
              <span className="text-sm font-bold font-mono text-emerald-300">
                {paceCalculated}
              </span>
            </div>
          </div>

          {/* Calories and Heart Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Active Calories Burned (kcal)
              </label>
              <input
                type="number"
                min="0"
                required
                value={activeCaloriesBurned}
                onChange={(e) => setActiveCaloriesBurned(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold text-orange-300 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 flex items-center gap-1 mb-1">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                Average Heart Rate (BPM)
              </label>
              <input
                type="number"
                min="50"
                max="220"
                value={heartRateAvg}
                onChange={(e) => setHeartRateAvg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Actions */}
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
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold px-6 py-2.5 rounded-xl text-xs font-heading shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>RECORD CARDIO QUEST (+EXP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

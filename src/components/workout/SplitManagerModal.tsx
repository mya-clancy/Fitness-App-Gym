import React, { useState } from 'react';
import { useHunter } from '../../context/HunterContext';
import { WorkoutSplit } from '../../types/hunter';
import {
  Layers,
  Edit3,
  Trash2,
  CheckCircle2,
  Plus,
  X,
  AlertTriangle,
  Dumbbell,
  Sparkles,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

interface SplitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSplit: (split: WorkoutSplit) => void;
  onCreateNewSplit: () => void;
}

export const SplitManagerModal: React.FC<SplitManagerModalProps> = ({
  isOpen,
  onClose,
  onEditSplit,
  onCreateNewSplit,
}) => {
  const { workoutSplits, activeSplitId, setActiveSplit, deleteWorkoutSplit } = useHunter();
  const [splitPendingDelete, setSplitPendingDelete] = useState<WorkoutSplit | null>(null);
  const [copiedSplitId, setCopiedSplitId] = useState<string | null>(null);

  const handleCopySplit = (split: WorkoutSplit) => {
    try {
      const cleanSplit = {
        splitId: split.splitId,
        name: split.name,
        description: split.description,
        days: split.days,
      };
      navigator.clipboard.writeText(JSON.stringify(cleanSplit, null, 2));
      setCopiedSplitId(split.splitId);
      setTimeout(() => setCopiedSplitId(null), 2500);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handleDeleteConfirm = async () => {
    if (!splitPendingDelete) return;
    await deleteWorkoutSplit(splitPendingDelete.splitId);
    setSplitPendingDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-5 sm:p-7 shadow-[0_0_40px_rgba(6,182,212,0.3)] my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-wide">
                SPLIT ROUTINES & CUSTOM PROGRAMS
              </h3>
              <p className="text-xs text-cyan-400/80 font-mono">
                Manage your training splits, clean up duplicates, edit or delete routines
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

        {/* Action bar: Create new split */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-slate-400">
            Total Configured Splits: <strong className="text-white">{workoutSplits.length}</strong>
          </span>

          <button
            onClick={() => {
              onClose();
              onCreateNewSplit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs font-heading shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>CREATE NEW SPLIT</span>
          </button>
        </div>

        {/* Split List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {workoutSplits.length === 0 ? (
            <div className="text-center p-8 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 font-mono text-xs">
              No workout splits found. Click Create New Split to configure your first routine.
            </div>
          ) : (
            workoutSplits.map((split) => {
              const isActive = split.splitId === activeSplitId;
              const daysCount = split.days ? split.days.length : 0;
              const totalExercises = split.days
                ? split.days.reduce((sum, d) => sum + (d.exercises ? d.exercises.length : 0), 0)
                : 0;
              const isEmpty = daysCount === 0;

              return (
                <div
                  key={split.splitId}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-heading">
                          {split.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            ACTIVE QUEST
                          </span>
                        )}
                        {isEmpty && (
                          <span className="text-[10px] font-mono uppercase bg-red-950/80 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            EMPTY SPLIT (0 DAYS)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 font-mono line-clamp-1">
                        {split.description || 'Custom Solo Leveling workout split.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                        <span className={isEmpty ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
                        </span>
                        <span>•</span>
                        <span>{totalExercises} {totalExercises === 1 ? 'Exercise' : 'Exercises'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {!isActive && (
                        <button
                          onClick={() => setActiveSplit(split.splitId)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors cursor-pointer"
                        >
                          ACTIVATE
                        </button>
                      )}

                      <button
                        onClick={() => handleCopySplit(split)}
                        title="Copy Split JSON to clipboard (for backups or adding directly to code)"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                      >
                        {copiedSplitId === split.splitId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400 font-bold">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>COPY JSON</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onEditSplit(split);
                        }}
                        title="Edit Split name, days, and exercises"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-mono transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>EDIT</span>
                      </button>

                      <button
                        onClick={() => setSplitPendingDelete(split)}
                        title="Delete this custom split"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-mono transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>DELETE</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {splitPendingDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl glass-panel border border-red-500/50 p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="text-base font-bold font-heading text-white">
                  DELETE SPLIT ROUTINE?
                </h4>
              </div>

              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Are you sure you want to delete <strong className="text-red-300 font-bold">"{splitPendingDelete.name}"</strong>? This will permanently remove this split routine and all associated workout days and exercises.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSplitPendingDelete(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-500 text-white font-extrabold px-5 py-2 rounded-xl text-xs font-heading transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  DELETE SPLIT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { WorkoutSplit } from '../../types/hunter';
import { parseAndValidateSplitJson } from '../../utils/splitFileUtils';
import {
  FileCode2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  Dumbbell,
} from 'lucide-react';

interface ImportSplitJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedSplit: WorkoutSplit) => void;
}

export const ImportSplitJsonModal: React.FC<ImportSplitJsonModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedSplit, setParsedSplit] = useState<WorkoutSplit | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processJsonContent(content);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const processJsonContent = (rawText: string) => {
    const result = parseAndValidateSplitJson(rawText);
    if (!result.valid || !result.split) {
      setErrorMsg(result.error || 'Invalid workout split JSON format.');
      setParsedSplit(null);
    } else {
      setErrorMsg('');
      setParsedSplit(result.split);
    }
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    if (text.trim()) {
      processJsonContent(text);
    } else {
      setParsedSplit(null);
      setErrorMsg('');
    }
  };

  const handleConfirmImport = () => {
    if (!parsedSplit) return;
    onImportSuccess(parsedSplit);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    setJsonText('');
    setFileName('');
    setParsedSplit(null);
    setErrorMsg('');
    onClose();
  };

  const sampleTemplate = JSON.stringify(
    {
      name: "Sung Jin Woo's Shadow 4-Day Split",
      description: "Elite progressive overload hypertrophy routine",
      days: [
        {
          dayName: "Day 1: Upper Body Shadow Dominance",
          targetFocus: "Chest, Lats & Shoulders",
          exercises: [
            {
              name: "Barbell Bench Press",
              targetMuscle: "Chest",
              sets: 4,
              reps: 8,
              weightKg: 85,
              xpValue: 350,
              progressiveOverloadTip: "Add 2.5kg when all sets hit 8 reps clean"
            }
          ]
        }
      ]
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl glass-panel-glow border-2 border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white font-heading tracking-wide">
                + ADD SPLIT (.JSON FILE)
              </h3>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                Import workout routines from JSON format files or code backups
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>SELECT JSON FILE</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PASTE RAW JSON</span>
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 bg-cyan-950/20 hover:bg-cyan-950/40 rounded-xl p-6 text-center cursor-pointer transition-all group"
            >
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white font-heading">
                {fileName ? fileName : 'CLICK TO BROWSE OR CHOOSE .JSON FILE'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Supports all exported Hunter routine JSON files (.json)
              </p>
            </div>
          </div>
        )}

        {/* Paste Mode */}
        {activeTab === 'paste' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400">
                Paste JSON Text:
              </label>
              <button
                type="button"
                onClick={() => {
                  setJsonText(sampleTemplate);
                  processJsonContent(sampleTemplate);
                }}
                className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                Insert Sample Template
              </button>
            </div>
            <textarea
              rows={7}
              value={jsonText}
              onChange={handlePasteChange}
              placeholder="Paste split JSON here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2 text-xs text-red-200 font-mono">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Parsed Preview Card */}
        {parsedSplit && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-cyan-950/50 to-slate-900 border border-cyan-500/40 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white font-heading">
                  VALID SPLIT DETECTED
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded font-bold">
                {parsedSplit.days.length} DAYS
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">
                {parsedSplit.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono line-clamp-2">
                {parsedSplit.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-slate-300">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500">Days: </span>
                <span className="text-cyan-400 font-bold">{parsedSplit.days.length}</span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-500">Total Exercises: </span>
                <span className="text-cyan-400 font-bold">
                  {parsedSplit.days.reduce((sum, d) => sum + (d.exercises ? d.exercises.length : 0), 0)}
                </span>
              </div>
            </div>

            {/* List preview of day titles */}
            <div className="pt-1 space-y-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Configured Routine Days:
              </p>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {parsedSplit.days.map((day, idx) => (
                  <div
                    key={day.id || idx}
                    className="flex items-center justify-between text-[11px] font-mono bg-slate-950/60 px-2 py-1 rounded border border-slate-800"
                  >
                    <span className="text-white truncate max-w-[280px]">
                      {day.dayName}
                    </span>
                    <span className="text-cyan-400 text-[10px]">
                      {day.exercises?.length || 0} exercises
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono cursor-pointer transition-colors"
          >
            CANCEL
          </button>

          <button
            type="button"
            disabled={!parsedSplit}
            onClick={handleConfirmImport}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-heading font-extrabold transition-all cursor-pointer ${
              parsedSplit
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONFIRM & IMPORT TO ROUTINES</span>
          </button>
        </div>
      </div>
    </div>
  );
};

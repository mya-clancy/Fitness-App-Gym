import React, { useState } from 'react';
import { HunterProvider } from './context/HunterContext';
import { CyberHeader } from './components/layout/CyberHeader';
import { NavigationTabs, TabType } from './components/layout/NavigationTabs';
import { LevelUpModal } from './components/layout/LevelUpModal';
import { PlayerLevelCard } from './components/dashboard/PlayerLevelCard';
import { MacroProgressRings } from './components/dashboard/MacroProgressRings';
import { DailyQuestStatus } from './components/dashboard/DailyQuestStatus';
import { FoodScannerModal } from './components/nutrition/FoodScannerModal';
import { DailyMealList } from './components/nutrition/DailyMealList';
import { CardioLoggerModal } from './components/cardio/CardioLoggerModal';
import { WeeklyCardioGraph } from './components/cardio/WeeklyCardioGraph';
import { SplitBuilder } from './components/workout/SplitBuilder';
import { ActiveWorkoutView } from './components/workout/ActiveWorkoutView';
import { HunterStatusView } from './components/profile/HunterStatusView';
import { FitnessAiChatModal } from './components/chat/FitnessAiChatModal';
import {
  Sparkles,
  Camera,
  Activity,
  Layers,
  ChevronRight,
  Shield,
  Utensils,
  Flame,
  MessageSquare,
} from 'lucide-react';

const MainDashboard: React.FC<{
  onOpenScanner: () => void;
  onOpenCardio: () => void;
  onOpenSplitBuilder: () => void;
  onOpenAiChat: () => void;
}> = ({ onOpenScanner, onOpenCardio, onOpenSplitBuilder, onOpenAiChat }) => {
  return (
    <div className="space-y-6">
      {/* 1. Player Level & XP Progression Card */}
      <PlayerLevelCard />

      {/* 2. Solo Leveling System Daily Quest */}
      <DailyQuestStatus onOpenScanner={onOpenScanner} onOpenCardio={onOpenCardio} />

      {/* 3. Daily Macro Progress Rings */}
      <MacroProgressRings onOpenFoodScanner={onOpenScanner} />

      {/* Quick Action Hunter Command Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenScanner}
          className="p-4 rounded-2xl glass-panel border border-cyan-500/30 hover:border-cyan-400 bg-gradient-to-br from-cyan-950/40 to-slate-900 flex items-center justify-between text-left group transition-all hover:scale-[1.01] cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">
                AI FOOD SCANNER
              </h4>
              <p className="text-[11px] text-cyan-400/80 font-mono">
                January AI Vision
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenCardio}
          className="p-4 rounded-2xl glass-panel border border-emerald-500/30 hover:border-emerald-400 bg-gradient-to-br from-emerald-950/40 to-slate-900 flex items-center justify-between text-left group transition-all hover:scale-[1.01] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">
                LOG CARDIO / RUN
              </h4>
              <p className="text-[11px] text-emerald-400/80 font-mono">
                Huawei Health Import
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onOpenSplitBuilder}
          className="p-4 rounded-2xl glass-panel border border-blue-500/30 hover:border-blue-400 bg-gradient-to-br from-blue-950/40 to-slate-900 flex items-center justify-between text-left group transition-all hover:scale-[1.01] cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">
                SPLIT ROUTINES
              </h4>
              <p className="text-[11px] text-blue-400/80 font-mono">
                Custom XP Workouts
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Dual Column: Active Workout Quest & Today's Meals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveWorkoutView onOpenSplitBuilder={onOpenSplitBuilder} />
        <DailyMealList onOpenScanner={onOpenScanner} />
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [cardioOpen, setCardioOpen] = useState<boolean>(false);
  const [splitBuilderOpen, setSplitBuilderOpen] = useState<boolean>(false);
  const [aiChatOpen, setAiChatOpen] = useState<boolean>(false);

  return (
    <HunterProvider>
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
        {/* Subtle Cyber Grid Background overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* System HUD Header */}
        <CyberHeader />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 z-10">
          <NavigationTabs activeTab={activeTab} onChangeTab={setActiveTab} />

          {activeTab === 'dashboard' && (
            <MainDashboard
              onOpenScanner={() => setScannerOpen(true)}
              onOpenCardio={() => setCardioOpen(true)}
              onOpenSplitBuilder={() => setSplitBuilderOpen(true)}
              onOpenAiChat={() => setAiChatOpen(true)}
            />
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              <MacroProgressRings onOpenFoodScanner={() => setScannerOpen(true)} />
              <DailyMealList onOpenScanner={() => setScannerOpen(true)} />
            </div>
          )}

          {activeTab === 'cardio' && (
            <WeeklyCardioGraph onOpenCardioLogger={() => setCardioOpen(true)} />
          )}

          {activeTab === 'workout' && (
            <div className="space-y-6">
              <ActiveWorkoutView onOpenSplitBuilder={() => setSplitBuilderOpen(true)} />
            </div>
          )}

          {activeTab === 'stats' && <HunterStatusView />}
        </main>

        {/* Floating AI Coach Trigger Button */}
        <button
          onClick={() => setAiChatOpen(true)}
          className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold px-3.5 py-2.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2 font-heading text-xs cursor-pointer border border-cyan-300 transition-all hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span className="hidden sm:inline">JANUARY AI COACH</span>
          <span className="sm:hidden font-mono font-bold">AI COACH</span>
        </button>

        {/* Global Modals */}
        <FoodScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
        <CardioLoggerModal isOpen={cardioOpen} onClose={() => setCardioOpen(false)} />
        <SplitBuilder isOpen={splitBuilderOpen} onClose={() => setSplitBuilderOpen(false)} />
        <FitnessAiChatModal isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
        <LevelUpModal />
      </div>
    </HunterProvider>
  );
}

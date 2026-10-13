import React from 'react';
import {
  Shield,
  Utensils,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

export type TabType = 'dashboard' | 'nutrition' | 'cardio' | 'workout' | 'stats';

interface NavigationTabsProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'HUNTER HUD',
      shortLabel: 'HUD',
      sublabel: 'Level & Macros',
      icon: Shield,
    },
    {
      id: 'nutrition' as TabType,
      label: 'AI SCANNER',
      shortLabel: 'Food AI',
      sublabel: 'January AI Scan',
      icon: Utensils,
    },
    {
      id: 'cardio' as TabType,
      label: 'CARDIO TRACKER',
      shortLabel: 'Cardio',
      sublabel: 'Huawei Telemetry',
      icon: Activity,
    },
    {
      id: 'workout' as TabType,
      label: 'WORKOUT SPLITS',
      shortLabel: 'Workouts',
      sublabel: 'Custom Routines & XP',
      icon: Layers,
    },
    {
      id: 'stats' as TabType,
      label: 'HUNTER STATUS',
      shortLabel: 'Status',
      sublabel: 'Ranks & Attributes',
      icon: Award,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Scrolling Navigation */}
      <nav className="hidden md:flex items-center gap-2 overflow-x-auto py-2 px-1 border-b border-slate-800/80 mb-6 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-300 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
                }`}
              />
              <div className="text-left">
                <span className="block leading-tight">{tab.label}</span>
                <span className="text-[10px] font-normal text-slate-500 block leading-tight">
                  {tab.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb Friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090e]/95 backdrop-blur-xl border-t border-cyan-500/25 px-2 py-1.5 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.8)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[58px] ${
                isActive
                  ? 'text-cyan-300 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] border border-cyan-400/40'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] font-mono mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-cyan-300' : 'text-slate-500'
                }`}
              >
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

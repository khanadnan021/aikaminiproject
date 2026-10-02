import React from 'react';
import {
  GraduationCap,
  Users,
  BrainCircuit,
  FileSpreadsheet,
  Info,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'roster' | 'analytics';
  setActiveTab: (tab: 'calculator' | 'roster' | 'analytics') => void;
  userRole: 'educator' | 'student';
  setUserRole: (role: 'educator' | 'student') => void;
  onOpenBatchModal: () => void;
  onOpenModelInfo: () => void;
  cohortCount: number;
  atRiskCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenBatchModal,
  onOpenModelInfo,
  cohortCount,
  atRiskCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  EduPredict AI
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <BrainCircuit className="h-3 w-3" /> ML & Risk Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Student Performance & Academic Risk Intelligence System
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Performance Predictor
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Cohort Roster
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-700 text-slate-300">
                {cohortCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Risk Analytics
              {atRiskCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
                  {atRiskCount} At Risk
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Role Switcher Pill */}
            <div className="hidden lg:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setUserRole('educator')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'educator'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Educator Mode
              </button>
              <button
                onClick={() => setUserRole('student')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'student'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Self-Check
              </button>
            </div>

            {/* Batch Upload */}
            <button
              onClick={onOpenBatchModal}
              title="Bulk Batch Predict"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              <span className="hidden sm:inline">Batch Import</span>
            </button>

            {/* Model Architecture Info */}
            <button
              onClick={onOpenModelInfo}
              title="How ML Model Works"
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs transition-all"
            >
              <Info className="h-4 w-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-1 px-2 font-medium ${activeTab === 'calculator' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Predictor
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`py-1 px-2 font-medium flex items-center gap-1 ${activeTab === 'roster' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Cohort ({cohortCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 font-medium flex items-center gap-1 ${activeTab === 'analytics' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            Analytics
            {atRiskCount > 0 && <span className="h-2 w-2 rounded-full bg-rose-500"></span>}
          </button>
        </div>
      </div>
    </header>
  );
};

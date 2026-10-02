import React, { useState, useMemo } from 'react';
import { StudentInput, PredictionResult } from '../types/index.ts';
import { runPredictionModel } from '../services/mlEngine.ts';
import { Sliders, Sparkles, ArrowUpRight, CheckCircle2, RotateCcw } from 'lucide-react';

interface WhatIfSimulatorProps {
  currentInput: StudentInput;
  basePrediction: PredictionResult;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  currentInput,
  basePrediction,
}) => {
  const [extraStudyHours, setExtraStudyHours] = useState<number>(4);
  const [extraAttendance, setExtraAttendance] = useState<number>(10);
  const [targetAssignmentRate, setTargetAssignmentRate] = useState<number>(
    Math.min(100, Math.max(90, currentInput.assignmentCompletionRate + 15))
  );

  // Compute live simulated scenario
  const simulatedResult = useMemo(() => {
    const simulatedInput: StudentInput = {
      ...currentInput,
      weeklyStudyHours: Math.min(98, currentInput.weeklyStudyHours + extraStudyHours),
      attendancePercentage: Math.min(100, currentInput.attendancePercentage + extraAttendance),
      assignmentCompletionRate: targetAssignmentRate,
      subjects: currentInput.subjects.map((sub) => ({
        ...sub,
        attendancePercentage: Math.min(100, sub.attendancePercentage + extraAttendance),
        internalScore: Math.min(100, sub.internalScore + Math.round(extraStudyHours * 0.8)),
      })),
    };

    return runPredictionModel(simulatedInput);
  }, [currentInput, extraStudyHours, extraAttendance, targetAssignmentRate]);

  const scoreDelta = Math.round((simulatedResult.predictedFinalScore - basePrediction.predictedFinalScore) * 10) / 10;
  const riskDelta = basePrediction.riskScore - simulatedResult.riskScore;

  const handleReset = () => {
    setExtraStudyHours(0);
    setExtraAttendance(0);
    setTargetAssignmentRate(currentInput.assignmentCompletionRate);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive "What-If" Sensitivity Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate academic intervention outcomes by adjusting attendance and study time.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 self-start sm:self-auto py-1 px-2 rounded-lg bg-slate-800/80 border border-slate-700/60"
        >
          <RotateCcw className="h-3 w-3" /> Reset Controls
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Slider 1: Extra Study Hours */}
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-semibold">Additional Study Time</span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              +{extraStudyHours} hrs/wk
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="18"
            step="1"
            value={extraStudyHours}
            onChange={(e) => setExtraStudyHours(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Current: {currentInput.weeklyStudyHours}h</span>
            <span className="text-indigo-300 font-medium">
              Simulated: {Math.min(98, currentInput.weeklyStudyHours + extraStudyHours)}h/wk
            </span>
          </div>
        </div>

        {/* Slider 2: Attendance Recovery */}
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-semibold">Attendance Improvement</span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              +{extraAttendance}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="2"
            value={extraAttendance}
            onChange={(e) => setExtraAttendance(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Current: {currentInput.attendancePercentage}%</span>
            <span className="text-cyan-300 font-medium">
              Simulated: {Math.min(100, currentInput.attendancePercentage + extraAttendance)}%
            </span>
          </div>
        </div>

        {/* Slider 3: Assignment Completion Target */}
        <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-300 font-semibold">Target Assignment Rate</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {targetAssignmentRate}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="2"
            value={targetAssignmentRate}
            onChange={(e) => setTargetAssignmentRate(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Current: {currentInput.assignmentCompletionRate}%</span>
            <span className="text-emerald-300 font-medium">Target: {targetAssignmentRate}%</span>
          </div>
        </div>
      </div>

      {/* Projection Comparison Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-800/60 to-cyan-950/40 border border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Projected Outcome with Simulated Effort
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-black text-white">
                {simulatedResult.predictedFinalScore}%
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Grade {simulatedResult.predictedGrade}
              </span>
              {scoreDelta > 0 && (
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="h-3.5 w-3.5" /> +{scoreDelta}% Projected Jump
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Risk Index drops from <span className="font-semibold text-rose-400">{basePrediction.riskScore}</span> to{' '}
              <span className="font-semibold text-emerald-400">{simulatedResult.riskScore}</span> (
              {simulatedResult.riskLevel} Risk tier)
            </p>
          </div>

          {/* Impact Quick Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-center">
              <p className="text-[10px] text-slate-400">Passing Probability</p>
              <p className="text-sm font-extrabold text-emerald-400">
                {simulatedResult.passingProbability}%
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-center">
              <p className="text-[10px] text-slate-400">Flagged Subjects</p>
              <p className="text-sm font-extrabold text-indigo-300">
                {simulatedResult.subjectsNeedingExtraHelpCount} Left
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

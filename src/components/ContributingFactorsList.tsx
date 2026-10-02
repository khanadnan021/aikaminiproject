import React from 'react';
import { ContributingFactor } from '../types/index.ts';
import { TrendingUp, TrendingDown, HelpCircle, Activity } from 'lucide-react';

interface ContributingFactorsListProps {
  factors: ContributingFactor[];
  passingProbability: number;
  distinctionProbability: number;
}

export const ContributingFactorsList: React.FC<ContributingFactorsListProps> = ({
  factors,
  passingProbability,
  distinctionProbability,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              ML Feature Attribution & Risk Drivers
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Explainable AI (XAI) breakdown of factors positively and negatively influencing the prediction.
          </p>
        </div>
      </div>

      {/* Graphical Probabilities & Outcome Distribution Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Graph 1: Passing Probability vs Benchmarks Column Graph */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider block">
                Passing Probability Graph
              </span>
              <span className="text-[11px] text-slate-400">
                Comparative benchmark & risk clearance chart
              </span>
            </div>
            <span
              className={`text-lg font-black px-3 py-1 rounded-xl border ${
                passingProbability >= 80
                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-sm'
                  : passingProbability >= 50
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/30 shadow-sm'
                  : 'text-rose-300 bg-rose-500/10 border-rose-500/30 shadow-sm'
              }`}
            >
              {passingProbability}%
            </span>
          </div>

          {/* Real Visual Graph with Y-Axis, Gridlines, and Vertical Columns */}
          <div className="my-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 relative">
            {/* 75% Target Reference Line across chart */}
            <div className="absolute left-8 right-3 top-[25%] border-b border-dashed border-cyan-500/40 pointer-events-none flex items-center justify-end">
              <span className="text-[9px] font-bold text-cyan-400 bg-slate-900/90 px-1 rounded -translate-y-1/2">
                75% Target
              </span>
            </div>
            {/* 35% Pass Bar Reference Line */}
            <div className="absolute left-8 right-3 top-[65%] border-b border-dashed border-rose-500/40 pointer-events-none flex items-center justify-end">
              <span className="text-[9px] font-bold text-rose-400 bg-slate-900/90 px-1 rounded -translate-y-1/2">
                35% Pass Bar
              </span>
            </div>

            <div className="flex h-36 gap-2">
              {/* Y-Axis scale */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 shrink-0 w-6 text-right pb-6">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Chart Grid & Columns */}
              <div className="flex-1 flex items-end justify-around gap-2 pt-2 border-l border-b border-slate-700 pb-1 relative">
                {/* Horizontal guide lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-600 w-full" />
                  <div className="border-b border-slate-600 w-full" />
                  <div className="border-b border-slate-600 w-full" />
                  <div className="border-b border-slate-600 w-full" />
                  <div className="border-b border-slate-600 w-full" />
                </div>

                {/* Column 1: Student Pass Odds */}
                <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                  <span className="text-[10px] font-extrabold text-white mb-1 drop-shadow">
                    {passingProbability}%
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-700 shadow-lg ${
                      passingProbability >= 80
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-emerald-500/20'
                        : passingProbability >= 50
                        ? 'bg-gradient-to-t from-amber-600 to-yellow-400 shadow-amber-500/20'
                        : 'bg-gradient-to-t from-rose-700 to-rose-500 shadow-rose-500/20'
                    }`}
                    style={{ height: `${Math.max(4, passingProbability)}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-300 mt-1 text-center whitespace-nowrap">
                    Pass Odds
                  </span>
                </div>

                {/* Column 2: 35% Pass Benchmark */}
                <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                  <span className="text-[10px] font-bold text-slate-400 mb-1">
                    35%
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-slate-700/80 border border-slate-600 transition-all duration-700"
                    style={{ height: '35%' }}
                  />
                  <span className="text-[10px] font-medium text-slate-400 mt-1 text-center whitespace-nowrap">
                    Pass Bar
                  </span>
                </div>

                {/* Column 3: 75% Target */}
                <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                  <span className="text-[10px] font-bold text-cyan-300 mb-1">
                    75%
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-900/80 to-cyan-600/60 border border-cyan-500/40 transition-all duration-700"
                    style={{ height: '75%' }}
                  />
                  <span className="text-[10px] font-medium text-slate-400 mt-1 text-center whitespace-nowrap">
                    Target
                  </span>
                </div>

                {/* Column 4: Deficit Risk Factor */}
                <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                  <span className="text-[10px] font-extrabold text-rose-400 mb-1 drop-shadow">
                    {(100 - passingProbability).toFixed(1)}%
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-rose-900 to-rose-600/80 border border-rose-500/40 transition-all duration-700 shadow-lg shadow-rose-900/20"
                    style={{ height: `${Math.max(4, 100 - passingProbability)}%` }}
                  />
                  <span className="text-[10px] font-bold text-rose-400 mt-1 text-center whitespace-nowrap">
                    Deficit Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Status Breakdown */}
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Model Classification:</span>
            <span
              className={`font-extrabold px-2 py-0.5 rounded-lg text-xs ${
                passingProbability >= 85
                  ? 'text-emerald-300 bg-emerald-500/10'
                  : passingProbability >= 50
                  ? 'text-amber-300 bg-amber-500/10'
                  : 'text-rose-300 bg-rose-500/10'
              }`}
            >
              {passingProbability >= 85
                ? 'High Clearance Margin'
                : passingProbability >= 50
                ? 'Moderate Clearance'
                : 'Deficit Risk Clearance'}
            </span>
          </div>
        </div>

        {/* Graph 2: Distinction (≥75%) & Tier Distribution Column Chart */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs md:text-sm font-bold text-white uppercase tracking-wider block">
                Distinction (≥75%) Odds Graph
              </span>
              <span className="text-[11px] text-slate-400">
                Academic honors tier likelihood distribution
              </span>
            </div>
            <span
              className={`text-lg font-black px-3 py-1 rounded-xl border ${
                distinctionProbability >= 60
                  ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30 shadow-sm'
                  : distinctionProbability >= 25
                  ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 shadow-sm'
                  : 'text-slate-300 bg-slate-700/30 border-slate-600 shadow-sm'
              }`}
            >
              {distinctionProbability}%
            </span>
          </div>

          {/* Real Visual Column Bar Chart for Academic Tiers */}
          <div className="my-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 relative">
            {/* 75% Distinction Threshold Line */}
            <div className="absolute left-8 right-3 top-[25%] border-b border-dashed border-cyan-500/40 pointer-events-none flex items-center justify-end">
              <span className="text-[9px] font-bold text-cyan-400 bg-slate-900/90 px-1 rounded -translate-y-1/2">
                Honors Bar
              </span>
            </div>

            <div className="flex h-36 gap-2">
              {/* Y-Axis scale */}
              <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 shrink-0 w-6 text-right pb-6">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Chart Grid & Columns */}
              {(() => {
                const failOdds = Math.max(0, 100 - passingProbability);
                const firstClassOdds = Math.min(
                  100 - distinctionProbability,
                  Math.max(0, Math.round((passingProbability - distinctionProbability) * 0.85))
                );
                const passClassOdds = Math.max(0, Math.min(100, Math.round(passingProbability * 0.15)));

                return (
                  <div className="flex-1 flex items-end justify-around gap-2 pt-2 border-l border-b border-slate-700 pb-1 relative">
                    {/* Horizontal guide lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-slate-600 w-full" />
                      <div className="border-b border-slate-600 w-full" />
                      <div className="border-b border-slate-600 w-full" />
                      <div className="border-b border-slate-600 w-full" />
                      <div className="border-b border-slate-600 w-full" />
                    </div>

                    {/* Column 1: Fail Risk (<35%) */}
                    <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                      <span className="text-[10px] font-bold text-rose-400 mb-1 drop-shadow">
                        {failOdds.toFixed(1)}%
                      </span>
                      <div
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-rose-800 to-rose-500 shadow-lg shadow-rose-600/20 transition-all duration-700"
                        style={{ height: `${Math.max(4, failOdds)}%` }}
                      />
                      <span className="text-[10px] font-medium text-slate-300 mt-1 text-center whitespace-nowrap">
                        &lt;35% Fail
                      </span>
                    </div>

                    {/* Column 2: Pass Class (35% - 59%) */}
                    <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                      <span className="text-[10px] font-bold text-emerald-400 mb-1 drop-shadow">
                        {passClassOdds}%
                      </span>
                      <div
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-emerald-800 to-teal-500 shadow-lg shadow-emerald-600/20 transition-all duration-700"
                        style={{ height: `${Math.max(4, passClassOdds)}%` }}
                      />
                      <span className="text-[10px] font-medium text-slate-300 mt-1 text-center whitespace-nowrap">
                        35-59% Pass
                      </span>
                    </div>

                    {/* Column 3: First Class (60% - 74%) */}
                    <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                      <span className="text-[10px] font-bold text-indigo-300 mb-1 drop-shadow">
                        {firstClassOdds}%
                      </span>
                      <div
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-800 to-indigo-500 shadow-lg shadow-indigo-600/20 transition-all duration-700"
                        style={{ height: `${Math.max(4, firstClassOdds)}%` }}
                      />
                      <span className="text-[10px] font-medium text-slate-300 mt-1 text-center whitespace-nowrap">
                        60-74% First
                      </span>
                    </div>

                    {/* Column 4: Distinction Honors (>=75%) */}
                    <div className="flex-1 h-full flex flex-col justify-end items-center z-10 group">
                      <span className="text-[10px] font-extrabold text-cyan-300 mb-1 drop-shadow">
                        {distinctionProbability}%
                      </span>
                      <div
                        className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-300 border-t-2 border-cyan-200 shadow-lg shadow-cyan-500/30 transition-all duration-700"
                        style={{ height: `${Math.max(4, distinctionProbability)}%` }}
                      />
                      <span className="text-[10px] font-bold text-cyan-300 mt-1 text-center whitespace-nowrap">
                        ≥75% Honors
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Graph Footer Note */}
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Honors Trajectory:</span>
            <span className="text-cyan-300 font-extrabold text-xs">
              {distinctionProbability >= 70
                ? 'High Honors Momentum'
                : distinctionProbability >= 40
                ? 'Attainable with Scaffolding'
                : 'Requires Remedial Uplift'}
            </span>
          </div>
        </div>
      </div>

      {/* Factor Cards */}
      <div className="space-y-2.5">
        {factors.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Standard metrics within normative boundaries. No major anomalous drivers detected.
          </p>
        ) : (
          factors.map((item, index) => {
            const isNegative = item.impact === 'negative';
            return (
              <div
                key={index}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  isNegative
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-emerald-950/20 border-emerald-500/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isNegative ? (
                      <TrendingDown className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingUp className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{item.factor}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div
                  className={`px-2 py-1 rounded font-bold text-xs shrink-0 ${
                    isNegative
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                      : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                  }`}
                >
                  {item.scoreDelta > 0 ? `+${item.scoreDelta}` : item.scoreDelta} pts
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

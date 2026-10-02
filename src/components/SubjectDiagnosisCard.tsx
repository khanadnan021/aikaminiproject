import React, { useState, useRef } from 'react';
import { SubjectDiagnosis } from '../types/index.ts';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns,
} from 'lucide-react';

interface SubjectDiagnosisCardProps {
  diagnoses: SubjectDiagnosis[];
  passingThreshold?: number;
  targetBenchmark?: number;
}

/**
 * Semi-circular Speedometer Gauge for Subject Performance Benchmark
 */
const SubjectSpeedometer: React.FC<{
  score: number;
  passingThreshold: number;
  targetBenchmark: number;
  isDeficit: boolean;
  grade: string;
}> = ({ score, passingThreshold, targetBenchmark, isDeficit, grade }) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Arc length of a semi-circle with radius 62: PI * 62 ≈ 194.78
  const totalLength = Math.PI * 62;

  const dangerPercent = Math.max(0, Math.min(100, passingThreshold));
  const warningPercent = Math.max(0, Math.min(100 - dangerPercent, targetBenchmark - passingThreshold));
  const safePercent = Math.max(0, 100 - targetBenchmark);

  const dangerLen = (dangerPercent / 100) * totalLength;
  const warningLen = (warningPercent / 100) * totalLength;
  const safeLen = (safePercent / 100) * totalLength;

  // Benchmark target tick rotation
  const targetAngle = (targetBenchmark / 100) * 180 - 90;
  const passAngle = (passingThreshold / 100) * 180 - 90;

  // Exact marker pin position directly on the curved arc (Radius 62, Center 100, 82)
  const angleRad = (clampedScore / 100) * Math.PI;
  const pinX = 100 - 62 * Math.cos(angleRad);
  const pinY = 82 - 62 * Math.sin(angleRad);

  return (
    <div className="flex flex-col items-center justify-center py-2 relative">
      <svg viewBox="0 0 200 118" className="w-52 h-32 overflow-visible">
        <defs>
          <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Outer background track */}
        <path
          d="M 38 82 A 62 62 0 0 1 162 82"
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Zone 1: Critical / Red (0 to passThreshold) */}
        <path
          d="M 38 82 A 62 62 0 0 1 162 82"
          fill="none"
          stroke="#ef4444"
          strokeWidth="10"
          strokeDasharray={`${dangerLen} ${totalLength}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Zone 2: Warning / Amber (passThreshold to targetBenchmark) */}
        <path
          d="M 38 82 A 62 62 0 0 1 162 82"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="10"
          strokeDasharray={`0 ${dangerLen} ${warningLen} ${totalLength}`}
          className="opacity-80"
        />

        {/* Zone 3: Safe / Green (targetBenchmark to 100) */}
        <path
          d="M 38 82 A 62 62 0 0 1 162 82"
          fill="none"
          stroke="#10b981"
          strokeWidth="10"
          strokeDasharray={`0 ${dangerLen + warningLen} ${safeLen} ${totalLength}`}
          strokeLinecap="round"
          className="opacity-90"
        />

        {/* Benchmark Indicators */}
        {/* Pass bar tick */}
        <g transform={`rotate(${passAngle} 100 82)`}>
          <line x1="100" y1="16" x2="100" y2="24" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* Target Benchmark tick */}
        <g transform={`rotate(${targetAngle} 100 82)`}>
          <line x1="100" y1="14" x2="100" y2="24" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Scale labels */}
        <text x="36" y="98" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">0%</text>
        <text x="164" y="98" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">100%</text>

        {/* Position marker beacon directly on the track (no radar stick) */}
        <circle
          cx={pinX}
          cy={pinY}
          r="7"
          fill="#ffffff"
          stroke={isDeficit ? '#f43f5e' : '#38bdf8'}
          strokeWidth="3"
          className="transition-all duration-700 ease-out"
        />
        <circle
          cx={pinX}
          cy={pinY}
          r="3"
          fill={isDeficit ? '#f43f5e' : '#38bdf8'}
          className="transition-all duration-700 ease-out"
        />

        {/* Speedometer Digital Readout */}
        <text x="100" y="70" fill="#ffffff" fontSize="18" fontWeight="800" textAnchor="middle">
          {score}%
        </text>
        <text
          x="100"
          y="84"
          fill={isDeficit ? '#f87171' : '#34d399'}
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
        >
          Grade {grade} • {isDeficit ? 'NEEDS HELP' : 'ON TRACK'}
        </text>
      </svg>

      {/* Target benchmark delta banner */}
      <div className="text-xs font-bold mt-0.5 text-center">
        {score >= targetBenchmark ? (
          <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            +{(score - targetBenchmark).toFixed(1)}% above target ({targetBenchmark}%)
          </span>
        ) : (
          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            -{(targetBenchmark - score).toFixed(1)}% deficit below target ({targetBenchmark}%)
          </span>
        )}
      </div>
    </div>
  );
};

export const SubjectDiagnosisCard: React.FC<SubjectDiagnosisCardProps> = ({
  diagnoses,
  passingThreshold = 35,
  targetBenchmark = 60,
}) => {
  const [filter, setFilter] = useState<'all' | 'needsHelp'>('all');
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'grid'>('horizontal');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredList =
    filter === 'needsHelp' ? diagnoses.filter((d) => d.needsExtraHelp) : diagnoses;

  const needingHelpCount = diagnoses.filter((d) => d.needsExtraHelp).length;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-white tracking-tight">
              Subject-Level Diagnosis & Remedial Needs
            </h3>
            {needingHelpCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {needingHelpCount} Subject{needingHelpCount > 1 ? 's' : ''} Need Extra Help
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                All Subjects On Track
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Speedometer dials showing course benchmarks side-by-side with targeted remedial hours.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setLayoutMode('horizontal')}
              title="Horizontal Row (Scrollable)"
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                layoutMode === 'horizontal'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Horizontal Row</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              title="Side-by-Side Grid"
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                layoutMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Grid View</span>
            </button>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({diagnoses.length})
            </button>
            <button
              onClick={() => setFilter('needsHelp')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filter === 'needsHelp'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="h-3 w-3" />
              Needs Help ({needingHelpCount})
            </button>
          </div>

          {/* Quick horizontal scroll buttons (when in horizontal mode) */}
          {layoutMode === 'horizontal' && filteredList.length > 2 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleScroll('left')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Scroll Right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Speedometer Legend Bar */}
      <div className="mt-3.5 px-3.5 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Speedometer Zones:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            <span>Critical Deficit (0 – {passingThreshold}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            <span>Passing Warning ({passingThreshold}% – {targetBenchmark}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>Target Mastery ({targetBenchmark}% – 100%)</span>
          </div>
        </div>
        <span className="text-[11px] text-cyan-300 font-medium">
          Blue marker: {targetBenchmark}% Target
        </span>
      </div>

      {/* Horizontal Subjects Container */}
      <div className="mt-4">
        {filteredList.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-200">
              No subjects currently flagged for extra help!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              All course scores maintain safe benchmarks above {targetBenchmark}%.
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className={
              layoutMode === 'horizontal'
                ? 'flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            }
          >
            {filteredList.map((subject) => {
              const isDeficit = subject.needsExtraHelp;
              return (
                <div
                  key={subject.subjectId}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    layoutMode === 'horizontal' ? 'w-[310px] shrink-0 snap-start' : ''
                  } ${
                    isDeficit
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60 shadow-lg shadow-rose-950/10'
                      : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600 shadow-lg'
                  }`}
                >
                  {/* Card Top: Subject Name & Status Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate" title={subject.subjectName}>
                          {subject.subjectName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Current Internal: <strong className="text-slate-200">{subject.currentInternal}%</strong>
                        </span>
                      </div>
                      {isDeficit ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Help Needed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          On Track
                        </span>
                      )}
                    </div>

                    {/* Speedometer Gauge in the center */}
                    <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 my-2">
                      <SubjectSpeedometer
                        score={subject.predictedFinalScore}
                        passingThreshold={passingThreshold}
                        targetBenchmark={targetBenchmark}
                        isDeficit={isDeficit}
                        grade={subject.predictedGrade}
                      />
                    </div>
                  </div>

                  {/* Card Bottom: Study Time & Interventions */}
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    {/* Suggested Study Allocation */}
                    <div className="flex items-center justify-between bg-slate-900/50 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-400" /> Target Study:
                      </span>
                      <span className="font-extrabold text-indigo-300">
                        {subject.suggestedWeeklyHours} hrs/wk
                      </span>
                    </div>

                    {/* Deficit Root Cause Diagnosis */}
                    <div className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200">Root Cause:</strong>{' '}
                        <span className="text-slate-300">{subject.primaryDeficitReason}</span>
                      </div>
                    </div>

                    {/* Prescribed Action */}
                    <div className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                      <ArrowRight className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-300">Action:</strong>{' '}
                        <span className="text-slate-300">{subject.recommendedIntervention}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { RiskLevel } from '../types/index.ts';
import { AlertTriangle, ShieldCheck, AlertCircle, AlertOctagon } from 'lucide-react';

interface RiskMeterGaugeProps {
  score: number; // 0 to 100 (Risk Score: higher is riskier)
  level: RiskLevel;
  predictedGrade: string;
  predictedFinalScore: number;
  predictedCGPA?: number;
  passingThreshold?: number;
  tierDisplayName?: string;
}

export const RiskMeterGauge: React.FC<RiskMeterGaugeProps> = ({
  score,
  level,
  predictedGrade,
  predictedFinalScore,
  predictedCGPA,
  passingThreshold = 35,
  tierDisplayName,
}) => {
  // SVG Semi-circle parameters
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const getRiskColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'Low':
        return {
          stroke: '#10b981', // emerald-500
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          label: 'Low Risk',
          subtext: 'Student is academically secure and on track for mastery.',
          icon: ShieldCheck,
        };
      case 'Moderate':
        return {
          stroke: '#f59e0b', // amber-500
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          label: 'Moderate Risk',
          subtext: 'Inconsistent performance. Early guidance recommended.',
          icon: AlertCircle,
        };
      case 'High':
        return {
          stroke: '#f97316', // orange-500
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          label: 'High Academic Risk',
          subtext: 'Critical bottlenecks detected. Targeted remedial needed.',
          icon: AlertTriangle,
        };
      case 'Critical':
        return {
          stroke: '#f43f5e', // rose-500
          text: 'text-rose-400',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          label: 'Critical Risk Alert',
          subtext: 'High probability of course failure. Immediate intervention!',
          icon: AlertOctagon,
        };
    }
  };

  const config = getRiskColor(level);
  const Icon = config.icon;

  // Grade color
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (grade.startsWith('B')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (grade.startsWith('D')) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: config.stroke }}
      />

      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Machine Learning Risk Gauge
          </h3>
          <p className="text-xs text-slate-400">Multivariate Academic Fragility Index</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        {/* SVG Semi-Circle Gauge */}
        <div className="relative w-48 h-28 flex items-end justify-center">
          <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#334155"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Foreground Colored Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={config.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Score Reading */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {score}
              <span className="text-xs font-normal text-slate-400">/100</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Risk Index
            </span>
          </div>
        </div>

        {/* Interpretation text */}
        <p className="text-xs text-center text-slate-300 mt-2 max-w-xs">{config.subtext}</p>
      </div>

      {/* Grade and Predicted Score Bar */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-medium">Predicted Performance</p>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-xl font-bold text-white">{predictedFinalScore}%</span>
            {predictedCGPA !== undefined && (
              <span className="text-xs font-extrabold text-cyan-400 ml-1">
                ({predictedCGPA.toFixed(1)} CGPA)
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Passing Bar: <span className="text-white font-medium">{passingThreshold}%</span>
          </p>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 flex flex-col items-center justify-center">
          <p className="text-[11px] text-slate-400 font-medium">Projected Outcome</p>
          <span
            className={`mt-0.5 px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${getGradeColor(
              predictedGrade
            )} max-w-full truncate`}
            title={predictedGrade}
          >
            {predictedGrade}
          </span>
          {tierDisplayName && (
            <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">
              {tierDisplayName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

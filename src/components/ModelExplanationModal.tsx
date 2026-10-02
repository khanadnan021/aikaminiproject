import React from 'react';
import { X, BrainCircuit, Activity, Sparkles, Target, Layers } from 'lucide-react';

interface ModelExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelExplanationModal: React.FC<ModelExplanationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Machine Learning & Academic Risk Model Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Educational Data Mining (EDM) predictive pipeline & explainable feature attribution.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Feature Matrix */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
              <Layers className="h-4 w-4 text-indigo-400" /> Multivariable Predictor Weighting
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block">Historical Scores Trend (35%)</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Recency-weighted trajectory modeling momentum across prior term examinations.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block">Continuous Internal Assessments (30%)</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Subject-by-subject internals, lab practicals, and syllabus difficulty coefficients.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block">Attendance Threshold Penalty (15%)</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Non-linear penalty triggered below the 75% institutional statutory attendance bar.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <span className="font-bold text-white block">Weekly Study Hours Log (12%)</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Logarithmic saturation curve modeling cognitive reinforcement vs diminishing returns.
                </p>
              </div>
            </div>
          </div>

          {/* Risk Tiers */}
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mb-2">
              <Target className="h-4 w-4 text-amber-400" /> Academic Risk Tier Classification
            </h4>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <span className="font-bold text-emerald-400">Low Risk (0 - 24 Risk Index)</span>
                <span className="text-slate-300">Passing odds &gt; 92%, high distinction potential</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <span className="font-bold text-amber-400">Moderate Risk (25 - 49 Risk Index)</span>
                <span className="text-slate-300">Vulnerable in 1-2 subjects; needs proactive review</span>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
                <span className="font-bold text-orange-400">High Risk (50 - 74 Risk Index)</span>
                <span className="text-slate-300">Attendance or test deficit; remedial tutoring recommended</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
                <span className="font-bold text-rose-400">Critical Risk (75 - 100 Risk Index)</span>
                <span className="text-slate-300">High failure hazard; immediate parent-counselor intervention</span>
              </div>
            </div>
          </div>

          {/* AI Pedagogical Diagnostics */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
            <h4 className="text-sm font-bold text-purple-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-4 w-4 text-purple-400" /> Gemini AI Integration (Server-Side)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              When triggered, the backend sends the student's multivariable telemetry and weak subject diagnoses
              to Google's <code className="text-purple-300 font-mono">gemini-3.8-flash</code> model. The AI synthesizes a
              structured 4-week remedial roadmap, pedagogical profile, teacher intervention guide, and tailored learning materials.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

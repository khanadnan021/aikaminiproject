import React from 'react';
import { AIDiagnosticReport, StudentInput, PredictionResult } from '../types/index.ts';
import {
  X,
  Sparkles,
  Calendar,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Printer,
  CheckCircle2,
} from 'lucide-react';

interface AiDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AIDiagnosticReport | null;
  isLoading: boolean;
  student: StudentInput;
  prediction: PredictionResult;
  isFallback?: boolean;
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  student,
  prediction,
  isFallback,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 print:max-h-none print:border-none print:shadow-none print:text-black">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AI Pedagogical Diagnostic & Roadmap</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.8 Flash
                </span>
                {isFallback && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Rule Engine Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Personalized remedial intervention plan for <span className="text-white font-medium">{student.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
              <p className="text-base font-semibold text-white">Analyzing Student Cognitive Profile...</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Correlating attendance trends, subject internal tests, and study rhythms through Gemini AI.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                      Executive Diagnostic Summary
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-200">{report.executiveSummary}</p>
                  </div>
                </div>
              </div>

              {/* Student Overview Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Predicted Score</span>
                  <p className="text-lg font-black text-white">{prediction.predictedFinalScore}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Risk Level</span>
                  <p
                    className={`text-lg font-bold ${
                      prediction.riskLevel === 'Low'
                        ? 'text-emerald-400'
                        : prediction.riskLevel === 'Moderate'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {prediction.riskLevel}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Attendance</span>
                  <p className="text-lg font-black text-white">{student.attendancePercentage}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Weekly Study</span>
                  <p className="text-lg font-black text-indigo-300">{student.weeklyStudyHours} hrs</p>
                </div>
              </div>

              {/* Pedagogical Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <GraduationCap className="h-4 w-4 text-indigo-400" /> Pedagogical Assessment
                </h4>
                <p className="text-xs text-slate-300 bg-slate-800/40 p-4 rounded-xl border border-slate-800 leading-relaxed">
                  {report.pedagogicalProfile}
                </p>
              </div>

              {/* Key Vulnerabilities */}
              <div>
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-4 w-4 text-rose-400" /> Primary Academic Vulnerabilities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.keyVulnerabilities.map((vuln, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200"
                    >
                      <span className="font-bold text-rose-300 block mb-0.5">Factor #{i + 1}</span>
                      {vuln}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4-Week Remedial Timetable */}
              <div>
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Calendar className="h-4 w-4 text-indigo-400" /> 4-Week Structured Action Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.immediateActionPlan.map((weekItem, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-700/60">
                        <span className="text-xs font-black text-indigo-300">{weekItem.week}</span>
                        <span className="text-[11px] font-semibold text-white px-2 py-0.5 rounded bg-slate-700">
                          {weekItem.focusSubject}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {weekItem.allocatedHours} hrs target
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {weekItem.actionItems.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Guidance & Student Motivational Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <GraduationCap className="h-4 w-4 text-indigo-400" /> Teacher & Advisor Guidance
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {report.teacherRecommendation}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <HeartHandshake className="h-4 w-4 text-teal-400" /> Student Motivational Coaching
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{report.studentMotivationAdvice}"
                  </p>
                </div>
              </div>

              {/* Recommended Resources */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" /> Recommended Learning Materials & Scaffolding
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {report.recommendedResources.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1 inline-block">
                        {res.type}
                      </span>
                      <p className="font-semibold text-white mt-1">{res.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Subject: {res.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p>No report loaded. Click "Generate AI Pedagogical Diagnostic" to run.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-4 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

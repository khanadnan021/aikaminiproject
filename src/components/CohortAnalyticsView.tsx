import React from 'react';
import { CohortAnalytics, SavedStudentRecord } from '../types/index.ts';
import {
  Users,
  Clock,
  GraduationCap,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

interface CohortAnalyticsViewProps {
  analytics: CohortAnalytics | null;
  students: SavedStudentRecord[];
  onSelectStudent: (student: SavedStudentRecord) => void;
  onOpenAiDiagnostic: (student: SavedStudentRecord) => void;
}

export const CohortAnalyticsView: React.FC<CohortAnalyticsViewProps> = ({
  analytics,
  students,
  onSelectStudent,
  onOpenAiDiagnostic,
}) => {
  if (!analytics || analytics.totalStudents === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Users className="h-12 w-12 mx-auto mb-3 opacity-40 text-slate-500" />
        <h3 className="text-base font-bold text-white">No Cohort Data Available</h3>
        <p className="text-xs text-slate-400 mt-1">
          Add students or upload a batch file to generate cohort risk intelligence.
        </p>
      </div>
    );
  }

  const { totalStudents, averageAttendance, averageStudyHours, averagePredictedScore, riskDistribution } =
    analytics;

  const totalRisky = riskDistribution.high + riskDistribution.critical;
  const riskPercentage = Math.round((totalRisky / totalStudents) * 100);

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </p>
            <h3 className="text-2xl font-black text-white mt-1">{totalStudents}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Active Class Cohort</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cohort Attendance
            </p>
            <h3
              className={`text-2xl font-black mt-1 ${
                averageAttendance >= 75 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {averageAttendance}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {averageAttendance >= 75 ? 'Above 75% Statutory Bar' : 'Below 75% Requirement!'}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Average Weekly Study */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg. Study Hours
            </p>
            <h3 className="text-2xl font-black text-indigo-300 mt-1">
              {averageStudyHours} <span className="text-sm font-normal">hrs/wk</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Recommended: 12-16 hrs</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* High Risk Proportion */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              At-Risk Students
            </p>
            <h3
              className={`text-2xl font-black mt-1 ${
                totalRisky > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {totalRisky} <span className="text-xs font-normal text-slate-400">({riskPercentage}%)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">High & Critical Categories</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Cohort Risk Tier Distribution Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          Cohort Academic Fragility & Risk Distribution
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Breakdown of students across the 4 predictive ML risk classifications.
        </p>

        {/* Stacked Percentage Bar */}
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
          <div
            style={{ width: `${(riskDistribution.low / totalStudents) * 100}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Low Risk: ${riskDistribution.low} students`}
          />
          <div
            style={{ width: `${(riskDistribution.moderate / totalStudents) * 100}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Moderate Risk: ${riskDistribution.moderate} students`}
          />
          <div
            style={{ width: `${(riskDistribution.high / totalStudents) * 100}%` }}
            className="bg-orange-500 h-full transition-all"
            title={`High Risk: ${riskDistribution.high} students`}
          />
          <div
            style={{ width: `${(riskDistribution.critical / totalStudents) * 100}%` }}
            className="bg-rose-500 h-full transition-all"
            title={`Critical Risk: ${riskDistribution.critical} students`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Low Risk (Safe)
            </div>
            <p className="text-lg font-black text-white mt-1">
              {riskDistribution.low}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.round((riskDistribution.low / totalStudents) * 100)}%)
              </span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Moderate Risk
            </div>
            <p className="text-lg font-black text-white mt-1">
              {riskDistribution.moderate}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.round((riskDistribution.moderate / totalStudents) * 100)}%)
              </span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-1.5 font-bold text-orange-400">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              High Risk
            </div>
            <p className="text-lg font-black text-white mt-1">
              {riskDistribution.high}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.round((riskDistribution.high / totalStudents) * 100)}%)
              </span>
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Critical Danger
            </div>
            <p className="text-lg font-black text-white mt-1">
              {riskDistribution.critical}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({Math.round((riskDistribution.critical / totalStudents) * 100)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Subject Difficulty Heatmap & Priority Intervention Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Difficulty Heatmap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Subject Vulnerability Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Identifies courses with the highest failure rates and student deficits.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.subjectDifficultyHeatmap.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No subject metrics calculated yet.</p>
            ) : (
              analytics.subjectDifficultyHeatmap.map((item, idx) => {
                const isHighDeficit = item.riskRate > 35;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60"
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-white">{item.subjectName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Avg: {item.averageScore}%</span>
                        {item.studentsNeedingHelp > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              isHighDeficit
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {item.studentsNeedingHelp} need help ({item.riskRate}%)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Heatmap Bar */}
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isHighDeficit
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, item.riskRate))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Priority Intervention Alert List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
                <AlertTriangle className="h-4 w-4" /> Priority Intervention Watchlist
              </h3>
              <p className="text-xs text-slate-400">
                Students flagged with High or Critical academic risk requiring teacher intervention.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {analytics.highRiskStudents.length === 0 ? (
              <div className="py-8 text-center text-emerald-400 text-xs">
                <ShieldCheck className="h-8 w-8 mx-auto mb-1 opacity-70" />
                No students currently in High or Critical danger.
              </div>
            ) : (
              analytics.highRiskStudents.map((stdItem) => {
                const fullStudent = students.find((s) => s.id === stdItem.id);
                return (
                  <div
                    key={stdItem.id}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{stdItem.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {stdItem.riskLevel} (Score: {stdItem.riskScore}/100)
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Deficits in: {stdItem.criticalSubjects.join(', ') || 'General Attendance & Tests'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {fullStudent && (
                        <>
                          <button
                            onClick={() => onSelectStudent(fullStudent)}
                            className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                            title="Inspect in Predictor"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenAiDiagnostic(fullStudent)}
                            className="p-1.5 text-purple-300 hover:text-purple-200 rounded-lg bg-purple-950/50 border border-purple-500/30 hover:bg-purple-900/50 transition-colors"
                            title="Generate AI Remedial Roadmap"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

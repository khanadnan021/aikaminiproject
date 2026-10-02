import React, { useState } from 'react';
import { SavedStudentRecord, RiskLevel } from '../types/index.ts';
import {
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  Trash2,
  Eye,
  Download,
  ShieldCheck,
  AlertOctagon,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface CohortRosterProps {
  students: SavedStudentRecord[];
  onSelectStudent: (student: SavedStudentRecord) => void;
  onDeleteStudent: (id: string) => void;
  onOpenAiDiagnostic: (student: SavedStudentRecord) => void;
  onNewStudent: () => void;
}

export const CohortRoster: React.FC<CohortRosterProps> = ({
  students,
  onSelectStudent,
  onDeleteStudent,
  onOpenAiDiagnostic,
  onNewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase());

    const predRisk = student.lastPrediction?.riskLevel || 'Low';
    const matchesRisk = riskFilter === 'ALL' || predRisk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (level?: RiskLevel) => {
    switch (level) {
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertOctagon className="h-3 w-3" /> Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> High Risk
          </span>
        );
      case 'Moderate':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Moderate
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> On Track
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Student ID',
      'Grade Level',
      'Attendance %',
      'Weekly Study Hours',
      'Assignment %',
      'Predicted Score %',
      'Projected Grade',
      'Risk Score',
      'Risk Level',
      'Flagged Weak Subjects',
    ];

    const rows = students.map((s) => {
      const pred = s.lastPrediction;
      const weakSubs = pred
        ? pred.subjectDiagnoses
            .filter((d) => d.needsExtraHelp)
            .map((d) => d.subjectName)
            .join('; ')
        : '';
      return [
        `"${s.name}"`,
        `"${s.studentId}"`,
        `"${s.gradeLevel}"`,
        s.attendancePercentage,
        s.weeklyStudyHours,
        s.assignmentCompletionRate,
        pred ? pred.predictedFinalScore : 'N/A',
        pred ? pred.predictedGrade : 'N/A',
        pred ? pred.riskScore : 'N/A',
        pred ? pred.riskLevel : 'N/A',
        `"${weakSubs}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edupredict_cohort_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Class Cohort Roster & Academic Early Warning System
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time student trajectories, sort by risk vulnerability, and schedule interventions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNewStudent}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Assess New Student
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, ID or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs overflow-x-auto">
          <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center gap-1">
            <Filter className="h-3 w-3" /> Risk:
          </span>
          {(['ALL', 'Critical', 'High', 'Moderate', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setRiskFilter(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                riskFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-3 px-3.5">Student</th>
              <th className="py-3 px-3 text-center">Attendance</th>
              <th className="py-3 px-3 text-center">Study Hrs</th>
              <th className="py-3 px-3 text-center">Predicted Score</th>
              <th className="py-3 px-3 text-center">Risk Level</th>
              <th className="py-3 px-3">Extra Help Needed In</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No students found matching current filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((std) => {
                const pred = std.lastPrediction;
                const weakSubjects = pred
                  ? pred.subjectDiagnoses.filter((d) => d.needsExtraHelp)
                  : [];

                return (
                  <tr key={std.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Student Name & ID */}
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white text-sm">{std.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">{std.studentId}</span>
                        <span>•</span>
                        <span>{std.gradeLevel}</span>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-extrabold ${
                          std.attendancePercentage >= 85
                            ? 'text-emerald-400'
                            : std.attendancePercentage >= 75
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {std.attendancePercentage}%
                      </span>
                    </td>

                    {/* Study Hours */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-semibold text-indigo-300">
                        {std.weeklyStudyHours} h/wk
                      </span>
                    </td>

                    {/* Predicted Score & Grade */}
                    <td className="py-3 px-3 text-center">
                      {pred ? (
                        <div>
                          <span className="font-extrabold text-white text-sm">
                            {pred.predictedFinalScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Grade {pred.predictedGrade}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Uncalculated</span>
                      )}
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3 px-3 text-center">
                      {getRiskBadge(pred?.riskLevel)}
                    </td>

                    {/* Extra Help Needed In */}
                    <td className="py-3 px-3 max-w-[200px]">
                      {weakSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {weakSubjects.map((w) => (
                            <span
                              key={w.subjectId}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              title={w.primaryDeficitReason}
                            >
                              {w.subjectName} ({w.predictedFinalScore}%)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-medium">
                          No weak subjects
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onSelectStudent(std)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Inspect in Predictor & Simulate"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onOpenAiDiagnostic(std)}
                        className="p-1.5 text-purple-400 hover:text-purple-300 rounded-lg hover:bg-purple-950/40 transition-colors"
                        title="Generate AI Roadmap"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(std.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

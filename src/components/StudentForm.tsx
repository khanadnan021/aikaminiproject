import React, { useState, useEffect } from 'react';
import { StudentInput, SubjectRecord, SubjectDifficulty, AcademicTier, AcademicSystemConfig } from '../types/index.ts';
import { DEFAULT_ACADEMIC_TIERS, TIER_DEFAULT_SUBJECTS, calculateNormalizedSubjectScore } from '../data/academicTiers.ts';
import {
  User,
  Clock,
  CheckSquare,
  Plus,
  Trash2,
  Bookmark,
  RotateCcw,
  Sparkles,
  BookOpen,
  Save,
  Settings,
  School,
  Building2,
  CheckCircle2,
  Edit3,
  Sliders,
  X,
  Check,
} from 'lucide-react';

interface StudentFormProps {
  input: StudentInput;
  setInput: React.Dispatch<React.SetStateAction<StudentInput>>;
  onSaveToCohort: () => void;
  isSaving: boolean;
  onOpenSystemConfig: () => void;
  onApplyTierPreset: (tier: AcademicTier) => void;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  'Advanced Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management',
  'General Science',
  'Social Studies',
  'English Literature',
  'Economics & Finance',
  'History & Civics',
  'Hindi / Language',
];

export const StudentForm: React.FC<StudentFormProps> = ({
  input,
  setInput,
  onSaveToCohort,
  isSaving,
  onOpenSystemConfig,
  onApplyTierPreset,
}) => {
  const activeConfig: AcademicSystemConfig = input.systemConfig || DEFAULT_ACADEMIC_TIERS.high_school;

  const [isEditingScheme, setIsEditingScheme] = useState(false);
  const [editedTierName, setEditedTierName] = useState(activeConfig.tierDisplayName);
  const [editedPassingThreshold, setEditedPassingThreshold] = useState(activeConfig.passingThresholdPercentage);
  const [editedMinAttendance, setEditedMinAttendance] = useState(activeConfig.minAttendanceRequired);
  const [editedGradingScale, setEditedGradingScale] = useState(activeConfig.gradingScale);

  useEffect(() => {
    setEditedTierName(activeConfig.tierDisplayName);
    setEditedPassingThreshold(activeConfig.passingThresholdPercentage);
    setEditedMinAttendance(activeConfig.minAttendanceRequired);
    setEditedGradingScale(activeConfig.gradingScale);
  }, [activeConfig]);

  const handleSaveInlineScheme = () => {
    const updated: AcademicSystemConfig = {
      ...activeConfig,
      tierDisplayName: editedTierName.trim() || activeConfig.tierDisplayName,
      passingThresholdPercentage: editedPassingThreshold,
      minAttendanceRequired: editedMinAttendance,
      gradingScale: editedGradingScale,
      tier: 'custom',
    };
    setInput((prev) => ({
      ...prev,
      systemConfig: updated,
      gradeLevel: updated.tierDisplayName,
    }));
    setIsEditingScheme(false);
  };

  const handleResetBlank = () => {
    const defaultSubs = TIER_DEFAULT_SUBJECTS[activeConfig.tier] || TIER_DEFAULT_SUBJECTS.high_school;
    const blank: StudentInput = {
      name: '',
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      gradeLevel: activeConfig.tierDisplayName,
      systemConfig: activeConfig,
      attendancePercentage: 75,
      weeklyStudyHours: 10,
      pastScores: [65, 70],
      assignmentCompletionRate: 80,
      sleepHours: 7,
      participationScore: 70,
      subjects: defaultSubs.map((s, i) => ({
        ...s,
        id: `sub-${Date.now()}-${i}`,
      })),
    };
    setInput(blank);
  };

  const handleAddSubject = () => {
    const newComponentScores: Record<string, number> = {};
    activeConfig.components.forEach((c) => {
      newComponentScores[c.id] = Math.round(c.maxMarks * 0.7);
    });

    const newSub: SubjectRecord = {
      id: `sub-${Date.now()}-${Math.random()}`,
      name: 'New Subject',
      componentScores: newComponentScores,
      internalScore: 70,
      attendancePercentage: input.attendancePercentage,
      difficulty: 'Medium',
      practicalScore: 70,
      creditHours: activeConfig.useCreditSystem ? 3 : 1,
    };

    setInput((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
  };

  const handleRemoveSubject = (id: string) => {
    if (input.subjects.length <= 1) return;
    setInput((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
  };

  const handleSubjectChange = (
    id: string,
    field: keyof SubjectRecord,
    value: any
  ) => {
    setInput((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id !== id) return sub;
        const updated = { ...sub, [field]: value };
        // Recalculate normalized score if components exist
        updated.internalScore = calculateNormalizedSubjectScore(updated, activeConfig);
        return updated;
      }),
    }));
  };

  const handleComponentScoreChange = (
    subjectId: string,
    componentId: string,
    rawScore: number
  ) => {
    setInput((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub) => {
        if (sub.id !== subjectId) return sub;
        const compScores = { ...(sub.componentScores || {}), [componentId]: rawScore };
        const updated = { ...sub, componentScores: compScores };
        updated.internalScore = calculateNormalizedSubjectScore(updated, activeConfig);
        return updated;
      }),
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Dynamic Academic System & Tier Selector Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-xl space-y-4">
        {/* Main Header & Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
              <School className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-wider">
                  Evaluation Scheme
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Active Model
                </span>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                {activeConfig.tierDisplayName}
              </h3>
            </div>
          </div>

          {/* Action buttons (Presets + Edit button) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Quick Edit Toggle Button */}
            <button
              type="button"
              onClick={() => setIsEditingScheme((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isEditingScheme
                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-400/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span>{isEditingScheme ? 'Close Editor' : 'Edit Scheme'}</span>
            </button>

            {/* Presets */}
            <button
              type="button"
              onClick={() => onApplyTierPreset('middle_school')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeConfig.tier === 'middle_school'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              🏫 1st - 9th Std
            </button>
            <button
              type="button"
              onClick={() => onApplyTierPreset('high_school')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeConfig.tier === 'high_school'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              🎓 10th/12th Std
            </button>
            <button
              type="button"
              onClick={() => onApplyTierPreset('university')}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeConfig.tier === 'university'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
            >
              🏛️ Degree College
            </button>
            <button
              type="button"
              onClick={onOpenSystemConfig}
              className="px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5"
              title="Open full academic customizer"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Customize...</span>
            </button>
          </div>
        </div>

        {/* Current Key Evaluation Metrics Pill Bar */}
        {!isEditingScheme && (
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-700/60 text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">Evaluation Criteria:</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200">
              <span className="text-slate-400">Passing Mark:</span>
              <strong className="text-amber-300 font-extrabold text-sm sm:text-base">{activeConfig.passingThresholdPercentage}%</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200">
              <span className="text-slate-400">Attendance Bar:</span>
              <strong className="text-emerald-300 font-extrabold text-sm sm:text-base">{activeConfig.minAttendanceRequired}%</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200">
              <span className="text-slate-400">Grading Scale:</span>
              <strong className="text-cyan-300 font-extrabold text-sm sm:text-base">{activeConfig.gradingScale.toUpperCase()}</strong>
            </div>
            {activeConfig.useCreditSystem && (
              <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs sm:text-sm">
                Credit-Weighted System
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsEditingScheme(true)}
              className="text-xs sm:text-sm text-indigo-400 hover:text-indigo-300 font-bold ml-auto flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-700/40 transition-colors"
            >
              <Edit3 className="h-4 w-4" /> Edit Scheme Values
            </button>
          </div>
        )}

        {/* INLINE SCHEME EDITOR */}
        {isEditingScheme && (
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-slate-900/95 border-2 border-indigo-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">
                    Edit Evaluation Scheme Parameters
                  </h4>
                  <p className="text-xs text-slate-400">
                    Modify passing mark benchmark, attendance threshold, and display name directly.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingScheme(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs md:text-sm">
              {/* Scheme Name */}
              <div className="lg:col-span-2">
                <label className="block font-bold text-slate-200 mb-1.5">
                  Scheme Display Name
                </label>
                <input
                  type="text"
                  value={editedTierName}
                  onChange={(e) => setEditedTierName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base text-white font-medium focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. High School (10th / 12th Standard)"
                />
              </div>

              {/* Passing Threshold */}
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Passing Mark (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="20"
                    max="75"
                    value={editedPassingThreshold}
                    onChange={(e) => setEditedPassingThreshold(parseInt(e.target.value) || 33)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base text-white font-extrabold focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="text-slate-400 font-extrabold text-base">%</span>
                </div>
              </div>

              {/* Attendance Requirement */}
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Attendance Bar (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="40"
                    max="95"
                    value={editedMinAttendance}
                    onChange={(e) => setEditedMinAttendance(parseInt(e.target.value) || 75)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base text-white font-extrabold focus:outline-none focus:border-indigo-500 text-center"
                  />
                  <span className="text-slate-400 font-extrabold text-base">%</span>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block font-bold text-slate-200 mb-1.5">
                  Scoring & Grading Scale
                </label>
                <select
                  value={editedGradingScale}
                  onChange={(e) => setEditedGradingScale(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="percentage">Percentage (0 - 100% with Standard Letter Grades)</option>
                  <option value="cgpa_10">10-Point CGPA Scale (O, A+, A, B+, B, C, P, F)</option>
                  <option value="gpa_4">4.0 GPA Scale (US / International Standard)</option>
                  <option value="cbse_letter">CBSE Secondary Grades (A1, A2, B1, B2, C1, C2, D, E)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="sm:col-span-2 lg:col-span-2 flex items-end gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveInlineScheme}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" /> Save & Apply Scheme
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingScheme(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onOpenSystemConfig}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs md:text-sm font-semibold border border-indigo-500/30 whitespace-nowrap transition-colors"
                  title="Configure components and weightages"
                >
                  Advanced Weights...
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Basic Student Info Row */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" /> Student Profile Details
          </span>
          <button
            type="button"
            onClick={handleResetBlank}
            className="text-xs md:text-sm text-slate-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Form
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" /> Student Full Name
            </label>
            <input
              type="text"
              value={input.name}
              onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Liam Chen"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-200 mb-1.5">
              Student ID / Roll No.
            </label>
            <input
              type="text"
              value={input.studentId}
              onChange={(e) => setInput((p) => ({ ...p, studentId: e.target.value }))}
              placeholder="STU-2026-001"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-200 mb-1.5">
              Grade / Cohort Level
            </label>
            <input
              type="text"
              value={input.gradeLevel}
              onChange={(e) => setInput((p) => ({ ...p, gradeLevel: e.target.value }))}
              placeholder="e.g. 7th Standard, Class 12, or B.Tech Year 3"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm md:text-base font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Primary Key Predictors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-800">
        {/* Attendance Percentage */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <label className="text-sm md:text-base font-bold text-white tracking-wide block">
                Attendance Percentage
              </label>
              <span className="text-xs text-slate-400">Classroom presence record</span>
            </div>
            <span
              className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                input.attendancePercentage >= 85
                  ? 'text-emerald-400'
                  : input.attendancePercentage >= activeConfig.minAttendanceRequired
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {input.attendancePercentage}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={input.attendancePercentage}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                attendancePercentage: parseInt(e.target.value),
              }))
            }
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
          />
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span className="text-rose-400/90">Critical (&lt;65%)</span>
            <span className="text-amber-300">Min Bar: {activeConfig.minAttendanceRequired}%</span>
            <span className="text-emerald-400">Target (≥90%)</span>
          </div>
        </div>

        {/* Weekly Study Hours */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <label className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" /> Weekly Self-Study Hours
              </label>
              <span className="text-xs text-slate-400">Dedicated study outside lectures</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-700">
              <input
                type="number"
                min="0"
                max="98"
                value={input.weeklyStudyHours}
                onChange={(e) =>
                  setInput((p) => ({
                    ...p,
                    weeklyStudyHours: Math.min(98, Math.max(0, parseInt(e.target.value) || 0)),
                  }))
                }
                className="w-12 bg-transparent text-xl md:text-2xl font-extrabold text-indigo-400 text-center focus:outline-none"
              />
              <span className="text-xs font-bold text-indigo-300">
                hrs/wk
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="98"
            step="1"
            value={input.weeklyStudyHours}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                weeklyStudyHours: Math.min(98, Math.max(0, parseInt(e.target.value) || 0)),
              }))
            }
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
          />
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span className="text-rose-400/90">Low (&lt;6h)</span>
            <span className="text-slate-300">Rec: 15–25h</span>
            <span className="text-indigo-400 font-medium">Max: 98 hrs/wk</span>
          </div>
        </div>

        {/* Assignment Completion Rate */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <label className="text-sm md:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-cyan-400" /> Continuous Submissions
              </label>
              <span className="text-xs text-slate-400">Assignments & coursework consistency</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-cyan-300 tracking-tight">
              {input.assignmentCompletionRate}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="2"
            value={input.assignmentCompletionRate}
            onChange={(e) =>
              setInput((p) => ({
                ...p,
                assignmentCompletionRate: parseInt(e.target.value),
              }))
            }
            className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-3"
          />
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span className="text-rose-400/90">Lagging (&lt;60%)</span>
            <span className="text-slate-300">Consistent</span>
            <span className="text-emerald-400">Optimal (≥90%)</span>
          </div>
        </div>
      </div>

      {/* Secondary Factors (Sleep & Class Engagement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-200">
              Average Sleep (Wellness Index)
            </label>
            <span className="text-xs font-extrabold text-indigo-300 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
              {input.sleepHours} hrs/night
            </span>
          </div>
          <input
            type="range"
            min="4"
            max="10"
            step="0.5"
            value={input.sleepHours}
            onChange={(e) =>
              setInput((p) => ({ ...p, sleepHours: parseFloat(e.target.value) }))
            }
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-1"
          />
          <p className="text-[11px] text-slate-400">
            Sleep below 6 hrs impacts cognitive stamina and test retention.
          </p>
        </div>

        <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs md:text-sm font-bold text-slate-200">
              Class Participation & Viva Score
            </label>
            <span className="text-xs font-extrabold text-cyan-300 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700">
              {input.participationScore}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={input.participationScore}
            onChange={(e) =>
              setInput((p) => ({ ...p, participationScore: parseInt(e.target.value) }))
            }
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-1"
          />
          <p className="text-[11px] text-slate-400">
            Tutorial, oral, lab discussion, and live classroom engagement.
          </p>
        </div>
      </div>

      {/* DYNAMIC SUBJECT-WISE ASSESSMENT TABLE */}
      <div className="pt-5 border-t border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Subject Performance Roster ({input.subjects.length} Subjects)
              </h4>
              <span className="px-3 py-1 rounded-lg text-xs md:text-sm font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {activeConfig.tierDisplayName} Columns
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Enter marks for each component defined in this evaluation scheme. Columns and max marks match this system.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={onOpenSystemConfig}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Settings className="h-4 w-4 text-indigo-400" /> Edit Columns & Max Marks
            </button>
            <button
              type="button"
              onClick={handleAddSubject}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-md shadow-indigo-600/30"
            >
              <Plus className="h-4 w-4" /> Add Subject
            </button>
          </div>
        </div>

        {/* Dynamic Table Header and Body */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl bg-slate-900/60">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-800 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4 min-w-[220px]">Subject Name</th>
                {activeConfig.useCreditSystem && (
                  <th className="py-3.5 px-4 text-center">Credits</th>
                )}
                {/* Dynamically generated columns for each assessment component */}
                {activeConfig.components.map((comp) => (
                  <th key={comp.id} className="py-3.5 px-4 text-center">
                    <div className="font-extrabold text-white text-xs sm:text-sm">{comp.name}</div>
                    <span className="text-xs text-indigo-300 font-bold">
                      (Max: {comp.maxMarks})
                    </span>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center">Attendance %</th>
                <th className="py-3.5 px-4 text-center">Difficulty</th>
                <th className="py-3.5 px-4 text-center">Calculated Score</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {input.subjects.map((sub) => {
                const normalized = calculateNormalizedSubjectScore(sub, activeConfig);
                const isUnderPassing = normalized < activeConfig.passingThresholdPercentage;

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Subject Name */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        list="subject-presets"
                        value={sub.name}
                        onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
                        className="w-full min-w-[200px] bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 font-semibold shadow-inner"
                      />
                    </td>

                    {/* Credit Hours (if University) */}
                    {activeConfig.useCreditSystem && (
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={sub.creditHours || 3}
                          onChange={(e) =>
                            handleSubjectChange(
                              sub.id,
                              'creditHours',
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-16 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-sm sm:text-base text-white text-center focus:outline-none focus:border-indigo-500 font-black shadow-inner"
                        />
                      </td>
                    )}

                    {/* Dynamic Component Score Inputs */}
                    {activeConfig.components.map((comp) => {
                      const score =
                        sub.componentScores && sub.componentScores[comp.id] !== undefined
                          ? sub.componentScores[comp.id]
                          : Math.round((sub.internalScore / 100) * comp.maxMarks);

                      return (
                        <td key={comp.id} className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max={comp.maxMarks}
                              value={score}
                              onChange={(e) => {
                                const val = Math.min(
                                  comp.maxMarks,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                );
                                handleComponentScoreChange(sub.id, comp.id, val);
                              }}
                              className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm sm:text-base text-indigo-300 text-center focus:outline-none focus:border-indigo-500 font-black shadow-inner"
                            />
                            <span className="text-xs sm:text-sm font-bold text-slate-400">/{comp.maxMarks}</span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Attendance % */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sub.attendancePercentage}
                          onChange={(e) =>
                            handleSubjectChange(
                              sub.id,
                              'attendancePercentage',
                              Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                            )
                          }
                          className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm sm:text-base text-amber-300 text-center focus:outline-none focus:border-indigo-500 font-black shadow-inner"
                        />
                        <span className="text-sm font-bold text-slate-300">%</span>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={sub.difficulty}
                        onChange={(e) =>
                          handleSubjectChange(sub.id, 'difficulty', e.target.value as SubjectDifficulty)
                        }
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </td>

                    {/* Calculated Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black px-3.5 py-1.5 rounded-xl text-sm sm:text-base inline-block ${
                          isUnderPassing
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        }`}
                      >
                        {normalized}%
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        disabled={input.subjects.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent transition-all"
                        title="Remove subject"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <datalist id="subject-presets">
          {COMMON_SUBJECT_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={onSaveToCohort}
          disabled={isSaving || !input.name.trim()}
          className="px-6 py-3 rounded-2xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all flex items-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          {isSaving ? 'Saving to Database...' : 'Save Student to Cohort'}
        </button>
      </div>
    </div>
  );
};

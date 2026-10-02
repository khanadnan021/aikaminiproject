import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StudentInput,
  SavedStudentRecord,
  PredictionResult,
  AIDiagnosticReport,
  CohortAnalytics,
  AcademicTier,
  AcademicSystemConfig,
} from './types/index.ts';
import { INITIAL_STUDENTS } from './data/sampleStudents.ts';
import { DEFAULT_ACADEMIC_TIERS, TIER_DEFAULT_SUBJECTS } from './data/academicTiers.ts';
import { runPredictionModel } from './services/mlEngine.ts';
import { Header } from './components/Header.tsx';
import { StudentForm } from './components/StudentForm.tsx';
import { RiskMeterGauge } from './components/RiskMeterGauge.tsx';
import { SubjectDiagnosisCard } from './components/SubjectDiagnosisCard.tsx';
import { ContributingFactorsList } from './components/ContributingFactorsList.tsx';
import { WhatIfSimulator } from './components/WhatIfSimulator.tsx';
import { AiDiagnosticModal } from './components/AiDiagnosticModal.tsx';
import { CohortRoster } from './components/CohortRoster.tsx';
import { CohortAnalyticsView } from './components/CohortAnalyticsView.tsx';
import { BatchPredictModal } from './components/BatchPredictModal.tsx';
import { ModelExplanationModal } from './components/ModelExplanationModal.tsx';
import { SystemConfigModal } from './components/SystemConfigModal.tsx';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'roster' | 'analytics'>('calculator');
  const [userRole, setUserRole] = useState<'educator' | 'student'>('educator');

  // Cohort state
  const [students, setStudents] = useState<SavedStudentRecord[]>(INITIAL_STUDENTS);
  const [cohortAnalytics, setCohortAnalytics] = useState<CohortAnalytics | null>(null);

  // Active student input for prediction & simulation
  const [currentInput, setCurrentInput] = useState<StudentInput>(() => {
    const defaultStudent = INITIAL_STUDENTS[0]; // Liam Chen
    return {
      name: defaultStudent.name,
      studentId: defaultStudent.studentId,
      gradeLevel: defaultStudent.gradeLevel,
      systemConfig: DEFAULT_ACADEMIC_TIERS.high_school,
      attendancePercentage: defaultStudent.attendancePercentage,
      weeklyStudyHours: defaultStudent.weeklyStudyHours,
      pastScores: [...defaultStudent.pastScores],
      assignmentCompletionRate: defaultStudent.assignmentCompletionRate,
      sleepHours: defaultStudent.sleepHours,
      participationScore: defaultStudent.participationScore,
      subjects: defaultStudent.subjects.map((s) => ({ ...s })),
    };
  });

  // Active student prediction (computed with ML model)
  const currentPrediction: PredictionResult = useMemo(() => {
    return runPredictionModel(currentInput);
  }, [currentInput]);

  // AI Diagnostic Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<AIDiagnosticReport | null>(null);
  const [isAiFallback, setIsAiFallback] = useState(false);

  // System Customization Modal
  const [isSystemConfigOpen, setIsSystemConfigOpen] = useState(false);

  // Other modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isModelInfoOpen, setIsModelInfoOpen] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch cohort list from backend API
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      }
    } catch {
      // In offline/dev environment, local memory store in INITIAL_STUDENTS remains authoritative
    }
  }, []);

  // Fetch cohort analytics from backend API
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/cohort');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          setCohortAnalytics(data.analytics);
        }
      }
    } catch {
      // Fallback calculation handled locally if server is reloading
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchAnalytics();
  }, [fetchStudents, fetchAnalytics]);

  // Save current student input to backend & local cohort
  const handleSaveToCohort = async () => {
    setIsSaving(true);
    try {
      const existing = students.find((s) => s.studentId === currentInput.studentId);
      let res;

      if (existing) {
        res = await fetch(`/api/students/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentInput, lastPrediction: currentPrediction }),
        });
      } else {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentInput),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          setStudents((prev) => {
            const idx = prev.findIndex((s) => s.id === data.student.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = data.student;
              return copy;
            }
            return [data.student, ...prev];
          });
          showToast(`Student profile for "${currentInput.name}" saved successfully!`);
          fetchAnalytics();
        }
      } else {
        // Fallback local save
        const fallbackStudent: SavedStudentRecord = {
          ...currentInput,
          id: existing ? existing.id : `std-${Date.now()}`,
          lastPrediction: currentPrediction,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setStudents((prev) => {
          const idx = prev.findIndex((s) => s.studentId === currentInput.studentId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = fallbackStudent;
            return copy;
          }
          return [fallbackStudent, ...prev];
        });
        showToast(`Saved "${currentInput.name}" to active cohort!`);
      }
    } catch {
      showToast(`Saved "${currentInput.name}" to local session!`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async (id: string) => {
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    fetchAnalytics();
    showToast('Student removed from cohort.');
  };

  // Inspect student from roster or analytics
  const handleSelectStudent = (std: SavedStudentRecord) => {
    setCurrentInput({
      name: std.name,
      studentId: std.studentId,
      gradeLevel: std.gradeLevel,
      attendancePercentage: std.attendancePercentage,
      weeklyStudyHours: std.weeklyStudyHours,
      pastScores: [...std.pastScores],
      assignmentCompletionRate: std.assignmentCompletionRate,
      sleepHours: std.sleepHours,
      participationScore: std.participationScore,
      subjects: std.subjects.map((s) => ({ ...s })),
    });
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded ${std.name} into Performance Predictor.`);
  };

  // Trigger Gemini AI Diagnostic
  const handleGenerateAiDiagnostic = async (targetStudent?: StudentInput, targetPrediction?: PredictionResult) => {
    const studentToDiagnose = targetStudent || currentInput;
    const predictionToDiagnose = targetPrediction || currentPrediction;

    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiReport(null);

    try {
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student: studentToDiagnose,
          prediction: predictionToDiagnose,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setAiReport(data.report);
        setIsAiFallback(!!data.isFallback);
      } else {
        throw new Error(data.error || 'Failed to generate diagnostic');
      }
    } catch (err: any) {
      console.warn('AI request failed, generating client fallback:', err);
      // Client-side fallback report
      setAiReport({
        executiveSummary: `${studentToDiagnose.name}'s predicted score of ${predictionToDiagnose.predictedFinalScore}% indicates ${predictionToDiagnose.riskLevel} academic risk. Key focus area is raising attendance (${studentToDiagnose.attendancePercentage}%) and subject practice.`,
        pedagogicalProfile: `Multivariate predictive evaluation shows reliable intellectual foundation, but irregular study rhythm and lecture gaps hinder test retention.`,
        keyVulnerabilities: [
          `Attendance at ${studentToDiagnose.attendancePercentage}% (below 75% target bar)`,
          `${predictionToDiagnose.subjectsNeedingExtraHelpCount} subjects require targeted intervention`,
          `Homework and continuous assignments at ${studentToDiagnose.assignmentCompletionRate}%`,
        ],
        immediateActionPlan: [
          {
            week: 'Week 1',
            focusSubject: 'Core Problem Areas',
            actionItems: ['Review missing lecture notes', 'Schedule faculty doubt clearing'],
            allocatedHours: 5,
          },
          {
            week: 'Week 2',
            focusSubject: 'Problem Solving Practice',
            actionItems: ['Solve 30 topical exercises', 'Daily 1.5 hr pomodoro study sessions'],
            allocatedHours: 6,
          },
          {
            week: 'Week 3',
            focusSubject: 'Peer Study & Review',
            actionItems: ['Partner with study buddy', 'Timed sectional quiz drill'],
            allocatedHours: 5,
          },
          {
            week: 'Week 4',
            focusSubject: 'Mock Exam Simulation',
            actionItems: ['Full length test under exam conditions', 'Error log analysis'],
            allocatedHours: 7,
          },
        ],
        teacherRecommendation: 'Provide structured weekly homework checkpoints and monitor laboratory attendance.',
        studentMotivationAdvice: 'Consistency beats intensity. Dedicating just 1 extra hour each day will change your academic trajectory dramatically.',
        recommendedResources: [
          { title: 'Curated Topic Revision Worksheets', type: 'Practice Sets', subject: 'Core Subjects' },
          { title: 'Interactive Conceptual Explanations', type: 'Concept Revision', subject: 'Core Subjects' },
        ],
      });
      setIsAiFallback(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenAiDiagnosticForRecord = (record: SavedStudentRecord) => {
    const pred = record.lastPrediction || runPredictionModel(record);
    handleGenerateAiDiagnostic(record, pred);
  };

  const handleApplyTierPreset = (tier: AcademicTier) => {
    const preset = DEFAULT_ACADEMIC_TIERS[tier];
    const defaultSubs = TIER_DEFAULT_SUBJECTS[tier] || TIER_DEFAULT_SUBJECTS.high_school;

    setCurrentInput((prev) => ({
      ...prev,
      systemConfig: preset,
      gradeLevel: preset.tierDisplayName,
      subjects: defaultSubs.map((s, i) => ({
        ...s,
        id: `sub-${Date.now()}-${i}`,
      })),
    }));

    showToast(`Switched evaluation scheme to "${preset.tierDisplayName}"!`);
  };

  const handleApplyConfig = (newConfig: AcademicSystemConfig, loadDefaultSubjects: boolean) => {
    setCurrentInput((prev) => {
      let updatedSubjects = prev.subjects;
      if (loadDefaultSubjects) {
        const defaultSubs = TIER_DEFAULT_SUBJECTS[newConfig.tier] || TIER_DEFAULT_SUBJECTS.high_school;
        updatedSubjects = defaultSubs.map((s, i) => ({
          ...s,
          id: `sub-${Date.now()}-${i}`,
        }));
      }
      return {
        ...prev,
        systemConfig: newConfig,
        gradeLevel: newConfig.tierDisplayName,
        subjects: updatedSubjects,
      };
    });

    showToast(`Applied custom "${newConfig.tierDisplayName}" scheme!`);
  };

  const handleBatchImport = (newStudents: SavedStudentRecord[]) => {
    setStudents((prev) => [...newStudents, ...prev]);
    fetchAnalytics();
    showToast(`Successfully imported ${newStudents.length} students into cohort!`);
    setActiveTab('roster');
  };

  const atRiskCount = useMemo(() => {
    return students.filter((s) => {
      const lvl = s.lastPrediction?.riskLevel;
      return lvl === 'High' || lvl === 'Critical';
    }).length;
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenModelInfo={() => setIsModelInfoOpen(true)}
        cohortCount={students.length}
        atRiskCount={atRiskCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Banner / Context */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 p-4 rounded-2xl border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {userRole === 'educator' ? 'Educator & Counselor Dashboard' : 'Student Self-Evaluation Portal'}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium">ML Model Online</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {userRole === 'educator'
                  ? 'Predict Academic Risk & Identify Vulnerable Subjects'
                  : 'Assess Your Exam Readiness & Discover What-If Scenarios'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleGenerateAiDiagnostic()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Roadmap</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Single Student Predictor & Risk Assessment */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Student Data Entry Form */}
            <StudentForm
              input={currentInput}
              setInput={setCurrentInput}
              onSaveToCohort={handleSaveToCohort}
              isSaving={isSaving}
              onOpenSystemConfig={() => setIsSystemConfigOpen(true)}
              onApplyTierPreset={handleApplyTierPreset}
            />

            {/* Prediction Output Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Diagnostic Results for</span>
                    <span className="text-indigo-400 underline decoration-indigo-500/50">
                      {currentInput.name || 'Student'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Real-time machine learning inference calibrated against {currentPrediction.systemConfig?.tierDisplayName || 'custom scheme'} with {currentPrediction.passingThreshold}% pass threshold.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateAiDiagnostic()}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Deep Diagnosis</span>
                  </button>
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Risk Gauge & Contributing Factors (5 cols on lg) */}
                <div className="lg:col-span-5 space-y-6">
                  <RiskMeterGauge
                    score={currentPrediction.riskScore}
                    level={currentPrediction.riskLevel}
                    predictedGrade={currentPrediction.predictedGrade}
                    predictedFinalScore={currentPrediction.predictedFinalScore}
                    predictedCGPA={currentPrediction.predictedCGPA}
                    passingThreshold={currentPrediction.passingThreshold}
                    tierDisplayName={currentPrediction.systemConfig?.tierDisplayName}
                  />

                  <ContributingFactorsList
                    factors={currentPrediction.contributingFactors}
                    passingProbability={currentPrediction.passingProbability}
                    distinctionProbability={currentPrediction.distinctionProbability}
                  />
                </div>

                {/* Right Column: Subject Diagnosis & What-If Simulator (7 cols on lg) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Subject Diagnosis Card */}
                  <SubjectDiagnosisCard
                    diagnoses={currentPrediction.subjectDiagnoses}
                    passingThreshold={currentPrediction.passingThreshold}
                    targetBenchmark={Math.max(currentPrediction.passingThreshold + 15, 60)}
                  />

                  {/* Interactive What-If Simulator */}
                  <WhatIfSimulator
                    currentInput={currentInput}
                    basePrediction={currentPrediction}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Class Cohort Roster */}
        {activeTab === 'roster' && (
          <CohortRoster
            students={students}
            onSelectStudent={handleSelectStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenAiDiagnostic={handleOpenAiDiagnosticForRecord}
            onNewStudent={() => {
              setCurrentInput({
                name: 'New Student',
                studentId: `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
                gradeLevel: 'Grade 11',
                attendancePercentage: 75,
                weeklyStudyHours: 8,
                pastScores: [65, 68],
                assignmentCompletionRate: 80,
                sleepHours: 7,
                participationScore: 70,
                subjects: [
                  {
                    id: `sub-new-1`,
                    name: 'Mathematics',
                    internalScore: 65,
                    attendancePercentage: 75,
                    difficulty: 'Hard',
                    practicalScore: 70,
                    creditHours: 4,
                  },
                  {
                    id: `sub-new-2`,
                    name: 'Science',
                    internalScore: 65,
                    attendancePercentage: 75,
                    difficulty: 'Medium',
                    practicalScore: 65,
                    creditHours: 4,
                  },
                ],
              });
              setActiveTab('calculator');
            }}
          />
        )}

        {/* TAB 3: Cohort Risk Analytics */}
        {activeTab === 'analytics' && (
          <CohortAnalyticsView
            analytics={cohortAnalytics}
            students={students}
            onSelectStudent={handleSelectStudent}
            onOpenAiDiagnostic={handleOpenAiDiagnosticForRecord}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            EduPredict AI • Student Academic Performance & Risk Prediction System
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModelInfoOpen(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Model Architecture & Weights
            </button>
            <span>•</span>
            <span className="text-slate-400">Gemini 3.8 Flash Powered</span>
          </div>
        </div>
      </footer>

      {/* AI Diagnostic Modal */}
      <AiDiagnosticModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        report={aiReport}
        isLoading={isAiLoading}
        student={currentInput}
        prediction={currentPrediction}
        isFallback={isAiFallback}
      />

      {/* Batch Import CSV Modal */}
      <BatchPredictModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onImportBatch={handleBatchImport}
      />

      {/* Model Explanation Info Modal */}
      <ModelExplanationModal
        isOpen={isModelInfoOpen}
        onClose={() => setIsModelInfoOpen(false)}
      />

      {/* Academic System Customization Modal */}
      <SystemConfigModal
        isOpen={isSystemConfigOpen}
        onClose={() => setIsSystemConfigOpen(false)}
        currentConfig={currentInput.systemConfig || DEFAULT_ACADEMIC_TIERS.high_school}
        onApplyConfig={handleApplyConfig}
      />
    </div>
  );
}

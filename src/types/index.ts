export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard';

export type AcademicTier = 'middle_school' | 'high_school' | 'university' | 'custom';
export type GradingScaleType = 'percentage' | 'cgpa_10' | 'gpa_4' | 'cbse_letter';

export interface AssessmentComponentDef {
  id: string;
  name: string; // e.g. "Theory Exam", "Practical / Lab", "Unit Test", "Notebook Submission", "Mid-Term"
  maxMarks: number; // e.g. 100, 80, 70, 60, 50, 30, 20
  weightPercentage: number; // % contribution to subject score
}

export interface AcademicSystemConfig {
  tier: AcademicTier;
  tierDisplayName: string;
  gradingScale: GradingScaleType;
  passingThresholdPercentage: number; // e.g. 33 for 12th board, 35 for 7th std, 40 for university
  minAttendanceRequired: number; // e.g. 75
  useCreditSystem: boolean; // true for university degree
  components: AssessmentComponentDef[];
}

export interface SubjectRecord {
  id: string;
  name: string;
  componentScores?: Record<string, number>; // componentId -> raw marks entered (0 to maxMarks)
  internalScore: number; // normalized 0 - 100
  attendancePercentage: number; // 0 - 100
  difficulty: SubjectDifficulty;
  practicalScore: number; // 0 - 100
  creditHours: number;
}

export interface StudentInput {
  name: string;
  studentId: string;
  gradeLevel: string; // e.g., "1st - 9th Standard", "12th Standard (Science)", "B.Tech Year 3"
  systemConfig?: AcademicSystemConfig;
  attendancePercentage: number; // 0 - 100
  weeklyStudyHours: number; // 0 - 98
  pastScores: number[]; // e.g. [72, 68, 65]
  assignmentCompletionRate: number; // 0 - 100
  sleepHours: number; // 4 - 10
  participationScore: number; // 0 - 100
  subjects: SubjectRecord[];
}

export interface ContributingFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  scoreDelta: number; // e.g. +6.5 or -12.0
  description: string;
  category: 'Attendance' | 'Study Habits' | 'Past Trajectory' | 'Assignments' | 'Subject Gap';
}

export interface SubjectDiagnosis {
  subjectId: string;
  subjectName: string;
  currentInternal: number;
  predictedFinalScore: number;
  predictedGrade: string;
  riskLevel: RiskLevel;
  needsExtraHelp: boolean;
  deficitPoints: number; // distance below target (70% or 60%)
  primaryDeficitReason: string;
  recommendedIntervention: string;
  suggestedWeeklyHours: number;
}

export interface WhatIfSensitivity {
  basePredictedScore: number;
  plus5StudyHoursScore: number;
  plus10StudyHoursScore: number;
  plus10AttendanceScore: number;
  maxAssignmentsScore: number;
  optimizedScenarioScore: number;
  optimizedRiskLevel: RiskLevel;
}

export interface PredictionResult {
  studentId?: string;
  studentName: string;
  predictedFinalScore: number; // 0 - 100
  predictedGrade: string; // "A+", "A", "B", "C", "D", "F", or "O", "A+" for 10pt CGPA, or CBSE "A1"
  predictedCGPA?: number; // 0.0 - 10.0 or 0.0 - 4.0 when applicable
  passingThreshold: number; // e.g. 33%, 35%, 40%
  systemConfig: AcademicSystemConfig;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  passingProbability: number; // percentage
  distinctionProbability: number; // percentage
  subjectDiagnoses: SubjectDiagnosis[];
  subjectsNeedingExtraHelpCount: number;
  contributingFactors: ContributingFactor[];
  whatIfSensitivity: WhatIfSensitivity;
  calculatedAt: string;
}

export interface AIDiagnosticReport {
  executiveSummary: string;
  pedagogicalProfile: string;
  keyVulnerabilities: string[];
  immediateActionPlan: {
    week: string;
    focusSubject: string;
    actionItems: string[];
    allocatedHours: number;
  }[];
  teacherRecommendation: string;
  studentMotivationAdvice: string;
  recommendedResources: {
    title: string;
    type: 'Practice Sets' | 'Video Lectures' | 'Concept Revision' | 'Peer Mentoring';
    subject: string;
  }[];
}

export interface SavedStudentRecord extends StudentInput {
  id: string;
  lastPrediction?: PredictionResult;
  lastAiReport?: AIDiagnosticReport;
  createdAt: string;
  updatedAt: string;
}

export interface CohortAnalytics {
  totalStudents: number;
  averageAttendance: number;
  averageStudyHours: number;
  averagePredictedScore: number;
  riskDistribution: {
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  highRiskStudents: {
    id: string;
    name: string;
    riskScore: number;
    riskLevel: RiskLevel;
    criticalSubjects: string[];
  }[];
  subjectDifficultyHeatmap: {
    subjectName: string;
    averageScore: number;
    studentsNeedingHelp: number;
    riskRate: number;
  }[];
}

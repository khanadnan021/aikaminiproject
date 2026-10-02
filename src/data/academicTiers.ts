import { AcademicSystemConfig, AcademicTier, SubjectRecord } from '../types/index.ts';

export const DEFAULT_ACADEMIC_TIERS: Record<AcademicTier, AcademicSystemConfig> = {
  middle_school: {
    tier: 'middle_school',
    tierDisplayName: 'School (1st – 9th Standard)',
    gradingScale: 'cbse_letter',
    passingThresholdPercentage: 35,
    minAttendanceRequired: 75,
    useCreditSystem: false,
    components: [
      {
        id: 'comp-unit-test',
        name: 'Unit / Periodic Test',
        maxMarks: 50,
        weightPercentage: 70,
      },
      {
        id: 'comp-notebook',
        name: 'Notebook & Classwork',
        maxMarks: 20,
        weightPercentage: 30,
      },
    ],
  },
  high_school: {
    tier: 'high_school',
    tierDisplayName: 'High School (10th / 12th Standard)',
    gradingScale: 'percentage',
    passingThresholdPercentage: 33,
    minAttendanceRequired: 75,
    useCreditSystem: false,
    components: [
      {
        id: 'comp-theory',
        name: 'Theory Exam',
        maxMarks: 80,
        weightPercentage: 80,
      },
      {
        id: 'comp-practical',
        name: 'Practical / Lab / Viva',
        maxMarks: 20,
        weightPercentage: 20,
      },
    ],
  },
  university: {
    tier: 'university',
    tierDisplayName: 'University / Degree (B.Tech, B.Sc, B.Com)',
    gradingScale: 'cgpa_10',
    passingThresholdPercentage: 40,
    minAttendanceRequired: 75,
    useCreditSystem: true,
    components: [
      {
        id: 'comp-endsem',
        name: 'End-Sem Exam',
        maxMarks: 60,
        weightPercentage: 60,
      },
      {
        id: 'comp-midsem',
        name: 'Mid-Sem / Sessional',
        maxMarks: 20,
        weightPercentage: 20,
      },
      {
        id: 'comp-lab-quiz',
        name: 'Lab & Quizzes',
        maxMarks: 20,
        weightPercentage: 20,
      },
    ],
  },
  custom: {
    tier: 'custom',
    tierDisplayName: 'Custom Evaluation Scheme',
    gradingScale: 'percentage',
    passingThresholdPercentage: 40,
    minAttendanceRequired: 75,
    useCreditSystem: false,
    components: [
      {
        id: 'comp-c1',
        name: 'Written Exam',
        maxMarks: 70,
        weightPercentage: 70,
      },
      {
        id: 'comp-c2',
        name: 'Continuous Assessment',
        maxMarks: 30,
        weightPercentage: 30,
      },
    ],
  },
};

export const TIER_DEFAULT_SUBJECTS: Record<AcademicTier, Omit<SubjectRecord, 'id'>[]> = {
  middle_school: [
    {
      name: 'Mathematics',
      componentScores: { 'comp-unit-test': 34, 'comp-notebook': 16 },
      internalScore: 71,
      attendancePercentage: 78,
      difficulty: 'Hard',
      practicalScore: 75,
      creditHours: 1,
    },
    {
      name: 'General Science',
      componentScores: { 'comp-unit-test': 36, 'comp-notebook': 17 },
      internalScore: 76,
      attendancePercentage: 82,
      difficulty: 'Medium',
      practicalScore: 80,
      creditHours: 1,
    },
    {
      name: 'Social Studies',
      componentScores: { 'comp-unit-test': 32, 'comp-notebook': 15 },
      internalScore: 67,
      attendancePercentage: 80,
      difficulty: 'Medium',
      practicalScore: 70,
      creditHours: 1,
    },
    {
      name: 'English Grammar & Literature',
      componentScores: { 'comp-unit-test': 40, 'comp-notebook': 18 },
      internalScore: 83,
      attendancePercentage: 85,
      difficulty: 'Easy',
      practicalScore: 85,
      creditHours: 1,
    },
    {
      name: 'Hindi / Second Language',
      componentScores: { 'comp-unit-test': 35, 'comp-notebook': 16 },
      internalScore: 73,
      attendancePercentage: 80,
      difficulty: 'Easy',
      practicalScore: 75,
      creditHours: 1,
    },
  ],
  high_school: [
    {
      name: 'Physics (Mechanics & Waves)',
      componentScores: { 'comp-theory': 46, 'comp-practical': 16 },
      internalScore: 62,
      attendancePercentage: 72,
      difficulty: 'Hard',
      practicalScore: 80,
      creditHours: 4,
    },
    {
      name: 'Chemistry (Organic & Physical)',
      componentScores: { 'comp-theory': 42, 'comp-practical': 15 },
      internalScore: 57,
      attendancePercentage: 74,
      difficulty: 'Hard',
      practicalScore: 75,
      creditHours: 4,
    },
    {
      name: 'Mathematics & Calculus',
      componentScores: { 'comp-theory': 52, 'comp-practical': 18 },
      internalScore: 70,
      attendancePercentage: 80,
      difficulty: 'Hard',
      practicalScore: 90,
      creditHours: 4,
    },
    {
      name: 'English Core',
      componentScores: { 'comp-theory': 62, 'comp-practical': 19 },
      internalScore: 81,
      attendancePercentage: 86,
      difficulty: 'Easy',
      practicalScore: 95,
      creditHours: 3,
    },
    {
      name: 'Computer Science (Python)',
      componentScores: { 'comp-theory': 56, 'comp-practical': 19 },
      internalScore: 75,
      attendancePercentage: 84,
      difficulty: 'Medium',
      practicalScore: 95,
      creditHours: 3,
    },
  ],
  university: [
    {
      name: 'Data Structures & Algorithms',
      componentScores: { 'comp-endsem': 38, 'comp-midsem': 14, 'comp-lab-quiz': 17 },
      internalScore: 69,
      attendancePercentage: 76,
      difficulty: 'Hard',
      practicalScore: 85,
      creditHours: 4,
    },
    {
      name: 'Operating Systems & Concurrency',
      componentScores: { 'comp-endsem': 34, 'comp-midsem': 12, 'comp-lab-quiz': 16 },
      internalScore: 62,
      attendancePercentage: 72,
      difficulty: 'Hard',
      practicalScore: 80,
      creditHours: 4,
    },
    {
      name: 'Database Management Systems',
      componentScores: { 'comp-endsem': 44, 'comp-midsem': 16, 'comp-lab-quiz': 18 },
      internalScore: 78,
      attendancePercentage: 84,
      difficulty: 'Medium',
      practicalScore: 90,
      creditHours: 3,
    },
    {
      name: 'Discrete Mathematics',
      componentScores: { 'comp-endsem': 32, 'comp-midsem': 11, 'comp-lab-quiz': 15 },
      internalScore: 58,
      attendancePercentage: 70,
      difficulty: 'Hard',
      practicalScore: 75,
      creditHours: 4,
    },
    {
      name: 'Software Engineering & Ethics',
      componentScores: { 'comp-endsem': 48, 'comp-midsem': 18, 'comp-lab-quiz': 19 },
      internalScore: 85,
      attendancePercentage: 90,
      difficulty: 'Easy',
      practicalScore: 95,
      creditHours: 3,
    },
  ],
  custom: [
    {
      name: 'Core Course 1',
      componentScores: { 'comp-c1': 48, 'comp-c2': 22 },
      internalScore: 70,
      attendancePercentage: 80,
      difficulty: 'Medium',
      practicalScore: 75,
      creditHours: 3,
    },
    {
      name: 'Core Course 2',
      componentScores: { 'comp-c1': 42, 'comp-c2': 18 },
      internalScore: 60,
      attendancePercentage: 75,
      difficulty: 'Hard',
      practicalScore: 65,
      creditHours: 3,
    },
  ],
};

/**
 * Calculates normalized 0-100 percentage score for a subject from its component scores
 */
export function calculateNormalizedSubjectScore(
  subject: SubjectRecord,
  config: AcademicSystemConfig
): number {
  if (!subject.componentScores || Object.keys(subject.componentScores).length === 0) {
    return subject.internalScore || 65;
  }

  let totalWeightedScore = 0;
  let totalWeights = 0;

  for (const comp of config.components) {
    const rawScore = subject.componentScores[comp.id] ?? 0;
    const maxMarks = comp.maxMarks || 100;
    const componentPct = Math.min(100, Math.max(0, (rawScore / maxMarks) * 100));
    totalWeightedScore += componentPct * (comp.weightPercentage || 1);
    totalWeights += comp.weightPercentage || 1;
  }

  if (totalWeights === 0) return subject.internalScore || 65;
  const normalized = totalWeightedScore / totalWeights;
  return Math.round(normalized * 10) / 10;
}

/**
 * Converts a 0-100 percentage score to 10-point CGPA
 */
export function scoreTo10PointCGPA(score: number): number {
  if (score >= 90) return 10.0;
  if (score >= 80) return 9.0;
  if (score >= 70) return 8.0;
  if (score >= 60) return 7.0;
  if (score >= 50) return 6.0;
  if (score >= 40) return 5.0;
  if (score >= 35) return 4.0;
  return 0.0;
}

/**
 * Converts a 0-100 percentage score to 4.0 GPA scale
 */
export function scoreTo4PointGPA(score: number): number {
  if (score >= 90) return 4.0;
  if (score >= 80) return 3.5;
  if (score >= 70) return 3.0;
  if (score >= 60) return 2.5;
  if (score >= 50) return 2.0;
  if (score >= 40) return 1.5;
  return 0.0;
}

/**
 * Formats grade display according to grading scale
 */
export function formatGradeByScale(
  score: number,
  scale: AcademicSystemConfig['gradingScale']
): { grade: string; cgpa?: number } {
  switch (scale) {
    case 'cgpa_10': {
      let letter = 'F';
      if (score >= 90) letter = 'O (Outstanding)';
      else if (score >= 80) letter = 'A+ (Excellent)';
      else if (score >= 70) letter = 'A (Very Good)';
      else if (score >= 60) letter = 'B+ (Good)';
      else if (score >= 50) letter = 'B (Above Avg)';
      else if (score >= 40) letter = 'C (Pass)';
      else letter = 'F (Fail)';

      const cgpa = scoreTo10PointCGPA(score);
      return { grade: letter, cgpa };
    }
    case 'gpa_4': {
      let letter = 'F';
      if (score >= 90) letter = 'A';
      else if (score >= 80) letter = 'B+';
      else if (score >= 70) letter = 'B';
      else if (score >= 60) letter = 'C+';
      else if (score >= 50) letter = 'C';
      else if (score >= 40) letter = 'D';
      else letter = 'F';

      const gpa = scoreTo4PointGPA(score);
      return { grade: letter, cgpa: gpa };
    }
    case 'cbse_letter': {
      if (score >= 91) return { grade: 'A1 (Top 1/8th)' };
      if (score >= 81) return { grade: 'A2 (Next 1/8th)' };
      if (score >= 71) return { grade: 'B1' };
      if (score >= 61) return { grade: 'B2' };
      if (score >= 51) return { grade: 'C1' };
      if (score >= 41) return { grade: 'C2' };
      if (score >= 33) return { grade: 'D (Passing)' };
      return { grade: 'E (Essential Repeat)' };
    }
    case 'percentage':
    default: {
      if (score >= 90) return { grade: 'A+' };
      if (score >= 80) return { grade: 'A' };
      if (score >= 70) return { grade: 'B' };
      if (score >= 60) return { grade: 'C' };
      if (score >= 50) return { grade: 'D' };
      if (score >= 33) return { grade: 'E' };
      return { grade: 'F' };
    }
  }
}

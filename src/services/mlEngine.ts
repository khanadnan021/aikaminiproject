import {
  StudentInput,
  PredictionResult,
  SubjectDiagnosis,
  ContributingFactor,
  RiskLevel,
  WhatIfSensitivity,
  AcademicSystemConfig,
} from '../types/index.ts';
import {
  DEFAULT_ACADEMIC_TIERS,
  calculateNormalizedSubjectScore,
  formatGradeByScale,
  scoreTo10PointCGPA,
} from '../data/academicTiers.ts';

export function calculateGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 33) return 'E';
  return 'F';
}

export function determineRiskLevel(riskScore: number): RiskLevel {
  if (riskScore < 25) return 'Low';
  if (riskScore < 50) return 'Moderate';
  if (riskScore < 75) return 'High';
  return 'Critical';
}

function calculateAverage(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
}

function calculateWeightedPastScore(
  pastScores?: number[],
  fallbackAvg = 70
): { avg: number; trend: number; hasPastScores: boolean } {
  if (!pastScores || pastScores.length === 0) {
    return { avg: fallbackAvg, trend: 0, hasPastScores: false };
  }
  if (pastScores.length === 1) {
    return { avg: pastScores[0], trend: 0, hasPastScores: true };
  }

  let totalWeight = 0;
  let weightedSum = 0;
  for (let i = 0; i < pastScores.length; i++) {
    const weight = i + 1;
    weightedSum += pastScores[i] * weight;
    totalWeight += weight;
  }
  const avg = weightedSum / totalWeight;
  const trend = pastScores[pastScores.length - 1] - pastScores[0];
  return { avg, trend, hasPastScores: true };
}

export function runPredictionModel(input: StudentInput): PredictionResult {
  const {
    name,
    studentId,
    attendancePercentage,
    weeklyStudyHours,
    pastScores,
    assignmentCompletionRate,
    sleepHours = 7,
    participationScore = 70,
    subjects = [],
    systemConfig = DEFAULT_ACADEMIC_TIERS.high_school,
  } = input;

  const minAttendance = systemConfig.minAttendanceRequired || 75;
  const passingThreshold = systemConfig.passingThresholdPercentage || 35;

  const rawSubjectBaseline =
    subjects.length > 0
      ? calculateAverage(subjects.map((s) => s.internalScore || 70))
      : 70;

  const { avg: weightedPast, trend, hasPastScores } = calculateWeightedPastScore(pastScores, rawSubjectBaseline);

  // Subject baseline calculation with component normalization
  const subjectScores: number[] = [];
  let totalCredits = 0;
  let creditWeightedSum = 0;

  subjects.forEach((s) => {
    // If component scores exist, compute normalized score, otherwise fallback to internalScore
    const normalizedInternal = calculateNormalizedSubjectScore(s, systemConfig);
    const diffMultiplier = s.difficulty === 'Hard' ? 0.94 : s.difficulty === 'Easy' ? 1.05 : 1.0;
    const internalPart = normalizedInternal * 0.65;
    const practicalPart = (s.practicalScore || 70) * 0.20;
    const attPart = (s.attendancePercentage / 100) * 15;
    const rawSubjectEst = (internalPart + practicalPart + attPart) * diffMultiplier;
    const finalSubScore = Math.min(100, Math.max(0, rawSubjectEst));

    subjectScores.push(finalSubScore);

    const credits = systemConfig.useCreditSystem ? (s.creditHours || 3) : 1;
    creditWeightedSum += finalSubScore * credits;
    totalCredits += credits;
  });

  const subjectAverage =
    subjects.length > 0 && totalCredits > 0
      ? creditWeightedSum / totalCredits
      : weightedPast;

  // ML Multi-factor Model Weights
  let predictedScore =
    0.35 * weightedPast +
    0.30 * subjectAverage +
    0.15 * ((attendancePercentage / 100) * 100) +
    0.12 * Math.min(100, (weeklyStudyHours / 22) * 100) +
    0.08 * assignmentCompletionRate;

  // Non-linear adjustments & Penalties
  const factors: ContributingFactor[] = [];

  // Attendance Impact relative to configured institutional threshold
  if (attendancePercentage < minAttendance - 10) {
    const penalty = 16 * ((minAttendance - attendancePercentage) / 35);
    predictedScore -= penalty;
    factors.push({
      factor: 'Critical Attendance Deficit',
      impact: 'negative',
      scoreDelta: -Math.round(penalty * 10) / 10,
      description: `Attendance of ${attendancePercentage}% is critically below the configured ${minAttendance}% statutory threshold for ${systemConfig.tierDisplayName}.`,
      category: 'Attendance',
    });
  } else if (attendancePercentage < minAttendance) {
    const penalty = 7;
    predictedScore -= penalty;
    factors.push({
      factor: 'Sub-Optimal Attendance Bar',
      impact: 'negative',
      scoreDelta: -penalty,
      description: `Attendance of ${attendancePercentage}% is under the required ${minAttendance}% mark.`,
      category: 'Attendance',
    });
  } else if (attendancePercentage >= 90) {
    const boost = 5.5;
    predictedScore += boost;
    factors.push({
      factor: 'Exemplary Attendance Discipline',
      impact: 'positive',
      scoreDelta: boost,
      description: `High attendance (${attendancePercentage}%) delivers continuous lecture continuity.`,
      category: 'Attendance',
    });
  }

  // Study Hours Impact
  if (weeklyStudyHours < 6) {
    const penalty = 9.5;
    predictedScore -= penalty;
    factors.push({
      factor: 'Insufficient Study Hours',
      impact: 'negative',
      scoreDelta: -penalty,
      description: `Only ${weeklyStudyHours} hrs/week logged. High risk of conceptual lag in syllabus topics.`,
      category: 'Study Habits',
    });
  } else if (weeklyStudyHours >= 16) {
    const boost = Math.min(8.0, 4.0 + (weeklyStudyHours - 16) * 0.4);
    predictedScore += boost;
    factors.push({
      factor: 'Dedicated Self-Study Time',
      impact: 'positive',
      scoreDelta: Math.round(boost * 10) / 10,
      description: `Investing ${weeklyStudyHours} hrs/week enables deep problem-solving and retention.`,
      category: 'Study Habits',
    });
  }

  // Assignment Completion
  if (assignmentCompletionRate < 70) {
    const penalty = 8.0;
    predictedScore -= penalty;
    factors.push({
      factor: 'Incomplete Continuous Work',
      impact: 'negative',
      scoreDelta: -penalty,
      description: `Continuous submission rate is ${assignmentCompletionRate}%. Weak continuous assessment trail.`,
      category: 'Assignments',
    });
  } else if (assignmentCompletionRate >= 92) {
    const boost = 6.0;
    predictedScore += boost;
    factors.push({
      factor: 'Continuous Assessment Excellence',
      impact: 'positive',
      scoreDelta: boost,
      description: `${assignmentCompletionRate}% assignment completion reinforces exam problem recall.`,
      category: 'Assignments',
    });
  }

  // Trend Trajectory (only if explicit past history exists)
  if (hasPastScores && trend <= -8) {
    const penalty = 6.5;
    predictedScore -= penalty;
    factors.push({
      factor: 'Declining Exam Momentum',
      impact: 'negative',
      scoreDelta: -penalty,
      description: `Past test scores show a downward trajectory (${trend > 0 ? `+${trend}` : trend}% drop).`,
      category: 'Past Trajectory',
    });
  } else if (hasPastScores && trend >= 8) {
    const boost = 5.0;
    predictedScore += boost;
    factors.push({
      factor: 'Upward Improvement Trajectory',
      impact: 'positive',
      scoreDelta: boost,
      description: `Exam trends show robust recovery (+${trend}% upward momentum).`,
      category: 'Past Trajectory',
    });
  }

  // Bound predicted score
  predictedScore = Math.max(12, Math.min(99.5, predictedScore));
  predictedScore = Math.round(predictedScore * 10) / 10;

  // Overall Risk Score calibrated with passing threshold
  let rawRisk = 100 - predictedScore;
  if (attendancePercentage < minAttendance) {
    rawRisk += (minAttendance - attendancePercentage) * 0.5;
  }
  if (weeklyStudyHours < 8) {
    rawRisk += (8 - weeklyStudyHours) * 1.5;
  }
  if (assignmentCompletionRate < 70) {
    rawRisk += (70 - assignmentCompletionRate) * 0.35;
  }
  if (predictedScore < passingThreshold + 10) {
    rawRisk += (passingThreshold + 10 - predictedScore) * 0.8;
  }

  const riskScore = Math.max(2, Math.min(98, Math.round(rawRisk)));
  const riskLevel = determineRiskLevel(riskScore);

  // Passing Probability (based on logistic sigmoid around configured passingThreshold)
  const passProb = 1 / (1 + Math.exp(-0.16 * (predictedScore - passingThreshold)));
  const passingProbability = Math.round(Math.min(99.9, Math.max(1.0, passProb * 100)) * 10) / 10;

  // Distinction Probability (>= 75%)
  const distProb = 1 / (1 + Math.exp(-0.18 * (predictedScore - 74)));
  const distinctionProbability = Math.round(Math.min(99.0, Math.max(0.5, distProb * 100)) * 10) / 10;

  // Grade Formatting by active grading scale
  const gradeFormat = formatGradeByScale(predictedScore, systemConfig.gradingScale);

  // Calculate credit-weighted CGPA if degree system
  let predictedCGPA: number | undefined;
  if (systemConfig.useCreditSystem || systemConfig.gradingScale === 'cgpa_10') {
    predictedCGPA = scoreTo10PointCGPA(predictedScore);
  } else if (systemConfig.gradingScale === 'gpa_4') {
    predictedCGPA = gradeFormat.cgpa;
  }

  // Subject Diagnoses & Extra Help Flagging
  const targetBenchmark = Math.max(passingThreshold + 15, 60);

  const subjectDiagnoses: SubjectDiagnosis[] = subjects.map((sub, idx) => {
    const rawSub = subjectScores[idx] !== undefined ? subjectScores[idx] : sub.internalScore;
    const attendanceFactor = (sub.attendancePercentage - minAttendance) * 0.15;
    const studyContribution = (weeklyStudyHours / Math.max(1, subjects.length)) * 1.2;
    let predSubScore = rawSub * 0.65 + sub.internalScore * 0.25 + attendanceFactor + studyContribution;

    if (sub.difficulty === 'Hard') predSubScore -= 4;
    if (sub.difficulty === 'Easy') predSubScore += 3;

    predSubScore = Math.max(15, Math.min(99, Math.round(predSubScore * 10) / 10));
    const subGradeInfo = formatGradeByScale(predSubScore, systemConfig.gradingScale);
    const subRiskScore = Math.max(0, Math.min(100, Math.round(100 - predSubScore)));
    const subRiskLevel = determineRiskLevel(subRiskScore);

    const deficitPoints = Math.max(0, Math.round((targetBenchmark - predSubScore) * 10) / 10);
    const needsExtraHelp =
      predSubScore < passingThreshold + 10 ||
      subRiskLevel === 'High' ||
      subRiskLevel === 'Critical' ||
      sub.attendancePercentage < minAttendance;

    let primaryDeficitReason = 'Performance is stable on track';
    let recommendedIntervention = 'Maintain consistent weekly revision cycles.';
    let suggestedWeeklyHours = 3;

    if (needsExtraHelp) {
      if (sub.attendancePercentage < minAttendance) {
        primaryDeficitReason = `Attendance deficiency (${sub.attendancePercentage}%) below ${minAttendance}% bar causing lecture concept misses.`;
        recommendedIntervention = 'Attend all remedial tutorials and procure lecture notes from missed modules.';
        suggestedWeeklyHours = 5.5;
      } else if (predSubScore < passingThreshold + 5) {
        primaryDeficitReason = `Score (${predSubScore}%) near or below the ${passingThreshold}% passing threshold. Fundamental revision needed.`;
        recommendedIntervention = 'Schedule 1-on-1 teacher doubt-clearing sessions and solve 5 years of past exam papers.';
        suggestedWeeklyHours = 6;
      } else if (sub.difficulty === 'Hard') {
        primaryDeficitReason = `High course complexity combined with insufficient targeted problem-solving time.`;
        recommendedIntervention = 'Increase dedicated weekly problem-solving blocks by at least 2.5 hours; use active recall flashcards.';
        suggestedWeeklyHours = 5;
      } else {
        primaryDeficitReason = `Borderline performance requiring score buffer above the ${targetBenchmark}% target benchmark.`;
        recommendedIntervention = 'Complete pending topical worksheets and join the weekly peer study group.';
        suggestedWeeklyHours = 4;
      }
    }

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      currentInternal: calculateNormalizedSubjectScore(sub, systemConfig),
      predictedFinalScore: predSubScore,
      predictedGrade: subGradeInfo.grade,
      riskLevel: subRiskLevel,
      needsExtraHelp,
      deficitPoints,
      primaryDeficitReason,
      recommendedIntervention,
      suggestedWeeklyHours,
    };
  });

  const subjectsNeedingExtraHelpCount = subjectDiagnoses.filter((s) => s.needsExtraHelp).length;

  // Add worst subject to contributing factors
  const worstSubject = [...subjectDiagnoses].sort((a, b) => a.predictedFinalScore - b.predictedFinalScore)[0];
  if (worstSubject && worstSubject.needsExtraHelp) {
    factors.push({
      factor: `Deficit in ${worstSubject.subjectName}`,
      impact: 'negative',
      scoreDelta: -Math.round(worstSubject.deficitPoints * 0.4 * 10) / 10,
      description: `Predicted score of ${worstSubject.predictedFinalScore}% in ${worstSubject.subjectName} pulls down cumulative average.`,
      category: 'Subject Gap',
    });
  }

  // Sensitivity calculation
  const whatIfSensitivity: WhatIfSensitivity = calculateSensitivity({
    input,
    basePredictedScore: predictedScore,
  });

  return {
    studentId,
    studentName: name || 'Student',
    predictedFinalScore: predictedScore,
    predictedGrade: gradeFormat.grade,
    predictedCGPA,
    passingThreshold,
    systemConfig,
    riskScore,
    riskLevel,
    passingProbability,
    distinctionProbability,
    subjectDiagnoses,
    subjectsNeedingExtraHelpCount,
    contributingFactors: factors,
    whatIfSensitivity,
    calculatedAt: new Date().toISOString(),
  };
}

function calculateSensitivity({
  input,
  basePredictedScore,
}: {
  input: StudentInput;
  basePredictedScore: number;
}): WhatIfSensitivity {
  const plus5HoursInput: StudentInput = {
    ...input,
    weeklyStudyHours: Math.min(98, input.weeklyStudyHours + 5),
  };
  const plus5Result = runPredictionModelWithoutSensitivity(plus5HoursInput);

  const plus10HoursInput: StudentInput = {
    ...input,
    weeklyStudyHours: Math.min(98, input.weeklyStudyHours + 10),
  };
  const plus10Result = runPredictionModelWithoutSensitivity(plus10HoursInput);

  const plus10AttInput: StudentInput = {
    ...input,
    attendancePercentage: Math.min(100, input.attendancePercentage + 10),
    subjects: input.subjects.map((s) => ({
      ...s,
      attendancePercentage: Math.min(100, s.attendancePercentage + 10),
    })),
  };
  const plus10AttResult = runPredictionModelWithoutSensitivity(plus10AttInput);

  const maxAssignInput: StudentInput = {
    ...input,
    assignmentCompletionRate: 100,
  };
  const maxAssignResult = runPredictionModelWithoutSensitivity(maxAssignInput);

  const optimizedInput: StudentInput = {
    ...input,
    attendancePercentage: Math.max(90, input.attendancePercentage + 12),
    weeklyStudyHours: Math.min(98, Math.max(18, input.weeklyStudyHours + 8)),
    assignmentCompletionRate: 98,
    subjects: input.subjects.map((s) => ({
      ...s,
      attendancePercentage: Math.max(90, s.attendancePercentage + 10),
      internalScore: Math.min(100, s.internalScore + 8),
    })),
  };
  const optimizedResult = runPredictionModelWithoutSensitivity(optimizedInput);

  return {
    basePredictedScore,
    plus5StudyHoursScore: plus5Result.predictedFinalScore,
    plus10StudyHoursScore: plus10Result.predictedFinalScore,
    plus10AttendanceScore: plus10AttResult.predictedFinalScore,
    maxAssignmentsScore: maxAssignResult.predictedFinalScore,
    optimizedScenarioScore: optimizedResult.predictedFinalScore,
    optimizedRiskLevel: optimizedResult.riskLevel,
  };
}

function runPredictionModelWithoutSensitivity(input: StudentInput): {
  predictedFinalScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
} {
  const {
    attendancePercentage,
    weeklyStudyHours,
    pastScores,
    assignmentCompletionRate,
    subjects = [],
    systemConfig = DEFAULT_ACADEMIC_TIERS.high_school,
  } = input;

  const minAttendance = systemConfig.minAttendanceRequired || 75;
  const rawSubAvg = subjects.length > 0 ? calculateAverage(subjects.map((s) => s.internalScore || 70)) : 70;
  const { avg: weightedPast } = calculateWeightedPastScore(pastScores, rawSubAvg);

  const subjectAverages =
    subjects.length > 0
      ? calculateAverage(
          subjects.map((s) => {
            const normalized = calculateNormalizedSubjectScore(s, systemConfig);
            const diffMultiplier = s.difficulty === 'Hard' ? 0.94 : s.difficulty === 'Easy' ? 1.05 : 1.0;
            return (normalized * 0.7 + (s.practicalScore || 70) * 0.2 + (s.attendancePercentage / 100) * 10) * diffMultiplier;
          })
        )
      : weightedPast;

  let score =
    0.35 * weightedPast +
    0.30 * subjectAverages +
    0.15 * ((attendancePercentage / 100) * 100) +
    0.12 * Math.min(100, (weeklyStudyHours / 22) * 100) +
    0.08 * assignmentCompletionRate;

  if (attendancePercentage < minAttendance) score -= (minAttendance - attendancePercentage) * 0.35;
  if (attendancePercentage >= 90) score += 5;
  if (weeklyStudyHours < 6) score -= 8;
  if (weeklyStudyHours >= 16) score += 6;
  if (assignmentCompletionRate < 70) score -= 7;
  if (assignmentCompletionRate >= 92) score += 5;

  score = Math.max(15, Math.min(99, Math.round(score * 10) / 10));
  const rawRisk = Math.max(2, Math.min(98, Math.round(100 - score + (attendancePercentage < minAttendance ? 8 : 0))));

  return {
    predictedFinalScore: score,
    riskScore: rawRisk,
    riskLevel: determineRiskLevel(rawRisk),
  };
}

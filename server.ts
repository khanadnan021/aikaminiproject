import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  StudentInput,
  SavedStudentRecord,
  AIDiagnosticReport,
  CohortAnalytics,
  PredictionResult,
} from './src/types/index.ts';
import { runPredictionModel } from './src/services/mlEngine.ts';
import { INITIAL_STUDENTS } from './src/data/sampleStudents.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory student store initialized with rich realistic cohort data
let studentsStore: SavedStudentRecord[] = [...INITIAL_STUDENTS];

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Run ML Prediction Endpoint
app.post('/api/predict', (req: Request, res: Response) => {
  try {
    const studentInput: StudentInput = req.body;
    if (!studentInput) {
      return res.status(400).json({ error: 'Missing student data payload' });
    }

    const prediction = runPredictionModel(studentInput);
    return res.json({ success: true, prediction });
  } catch (err: any) {
    console.error('Prediction calculation error:', err);
    return res.status(500).json({ error: 'Failed to compute prediction', details: err?.message });
  }
});

// 2. AI Pedagogical Diagnostic & Remedial Action Generator (Gemini AI)
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  try {
    const { student, prediction }: { student: StudentInput; prediction: PredictionResult } = req.body;

    if (!student || !prediction) {
      return res.status(400).json({ error: 'Student and prediction data are required' });
    }

    // Weak subjects needing extra help
    const weakSubjects = prediction.subjectDiagnoses
      .filter((s) => s.needsExtraHelp || s.predictedFinalScore < 65)
      .map((s) => `${s.subjectName} (Predicted: ${s.predictedFinalScore}%, Internal: ${s.currentInternal}%, Reason: ${s.primaryDeficitReason})`);

    const prompt = `
You are an expert Senior Educational Data Scientist and Academic Counselor.
Analyze the following student performance and ML risk prediction profile, and formulate a high-impact, empathetic, and actionable pedagogical diagnosis and remedial roadmap.

STUDENT PROFILE:
- Name: ${student.name}
- Grade/Cohort: ${student.gradeLevel || 'Standard'}
- Attendance: ${student.attendancePercentage}% (Institutional Target: >= 75%)
- Weekly Study Hours: ${student.weeklyStudyHours} hours
- Assignment Completion: ${student.assignmentCompletionRate}%
- Past Scores History: [${student.pastScores?.join(', ') || 'N/A'}]
- Sleep Hours: ${student.sleepHours} hrs/night
- Participation Score: ${student.participationScore}%

ML RISK PREDICTION OUTPUT:
- Overall Predicted Final Score: ${prediction.predictedFinalScore}%
- Predicted Letter Grade: ${prediction.predictedGrade}
- Academic Risk Level: ${prediction.riskLevel} (Risk Index: ${prediction.riskScore}/100)
- Passing Probability: ${prediction.passingProbability}%
- Subjects Flagged Needing Extra Help:
  ${weakSubjects.length > 0 ? weakSubjects.join('\n  ') : 'No critically failing subjects, but continuous mastery is needed.'}
- Key ML Negative Drivers: ${prediction.contributingFactors.filter((f) => f.impact === 'negative').map((f) => f.factor).join(', ') || 'None'}

Return ONLY a valid JSON object matching the following structure (no markdown fences, just pure JSON):
{
  "executiveSummary": "A concise 2-3 sentence diagnosis explaining the student's current trajectory and root cause of risk.",
  "pedagogicalProfile": "A detailed 1-paragraph academic assessment examining attendance correlation, self-study discipline, and subject-specific cognitive friction.",
  "keyVulnerabilities": ["Vulnerability 1 with specific metric", "Vulnerability 2", "Vulnerability 3"],
  "immediateActionPlan": [
    {
      "week": "Week 1",
      "focusSubject": "Subject Name",
      "actionItems": ["Specific task 1", "Specific task 2"],
      "allocatedHours": 4
    },
    {
      "week": "Week 2",
      "focusSubject": "Subject Name",
      "actionItems": ["Specific task 1", "Specific task 2"],
      "allocatedHours": 5
    },
    {
      "week": "Week 3",
      "focusSubject": "Subject Name",
      "actionItems": ["Specific task 1", "Specific task 2"],
      "allocatedHours": 4
    },
    {
      "week": "Week 4",
      "focusSubject": "Comprehensive Review",
      "actionItems": ["Mock exam drill", "Error log analysis"],
      "allocatedHours": 6
    }
  ],
  "teacherRecommendation": "Concrete guidance for the class instructor / advisor on how to scaffold this student without inducing anxiety.",
  "studentMotivationAdvice": "Inspiring, psychologically grounded advice addressed directly to the student on building consistency and overcoming hurdles.",
  "recommendedResources": [
    {
      "title": "Resource title (e.g. Worked Problem Worksheets, Video Series)",
      "type": "Practice Sets",
      "subject": "Subject Name"
    },
    {
      "title": "Resource title",
      "type": "Concept Revision",
      "subject": "Subject Name"
    },
    {
      "title": "Resource title",
      "type": "Peer Mentoring",
      "subject": "Subject Name"
    }
  ]
}
`;

    if (!process.env.GEMINI_API_KEY) {
      // Provide an intelligent deterministic pedagogical fallback report
      const fallbackReport: AIDiagnosticReport = generateFallbackDiagnostic(student, prediction);
      return res.json({ success: true, report: fallbackReport, isFallback: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '{}';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const report: AIDiagnosticReport = JSON.parse(cleanJson);

      return res.json({ success: true, report, isFallback: false });
    } catch (aiErr: any) {
      console.warn('Gemini API call failed, generating pedagogical rule fallback:', aiErr?.message);
      const fallbackReport = generateFallbackDiagnostic(student, prediction);
      return res.json({ success: true, report: fallbackReport, isFallback: true, warning: aiErr?.message });
    }
  } catch (err: any) {
    console.error('AI diagnosis error:', err);
    return res.status(500).json({ error: 'Failed to generate diagnostic report', details: err?.message });
  }
});

function generateFallbackDiagnostic(student: StudentInput, prediction: PredictionResult): AIDiagnosticReport {
  const weakSubjects = prediction.subjectDiagnoses.filter((s) => s.needsExtraHelp);
  const primaryWeak = weakSubjects[0] ? weakSubjects[0].subjectName : 'Core Subjects';

  return {
    executiveSummary: `${student.name}'s predicted score of ${prediction.predictedFinalScore}% places them at ${prediction.riskLevel} academic risk. The primary bottleneck is ${student.attendancePercentage < 75 ? `attendance (${student.attendancePercentage}%)` : `study volume (${student.weeklyStudyHours} hrs/wk)`} which requires targeted intervention in ${primaryWeak}.`,
    pedagogicalProfile: `The multivariable analysis confirms that ${student.name} possesses good foundational capability, but consistent knowledge retention is impeded by ${student.attendancePercentage < 75 ? 'frequent lecture absenteeism' : 'irregular self-study rhythms'}. In ${primaryWeak}, internal scores reflect conceptual gaps in higher-order problem-solving rather than rote recall.`,
    keyVulnerabilities: [
      student.attendancePercentage < 75 ? `Attendance gap at ${student.attendancePercentage}% (below 75% minimum statutory threshold)` : 'Study hours under required depth for rigorous coursework',
      `Subject deficit in ${primaryWeak} requiring immediate scaffolded remediation`,
      student.assignmentCompletionRate < 80 ? `Assignment completion lag (${student.assignmentCompletionRate}%) reducing continuous assessment points` : 'Test anxiety and variance in past exam trend scores',
    ],
    immediateActionPlan: [
      {
        week: 'Week 1',
        focusSubject: primaryWeak,
        actionItems: [
          'Audit and complete all missing lecture notes and syllabus outlines',
          'Schedule an introductory 1-on-1 meeting with the course mentor',
        ],
        allocatedHours: 5,
      },
      {
        week: 'Week 2',
        focusSubject: weakSubjects[1] ? weakSubjects[1].subjectName : primaryWeak,
        actionItems: [
          'Solve 25 curated fundamental practice problems with worked step solutions',
          'Implement the Pomodoro technique (45 min focus / 10 min break) for study consistency',
        ],
        allocatedHours: 6,
      },
      {
        week: 'Week 3',
        focusSubject: 'Cross-Subject Reinforcement',
        actionItems: [
          'Form an accountability study pair for weekly assignment completion',
          'Attempt a 60-minute timed sectional quiz under exam conditions',
        ],
        allocatedHours: 6,
      },
      {
        week: 'Week 4',
        focusSubject: 'Exam Simulation & Review',
        actionItems: [
          'Full diagnostic mock exam with in-depth error taxonomy logging',
          'Teacher review session to verify improvement trajectory',
        ],
        allocatedHours: 7,
      },
    ],
    teacherRecommendation: `Offer structured weekly check-ins every Friday. Provide ${student.name} with modular milestone worksheets rather than overwhelming long-term problem sets. Ensure attendance in laboratory tutorials is strictly tracked.`,
    studentMotivationAdvice: `Academic improvement is a muscle built through daily small wins. By recovering attendance and logging just 1.5 focused hours of deliberate practice each day, you can raise your predicted score by over 12 percentage points in 4 weeks.`,
    recommendedResources: [
      {
        title: `${primaryWeak} Step-by-Step Problem Solving Handbook`,
        type: 'Practice Sets',
        subject: primaryWeak,
      },
      {
        title: 'Interactive Conceptual Video Modules & Summary Notes',
        type: 'Concept Revision',
        subject: primaryWeak,
      },
      {
        title: 'Weekly Faculty Doubt-Clearing & Peer Tutorial Circles',
        type: 'Peer Mentoring',
        subject: 'All Subjects',
      },
    ],
  };
}

// 3. Get All Students
app.get('/api/students', (req: Request, res: Response) => {
  res.json({ success: true, students: studentsStore });
});

// 4. Create New Student Record & Predict
app.post('/api/students', (req: Request, res: Response) => {
  try {
    const studentInput: StudentInput = req.body;
    const newId = `std-${Date.now()}`;
    const prediction = runPredictionModel(studentInput);

    const newRecord: SavedStudentRecord = {
      ...studentInput,
      id: newId,
      lastPrediction: prediction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    studentsStore.unshift(newRecord);
    res.status(201).json({ success: true, student: newRecord });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create student', details: err?.message });
  }
});

// 5. Update Student Record
app.put('/api/students/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = studentsStore.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updatedData: Partial<SavedStudentRecord> = req.body;
    const current = studentsStore[index];

    const mergedInput: StudentInput = {
      name: updatedData.name ?? current.name,
      studentId: updatedData.studentId ?? current.studentId,
      gradeLevel: updatedData.gradeLevel ?? current.gradeLevel,
      systemConfig: updatedData.systemConfig ?? current.systemConfig,
      attendancePercentage: updatedData.attendancePercentage ?? current.attendancePercentage,
      weeklyStudyHours: updatedData.weeklyStudyHours ?? current.weeklyStudyHours,
      pastScores: updatedData.pastScores ?? current.pastScores,
      assignmentCompletionRate: updatedData.assignmentCompletionRate ?? current.assignmentCompletionRate,
      sleepHours: updatedData.sleepHours ?? current.sleepHours,
      participationScore: updatedData.participationScore ?? current.participationScore,
      subjects: updatedData.subjects ?? current.subjects,
    };

    const newPrediction = runPredictionModel(mergedInput);

    studentsStore[index] = {
      ...current,
      ...mergedInput,
      lastPrediction: newPrediction,
      lastAiReport: updatedData.lastAiReport ?? current.lastAiReport,
      updatedAt: new Date().toISOString(),
    };

    res.json({ success: true, student: studentsStore[index] });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student', details: err?.message });
  }
});

// 6. Delete Student Record
app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = studentsStore.length;
  studentsStore = studentsStore.filter((s) => s.id !== id);
  if (studentsStore.length === initialLength) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json({ success: true, message: 'Student removed successfully' });
});

// 7. Cohort-Wide Analytics Endpoint
app.get('/api/analytics/cohort', (req: Request, res: Response) => {
  try {
    const total = studentsStore.length;
    if (total === 0) {
      return res.json({
        totalStudents: 0,
        averageAttendance: 0,
        averageStudyHours: 0,
        averagePredictedScore: 0,
        riskDistribution: { low: 0, moderate: 0, high: 0, critical: 0 },
        highRiskStudents: [],
        subjectDifficultyHeatmap: [],
      });
    }

    let sumAttendance = 0;
    let sumStudy = 0;
    let sumScore = 0;
    const riskDist = { low: 0, moderate: 0, high: 0, critical: 0 };
    const highRiskStudents: CohortAnalytics['highRiskStudents'] = [];

    const subjectMap: Record<string, { totalScore: number; count: number; needingHelp: number }> = {};

    studentsStore.forEach((s) => {
      sumAttendance += s.attendancePercentage;
      sumStudy += s.weeklyStudyHours;
      const pred = s.lastPrediction || runPredictionModel(s);
      sumScore += pred.predictedFinalScore;

      if (pred.riskLevel === 'Low') riskDist.low++;
      else if (pred.riskLevel === 'Moderate') riskDist.moderate++;
      else if (pred.riskLevel === 'High') riskDist.high++;
      else if (pred.riskLevel === 'Critical') riskDist.critical++;

      if (pred.riskLevel === 'High' || pred.riskLevel === 'Critical') {
        const critSubs = pred.subjectDiagnoses.filter((sub) => sub.needsExtraHelp).map((sub) => sub.subjectName);
        highRiskStudents.push({
          id: s.id,
          name: s.name,
          riskScore: pred.riskScore,
          riskLevel: pred.riskLevel,
          criticalSubjects: critSubs,
        });
      }

      pred.subjectDiagnoses.forEach((sub) => {
        if (!subjectMap[sub.subjectName]) {
          subjectMap[sub.subjectName] = { totalScore: 0, count: 0, needingHelp: 0 };
        }
        subjectMap[sub.subjectName].totalScore += sub.predictedFinalScore;
        subjectMap[sub.subjectName].count++;
        if (sub.needsExtraHelp) {
          subjectMap[sub.subjectName].needingHelp++;
        }
      });
    });

    const subjectDifficultyHeatmap = Object.entries(subjectMap).map(([subjectName, stats]) => ({
      subjectName,
      averageScore: Math.round((stats.totalScore / stats.count) * 10) / 10,
      studentsNeedingHelp: stats.needingHelp,
      riskRate: Math.round((stats.needingHelp / stats.count) * 100),
    }));

    const analytics: CohortAnalytics = {
      totalStudents: total,
      averageAttendance: Math.round((sumAttendance / total) * 10) / 10,
      averageStudyHours: Math.round((sumStudy / total) * 10) / 10,
      averagePredictedScore: Math.round((sumScore / total) * 10) / 10,
      riskDistribution: riskDist,
      highRiskStudents,
      subjectDifficultyHeatmap,
    };

    res.json({ success: true, analytics });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute cohort analytics', details: err?.message });
  }
});

// 8. Batch Predict / Upload Endpoint
app.post('/api/batch-predict', (req: Request, res: Response) => {
  try {
    const { students }: { students: StudentInput[] } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Students array required' });
    }

    const results = students.map((std, i) => {
      const pred = runPredictionModel(std);
      return {
        index: i,
        studentName: std.name,
        prediction: pred,
      };
    });

    res.json({ success: true, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: 'Batch prediction failed', details: err?.message });
  }
});

// Full-Stack Server & Vite Setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduPredict server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server boot failure:', err);
});

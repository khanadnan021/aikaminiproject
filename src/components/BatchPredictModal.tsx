import React, { useState } from 'react';
import { StudentInput, PredictionResult, SavedStudentRecord } from '../types/index.ts';
import { X, FileSpreadsheet, UploadCloud, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface BatchPredictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBatch: (newStudents: SavedStudentRecord[]) => void;
}

const SAMPLE_CSV_DATA = `Name,StudentId,Grade,Attendance,WeeklyStudyHours,PastScores,AssignmentRate,MathScore,PhysicsScore,ChemistryScore
Daniel Wright,STU-2026-401,Grade 11,54,4,"50, 48",55,42,46,50
Chloe Bennett,STU-2026-402,Grade 11,88,14,"82, 85",92,85,78,82
Noah Garcia,STU-2026-403,Grade 12,68,7,"64, 60",65,58,52,60
Elena Rostova,STU-2026-404,Grade 12,94,20,"90, 92",96,94,88,90
Zack Taylor,STU-2026-405,Grade 11,72,6,"68, 62",70,60,54,64`;

export const BatchPredictModal: React.FC<BatchPredictModalProps> = ({
  isOpen,
  onClose,
  onImportBatch,
}) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_DATA);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewResults, setPreviewResults] = useState<
    { student: StudentInput; prediction: PredictionResult }[] | null
  >(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseAndPredict = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must contain at least 1 header line and 1 data row');
      }

      const parsedStudents: StudentInput[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser handling quotes
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(line)) !== null) {
          if (match.index === regex.lastIndex) regex.lastIndex++;
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          matches.push(val.trim());
        }

        const name = matches[0] || `Student #${i}`;
        const studentId = matches[1] || `STU-CSV-${i}`;
        const gradeLevel = matches[2] || 'Grade 11';
        const attendancePercentage = parseFloat(matches[3]) || 75;
        const weeklyStudyHours = parseFloat(matches[4]) || 8;
        const pastScores = (matches[5] || '65')
          .split(',')
          .map((n) => parseFloat(n.trim()))
          .filter((n) => !isNaN(n));
        const assignmentCompletionRate = parseFloat(matches[6]) || 75;

        const mathScore = parseFloat(matches[7]) || 65;
        const physicsScore = parseFloat(matches[8]) || 60;
        const chemScore = parseFloat(matches[9]) || 62;

        const studentInput: StudentInput = {
          name,
          studentId,
          gradeLevel,
          attendancePercentage,
          weeklyStudyHours,
          pastScores: pastScores.length > 0 ? pastScores : [65],
          assignmentCompletionRate,
          sleepHours: 7,
          participationScore: 70,
          subjects: [
            {
              id: `sub-batch-${i}-1`,
              name: 'Mathematics',
              internalScore: mathScore,
              attendancePercentage,
              difficulty: 'Hard',
              practicalScore: 70,
              creditHours: 4,
            },
            {
              id: `sub-batch-${i}-2`,
              name: 'Physics',
              internalScore: physicsScore,
              attendancePercentage,
              difficulty: 'Hard',
              practicalScore: 65,
              creditHours: 4,
            },
            {
              id: `sub-batch-${i}-3`,
              name: 'Chemistry',
              internalScore: chemScore,
              attendancePercentage,
              difficulty: 'Medium',
              practicalScore: 68,
              creditHours: 3,
            },
          ],
        };

        parsedStudents.push(studentInput);
      }

      // Call backend batch prediction endpoint
      const response = await fetch('/api/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Batch calculation failed on server');
      }

      const combined = parsedStudents.map((std, idx) => ({
        student: std,
        prediction: data.results[idx].prediction,
      }));

      setPreviewResults(combined);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to process CSV data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!previewResults) return;

    const newRecords: SavedStudentRecord[] = previewResults.map((item) => ({
      ...item.student,
      id: `std-batch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lastPrediction: item.prediction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    onImportBatch(newRecords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Student Import & Prediction</h3>
              <p className="text-xs text-slate-400">
                Score an entire class cohort via CSV and identify at-risk students in bulk.
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {!previewResults ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Paste CSV Data</span>
                  <button
                    onClick={() => setCsvText(SAMPLE_CSV_DATA)}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Reset to Default Sample
                  </button>
                </label>
                <textarea
                  rows={8}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleParseAndPredict}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <UploadCloud className="h-4 w-4" />
                  {isProcessing ? 'Running Machine Learning Model...' : 'Parse & Predict Batch'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Successfully Predicted {previewResults.length} Students
                </span>
                <button
                  onClick={() => setPreviewResults(null)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Edit CSV
                </button>
              </div>

              {/* Preview Table */}
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 sticky top-0 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3 text-center">Att.</th>
                      <th className="py-2.5 px-3 text-center">Study</th>
                      <th className="py-2.5 px-3 text-center">Predicted</th>
                      <th className="py-2.5 px-3 text-center">Risk</th>
                      <th className="py-2.5 px-3">Weak Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {previewResults.map((item, idx) => {
                      const weak = item.prediction.subjectDiagnoses
                        .filter((d) => d.needsExtraHelp)
                        .map((d) => d.subjectName);

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3">
                            <span className="font-bold text-white">{item.student.name}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.student.studentId}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.student.attendancePercentage}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.student.weeklyStudyHours}h
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-white">
                            {item.prediction.predictedFinalScore}% (
                            {item.prediction.predictedGrade})
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.prediction.riskLevel === 'Critical'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : item.prediction.riskLevel === 'High'
                                  ? 'bg-orange-500/20 text-orange-300'
                                  : item.prediction.riskLevel === 'Moderate'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {item.prediction.riskLevel}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-300">
                            {weak.length > 0 ? (
                              <span className="text-rose-400 font-medium">
                                {weak.join(', ')}
                              </span>
                            ) : (
                              <span className="text-emerald-400">None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPreviewResults(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <ArrowRight className="h-4 w-4" /> Import {previewResults.length} Students to
                  Cohort
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

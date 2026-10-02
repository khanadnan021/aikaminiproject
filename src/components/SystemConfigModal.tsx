import React, { useState } from 'react';
import { AcademicSystemConfig, AcademicTier, GradingScaleType, AssessmentComponentDef } from '../types/index.ts';
import { DEFAULT_ACADEMIC_TIERS, TIER_DEFAULT_SUBJECTS } from '../data/academicTiers.ts';
import {
  X,
  Settings,
  GraduationCap,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  School,
  Building2,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: AcademicSystemConfig;
  onApplyConfig: (newConfig: AcademicSystemConfig, loadDefaultSubjects: boolean) => void;
}

export const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
}) => {
  const [selectedTier, setSelectedTier] = useState<AcademicTier>(currentConfig.tier);
  const [tierDisplayName, setTierDisplayName] = useState(currentConfig.tierDisplayName);
  const [gradingScale, setGradingScale] = useState<GradingScaleType>(currentConfig.gradingScale);
  const [passingThreshold, setPassingThreshold] = useState(currentConfig.passingThresholdPercentage);
  const [minAttendance, setMinAttendance] = useState(currentConfig.minAttendanceRequired);
  const [useCreditSystem, setUseCreditSystem] = useState(currentConfig.useCreditSystem);
  const [components, setComponents] = useState<AssessmentComponentDef[]>([...currentConfig.components]);
  const [loadDefaultSubjects, setLoadDefaultSubjects] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSelectTierPreset = (tier: AcademicTier) => {
    setSelectedTier(tier);
    const preset = DEFAULT_ACADEMIC_TIERS[tier];
    setTierDisplayName(preset.tierDisplayName);
    setGradingScale(preset.gradingScale);
    setPassingThreshold(preset.passingThresholdPercentage);
    setMinAttendance(preset.minAttendanceRequired);
    setUseCreditSystem(preset.useCreditSystem);
    setComponents([...preset.components]);
  };

  const handleComponentChange = (id: string, field: keyof AssessmentComponentDef, value: any) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleAddComponent = () => {
    if (components.length >= 4) return;
    const newComp: AssessmentComponentDef = {
      id: `comp-${Date.now()}`,
      name: 'Continuous Evaluation',
      maxMarks: 25,
      weightPercentage: 25,
    };
    setComponents((prev) => [...prev, newComp]);
  };

  const handleRemoveComponent = (id: string) => {
    if (components.length <= 1) return;
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    const updatedConfig: AcademicSystemConfig = {
      tier: selectedTier,
      tierDisplayName,
      gradingScale,
      passingThresholdPercentage: passingThreshold,
      minAttendanceRequired: minAttendance,
      useCreditSystem,
      components,
    };
    onApplyConfig(updatedConfig, loadDefaultSubjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Customize Academic Evaluation System
              </h3>
              <p className="text-xs text-slate-400">
                Tailor the assessment criteria for Middle School, 12th Board, or University Degree.
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Preset Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Academic Tier & Evaluation Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Preset 1: School 1st - 9th Standard */}
              <button
                type="button"
                onClick={() => handleSelectTierPreset('middle_school')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedTier === 'middle_school'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <School className="h-4 w-4 text-cyan-400" />
                    School (1st – 9th)
                  </span>
                  {selectedTier === 'middle_school' && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">1st to 9th Standard</p>
                <div className="mt-2 text-[10px] text-slate-300 space-y-0.5">
                  <div>• Unit Tests (50) + Notebooks (20)</div>
                  <div>• Passing Mark: 35%</div>
                  <div>• CBSE Letter / Percentage</div>
                </div>
              </button>

              {/* Preset 2: High School / 12th Board */}
              <button
                type="button"
                onClick={() => handleSelectTierPreset('high_school')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedTier === 'high_school'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    High School
                  </span>
                  {selectedTier === 'high_school' && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">10th / 12th Standard Board</p>
                <div className="mt-2 text-[10px] text-slate-300 space-y-0.5">
                  <div>• Theory Exam (80) + Practical (20)</div>
                  <div>• Passing Mark: 33%</div>
                  <div>• Standard Board % Marks</div>
                </div>
              </button>

              {/* Preset 3: University / Degree College */}
              <button
                type="button"
                onClick={() => handleSelectTierPreset('university')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedTier === 'university'
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    University Degree
                  </span>
                  {selectedTier === 'university' && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400">B.Tech / B.Sc / B.Com / MBA</p>
                <div className="mt-2 text-[10px] text-slate-300 space-y-0.5">
                  <div>• End-Sem (60) + Mid-Sem (20) + Lab (20)</div>
                  <div>• 10.0 CGPA Scale + Course Credits</div>
                  <div>• Passing Mark: 40%</div>
                </div>
              </button>
            </div>
          </div>

          {/* System Name & Scale Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                System Display Name
              </label>
              <input
                type="text"
                value={tierDisplayName}
                onChange={(e) => {
                  setTierDisplayName(e.target.value);
                  setSelectedTier('custom');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Grading / Scoring Scale
              </label>
              <select
                value={gradingScale}
                onChange={(e) => {
                  setGradingScale(e.target.value as GradingScaleType);
                  setSelectedTier('custom');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="percentage">Percentage (0 - 100% with Standard Letter Grades)</option>
                <option value="cgpa_10">10-Point CGPA (O, A+, A, B+, B, C, P, F)</option>
                <option value="gpa_4">4.0 GPA Scale (US / International Standard)</option>
                <option value="cbse_letter">CBSE Secondary Grades (A1, A2, B1, B2, C1, C2, D, E)</option>
              </select>
            </div>
          </div>

          {/* Passing Threshold & Attendance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
              <label className="block text-slate-300 font-medium mb-1">
                Minimum Passing Benchmark
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="20"
                  max="60"
                  value={passingThreshold}
                  onChange={(e) => {
                    setPassingThreshold(parseInt(e.target.value) || 35);
                    setSelectedTier('custom');
                  }}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white text-center"
                />
                <span className="text-slate-400 font-semibold">% marks</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                33% (10th/12th Board), 35% (School 1st–9th), 40% (College)
              </p>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
              <label className="block text-slate-300 font-medium mb-1">
                Statutory Attendance Requirement
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="90"
                  value={minAttendance}
                  onChange={(e) => {
                    setMinAttendance(parseInt(e.target.value) || 75);
                    setSelectedTier('custom');
                  }}
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white text-center"
                />
                <span className="text-slate-400 font-semibold">% min</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Institutional bar before penalties & debarment
              </p>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Course Credit System
                </label>
                <p className="text-[10px] text-slate-400">
                  Weight courses by credit hours (e.g. 4 credits, 3 credits)
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={useCreditSystem}
                  onChange={(e) => {
                    setUseCreditSystem(e.target.checked);
                    setSelectedTier('custom');
                  }}
                  className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-white font-medium">Enable Subject Credits</span>
              </label>
            </div>
          </div>

          {/* Assessment Components Breakdown Configuration */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Subject Marks Components (Customizable Columns)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Define the exact assessment columns appearing in the subject table and their max marks.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddComponent}
                disabled={components.length >= 4}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-all flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Component
              </button>
            </div>

            <div className="space-y-2">
              {components.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center gap-3"
                >
                  <span className="text-[10px] font-bold text-slate-400 w-5 text-center">
                    #{idx + 1}
                  </span>

                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400">Component Name</label>
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => {
                        handleComponentChange(comp.id, 'name', e.target.value);
                        setSelectedTier('custom');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] text-slate-400">Max Marks</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={comp.maxMarks}
                      onChange={(e) => {
                        handleComponentChange(comp.id, 'maxMarks', parseInt(e.target.value) || 100);
                        setSelectedTier('custom');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-center font-bold"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[10px] text-slate-400">Weight %</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={comp.weightPercentage}
                      onChange={(e) => {
                        handleComponentChange(comp.id, 'weightPercentage', parseInt(e.target.value) || 50);
                        setSelectedTier('custom');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white text-center font-bold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveComponent(comp.id)}
                    disabled={components.length <= 1}
                    className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20 transition-colors mt-3"
                    title="Remove component"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Option to load standard subjects for this tier */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white">Load default subjects for this level</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically populate standard courses typical for {tierDisplayName}.
              </p>
            </div>
            <input
              type="checkbox"
              checked={loadDefaultSubjects}
              onChange={(e) => setLoadDefaultSubjects(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" /> Apply System Scheme
          </button>
        </div>
      </div>
    </div>
  );
};

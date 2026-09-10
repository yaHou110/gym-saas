import React, { useState } from 'react';
import { Language, FitnessGoal } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Sparkles,
  Dumbbell,
  ClipboardCheck,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
} from 'lucide-react';

interface AICoachAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AICoachAssistantModal: React.FC<AICoachAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = translations[language];

  const [activeMode, setActiveMode] = useState<'workout' | 'checkin' | 'macro'>('workout');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // Workout Generator Form State
  const [goal, setGoal] = useState<FitnessGoal>('Hypertrophy');
  const [experience, setExperience] = useState('Intermediate');
  const [days, setDays] = useState(4);
  const [injuries, setInjuries] = useState('Mild right shoulder impingement when dipping');
  const [equipment, setEquipment] = useState('Commercial Gym with Barbells, Dumbbells, Cables, and Machines');

  // Macro Form State
  const [weightKg, setWeightKg] = useState(84);
  const [heightCm, setHeightCm] = useState(182);
  const [age, setAge] = useState(27);
  const [gender, setGender] = useState('male');

  if (!isOpen) return null;

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    setResultData(null);
    try {
      const res = await fetch('/api/ai/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          experienceLevel: experience,
          daysPerWeek: days,
          injuries,
          equipment,
          lang: language,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResultData(json.data);
      }
    } catch (err) {
      console.warn('AI Workout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateMacros = async () => {
    setIsLoading(true);
    setResultData(null);
    try {
      const res = await fetch('/api/ai/calculate-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg,
          heightCm,
          age,
          gender,
          goal,
          lang: language,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResultData(json.data);
      }
    } catch (err) {
      console.warn('Macro calc error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.aiCoach.title}
              </h2>
              <p className="text-xs text-slate-400">
                {t.aiCoach.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveMode('workout');
              setResultData(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeMode === 'workout'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>{t.aiCoach.workoutMode}</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('macro');
              setResultData(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeMode === 'macro'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t.aiCoach.macroMode}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeMode === 'workout' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hypertrophy">Hypertrophy (Mass Gain)</option>
                    <option value="Strength & Power">Strength &amp; Power</option>
                    <option value="Fat Loss">Fat Loss &amp; Cut</option>
                    <option value="Athletic Conditioning">Athletic Conditioning</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Training Age</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner (&lt;1 yr)</option>
                    <option value="Intermediate">Intermediate (1-3 yrs)</option>
                    <option value="Advanced">Advanced (3-6 yrs)</option>
                    <option value="Elite">Elite (6+ yrs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Injuries, Joint Stress or Specific Restrictions
                </label>
                <input
                  type="text"
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Available Equipment</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                id="generate-ai-workout-submit-btn"
                onClick={handleGenerateWorkout}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? t.aiCoach.generating : t.aiCoach.generateBtn}</span>
              </button>
            </div>
          )}

          {activeMode === 'macro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Metabolic Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Hypertrophy">Hypertrophy (Lean Bulk +12% Surplus)</option>
                  <option value="Fat Loss">Fat Loss (Deficit -20%)</option>
                  <option value="Strength & Power">Strength &amp; Power (+8% Surplus)</option>
                </select>
              </div>

              <button
                id="calculate-ai-macro-submit-btn"
                onClick={handleCalculateMacros}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>{isLoading ? 'Computing Metabolic Equations...' : 'Calculate Optimal Macro Split'}</span>
              </button>
            </div>
          )}

          {/* Generated Result Container */}
          {resultData && (
            <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Sports Science Engine Output
                </span>
                <button
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(resultData, null, 2))}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              </div>

              {activeMode === 'workout' && (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-white">{resultData.title}</h4>
                    <p className="text-xs text-slate-400">{resultData.focus}</p>
                  </div>

                  {resultData.warmup && (
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-emerald-400 font-bold block mb-0.5">Warm-up:</span>
                      <span className="text-slate-300">{resultData.warmup}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {resultData.exercises?.map((ex: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{ex.name}</span>
                          <span className="text-slate-400">
                            {ex.sets} sets × {ex.reps} reps • Rest: {ex.restSeconds}s
                          </span>
                          {ex.cues && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Cue: {ex.cues}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-emerald-400 font-bold">
                          RPE {ex.rpe}
                        </span>
                      </div>
                    ))}
                  </div>

                  {resultData.coachNotes && (
                    <p className="text-xs text-slate-400 italic">
                      Rationale: {resultData.coachNotes}
                    </p>
                  )}
                </div>
              )}

              {activeMode === 'macro' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Target Calories</span>
                      <span className="text-lg font-black text-amber-400">{resultData.targetCalories}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Protein</span>
                      <span className="text-lg font-black text-emerald-400">{resultData.proteinGrams}g</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Carbohydrates</span>
                      <span className="text-lg font-black text-sky-400">{resultData.carbsGrams}g</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Fats</span>
                      <span className="text-lg font-black text-rose-400">{resultData.fatsGrams}g</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>Baseline Basal Metabolic Rate (BMR):</span>
                    <strong className="text-white">{resultData.bmr} kcal</strong>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>Recommended Daily Hydration:</span>
                    <strong className="text-sky-400">{resultData.waterMl} ml</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

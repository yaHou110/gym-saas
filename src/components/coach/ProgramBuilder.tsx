import React, { useState } from 'react';
import {
  TrainingProgram,
  WorkoutSession,
  WorkoutExercise,
  Exercise,
  Athlete,
  Language,
  FitnessGoal,
} from '../../types';
import { translations } from '../../i18n/translations';
import {
  Plus,
  Trash2,
  Sparkles,
  Save,
  Clock,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ProgramBuilderProps {
  program?: TrainingProgram | null;
  exercises: Exercise[];
  athletes: Athlete[];
  language: Language;
  onSaveProgram: (program: TrainingProgram) => void;
  onOpenAICoach: () => void;
  onClose: () => void;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({
  program: initialProgram,
  exercises,
  athletes,
  language,
  onSaveProgram,
  onOpenAICoach,
  onClose,
}) => {
  const t = translations[language];

  const [title, setTitle] = useState(initialProgram?.title || '4-Week Hypertrophy Mesocycle');
  const [goal, setGoal] = useState<FitnessGoal>(initialProgram?.goal || 'Hypertrophy');
  const [durationWeeks, setDurationWeeks] = useState(initialProgram?.durationWeeks || 4);
  const [daysPerWeek, setDaysPerWeek] = useState(initialProgram?.daysPerWeek || 4);
  const [assignedAthleteId, setAssignedAthleteId] = useState<string>(initialProgram?.athleteId || 'athlete-1');
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMuscle, setPickerMuscle] = useState('all');

  const [sessions, setSessions] = useState<WorkoutSession[]>(
    initialProgram?.sessions || [
      {
        id: `sess-${Date.now()}-1`,
        programId: 'new-prog',
        dayOfWeek: 1,
        name: 'Day 1: Upper Body Power & Chest',
        nameFa: 'روز ۱: بالا تنه قدرت و سینه',
        focus: 'Chest, Back & Shoulders',
        focusFa: 'سینه، پشت و سرشانه',
        warmupNotes: 'Band pull-aparts, thoracic extensions, rotator cuff work.',
        warmupNotesFa: 'فیس‌پول با کش، کشش قفسه سینه و گرم کردن روتاتور کاف.',
        cooldownNotes: 'Doorway pectoral stretch and lat hangs.',
        cooldownNotesFa: 'کشش عضلات سینه و بارفیکس آویزان.',
        estimatedMinutes: 60,
        exercises: [
          {
            id: `we-${Date.now()}-1`,
            exerciseId: 'ex-3',
            exerciseName: 'Flat Barbell Bench Press',
            exerciseNameFa: 'پرس سینه با هالتر روی نیمکت صاف',
            targetMuscle: 'Chest',
            restSeconds: 120,
            tempo: '3-0-1-0',
            notes: 'Pause 1s on chest. Drive through legs.',
            sets: [
              { id: 's1', setNumber: 1, targetReps: 6, targetWeightKg: 90, targetRpe: 8, isCompleted: false },
              { id: 's2', setNumber: 2, targetReps: 6, targetWeightKg: 90, targetRpe: 8.5, isCompleted: false },
              { id: 's3', setNumber: 3, targetReps: 6, targetWeightKg: 90, targetRpe: 9, isCompleted: false },
            ],
          },
        ],
      },
      {
        id: `sess-${Date.now()}-2`,
        programId: 'new-prog',
        dayOfWeek: 2,
        name: 'Day 2: Lower Body Quad Focus',
        nameFa: 'روز ۲: پایین تنه - تمرکز چهارسر',
        focus: 'Quads, Calves & Core',
        focusFa: 'چهارسر ران، ساق و عضلات میان‌تنه',
        warmupNotes: 'Agile 8 warm-up and hip mobility flow.',
        warmupNotesFa: 'فلوی متحرک لگن و مچ پا و اسکوات با وزن بدن.',
        cooldownNotes: 'Hamstring stretch and foam roll quads.',
        cooldownNotesFa: 'کشش عضلات همسترینگ و فوم رول چهارسر.',
        estimatedMinutes: 65,
        exercises: [
          {
            id: `we-${Date.now()}-2`,
            exerciseId: 'ex-1',
            exerciseName: 'Barbell Back Squat',
            exerciseNameFa: 'اسکوات با هالتر از پشت',
            targetMuscle: 'Quads',
            restSeconds: 150,
            tempo: '3-1-1-0',
            notes: 'Break parallel with upright torso.',
            sets: [
              { id: 's4', setNumber: 1, targetReps: 6, targetWeightKg: 135, targetRpe: 8, isCompleted: false },
              { id: 's5', setNumber: 2, targetReps: 6, targetWeightKg: 135, targetRpe: 8.5, isCompleted: false },
              { id: 's6', setNumber: 3, targetReps: 6, targetWeightKg: 135, targetRpe: 9, isCompleted: false },
            ],
          },
        ],
      },
    ]
  );

  const currentSession = sessions[activeSessionIndex] || sessions[0];

  const handleAddSession = () => {
    const newSessionNumber = sessions.length + 1;
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      programId: initialProgram?.id || 'prog-new',
      dayOfWeek: newSessionNumber,
      name: `Day ${newSessionNumber}: Training Session`,
      nameFa: `روز ${newSessionNumber}: جلسه تمرینی`,
      focus: 'General Training',
      focusFa: 'تمرین عمومی',
      warmupNotes: 'Standard 5-min dynamic warm-up.',
      warmupNotesFa: '۵ دقیقه گرم کردن پویا.',
      cooldownNotes: '10-min light stretching.',
      cooldownNotesFa: '۱۰ دقیقه کشش ایستا.',
      estimatedMinutes: 60,
      exercises: [],
    };
    setSessions([...sessions, newSession]);
    setActiveSessionIndex(sessions.length);
  };

  const handleRemoveSession = (index: number) => {
    if (sessions.length <= 1) return;
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    setActiveSessionIndex(Math.max(0, index - 1));
  };

  const handleAddExerciseToSession = (exercise: Exercise) => {
    const newWe: WorkoutExercise = {
      id: `we-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseNameFa: exercise.nameFa,
      targetMuscle: exercise.targetMuscle,
      restSeconds: 90,
      tempo: '2-0-1-0',
      notes: exercise.tips || '',
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, targetReps: 10, targetWeightKg: 50, targetRpe: 8, isCompleted: false },
        { id: `s-${Date.now()}-2`, setNumber: 2, targetReps: 10, targetWeightKg: 50, targetRpe: 8, isCompleted: false },
        { id: `s-${Date.now()}-3`, setNumber: 3, targetReps: 10, targetWeightKg: 50, targetRpe: 8.5, isCompleted: false },
      ],
    };

    const updatedSessions = [...sessions];
    updatedSessions[activeSessionIndex].exercises.push(newWe);
    setSessions(updatedSessions);
    setIsExercisePickerOpen(false);
  };

  const handleRemoveExercise = (weIndex: number) => {
    const updatedSessions = [...sessions];
    updatedSessions[activeSessionIndex].exercises.splice(weIndex, 1);
    setSessions(updatedSessions);
  };

  const handleAddSet = (weIndex: number) => {
    const updatedSessions = [...sessions];
    const targetExercise = updatedSessions[activeSessionIndex].exercises[weIndex];
    const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
    const newSetNumber = targetExercise.sets.length + 1;
    targetExercise.sets.push({
      id: `s-${Date.now()}-${newSetNumber}`,
      setNumber: newSetNumber,
      targetReps: lastSet ? lastSet.targetReps : 10,
      targetWeightKg: lastSet ? lastSet.targetWeightKg : 50,
      targetRpe: lastSet ? lastSet.targetRpe : 8,
      isCompleted: false,
    });
    setSessions(updatedSessions);
  };

  const handleRemoveSet = (weIndex: number, setIdx: number) => {
    const updatedSessions = [...sessions];
    const targetExercise = updatedSessions[activeSessionIndex].exercises[weIndex];
    if (targetExercise.sets.length <= 1) return;
    targetExercise.sets.splice(setIdx, 1);
    // Renumber
    targetExercise.sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });
    setSessions(updatedSessions);
  };

  const handleUpdateSet = (
    weIndex: number,
    setIdx: number,
    field: 'targetReps' | 'targetWeightKg' | 'targetRpe',
    value: number
  ) => {
    const updatedSessions = [...sessions];
    updatedSessions[activeSessionIndex].exercises[weIndex].sets[setIdx][field] = value;
    setSessions(updatedSessions);
  };

  const handleSave = () => {
    const newProgram: TrainingProgram = {
      id: initialProgram?.id || `prog-${Date.now()}`,
      coachId: 'coach-1',
      athleteId: assignedAthleteId || undefined,
      title,
      titleFa: title,
      description: `Periodized ${goal} plan for ${durationWeeks} weeks, ${daysPerWeek} days/week.`,
      descriptionFa: `برنامه تخصصی ${goal} برای دوره ${durationWeeks} هفته‌ای با ${daysPerWeek} جلسه در هفته.`,
      goal,
      durationWeeks,
      daysPerWeek,
      level: 'Advanced',
      macrocyclePhase: 'Hypertrophy Block',
      sessions,
      isTemplate: !assignedAthleteId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSaveProgram(newProgram);
    onClose();
  };

  const filteredExercisesForPicker = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.nameFa.includes(pickerSearch);
    const matchesMuscle = pickerMuscle === 'all' || ex.targetMuscle === pickerMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>{t.programBuilder.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {t.programBuilder.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="prog-ai-btn"
            onClick={onOpenAICoach}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.programBuilder.generateWithAI}</span>
          </button>
          <button
            id="prog-save-btn"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{t.programBuilder.saveProgram}</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition"
          >
            {t.common.cancel}
          </button>
        </div>
      </div>

      {/* Program Metadata Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {t.programBuilder.programTitle}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {t.programBuilder.goal}
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as FitnessGoal)}
            className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Hypertrophy">Hypertrophy (Muscle Growth)</option>
            <option value="Strength & Power">Strength &amp; Power</option>
            <option value="Fat Loss">Fat Loss &amp; Conditioning</option>
            <option value="Athletic Conditioning">Athletic Conditioning</option>
            <option value="Rehab & Mobility">Rehab &amp; Mobility</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {t.programBuilder.duration}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={16}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-400 whitespace-nowrap">Weeks</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {t.programBuilder.assignToAthlete}
          </label>
          <select
            value={assignedAthleteId}
            onChange={(e) => setAssignedAthleteId(e.target.value)}
            className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Save as Reusable Template</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {language === 'fa' ? a.nameFa : a.name} ({a.goal})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Day Sessions Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {sessions.map((sess, idx) => {
          const isActive = activeSessionIndex === idx;
          return (
            <button
              key={sess.id}
              onClick={() => setActiveSessionIndex(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'fa' ? sess.nameFa : sess.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {sess.exercises.length} ex
              </span>
            </button>
          );
        })}
        <button
          id="add-day-btn"
          onClick={handleAddSession}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold whitespace-nowrap transition"
        >
          <Plus className="w-4 h-4" />
          <span>{t.programBuilder.addSession}</span>
        </button>
      </div>

      {/* Current Session Editor */}
      {currentSession && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6">
          {/* Session Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={currentSession.name}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[activeSessionIndex].name = e.target.value;
                  setSessions(updated);
                }}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none w-full"
              />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Focus:</span>
                <input
                  type="text"
                  value={currentSession.focus}
                  onChange={(e) => {
                    const updated = [...sessions];
                    updated[activeSessionIndex].focus = e.target.value;
                    setSessions(updated);
                  }}
                  className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-200 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="open-ex-picker-btn"
                onClick={() => setIsExercisePickerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.programBuilder.addExercise}</span>
              </button>
              {sessions.length > 1 && (
                <button
                  onClick={() => handleRemoveSession(activeSessionIndex)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                  title="Remove this training day"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Warmup & Cooldown Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-emerald-400 block mb-1">
                Warm-up Protocol
              </label>
              <input
                type="text"
                value={currentSession.warmupNotes}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[activeSessionIndex].warmupNotes = e.target.value;
                  setSessions(updated);
                }}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none"
                placeholder="Specific warm-up cues..."
              />
            </div>
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Cooldown / Decompression
              </label>
              <input
                type="text"
                value={currentSession.cooldownNotes}
                onChange={(e) => {
                  const updated = [...sessions];
                  updated[activeSessionIndex].cooldownNotes = e.target.value;
                  setSessions(updated);
                }}
                className="w-full bg-transparent text-xs text-slate-300 focus:outline-none"
                placeholder="Stretches & mobility..."
              />
            </div>
          </div>

          {/* Exercises List in Session */}
          <div className="space-y-4">
            {currentSession.exercises.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  No exercises added to this training day yet.
                </p>
                <button
                  onClick={() => setIsExercisePickerOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Select from 30+ Exercise Library
                </button>
              </div>
            ) : (
              currentSession.exercises.map((we, weIdx) => (
                <div
                  key={we.id}
                  className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4 space-y-3"
                >
                  {/* Exercise Title Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                        {weIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {language === 'fa' ? we.exerciseNameFa : we.exerciseName}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-slate-700 text-slate-300">
                            {we.targetMuscle}
                          </span>
                        </div>
                        {we.notes && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            Cue: {we.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{we.restSeconds}s rest</span>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(weIdx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                          <th className="py-2 px-2 w-12">{t.workoutRunner.set}</th>
                          <th className="py-2 px-2 w-28">{t.workoutRunner.logReps}</th>
                          <th className="py-2 px-2 w-28">{t.workoutRunner.logWeight}</th>
                          <th className="py-2 px-2 w-20">{t.common.rpe}</th>
                          <th className="py-2 px-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {we.sets.map((set, sIdx) => (
                          <tr key={set.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-2 font-bold text-slate-300">
                              #{set.setNumber}
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={set.targetReps}
                                onChange={(e) =>
                                  handleUpdateSet(weIdx, sIdx, 'targetReps', Number(e.target.value))
                                }
                                className="w-20 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-white font-semibold focus:outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="0.5"
                                min={0}
                                max={400}
                                value={set.targetWeightKg}
                                onChange={(e) =>
                                  handleUpdateSet(
                                    weIdx,
                                    sIdx,
                                    'targetWeightKg',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-white font-semibold focus:outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="py-2 px-2">
                              <input
                                type="number"
                                step="0.5"
                                min={5}
                                max={10}
                                value={set.targetRpe || 8}
                                onChange={(e) =>
                                  handleUpdateSet(weIdx, sIdx, 'targetRpe', Number(e.target.value))
                                }
                                className="w-16 bg-slate-900 px-2 py-1 rounded border border-slate-700 text-white font-semibold focus:outline-none focus:border-emerald-500"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              {we.sets.length > 1 && (
                                <button
                                  onClick={() => handleRemoveSet(weIdx, sIdx)}
                                  className="text-slate-500 hover:text-rose-400"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    onClick={() => handleAddSet(weIdx)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 py-1"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    Add Set
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {t.programBuilder.searchExercise}
                </h3>
                <p className="text-xs text-slate-400">
                  Select an exercise to add to {currentSession?.name}
                </p>
              </div>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={t.common.search}
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="flex-1 bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <select
                value={pickerMuscle}
                onChange={(e) => setPickerMuscle(e.target.value)}
                className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Muscle Groups</option>
                <option value="Chest">Chest</option>
                <option value="Back">Back</option>
                <option value="Quads">Quads</option>
                <option value="Hamstrings">Hamstrings</option>
                <option value="Shoulders">Shoulders</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Core">Core</option>
              </select>
            </div>

            {/* Exercise List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-800">
              {filteredExercisesForPicker.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  className="pt-2 first:pt-0 p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                        {language === 'fa' ? ex.nameFa : ex.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {ex.targetMuscle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {ex.equipment} • {language === 'fa' ? ex.instructionsFa : ex.instructions}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    + Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

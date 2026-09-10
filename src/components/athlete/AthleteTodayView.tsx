import React, { useState, useEffect, useRef } from 'react';
import {
  WorkoutSession,
  WorkoutExercise,
  WorkoutSet,
  Language,
  Athlete,
} from '../../types';
import { translations } from '../../i18n/translations';
import {
  Play,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Award,
  ChevronRight,
  ChevronLeft,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface AthleteTodayViewProps {
  session: WorkoutSession;
  athlete: Athlete;
  language: Language;
  onFinishSession: (
    sessionId: string,
    feedback: { sessionRpe: number; energyLevel: number; enjoymentRating: number; notes: string }
  ) => void;
  onOpenCheckInModal: () => void;
}

export const AthleteTodayView: React.FC<AthleteTodayViewProps> = ({
  session: initialSession,
  athlete,
  language,
  onFinishSession,
  onOpenCheckInModal,
}) => {
  const t = translations[language];

  const [session, setSession] = useState<WorkoutSession>(initialSession);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Rest Timer State
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(90);

  // Feedback Modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [sessionRpe, setSessionRpe] = useState(8);
  const [energyRating, setEnergyRating] = useState(8);
  const [athleteNotes, setAthleteNotes] = useState('');
  const [isCelebrationActive, setIsCelebrationActive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio tone synthesizer for timer alerts & set completions
  const playBeep = (freq = 600, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Timer countdown loop
  useEffect(() => {
    if (isTimerRunning && restSecondsRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setRestSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isTimerRunning && restSecondsRemaining === 0) {
      setIsTimerRunning(false);
      playBeep(880, 0.3); // High celebratory beep when rest expires
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setTimerTotalDuration(seconds);
    setRestSecondsRemaining(seconds);
    setIsTimerRunning(true);
  };

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    const updated = { ...session };
    const targetSet = updated.exercises[exIdx].sets[setIdx];
    const willBeCompleted = !targetSet.isCompleted;
    targetSet.isCompleted = willBeCompleted;

    // Fill actuals if not set
    if (willBeCompleted) {
      if (!targetSet.actualReps) targetSet.actualReps = targetSet.targetReps;
      if (!targetSet.actualWeightKg) targetSet.actualWeightKg = targetSet.targetWeightKg;
      playBeep(520, 0.12);

      // Trigger rest timer
      const restSec = updated.exercises[exIdx].restSeconds || 90;
      startRestTimer(restSec);
    }

    setSession(updated);
  };

  const handleUpdateActuals = (
    exIdx: number,
    setIdx: number,
    field: 'actualReps' | 'actualWeightKg',
    value: number
  ) => {
    const updated = { ...session };
    updated.exercises[exIdx].sets[setIdx][field] = value;
    setSession(updated);
  };

  const totalSetsCount = session.exercises.reduce(
    (acc, curr) => acc + curr.sets.length,
    0
  );
  const completedSetsCount = session.exercises.reduce(
    (acc, curr) => acc + curr.sets.filter((s) => s.isCompleted).length,
    0
  );
  const progressPercent = Math.round(
    (completedSetsCount / (totalSetsCount || 1)) * 100
  );

  const currentExercise: WorkoutExercise | undefined =
    session.exercises[currentExerciseIndex];

  const handleFinishConfirm = () => {
    setIsCelebrationActive(true);
    setShowFinishModal(false);
    setIsWorkoutActive(false);
    playBeep(800, 0.4);

    onFinishSession(session.id, {
      sessionRpe,
      energyLevel: energyRating,
      enjoymentRating: 9,
      notes: athleteNotes,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Celebration Banner if finished */}
      {isCelebrationActive && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-2xl text-slate-950 shadow-xl shadow-emerald-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black">
                {t.workoutRunner.workoutFinishedSuccess}
              </h3>
              <p className="text-xs sm:text-sm font-medium opacity-90">
                {t.workoutRunner.workoutSummary}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-950 text-emerald-400 text-xs font-bold">
            Streak: {athlete.currentStreakDays + 1} Days 🔥
          </span>
        </div>
      )}

      {/* Top Session Overview Card */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" />
            <span>{t.athleteDashboard.todaySessionTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {language === 'fa' ? session.nameFa : session.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
            <span>Focus: <strong className="text-slate-200">{language === 'fa' ? session.focusFa : session.focus}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ~{session.estimatedMinutes} mins
            </span>
            <span>•</span>
            <span>{session.exercises.length} Movements ({totalSetsCount} sets)</span>
          </div>
        </div>

        {/* Start / Finish Controls */}
        <div className="flex items-center gap-3">
          {!isWorkoutActive && !session.isCompleted ? (
            <button
              id="start-workout-session-btn"
              onClick={() => setIsWorkoutActive(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.athleteDashboard.startWorkout}</span>
            </button>
          ) : isWorkoutActive ? (
            <button
              id="finish-workout-session-btn"
              onClick={() => setShowFinishModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.workoutRunner.finishWorkout}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.athleteDashboard.completedToday}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warmup & Cooldown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-emerald-400 block mb-1">
            Pre-Workout Activation
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'fa' ? session.warmupNotesFa : session.warmupNotes}
          </p>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-400 block mb-1">
            Post-Workout Cooldown
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {language === 'fa' ? session.cooldownNotesFa : session.cooldownNotes}
          </p>
        </div>
      </div>

      {/* Progress Bar during active workout */}
      {isWorkoutActive && (
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Overall Session Volume Progress</span>
              <span className="font-bold text-emerald-400">
                {completedSetsCount} / {totalSetsCount} Sets ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Float Bar when active */}
      {restSecondsRemaining > 0 && (
        <div className="bg-slate-900/95 border-2 border-emerald-500/60 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">
                {t.workoutRunner.restTimer}
              </span>
              <div className="text-2xl font-black text-white tracking-widest font-mono">
                {formatTime(restSecondsRemaining)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSecondsRemaining((prev) => prev + 30)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
            >
              {t.workoutRunner.add30s}
            </button>
            <button
              onClick={() => setRestSecondsRemaining((prev) => Math.max(0, prev - 15))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
            >
              {t.workoutRunner.minus15s}
            </button>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setRestSecondsRemaining(0);
                setIsTimerRunning(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold"
            >
              {t.workoutRunner.skipRest}
            </button>
          </div>
        </div>
      )}

      {/* Exercises Execution Cards */}
      <div className="space-y-4">
        {session.exercises.map((we, exIdx) => {
          const isSelected = !isWorkoutActive || currentExerciseIndex === exIdx;
          return (
            <div
              key={we.id}
              className={`bg-slate-900 rounded-2xl border transition-all p-5 sm:p-6 ${
                isSelected
                  ? 'border-slate-700 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-slate-800/80 opacity-80'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-sm flex items-center justify-center border border-emerald-500/20 shrink-0">
                    {exIdx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {language === 'fa' ? we.exerciseNameFa : we.exerciseName}
                      </h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {we.targetMuscle}
                      </span>
                      {we.tempo && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                          Tempo: {we.tempo}
                        </span>
                      )}
                    </div>
                    {we.notes && (
                      <p className="text-xs text-slate-400 mt-1">
                        Coach Cue: {we.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60 self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Rest: {we.restSeconds}s</span>
                </div>
              </div>

              {/* Sets Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <th className="py-2.5 px-3 w-14">{t.workoutRunner.set}</th>
                      <th className="py-2.5 px-3">{t.workoutRunner.target}</th>
                      <th className="py-2.5 px-3 w-32">{t.workoutRunner.logWeight}</th>
                      <th className="py-2.5 px-3 w-28">{t.workoutRunner.logReps}</th>
                      <th className="py-2.5 px-3 w-20">{t.common.rpe}</th>
                      <th className="py-2.5 px-3 text-center w-20">{t.workoutRunner.checkDone}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {we.sets.map((set, setIdx) => {
                      return (
                        <tr
                          key={set.id}
                          className={`transition ${
                            set.isCompleted ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="py-3 px-3 font-bold text-slate-300">
                            #{set.setNumber}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-xs">
                            <span className="font-semibold text-slate-200">
                              {set.targetReps} reps
                            </span>{' '}
                            @ {set.targetWeightKg} kg{' '}
                            {set.targetRpe && (
                              <span className="text-slate-500">
                                (RPE {set.targetRpe})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                value={set.actualWeightKg ?? set.targetWeightKg}
                                onChange={(e) =>
                                  handleUpdateActuals(
                                    exIdx,
                                    setIdx,
                                    'actualWeightKg',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                              />
                              <span className="text-xs text-slate-400">kg</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={set.actualReps ?? set.targetReps}
                              onChange={(e) =>
                                handleUpdateActuals(
                                  exIdx,
                                  setIdx,
                                  'actualReps',
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="py-3 px-3 text-xs font-semibold text-slate-300">
                            {set.targetRpe || 8}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              id={`set-check-btn-${exIdx}-${setIdx}`}
                              onClick={() => handleToggleSet(exIdx, setIdx)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                                set.isCompleted
                                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-500 border border-slate-700'
                              }`}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Session Feedback Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">
                {t.workoutRunner.feedbackPrompt}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Your coach will review your rate of perceived exertion and log notes.
              </p>
            </div>

            {/* RPE Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>{t.workoutRunner.sessionRpe}</span>
                <span className="font-extrabold text-emerald-400">{sessionRpe} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={sessionRpe}
                onChange={(e) => setSessionRpe(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>{t.workoutRunner.energyRating}</span>
                <span className="font-extrabold text-teal-400">{energyRating} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={energyRating}
                onChange={(e) => setEnergyRating(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>

            {/* Notes to coach */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Athlete Session Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={athleteNotes}
                onChange={(e) => setAthleteNotes(e.target.value)}
                placeholder="Felt great on bench press, slight shoulder fatigue on last set..."
                className="w-full bg-slate-800 text-xs text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {t.common.cancel}
              </button>
              <button
                id="submit-session-feedback-btn"
                onClick={handleFinishConfirm}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
              >
                {t.workoutRunner.saveFeedback}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

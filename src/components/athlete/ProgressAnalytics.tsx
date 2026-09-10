import React, { useState } from 'react';
import { PersonalRecord, Athlete, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Trophy,
  TrendingUp,
  Activity,
  Flame,
  Award,
  Plus,
  Dumbbell,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface ProgressAnalyticsProps {
  prs: PersonalRecord[];
  athlete: Athlete;
  language: Language;
  onAddPR: (pr: PersonalRecord) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  prs,
  athlete,
  language,
  onAddPR,
}) => {
  const t = translations[language];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState('Barbell Back Squat');
  const [weightKg, setWeightKg] = useState(170);
  const [reps, setReps] = useState(3);

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    const est1rm = Math.round(weightKg * (1 + reps / 30));
    const newPR: PersonalRecord = {
      id: `pr-${Date.now()}`,
      athleteId: athlete.id,
      exerciseName,
      weightKg: Number(weightKg),
      reps: Number(reps),
      estimatedOneRepMax: est1rm,
      achievedDate: new Date().toISOString().split('T')[0],
    };
    onAddPR(newPR);
    setIsAddModalOpen(false);
  };

  // Sample weekly tonnage progression for visual chart
  const weeklyTonnage = [
    { week: 'W1', tonnage: 24200, label: 'Base' },
    { week: 'W2', tonnage: 26800, label: '+10%' },
    { week: 'W3', tonnage: 28900, label: '+8%' },
    { week: 'W4', tonnage: 19400, label: 'Deload' },
    { week: 'W5', tonnage: 30200, label: 'Meso 2' },
    { week: 'W6', tonnage: 32400, label: 'Current' },
  ];
  const maxTonnage = Math.max(...weeklyTonnage.map((w) => w.tonnage));

  // Weight progression records
  const weightTrend = [
    { date: 'Aug 01', weight: 83.8 },
    { date: 'Aug 08', weight: 84.1 },
    { date: 'Aug 15', weight: 84.2 },
    { date: 'Aug 22', weight: 84.3 },
    { date: 'Aug 29', weight: 84.5 },
    { date: 'Sep 07', weight: 84.6 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{t.analytics.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {language === 'fa' ? athlete.nameFa : athlete.name} - Athletic Trajectory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t.analytics.subtitle}
          </p>
        </div>

        <button
          id="log-new-pr-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log New Personal Record</span>
        </button>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Tonnage Volume Bar Chart */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t.analytics.volumeTrend}
              </h3>
              <p className="text-xs text-slate-400">
                Sum of (Sets × Reps × Load in kg) across mesocycle
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              Peak: 32.4 tons
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-44 pt-6 px-2">
            {weeklyTonnage.map((item) => {
              const heightPercent = Math.round((item.tonnage / maxTonnage) * 100);
              return (
                <div key={item.week} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(item.tonnage / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-slate-800/80 rounded-t-xl overflow-hidden h-28 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{item.week}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bodyweight Trendline */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                {t.analytics.weightTrend}
              </h3>
              <p className="text-xs text-slate-400">
                Controlled surplus rate: +0.8kg over past 6 weeks
              </p>
            </div>
            <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
              Goal: {athlete.targetWeightKg} kg
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {weightTrend.map((row) => (
              <div
                key={row.date}
                className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{row.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-white text-sm">
                    {row.weight} kg
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    On track
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Records (PR) Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              {t.analytics.personalRecords} ({prs.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Est. 1RM calculated via Sports Science Epley/Brzycki equation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 bg-slate-900/50">
                <th className="py-3 px-4">{t.analytics.exercise}</th>
                <th className="py-3 px-4">{t.analytics.bestWeight}</th>
                <th className="py-3 px-4">{t.common.reps}</th>
                <th className="py-3 px-4 text-emerald-400">{t.analytics.estimated1RM}</th>
                <th className="py-3 px-4 text-slate-400">{t.analytics.dateAchieved}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {prs.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-400" />
                    <span>{pr.exerciseName}</span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-white">
                    {pr.weightKg} kg
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">
                    {pr.reps} reps
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                    ~{pr.estimatedOneRepMax} kg
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                    {pr.achievedDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badges & Milestones */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Active Milestones &amp; Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">18-Day Streak</span>
              <span className="text-[10px] text-slate-400">Zero skipped sessions</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">94% Compliance</span>
              <span className="text-[10px] text-slate-400">Elite tier adherent</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Century Squat</span>
              <span className="text-[10px] text-slate-400">165kg for reps achieved</span>
            </div>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Volume King</span>
              <span className="text-[10px] text-slate-400">30,000+ kg weekly load</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add PR Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Log New Personal Record</h3>
            <form onSubmit={handleSavePR} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Exercise</label>
                <input
                  type="text"
                  required
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reps Completed</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-full bg-slate-800 text-sm text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
                <span className="text-slate-400">Estimated 1RM:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {Math.round(weightKg * (1 + reps / 30))} kg
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition"
                >
                  Record PR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

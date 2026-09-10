import React, { useState } from 'react';
import { Athlete, CheckIn, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Scale,
  Moon,
  Zap,
  Activity,
  Upload,
  Send,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface CheckInSubmitModalProps {
  athlete: Athlete;
  language: Language;
  onSubmit: (checkIn: CheckIn) => void;
  onClose: () => void;
}

export const CheckInSubmitModal: React.FC<CheckInSubmitModalProps> = ({
  athlete,
  language,
  onSubmit,
  onClose,
}) => {
  const t = translations[language];

  const [weightKg, setWeightKg] = useState<number>(athlete.weightKg || 84.6);
  const [waistCm, setWaistCm] = useState<number>(81.5);
  const [chestCm, setChestCm] = useState<number>(108.0);
  const [hipsCm, setHipsCm] = useState<number>(99.0);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [sorenessRating, setSorenessRating] = useState<number>(5);
  const [energyRating, setEnergyRating] = useState<number>(8);
  const [adherenceRate, setAdherenceRate] = useState<number>(92);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCheckIn: CheckIn = {
      id: `chk-${Date.now()}`,
      athleteId: athlete.id,
      coachId: athlete.assignedCoachId,
      date: new Date().toISOString().split('T')[0],
      status: 'pending_review',
      weightKg: Number(weightKg),
      waistCm: Number(waistCm),
      chestCm: Number(chestCm),
      hipsCm: Number(hipsCm),
      sleepHours: Number(sleepHours),
      sleepQuality: Number(sleepQuality),
      stressLevel: Number(stressLevel),
      sorenessRating: Number(sorenessRating),
      energyRating: Number(energyRating),
      adherenceRate: Number(adherenceRate),
      athleteNotes: notes || 'Weekly training completed smoothly according to protocol.',
      frontPhotoUrl: photoUrl,
    };
    onSubmit(newCheckIn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t.checkIns.submitNew}
            </h2>
            <p className="text-xs text-slate-400">
              Log your physiological markers and recovery data for Coach review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Weight & Measurements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              Weight &amp; Tape Circumference (cm)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <label className="text-xs text-slate-400 block mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <label className="text-xs text-slate-400 block mb-1">
                  Waist (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <label className="text-xs text-slate-400 block mb-1">
                  Chest (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={chestCm}
                  onChange={(e) => setChestCm(Number(e.target.value))}
                  className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <label className="text-xs text-slate-400 block mb-1">
                  Hips (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={hipsCm}
                  onChange={(e) => setHipsCm(Number(e.target.value))}
                  className="w-full bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Biofeedback Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              {t.checkIns.biofeedback}
            </h3>

            {/* Sleep Quality */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{t.checkIns.sleepQuality} (1-10)</span>
                <span className="font-bold text-indigo-400">{sleepQuality} / 10 ({sleepHours} hrs)</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Stress & Soreness in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t.checkIns.stressLevel} (1-10)</span>
                  <span className="font-bold text-amber-400">{stressLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t.checkIns.soreness} (1-10)</span>
                  <span className="font-bold text-rose-400">{sorenessRating} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={sorenessRating}
                  onChange={(e) => setSorenessRating(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            {/* Adherence */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{t.checkIns.adherence} (%)</span>
                <span className="font-bold text-emerald-400">{adherenceRate}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={adherenceRate}
                onChange={(e) => setAdherenceRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Notes &amp; Subjective Experience for Coach
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did training feel this week? Any aches, joint stress, or nutrition challenges?"
              className="w-full bg-slate-800 text-xs sm:text-sm text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Progress Photo Simulator */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Physique Check-In Photo (Optional)
            </label>
            <div className="flex items-center gap-4">
              <img
                src={photoUrl}
                alt="Preview"
                className="w-16 h-20 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="flex-1">
                <span className="text-xs text-slate-300 block mb-1">
                  Simulate Camera / Image Upload
                </span>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
                  placeholder="https://image-url..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              id="submit-athlete-checkin-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Check-In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

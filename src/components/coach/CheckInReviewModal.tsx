import React, { useState } from 'react';
import { CheckIn, Athlete, Language } from '../../types';
import { translations } from '../../i18n/translations';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Scale,
  Moon,
  Zap,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';

interface CheckInReviewModalProps {
  checkIn: CheckIn;
  athlete?: Athlete;
  language: Language;
  onSaveReview: (
    checkInId: string,
    commentary: string,
    actionItems: string[],
    macroAdjustment?: string,
    volumeAdjustment?: string
  ) => void;
  onClose: () => void;
}

export const CheckInReviewModal: React.FC<CheckInReviewModalProps> = ({
  checkIn,
  athlete,
  language,
  onSaveReview,
  onClose,
}) => {
  const t = translations[language];

  const [commentary, setCommentary] = useState(checkIn.coachReview?.commentary || '');
  const [actionItems, setActionItems] = useState<string[]>(
    checkIn.coachReview?.actionItems || [
      'Advance Bench Press target weight by +2.5kg',
      'Increase hydration by 500ml on leg days',
      'Prioritize 8 hours of sleep for central nervous recovery',
    ]
  );
  const [newActionItem, setNewActionItem] = useState('');
  const [macroAdjustment, setMacroAdjustment] = useState(
    checkIn.coachReview?.macroAdjustmentNotes || 'Keep calories steady at 3,150 kcal. Surplus rate is optimal.'
  );
  const [volumeAdjustment, setVolumeAdjustment] = useState(
    checkIn.coachReview?.volumeAdjustmentNotes || 'Progress flat bench to 4 sets of 8 reps.'
  );
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    setActionItems([...actionItems, newActionItem.trim()]);
    setNewActionItem('');
  };

  const handleRemoveActionItem = (idx: number) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  const handleAIAnalyze = async () => {
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/ai/analyze-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteName: athlete?.name || 'Athlete',
          currentWeight: checkIn.weightKg,
          previousWeight: 84.3,
          sleepScore: checkIn.sleepQuality,
          stressScore: checkIn.stressLevel,
          sorenessScore: checkIn.sorenessRating,
          complianceRate: checkIn.adherenceRate,
          notes: checkIn.athleteNotes,
          lang: language,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        if (d.suggestedCoachFeedback) setCommentary(d.suggestedCoachFeedback);
        if (d.recommendedActionItems && Array.isArray(d.recommendedActionItems)) {
          setActionItems(d.recommendedActionItems);
        }
        if (d.weightDeltaAssessment) setMacroAdjustment(d.weightDeltaAssessment);
      }
    } catch (err) {
      console.warn('AI analysis error:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmit = () => {
    onSaveReview(checkIn.id, commentary, actionItems, macroAdjustment, volumeAdjustment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            {athlete?.avatar && (
              <img
                src={athlete.avatar}
                alt={athlete.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {t.checkIns.title} - {language === 'fa' ? athlete?.nameFa : athlete?.name}
                </h2>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  checkIn.status === 'reviewed'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {checkIn.status === 'reviewed' ? t.checkIns.statusReviewed : t.checkIns.statusPending}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submitted on: {checkIn.date} • Goal: {athlete?.goal}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Weight */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                {t.common.weight}
              </span>
              <div className="text-lg font-extrabold text-white mt-1">
                {checkIn.weightKg} kg
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">+0.3 kg / week</span>
            </div>

            {/* Sleep Quality */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                {t.checkIns.sleepQuality}
              </span>
              <div className="text-lg font-extrabold text-indigo-300 mt-1">
                {checkIn.sleepQuality} / 10
              </div>
              <span className="text-[10px] text-slate-400">{checkIn.sleepHours} hrs / night</span>
            </div>

            {/* Stress & Soreness */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                {t.checkIns.soreness}
              </span>
              <div className="text-lg font-extrabold text-amber-300 mt-1">
                {checkIn.sorenessRating} / 10
              </div>
              <span className="text-[10px] text-slate-400">Stress: {checkIn.stressLevel}/10</span>
            </div>

            {/* Adherence */}
            <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                {t.checkIns.adherence}
              </span>
              <div className="text-lg font-extrabold text-emerald-400 mt-1">
                {checkIn.adherenceRate}%
              </div>
              <span className="text-[10px] text-emerald-400/90 font-bold">High Compliance</span>
            </div>
          </div>

          {/* Athlete Subjective Notes */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Athlete Reflection &amp; Biofeedback
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              "{checkIn.athleteNotes}"
            </p>
          </div>

          {/* Progress Photo Preview */}
          {checkIn.frontPhotoUrl && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Visual Physique Check
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-1">
                <div className="relative group rounded-xl overflow-hidden border border-slate-700 w-32 h-44 shrink-0">
                  <img
                    src={checkIn.frontPhotoUrl}
                    alt="Front Check-in"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[10px] text-white p-1 text-center font-bold">
                    Front Pose
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistance Trigger */}
          <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-teal-950/40 via-emerald-950/30 to-slate-900 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block">
                  AI Biofeedback Analyzer
                </span>
                <span className="text-[11px] text-slate-400">
                  Synthesize sleep, stress, and tonnage trends into suggested coach action items.
                </span>
              </div>
            </div>
            <button
              id="ai-analyze-checkin-btn"
              onClick={handleAIAnalyze}
              disabled={isAnalyzingAI}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-sm transition whitespace-nowrap"
            >
              {isAnalyzingAI ? 'Analyzing...' : 'Auto-Draft Feedback'}
            </button>
          </div>

          {/* Coach Review & Feedback Form */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t.checkIns.coachFeedbackTitle}
            </h3>

            {/* Commentary Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Direct Message to Athlete
              </label>
              <textarea
                rows={3}
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder={t.checkIns.writeFeedback}
                className="w-full bg-slate-800 text-xs sm:text-sm text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            {/* Action Items */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t.checkIns.actionItems}
              </label>
              <div className="space-y-2 mb-2">
                {actionItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-2 rounded-lg text-xs text-slate-200 border border-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </span>
                    <button
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActionItem()}
                  placeholder="Add another tactical action item..."
                  className="flex-1 bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddActionItem}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Adjustments: Macros & Volume */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.checkIns.macroAdjustment}
                </label>
                <input
                  type="text"
                  value={macroAdjustment}
                  onChange={(e) => setMacroAdjustment(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.checkIns.volumeAdjustment}
                </label>
                <input
                  type="text"
                  value={volumeAdjustment}
                  onChange={(e) => setVolumeAdjustment(e.target.value)}
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            {t.common.cancel}
          </button>
          <button
            id="submit-coach-review-btn"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.checkIns.submitReview}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

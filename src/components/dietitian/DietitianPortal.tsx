import React, { useState } from 'react';
import { Athlete, CheckIn, DailyNutritionPlan, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { NutritionTracker } from '../athlete/NutritionTracker';
import { Users, Apple, ClipboardCheck, Target, TrendingDown, TrendingUp } from 'lucide-react';

interface DietitianPortalProps {
  athletes: Athlete[];
  nutritionPlans: Record<string, DailyNutritionPlan>;
  checkIns: CheckIn[];
  activeTab: string;
  language: Language;
  onUpdatePlan: (plan: DailyNutritionPlan) => void;
  onOpenAICoach: () => void;
  onNavigateToNutrition: () => void;
}

export const DietitianPortal: React.FC<DietitianPortalProps> = ({
  athletes,
  nutritionPlans,
  checkIns,
  activeTab,
  language,
  onUpdatePlan,
  onOpenAICoach,
  onNavigateToNutrition,
}) => {
  const t = translations[language];
  const [selectedId, setSelectedId] = useState<string>(athletes[0]?.id || '');
  const selected = athletes.find((a) => a.id === selectedId) || athletes[0];
  // This athlete's plan only — derived from the per-athlete map; no shared object.
  const nutritionPlan = nutritionPlans[selected?.id];

  // ============ DIETITIAN NUTRITION ============
  if (activeTab === 'nutrition' && selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <Apple className="w-4 h-4 text-emerald-400 shrink-0" />
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                a.id === selected.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {language === 'fa' ? a.nameFa : a.name}
            </button>
          ))}
        </div>
        <NutritionTracker
          key={selected.id}
          plan={nutritionPlan}
          athlete={selected}
          language={language}
          onUpdatePlan={onUpdatePlan}
          onOpenAICoach={onOpenAICoach}
        />
      </div>
    );
  }

  // ============ DIETITIAN ROSTER (nutrition-focused) ============
  if (activeTab === 'roster') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h1 className="text-xl sm:text-2xl font-black text-white">{t.dietitian.rosterTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.nutrition.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {athletes.map((a) => {
            const delta = a.weightKg - a.targetWeightKg;
            const gaining = delta < 0;
            return (
              <div key={a.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-black text-white">
                        {language === 'fa' ? a.nameFa : a.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{a.goal}</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {a.experienceLevel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.common.weight}</span>
                    <span className="font-black text-white">{a.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'fa' ? 'هدف' : 'Target'}</span>
                    <span className="font-black text-slate-300">{a.targetWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'fa' ? 'فاصله' : 'Delta'}</span>
                    <span className={`font-black inline-flex items-center gap-1 ${gaining ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {gaining ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(delta).toFixed(1)} kg
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.coachDashboard.avgCompliance}: <strong className="text-slate-200">{a.complianceRate}%</strong></span>
                  <button
                    onClick={() => {
                      setSelectedId(a.id);
                      onNavigateToNutrition();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    {t.nutrition.editPlan} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============ DIETITIAN CHECK-INS (biofeedback feed) ============
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-3">
        <ClipboardCheck className="w-6 h-6 text-emerald-400" />
        <h1 className="text-xl sm:text-2xl font-black text-white">{t.checkIns.title}</h1>
      </div>

      {checkIns.length === 0 ? (
        <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 text-center text-sm text-slate-500">
          {t.checkIns.statusPending}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkIns.map((chk) => {
            const ath = athletes.find((a) => a.id === chk.athleteId);
            return (
              <div key={chk.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ath && <img src={ath.avatar} alt={ath.name} className="w-7 h-7 rounded-full object-cover" />}
                    <span className="text-sm font-bold text-white">
                      {ath ? (language === 'fa' ? ath.nameFa : ath.name) : chk.athleteId}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{chk.date}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.checkIns.sleepQuality}</span>
                    <span className="font-black text-indigo-300">{chk.sleepQuality}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.checkIns.stressLevel}</span>
                    <span className="font-black text-rose-300">{chk.stressLevel}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t.checkIns.soreness}</span>
                    <span className="font-black text-amber-300">{chk.sorenessRating}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{language === 'fa' ? 'پایبندی' : 'Adherence'}</span>
                    <span className="font-black text-emerald-400">{chk.adherenceRate}%</span>
                  </div>
                </div>

                {chk.athleteNotes && (
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">"{chk.athleteNotes}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

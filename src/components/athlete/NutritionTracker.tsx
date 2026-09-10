import React, { useState } from 'react';
import { DailyNutritionPlan, Language, Athlete } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Apple,
  Droplets,
  Flame,
  CheckCircle2,
  Plus,
  Sparkles,
  Utensils,
  Clock,
  Beef,
  Wheat,
  PieChart,
} from 'lucide-react';

interface NutritionTrackerProps {
  plan: DailyNutritionPlan;
  athlete: Athlete;
  language: Language;
  onUpdatePlan: (plan: DailyNutritionPlan) => void;
  onOpenAICoach: () => void;
}

export const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  plan: initialPlan,
  athlete,
  language,
  onUpdatePlan,
  onOpenAICoach,
}) => {
  const t = translations[language];
  const [plan, setPlan] = useState<DailyNutritionPlan>(initialPlan);

  // Compute consumed totals from completed meals
  const consumed = plan.meals
    .filter((m) => m.isCompleted)
    .reduce(
      (acc, meal) => {
        meal.items.forEach((item) => {
          acc.calories += item.calories;
          acc.protein += item.protein;
          acc.carbs += item.carbs;
          acc.fats += item.fats;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

  const targets = plan.targets;

  const handleToggleMeal = (mealIndex: number) => {
    const updated = { ...plan };
    updated.meals[mealIndex].isCompleted = !updated.meals[mealIndex].isCompleted;
    setPlan(updated);
    onUpdatePlan(updated);
  };

  const handleAddWater = (ml: number) => {
    const updated = { ...plan };
    updated.waterLoggedMl = Math.min(6000, (updated.waterLoggedMl || 0) + ml);
    setPlan(updated);
    onUpdatePlan(updated);
  };

  const caloriePercent = Math.min(100, Math.round((consumed.calories / (targets.calories || 1)) * 100));
  const proteinPercent = Math.min(100, Math.round((consumed.protein / (targets.proteinGrams || 1)) * 100));
  const carbsPercent = Math.min(100, Math.round((consumed.carbs / (targets.carbsGrams || 1)) * 100));
  const fatsPercent = Math.min(100, Math.round((consumed.fats / (targets.fatsGrams || 1)) * 100));
  const waterPercent = Math.min(100, Math.round((plan.waterLoggedMl / (targets.waterMl || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Apple className="w-4 h-4" />
            <span>{t.nutrition.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {language === 'fa' ? athlete.nameFa : athlete.name} - Macro Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Target Goal: <strong className="text-slate-200">{athlete.goal}</strong> • {t.nutrition.subtitle}
          </p>
        </div>

        <button
          id="nutrition-ai-btn"
          onClick={onOpenAICoach}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.nutrition.generateAIPlan}</span>
        </button>
      </div>

      {/* Macro Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              {t.common.calories}
            </span>
            <span className="text-xs font-bold text-amber-400">{caloriePercent}%</span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {consumed.calories}{' '}
            <span className="text-xs font-medium text-slate-400">/ {targets.calories} kcal</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Protein */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-emerald-400" />
              {t.common.protein}
            </span>
            <span className="text-xs font-bold text-emerald-400">{proteinPercent}%</span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {consumed.protein}g{' '}
            <span className="text-xs font-medium text-slate-400">/ {targets.proteinGrams}g</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-sky-400" />
              {t.common.carbs}
            </span>
            <span className="text-xs font-bold text-sky-400">{carbsPercent}%</span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {consumed.carbs}g{' '}
            <span className="text-xs font-medium text-slate-400">/ {targets.carbsGrams}g</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${carbsPercent}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-rose-400" />
              {t.common.fats}
            </span>
            <span className="text-xs font-bold text-rose-400">{fatsPercent}%</span>
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {consumed.fats}g{' '}
            <span className="text-xs font-medium text-slate-400">/ {targets.fatsGrams}g</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${fatsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hydration Tracker */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">
              {t.nutrition.waterTracker}
            </span>
            <div className="text-lg font-black text-white mt-0.5">
              {plan.waterLoggedMl} ml{' '}
              <span className="text-xs text-slate-400">/ {targets.waterMl} ml ({waterPercent}%)</span>
            </div>
            <div className="w-40 sm:w-60 bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="log-water-250-btn"
            onClick={() => handleAddWater(250)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+250ml</span>
          </button>
          <button
            onClick={() => handleAddWater(500)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+500ml Bottle</span>
          </button>
        </div>
      </div>

      {/* Planned Meals Breakdown */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {t.nutrition.mealsTitle} ({plan.meals.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Check off meals as consumed to update live daily intake
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {plan.meals.map((meal, mIdx) => {
            const mealCals = meal.items.reduce((sum, item) => sum + item.calories, 0);
            const mealProtein = meal.items.reduce((sum, item) => sum + item.protein, 0);
            const mealCarbs = meal.items.reduce((sum, item) => sum + item.carbs, 0);
            const mealFats = meal.items.reduce((sum, item) => sum + item.fats, 0);

            return (
              <div
                key={meal.id}
                className={`p-5 transition ${
                  meal.isCompleted ? 'bg-slate-900/40' : 'hover:bg-slate-800/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      id={`meal-check-btn-${meal.id}`}
                      onClick={() => handleToggleMeal(mIdx)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition shrink-0 ${
                        meal.isCompleted
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm sm:text-base ${
                          meal.isCompleted ? 'text-slate-400 line-through' : 'text-white'
                        }`}>
                          {language === 'fa' ? meal.nameFa : meal.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.timeHint}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto">
                    <span><strong className="text-white">{mealCals}</strong> kcal</span>
                    <span>•</span>
                    <span>P: <strong className="text-emerald-400">{mealProtein}g</strong></span>
                    <span>•</span>
                    <span>C: <strong className="text-sky-400">{mealCarbs}g</strong></span>
                    <span>•</span>
                    <span>F: <strong className="text-rose-400">{mealFats}g</strong></span>
                  </div>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pl-10">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-xs"
                    >
                      <div className="font-semibold text-slate-200">
                        {language === 'fa' ? item.nameFa : item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>{item.portion}</span>
                        <span className="font-medium text-slate-300">{item.calories} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

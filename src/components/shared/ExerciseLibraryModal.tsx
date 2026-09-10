import React, { useState } from 'react';
import { Exercise, Language, MuscleGroup } from '../../types';
import { translations } from '../../i18n/translations';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Play,
  Dumbbell,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface ExerciseLibraryModalProps {
  exercises: Exercise[];
  language: Language;
  onAddExercise: (exercise: Exercise) => void;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  exercises,
  language,
  onAddExercise,
}) => {
  const t = translations[language];

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Exercise Form
  const [name, setName] = useState('');
  const [nameFa, setNameFa] = useState('');
  const [targetMuscle, setTargetMuscle] = useState<MuscleGroup>('Chest');
  const [equipment, setEquipment] = useState('Barbell');
  const [category, setCategory] = useState<'compound' | 'isolation' | 'cardio' | 'mobility' | 'bodyweight'>('compound');
  const [instructions, setInstructions] = useState('');
  const [instructionsFa, setInstructionsFa] = useState('');
  const [tips, setTips] = useState('');

  const muscles: MuscleGroup[] = [
    'Chest',
    'Back',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Core',
    'Calves',
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.nameFa.includes(search) ||
      ex.instructions.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.targetMuscle === selectedMuscle;
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesMuscle && matchesCat;
  });

  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name,
      nameFa: nameFa || name,
      targetMuscle,
      secondaryMuscles: [],
      equipment,
      category,
      instructions,
      instructionsFa: instructionsFa || instructions,
      tips,
    };
    onAddExercise(newEx);
    setIsAddModalOpen(false);
    // Reset
    setName('');
    setNameFa('');
    setInstructions('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>{t.nav.exercises}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Biomechanical Exercise Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized movement patterns with form cues, muscle recruitment maps, and coaching cues.
          </p>
        </div>

        <button
          id="add-exercise-btn"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Custom Exercise</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Muscles ({muscles.length})</option>
            {muscles.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="compound">Compound</option>
            <option value="isolation">Isolation</option>
            <option value="bodyweight">Bodyweight</option>
            <option value="mobility">Mobility</option>
          </select>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              {/* Muscle & Category badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {ex.targetMuscle}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {ex.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white">
                {language === 'fa' ? ex.nameFa : ex.name}
              </h3>
              {language === 'fa' && (
                <span className="text-xs text-slate-400 block -mt-0.5 mb-2 font-mono">
                  {ex.name}
                </span>
              )}

              {/* Equipment */}
              <p className="text-xs text-slate-400 font-medium">
                Equipment: <span className="text-slate-300">{ex.equipment}</span>
              </p>

              {/* Execution Instructions */}
              <p className="text-xs text-slate-300/90 mt-2 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                {language === 'fa' ? ex.instructionsFa : ex.instructions}
              </p>
            </div>

            {/* Pro Tips Footer */}
            {ex.tips && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-400/90 flex items-start gap-1.5">
                <span className="font-bold shrink-0">Cue:</span>
                <span>{ex.tips}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add Movement to Library</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Exercise Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Incline Cable Flyes"
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">نام حرکت به فارسی (اختیاری)</label>
                <input
                  type="text"
                  value={nameFa}
                  onChange={(e) => setNameFa(e.target.value)}
                  placeholder="مثال: فلای بالا سینه با سیم‌کش"
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Primary Muscle</label>
                  <select
                    value={targetMuscle}
                    onChange={(e) => setTargetMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    {muscles.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="compound">Compound</option>
                    <option value="isolation">Isolation</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="mobility">Mobility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Equipment</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Cables, Bench, Dumbbells..."
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Biomechanical Instructions</label>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Detailed setup, joint angle, range of motion..."
                  className="w-full bg-slate-800 text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Coaching Cues</label>
                <input
                  type="text"
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="e.g. Squeeze chest at peak contraction, controlled negative..."
                  className="w-full bg-slate-800 text-xs text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
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
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Athlete, Language, CheckIn } from '../../types';
import { translations } from '../../i18n/translations';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  MessageSquare,
  FileCode2,
  Sparkles,
  ChevronRight,
  Flame,
  Activity,
  Plus,
} from 'lucide-react';

interface CoachDashboardProps {
  athletes: Athlete[];
  checkIns: CheckIn[];
  language: Language;
  onSelectAthlete: (athlete: Athlete) => void;
  onReviewCheckIn: (checkIn: CheckIn) => void;
  onOpenProgramBuilder: () => void;
  onOpenAICoach: () => void;
  onOpenChatWithAthlete: (athlete: Athlete) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  athletes,
  checkIns,
  language,
  onSelectAthlete,
  onReviewCheckIn,
  onOpenProgramBuilder,
  onOpenAICoach,
  onOpenChatWithAthlete,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingCheckIns = checkIns.filter((c) => c.status === 'pending_review');
  const flaggedAthletes = athletes.filter((a) => a.status === 'at_risk' || a.readinessScore < 60);

  const avgCompliance = Math.round(
    athletes.reduce((acc, curr) => acc + curr.complianceRate, 0) / (athletes.length || 1)
  );

  const filteredAthletes = athletes.filter((athlete) => {
    const nameMatch =
      athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      athlete.nameFa.includes(searchQuery);
    const statusMatch = filterStatus === 'all' || athlete.status === filterStatus;
    return nameMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.coachDashboard.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {t.coachDashboard.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="coach-new-prog-btn"
            onClick={onOpenProgramBuilder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.coachDashboard.createNewProgram}</span>
          </button>
          <button
            id="coach-ai-pilot-btn"
            onClick={onOpenAICoach}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs sm:text-sm transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.coachDashboard.aiAssistantBtn}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Athletes */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {t.coachDashboard.totalAthletes}
            </span>
            <div className="text-2xl font-black text-white mt-1.5">
              {athletes.length}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              100% Active roster
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Compliance */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {t.coachDashboard.avgCompliance}
            </span>
            <div className="text-2xl font-black text-white mt-1.5">
              {avgCompliance}%
            </div>
            <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${avgCompliance}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Check-Ins */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {t.coachDashboard.pendingCheckIns}
            </span>
            <div className="text-2xl font-black text-white mt-1.5">
              {pendingCheckIns.length}
            </div>
            <span className="text-[11px] text-amber-400 font-medium mt-1 inline-block">
              {pendingCheckIns.length > 0 ? 'Requires coach action' : 'All up to date'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            pendingCheckIns.length > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Flagged / Needs Attention */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {t.coachDashboard.flaggedInjuries}
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1.5">
              {flaggedAthletes.length}
            </div>
            <span className="text-[11px] text-rose-300 font-medium mt-1 inline-block">
              Reported fatigue or injury
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Athlete Roster Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              {t.coachDashboard.athleteRoster} ({filteredAthletes.length})
            </h2>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={t.common.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t.common.all}</option>
              <option value="active">{t.common.active}</option>
              <option value="pending_checkin">{t.common.pending}</option>
              <option value="at_risk">{t.common.flagged}</option>
            </select>
          </div>
        </div>

        {/* Athlete List */}
        <div className="divide-y divide-slate-800/80">
          {filteredAthletes.map((athlete) => {
            const athleteCheckIn = checkIns.find(
              (c) => c.athleteId === athlete.id && c.status === 'pending_review'
            );

            return (
              <div
                key={athlete.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Info & Avatar */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <img
                    src={athlete.avatar}
                    alt={athlete.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white">
                        {language === 'fa' ? athlete.nameFa : athlete.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {athlete.goal}
                      </span>
                      {athlete.status === 'pending_checkin' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t.coachDashboard.statusPending}
                        </span>
                      )}
                      {athlete.status === 'at_risk' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {t.coachDashboard.statusAtRisk}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span>{t.common.weight}: <strong className="text-slate-200">{athlete.weightKg} kg</strong> (Goal: {athlete.targetWeightKg} kg)</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <strong className="text-slate-200">{athlete.currentStreakDays}</strong> {t.common.streak}
                      </span>
                      <span>•</span>
                      <span>{t.common.compliance}: <strong className="text-emerald-400">{athlete.complianceRate}%</strong></span>
                    </div>

                    {athlete.injuryNotes && (
                      <p className="text-xs text-rose-300/90 mt-1 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40">
                        ⚠️ {language === 'fa' ? athlete.injuryNotesFa || athlete.injuryNotes : athlete.injuryNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Readiness & Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 self-end lg:self-center shrink-0">
                  {/* Readiness Pill */}
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      {t.common.readiness}
                    </div>
                    <div className={`text-sm font-extrabold ${
                      athlete.readinessScore >= 80
                        ? 'text-emerald-400'
                        : athlete.readinessScore >= 65
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {athlete.readinessScore} / 100
                    </div>
                  </div>

                  {/* Review Check-In Button (if pending) */}
                  {athleteCheckIn && (
                    <button
                      id={`review-checkin-btn-${athlete.id}`}
                      onClick={() => onReviewCheckIn(athleteCheckIn)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.coachDashboard.viewCheckin}</span>
                    </button>
                  )}

                  {/* Program View/Assign */}
                  <button
                    id={`view-prog-btn-${athlete.id}`}
                    onClick={() => onSelectAthlete(athlete)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
                    title={t.coachDashboard.assignProgram}
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">{t.coachDashboard.assignProgram}</span>
                  </button>

                  {/* Chat */}
                  <button
                    id={`chat-athlete-btn-${athlete.id}`}
                    onClick={() => onOpenChatWithAthlete(athlete)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
                    title={t.coachDashboard.openChat}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

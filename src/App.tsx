import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Language,
  Athlete,
  Coach,
  Program,
  WorkoutSession,
  DailyNutritionPlan,
  CheckIn,
  PersonalRecord,
  Exercise,
  ChatMessage,
} from './types';
import { translations } from './i18n/translations';
import { StorageManager } from './utils/storage';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';

// Coach Views
import { CoachDashboard } from './components/coach/CoachDashboard';
import { ProgramBuilder } from './components/coach/ProgramBuilder';
import { CheckInReviewModal } from './components/coach/CheckInReviewModal';

// Athlete Views
import { AthleteTodayView } from './components/athlete/AthleteTodayView';
import { NutritionTracker } from './components/athlete/NutritionTracker';
import { CheckInSubmitModal } from './components/athlete/CheckInSubmitModal';
import { ProgressAnalytics } from './components/athlete/ProgressAnalytics';

// Shared Components
import { ExerciseLibraryModal } from './components/shared/ExerciseLibraryModal';
import { ChatDrawer } from './components/shared/ChatDrawer';
import { AICoachAssistantModal } from './components/shared/AICoachAssistantModal';

import {
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Dumbbell,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function App() {
  // Global State
  const [role, setRole] = useState<UserRole>('coach');
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('roster');

  // Domain State loaded from Storage
  const [coach, setCoach] = useState<Coach>(StorageManager.getCoach());
  const [athletes, setAthletes] = useState<Athlete[]>(StorageManager.getAthletes());
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athletes[0]?.id || 'ath-1'
  );
  const [programs, setPrograms] = useState<Program[]>(StorageManager.getPrograms());
  const [todaySession, setTodaySession] = useState<WorkoutSession>(
    StorageManager.getTodaySession()
  );
  const [nutritionPlan, setNutritionPlan] = useState<DailyNutritionPlan>(
    StorageManager.getNutrition()
  );
  const [checkIns, setCheckIns] = useState<CheckIn[]>(StorageManager.getCheckIns());
  const [prs, setPrs] = useState<PersonalRecord[]>(StorageManager.getPRs());
  const [exercises, setExercises] = useState<Exercise[]>(StorageManager.getExercises());
  const [messages, setMessages] = useState<ChatMessage[]>(StorageManager.getMessages());

  // Modals and Drawers
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSubmitCheckInOpen, setIsSubmitCheckInOpen] = useState(false);
  const [reviewingCheckIn, setReviewingCheckIn] = useState<CheckIn | null>(null);

  // Active athlete object
  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const t = translations[language];

  // Handle RTL direction switch
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Handle Role Switch tab resets
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'coach') {
      setActiveTab('roster');
    } else {
      setActiveTab('today');
    }
  };

  // Handlers for updating state and syncing to storage
  const handleSaveProgram = (updatedProgram: Program) => {
    const nextPrograms = programs.map((p) =>
      p.id === updatedProgram.id ? updatedProgram : p
    );
    setPrograms(nextPrograms);
    StorageManager.savePrograms(nextPrograms);
  };

  const handleCreateProgram = (newProgram: Program) => {
    const next = [...programs, newProgram];
    setPrograms(next);
    StorageManager.savePrograms(next);
  };

  const handleUpdateAthlete = (updated: Athlete) => {
    const next = athletes.map((a) => (a.id === updated.id ? updated : a));
    setAthletes(next);
    StorageManager.saveAthletes(next);
  };

  const handleFinishWorkout = (
    sessionId: string,
    feedback: { sessionRpe: number; energyLevel: number; enjoymentRating: number; notes: string }
  ) => {
    const updated = { ...todaySession, isCompleted: true };
    setTodaySession(updated);
    StorageManager.saveTodaySession(updated);

    // Increment athlete streak
    if (currentAthlete) {
      const updatedAth: Athlete = {
        ...currentAthlete,
        currentStreakDays: currentAthlete.currentStreakDays + 1,
      };
      handleUpdateAthlete(updatedAth);
    }
  };

  const handleUpdateNutrition = (newPlan: DailyNutritionPlan) => {
    setNutritionPlan(newPlan);
    StorageManager.saveNutrition(newPlan);
  };

  const handleSubmitCheckIn = (newCheckIn: CheckIn) => {
    const next = [newCheckIn, ...checkIns];
    setCheckIns(next);
    StorageManager.saveCheckIns(next);

    // Update athlete compliance status
    if (currentAthlete) {
      handleUpdateAthlete({
        ...currentAthlete,
        status: 'active',
        weightKg: newCheckIn.weightKg,
      });
    }
  };

  const handleSaveCheckInReview = (
    checkInId: string,
    commentary: string,
    actionItems: string[],
    macroAdjustment?: string,
    volumeAdjustment?: string
  ) => {
    const next = checkIns.map((chk) => {
      if (chk.id === checkInId) {
        return {
          ...chk,
          status: 'reviewed' as const,
          coachReview: {
            reviewedAt: new Date().toISOString(),
            coachId: coach.id,
            commentary,
            actionItems,
            macroAdjustmentNotes: macroAdjustment,
            volumeAdjustmentNotes: volumeAdjustment,
          },
        };
      }
      return chk;
    });
    setCheckIns(next);
    StorageManager.saveCheckIns(next);

    // Also auto-post a message in chat so the athlete gets an immediate notification!
    const noticeMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: coach.id,
      senderName: coach.name,
      receiverId: currentAthlete?.id || 'ath-1',
      text: `Weekly Check-In Reviewed! Feedback: "${commentary}"`,
      textFa: `چک‌این هفتگی بررسی شد! بازخورد مربی: «${commentary}»`,
      timestamp: 'Just now',
      isRead: false,
      type: 'checkin_alert',
    };
    const nextMessages = [...messages, noticeMsg];
    setMessages(nextMessages);
    StorageManager.saveMessages(nextMessages);
  };

  const handleAddPR = (newPR: PersonalRecord) => {
    const next = [newPR, ...prs];
    setPrs(next);
    StorageManager.savePRs(next);
  };

  const handleAddExercise = (newEx: Exercise) => {
    const next = [...exercises, newEx];
    setExercises(next);
    StorageManager.saveExercises(next);
  };

  const handleSendMessage = (text: string) => {
    const senderName = role === 'coach' ? coach.name : currentAthlete.name;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: role === 'coach' ? coach.id : currentAthlete.id,
      senderName,
      receiverId: role === 'coach' ? currentAthlete.id : coach.id,
      text,
      textFa: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'text',
    };
    const next = [...messages, newMsg];
    setMessages(next);
    StorageManager.saveMessages(next);
  };

  const unreadChatCount = messages.filter(
    (m) =>
      !m.isRead &&
      ((role === 'coach' && m.senderId !== coach.id) ||
        (role === 'athlete' && m.senderId !== currentAthlete.id))
  ).length;

  const pendingCheckInsCount = checkIns.filter(
    (c) => c.status === 'pending_review'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        language={language}
        onLanguageChange={setLanguage}
        onOpenAICoach={() => setIsAICoachOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        unreadMessagesCount={unreadChatCount}
      />

      {/* Navigation Sub-header */}
      <Navigation
        role={role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={language}
        pendingReviewsCount={pendingCheckInsCount}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= COACH PORTAL ================= */}
        {role === 'coach' && (
          <>
            {activeTab === 'roster' && (
              <CoachDashboard
                athletes={athletes}
                coach={coach}
                checkIns={checkIns}
                language={language}
                onSelectAthlete={(ath) => {
                  setSelectedAthleteId(ath.id);
                  setActiveTab('builder');
                }}
                onOpenReview={(chk) => setReviewingCheckIn(chk)}
                onOpenAICoach={() => setIsAICoachOpen(true)}
                onNavigateToBuilder={() => setActiveTab('builder')}
              />
            )}

            {activeTab === 'builder' && (
              <ProgramBuilder
                program={programs[0]}
                athlete={currentAthlete}
                exercises={exercises}
                language={language}
                onSaveProgram={handleSaveProgram}
                onOpenAICoach={() => setIsAICoachOpen(true)}
              />
            )}

            {activeTab === 'checkins' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {t.checkIns.title} ({checkIns.length})
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Review weekly biofeedback, update nutrition prescriptions, and guide athletic progression.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkIns.map((chk) => {
                    const ath = athletes.find((a) => a.id === chk.athleteId) || currentAthlete;
                    return (
                      <div
                        key={chk.id}
                        className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={ath.avatar}
                              alt={ath.name}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <h3 className="font-bold text-white text-sm sm:text-base">
                                {language === 'fa' ? ath.nameFa : ath.name}
                              </h3>
                              <span className="text-xs text-slate-400">
                                Submitted: {chk.date}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                              chk.status === 'reviewed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {chk.status === 'reviewed' ? t.checkIns.statusReviewed : t.checkIns.statusPending}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Weight</span>
                            <span className="font-black text-white">{chk.weightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Sleep Score</span>
                            <span className="font-black text-indigo-300">{chk.sleepQuality}/10</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Adherence</span>
                            <span className="font-black text-emerald-400">{chk.adherenceRate}%</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 italic line-clamp-2">
                          "{chk.athleteNotes}"
                        </p>

                        <button
                          id={`review-checkin-card-btn-${chk.id}`}
                          onClick={() => setReviewingCheckIn(chk)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                          <span>{chk.status === 'reviewed' ? 'View Review Details' : 'Review & Provide Feedback'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'exercises' && (
              <ExerciseLibraryModal
                exercises={exercises}
                language={language}
                onAddExercise={handleAddExercise}
              />
            )}

            {activeTab === 'analytics' && (
              <ProgressAnalytics
                prs={prs}
                athlete={currentAthlete}
                language={language}
                onAddPR={handleAddPR}
              />
            )}
          </>
        )}

        {/* ================= ATHLETE PORTAL ================= */}
        {role === 'athlete' && (
          <>
            {activeTab === 'today' && (
              <AthleteTodayView
                session={todaySession}
                athlete={currentAthlete}
                language={language}
                onFinishSession={handleFinishWorkout}
                onOpenCheckInModal={() => setIsSubmitCheckInOpen(true)}
              />
            )}

            {activeTab === 'program' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Current Assigned Protocol
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {language === 'fa' ? programs[0].titleFa : programs[0].title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Coach: {coach.name} • {programs[0].durationWeeks} Weeks Mesocycle • Microcycle Week 3
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('today')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition"
                  >
                    Go to Today's Workout
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs[0].microcycles[0]?.workoutSessions.map((sess, sIdx) => (
                    <div
                      key={sess.id}
                      className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">Day {sIdx + 1}</span>
                        <span className="text-xs text-slate-400">~{sess.estimatedMinutes} min</span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {language === 'fa' ? sess.nameFa : sess.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Focus: {language === 'fa' ? sess.focusFa : sess.focus}
                      </p>
                      <div className="space-y-1 pt-2 border-t border-slate-800/80">
                        {sess.exercises.map((ex, eIdx) => (
                          <div key={ex.id} className="text-xs text-slate-300 flex justify-between">
                            <span>{eIdx + 1}. {language === 'fa' ? ex.exerciseNameFa : ex.exerciseName}</span>
                            <span className="text-slate-400">{ex.sets.length} sets</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'checkin' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-white">
                      {t.checkIns.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Log your weekly weigh-ins, measurements, and biofeedback for Coach {coach.name}.
                    </p>
                  </div>
                  <button
                    id="athlete-open-checkin-btn"
                    onClick={() => setIsSubmitCheckInOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{t.checkIns.submitNew}</span>
                  </button>
                </div>

                {/* Previous Check-ins Feed */}
                <div className="space-y-4">
                  {checkIns
                    .filter((c) => c.athleteId === currentAthlete.id)
                    .map((chk) => (
                      <div
                        key={chk.id}
                        className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Check-in: {chk.date}</span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                              chk.status === 'reviewed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {chk.status === 'reviewed' ? t.checkIns.statusReviewed : t.checkIns.statusPending}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Weight</span>
                            <span className="font-black text-white">{chk.weightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Sleep</span>
                            <span className="font-black text-indigo-300">{chk.sleepQuality}/10 ({chk.sleepHours}h)</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Soreness</span>
                            <span className="font-black text-amber-300">{chk.sorenessRating}/10</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Adherence</span>
                            <span className="font-black text-emerald-400">{chk.adherenceRate}%</span>
                          </div>
                        </div>

                        {chk.coachReview && (
                          <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                            <span className="text-xs font-bold text-emerald-400 block">
                              Coach Feedback from {coach.name}:
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed">
                              "{chk.coachReview.commentary}"
                            </p>
                            {chk.coachReview.actionItems && chk.coachReview.actionItems.length > 0 && (
                              <div className="pt-2 border-t border-emerald-500/20">
                                <span className="text-[11px] font-bold text-slate-300 block mb-1">
                                  Action Items:
                                </span>
                                <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                                  {chk.coachReview.actionItems.map((ai, i) => (
                                    <li key={i}>{ai}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <NutritionTracker
                plan={nutritionPlan}
                athlete={currentAthlete}
                language={language}
                onUpdatePlan={handleUpdateNutrition}
                onOpenAICoach={() => setIsAICoachOpen(true)}
              />
            )}

            {activeTab === 'records' && (
              <ProgressAnalytics
                prs={prs}
                athlete={currentAthlete}
                language={language}
                onAddPR={handleAddPR}
              />
            )}
          </>
        )}
      </main>

      {/* Check-In Review Modal (Coach) */}
      {reviewingCheckIn && (
        <CheckInReviewModal
          checkIn={reviewingCheckIn}
          athlete={athletes.find((a) => a.id === reviewingCheckIn.athleteId)}
          language={language}
          onSaveReview={handleSaveCheckInReview}
          onClose={() => setReviewingCheckIn(null)}
        />
      )}

      {/* Check-In Submission Modal (Athlete) */}
      {isSubmitCheckInOpen && (
        <CheckInSubmitModal
          athlete={currentAthlete}
          language={language}
          onSubmit={handleSubmitCheckIn}
          onClose={() => setIsSubmitCheckInOpen(false)}
        />
      )}

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        currentRole={role}
        language={language}
        onSendMessage={handleSendMessage}
        selectedAthlete={currentAthlete}
      />

      {/* AI Sports Science Co-Pilot Modal */}
      <AICoachAssistantModal
        isOpen={isAICoachOpen}
        onClose={() => setIsAICoachOpen(false)}
        language={language}
      />
    </div>
  );
}

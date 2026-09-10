import {
  UserRole,
  Language,
  Athlete,
  TrainingProgram,
  DailyNutritionPlan,
  CheckIn,
  ChatMessage,
  PersonalRecord,
  Exercise,
  AuditLog,
  WorkoutSession,
  UserProfile,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_ATHLETES,
  INITIAL_PROGRAMS,
  INITIAL_NUTRITION,
  INITIAL_CHECKINS,
  INITIAL_MESSAGES,
  INITIAL_PRS,
  EXERCISE_LIBRARY,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

const STORAGE_KEYS = {
  ROLE: 'athletica_current_role',
  LANG: 'athletica_language',
  ATHLETES: 'athletica_athletes',
  PROGRAMS: 'athletica_programs',
  NUTRITION: 'athletica_nutrition',
  CHECKINS: 'athletica_checkins',
  MESSAGES: 'athletica_messages',
  PRS: 'athletica_prs',
  EXERCISES: 'athletica_exercises',
  AUDIT: 'athletica_audit_logs',
  SESSION: 'athletica_today_session',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export const StorageManager = {
  getRole(): UserRole {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (role as UserRole) || 'coach';
  },
  setRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  },

  getLanguage(): Language {
    const lang = localStorage.getItem(STORAGE_KEYS.LANG);
    return lang === 'fa' || lang === 'en' ? lang : 'fa';
  },
  setLanguage(lang: Language): void {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  },

  getAthletes(): Athlete[] {
    return getStorage<Athlete[]>(STORAGE_KEYS.ATHLETES, INITIAL_ATHLETES);
  },
  saveAthletes(athletes: Athlete[]): void {
    setStorage(STORAGE_KEYS.ATHLETES, athletes);
  },

  getPrograms(): TrainingProgram[] {
    return getStorage<TrainingProgram[]>(STORAGE_KEYS.PROGRAMS, INITIAL_PROGRAMS);
  },
  savePrograms(programs: TrainingProgram[]): void {
    setStorage(STORAGE_KEYS.PROGRAMS, programs);
  },

  getCoach(): UserProfile {
    return INITIAL_PROFILES.coach;
  },

  getTodaySession(): WorkoutSession {
    const defaultSession = INITIAL_PROGRAMS[0].sessions[0];
    return getStorage<WorkoutSession>(STORAGE_KEYS.SESSION, defaultSession);
  },
  saveTodaySession(session: WorkoutSession): void {
    setStorage(STORAGE_KEYS.SESSION, session);
  },

  getNutrition(): DailyNutritionPlan {
    return getStorage<DailyNutritionPlan>(STORAGE_KEYS.NUTRITION, INITIAL_NUTRITION);
  },
  saveNutrition(plan: DailyNutritionPlan): void {
    setStorage(STORAGE_KEYS.NUTRITION, plan);
  },

  getCheckIns(): CheckIn[] {
    return getStorage<CheckIn[]>(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
  },
  saveCheckIns(checkins: CheckIn[]): void {
    setStorage(STORAGE_KEYS.CHECKINS, checkins);
  },

  getMessages(): ChatMessage[] {
    return getStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  },
  saveMessages(messages: ChatMessage[]): void {
    setStorage(STORAGE_KEYS.MESSAGES, messages);
  },

  getPRs(): PersonalRecord[] {
    return getStorage<PersonalRecord[]>(STORAGE_KEYS.PRS, INITIAL_PRS);
  },
  savePRs(prs: PersonalRecord[]): void {
    setStorage(STORAGE_KEYS.PRS, prs);
  },

  getExercises(): Exercise[] {
    return getStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, EXERCISE_LIBRARY);
  },
  saveExercises(exercises: Exercise[]): void {
    setStorage(STORAGE_KEYS.EXERCISES, exercises);
  },

  getAuditLogs(): AuditLog[] {
    return getStorage<AuditLog[]>(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(actorName: string, actorRole: UserRole, action: string, details: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: `user-${actorRole}`,
      actorName,
      actorRole,
      action,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setStorage(STORAGE_KEYS.AUDIT, [newLog, ...logs]);
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.ATHLETES);
    localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
    localStorage.removeItem(STORAGE_KEYS.NUTRITION);
    localStorage.removeItem(STORAGE_KEYS.CHECKINS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.PRS);
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
  },

  getProfile(role: UserRole) {
    return INITIAL_PROFILES[role] || INITIAL_PROFILES.coach;
  },
};

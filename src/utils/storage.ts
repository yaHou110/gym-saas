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
  INITIAL_NUTRITION_PLANS,
  INITIAL_CHECKINS,
  INITIAL_MESSAGES,
  INITIAL_PRS,
  EXERCISE_LIBRARY,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

export const STORAGE_KEYS = {
  ROLE: 'athletica_current_role',
  LANG: 'athletica_language',
  TAB: 'athletica_active_tab',
  ATHLETES: 'athletica_athletes',
  PROGRAMS: 'athletica_programs',
  NUTRITION: 'athletica_nutrition',
  CHECKINS: 'athletica_checkins',
  MESSAGES: 'athletica_messages',
  PRS: 'athletica_prs',
  EXERCISES: 'athletica_exercises',
  AUDIT: 'athletica_audit_logs',
  SESSION: 'athletica_today_session',
} as const;

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

const VALID_ROLES: readonly UserRole[] = ['coach', 'athlete', 'dietitian', 'admin'] as const;

export const StorageManager = {
  getRole(): UserRole {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (!raw) return 'coach';
      let val: string = raw;
      // Legacy: value may have been stored via JSON.stringify (e.g. "\"coach\"") or as {role:"coach"}
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') val = parsed;
        else if (parsed && typeof parsed === 'object' && typeof (parsed as Record<string, unknown>).role === 'string') {
          val = (parsed as Record<string, string>).role;
        }
      } catch {
        // raw is plain string — use as-is
      }
      const normalized = val.trim().toLowerCase();
      if ((VALID_ROLES as readonly string[]).includes(normalized)) return normalized as UserRole;
      return 'coach';
    } catch {
      return 'coach';
    }
  },
  setRole(role: UserRole): void {
    const normalized = role?.trim?.().toLowerCase() as UserRole;
    const safe = (VALID_ROLES as readonly string[]).includes(normalized) ? normalized : 'coach';
    localStorage.setItem(STORAGE_KEYS.ROLE, safe);
  },

  getLanguage(): Language {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LANG);
      if (!raw) return 'en';
      let val: string = raw;
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string') val = parsed;
        else if (parsed && typeof parsed === 'object') {
          const obj = parsed as Record<string, unknown>;
          if (typeof obj.lang === 'string') val = obj.lang;
          else if (typeof obj.language === 'string') val = obj.language;
        }
      } catch {
        // plain string
      }
      const normalized = val.trim().toLowerCase();
      if (normalized.startsWith('fa')) return 'fa';
      if (normalized.startsWith('en')) return 'en';
      return 'en';
    } catch {
      return 'en';
    }
  },
  setLanguage(lang: Language): void {
    const normalized = lang?.trim?.().toLowerCase() ?? '';
    const safe: Language = normalized.startsWith('fa') ? 'fa' : 'en';
    localStorage.setItem(STORAGE_KEYS.LANG, safe);
  },

  getTab(): string | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TAB);
      return raw && raw.trim() ? raw.trim() : null;
    } catch {
      return null;
    }
  },
  setTab(tab: string): void {
    try {
      if (!tab || !tab.trim()) return;
      localStorage.setItem(STORAGE_KEYS.TAB, tab.trim());
    } catch {}
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

  getNutritionPlans(): Record<string, DailyNutritionPlan> {
    const raw = localStorage.getItem(STORAGE_KEYS.NUTRITION);
    if (!raw) return INITIAL_NUTRITION_PLANS;
    try {
      const parsed = JSON.parse(raw);
      // Migrate legacy single-plan shape (stored pre-per-athlete) by adopting it
      // as that athlete's plan and reseeding the rest.
      if (parsed && !Array.isArray(parsed) && parsed.athleteId) {
        return { ...INITIAL_NUTRITION_PLANS, [parsed.athleteId as string]: parsed };
      }
      return parsed as Record<string, DailyNutritionPlan>;
    } catch {
      return INITIAL_NUTRITION_PLANS;
    }
  },
  saveNutritionPlans(plans: Record<string, DailyNutritionPlan>): void {
    setStorage(STORAGE_KEYS.NUTRITION, plans);
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
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorId: `user-${actorRole}`,
      actorName,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    const next = [newLog, ...logs].slice(0, 100);
    setStorage(STORAGE_KEYS.AUDIT, next);
  },

  resetAll(): void {
    // Keep role/language so post-reset reload stays where the user is; keep _SESSION to avoid schedule blank-screens.
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

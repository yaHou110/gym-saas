export type UserRole = 'coach' | 'athlete' | 'dietitian' | 'admin';

export type Language = 'en' | 'fa';

export interface UserProfile {
  id: string;
  name: string;
  nameFa: string;
  role: UserRole;
  email: string;
  avatar: string;
  phone?: string;
  bio?: string;
  bioFa?: string;
  title?: string;
  titleFa?: string;
  joinedDate: string;
}

export type Coach = UserProfile;

export type FitnessGoal =
  | 'Hypertrophy'
  | 'Strength & Power'
  | 'Fat Loss'
  | 'Athletic Conditioning'
  | 'Rehab & Mobility';

export interface Athlete {
  id: string;
  name: string;
  nameFa: string;
  email: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: FitnessGoal;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  assignedCoachId: string;
  assignedDietitianId?: string;
  activeProgramId?: string;
  complianceRate: number; // e.g. 94%
  currentStreakDays: number;
  readinessScore: number; // 1-100
  injuryNotes?: string;
  injuryNotesFa?: string;
  status: 'active' | 'at_risk' | 'pending_checkin' | 'paused';
  nextCheckInDate: string;
  phone: string;
}

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Core'
  | 'Calves'
  | 'Full Body';

export interface Exercise {
  id: string;
  name: string;
  nameFa: string;
  targetMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: string;
  category: 'compound' | 'isolation' | 'cardio' | 'mobility' | 'bodyweight';
  demoVideoUrl?: string;
  instructions: string;
  instructionsFa: string;
  tips: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  targetReps: number;
  actualReps?: number;
  targetWeightKg: number;
  actualWeightKg?: number;
  targetRpe?: number;
  actualRpe?: number;
  isCompleted: boolean;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseNameFa: string;
  targetMuscle: MuscleGroup;
  sets: WorkoutSet[];
  restSeconds: number;
  tempo?: string; // e.g. "3-0-1-0"
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  programId: string;
  dayOfWeek: number; // 1=Mon, 7=Sun or day index
  name: string;
  nameFa: string;
  focus: string;
  focusFa: string;
  warmupNotes: string;
  warmupNotesFa: string;
  exercises: WorkoutExercise[];
  cooldownNotes: string;
  cooldownNotesFa: string;
  estimatedMinutes: number;
  isCompleted?: boolean;
  completedAt?: string;
  athleteFeedback?: {
    sessionRpe: number;
    energyLevel: number;
    enjoymentRating: number;
    athleteNotes?: string;
  };
}

export interface TrainingProgram {
  id: string;
  coachId: string;
  athleteId?: string; // If null/empty, it's a reusable template
  title: string;
  titleFa: string;
  description: string;
  descriptionFa: string;
  goal: FitnessGoal;
  durationWeeks: number;
  daysPerWeek: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  macrocyclePhase: 'Hypertrophy Block' | 'Strength Accumulation' | 'Peak & Taper' | 'Deload / Prep';
  sessions: WorkoutSession[];
  isTemplate: boolean;
  createdAt: string;
}

export type Program = TrainingProgram;

export interface MacroTarget {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  waterMl: number;
}

export interface MealItem {
  id: string;
  name: string;
  nameFa: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack_pre' | 'snack_post';
  name: string;
  nameFa: string;
  timeHint: string;
  items: MealItem[];
  isCompleted?: boolean;
}

export interface DailyNutritionPlan {
  id: string;
  athleteId: string;
  date: string;
  targets: MacroTarget;
  meals: Meal[];
  waterLoggedMl: number;
  notes?: string;
  notesFa?: string;
}

export interface CheckIn {
  id: string;
  athleteId: string;
  coachId: string;
  date: string;
  status: 'pending_review' | 'reviewed' | 'flagged';
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipsCm?: number;
  sleepHours: number;
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  sorenessRating: number; // 1-10
  energyRating: number; // 1-10
  adherenceRate: number; // percentage, e.g. 90
  athleteNotes: string;
  frontPhotoUrl?: string;
  sidePhotoUrl?: string;
  backPhotoUrl?: string;
  coachReview?: {
    reviewedAt: string;
    commentary: string;
    commentaryFa?: string;
    actionItems: string[];
    macroAdjustmentNotes?: string;
    volumeAdjustmentNotes?: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: string;
  text: string;
  textFa?: string;
  isRead: boolean;
  type: 'text' | 'workout_share' | 'voice_simulation' | 'checkin_alert';
  metadata?: {
    sessionId?: string;
    sessionTitle?: string;
    audioDuration?: string;
  };
}

export interface PersonalRecord {
  id: string;
  athleteId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedDate: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

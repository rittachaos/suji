export interface ApiListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionUser {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  role: 'USER' | 'COACH' | 'ADMIN';
  phone?: string;
}

export interface LoginResult {
  token: string;
  user: SessionUser;
}

export interface BodyRecordPayload {
  recordDate: string;
  heightCm?: number;
  weightKg?: number;
  bodyFatRate?: number;
  skeletalMuscle?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
  shoulderCm?: number;
  extraMetrics?: Record<string, number>;
  note?: string;
}

export interface TrainingSetPayload {
  setIndex: number;
  weightKg?: number;
  reps?: number;
  rpe?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  note?: string;
}

export interface TrainingExercisePayload {
  name: string;
  equipment?: string;
  bodyPart?: string;
  exerciseType?: 'STRENGTH' | 'CARDIO';
  workingWeightKg?: number;
  topWeightKg?: number;
  setCount?: number;
  durationMinutes?: number;
  sets: TrainingSetPayload[];
}

export interface TrainingSessionPayload {
  sessionDate: string;
  bodyPart: string;
  note?: string;
  exercises: TrainingExercisePayload[];
}

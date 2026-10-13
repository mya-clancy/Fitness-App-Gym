import { HunterProfile, DailyLogData, WorkoutSplit } from './hunter';

export interface HunterAccountData {
  username: string;
  password: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
  profile: HunterProfile;
  dailyLogs: Record<string, DailyLogData>;
  workoutSplits: WorkoutSplit[];
}

export interface AuthState {
  currentAccount: HunterAccountData | null;
  isAuthenticated: boolean;
}

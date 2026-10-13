export type HunterRank = 
  | 'E-Rank'
  | 'D-Rank'
  | 'C-Rank'
  | 'B-Rank'
  | 'A-Rank'
  | 'S-Rank'
  | 'National Hunter'
  | 'Shadow Monarch';

export interface HunterProfile {
  userId: string;
  displayName: string;
  hunterTitle: string; // e.g. "The Weakest Hunter", "Awakened Assailant", "Shadow Monarch"
  level: number;
  totalXp: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  hunterRank: HunterRank;
  // Attributes derived from training
  stats: {
    strength: number;    // Boosted by Heavy compound lifts & hypertrophy
    agility: number;     // Boosted by Cardio & fast cadence
    endurance: number;   // Boosted by Long distance running
    vitality: number;    // Boosted by Consistent high-protein nutrition
    discipline: number;  // Consecutive streak days
  };
  streakDays: number;
  lastActiveDate: string;
  // Daily Nutrition Goals
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface MealItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre-Workout' | 'Post-Workout';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  imageUrl?: string;
  notes?: string;
  confidence?: 'High' | 'Medium' | 'Low';
}

export interface CardioLog {
  id: string;
  date: string;
  timestamp: string;
  activityType: 'Running' | 'Treadmill' | 'Outdoor 5K' | 'Outdoor 10K' | 'HIIT Sprint' | 'Cycling' | 'Walking';
  distanceKm: number;
  durationMinutes: number;
  durationSeconds: number;
  paceMinPerKm: string; // e.g. "5:12 /km"
  activeCaloriesBurned: number;
  source: 'Huawei Health Import' | 'Manual Log' | 'Smartwatch Sync';
  heartRateAvg?: number;
  xpAwarded: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  weightKg: number;
  xpValue: number; // 100 to 500 based on intensity/difficulty
  completed?: boolean;
  progressiveOverloadTip?: string;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g. "Day 1: Hypertrophy Chest / Triceps"
  targetFocus: string; // e.g. "Upper Body Power"
  exercises: ExerciseItem[];
}

export interface WorkoutSplit {
  splitId: string;
  userId: string;
  name: string; // e.g. "Shadow Monarch Hypertrophy PPL"
  description: string;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface DailyLogData {
  date: string; // YYYY-MM-DD
  userId: string;
  meals: MealItem[];
  cardio: CardioLog[];
  completedExercisesToday: {
    splitId: string;
    dayId: string;
    exerciseId: string;
    xpEarned: number;
    timestamp: string;
  }[];
  updatedAt: string;
}

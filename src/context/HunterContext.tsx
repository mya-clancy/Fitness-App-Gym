import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  deleteDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase';
import {
  HunterProfile,
  MealItem,
  CardioLog,
  WorkoutSplit,
  DailyLogData,
  ExerciseItem,
  WorkoutDay,
} from '../types/hunter';
import { HunterAccountData } from '../types/auth';
import {
  getStoredAccounts,
  saveAccountToStorage,
  getActiveUsername,
  setActiveUsername,
  ensureJonAccountWithCurrentProgress,
} from '../utils/accountStorage';
import {
  calculateLevelData,
  triggerLevelUpConfetti,
  sound,
} from '../utils/gamification';
import { getPhilippineDateString } from '../utils/phTime';

interface HunterContextType {
  user: User | null;
  authLoading: boolean;
  profile: HunterProfile;
  dailyLog: DailyLogData;
  workoutSplits: WorkoutSplit[];
  activeSplitId: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  // Auth Portal Account
  currentAccount: HunterAccountData | null;
  loginAccount: (
    username: string,
    password: string
  ) => { success: boolean; message?: string; account?: HunterAccountData };
  registerAccount: (
    username: string,
    password: string,
    displayName: string
  ) => { success: boolean; message?: string; account?: HunterAccountData };
  logoutAccount: () => void;
  saveProgressToAccount: () => void;
  // Actions
  addMeal: (meal: Omit<MealItem, 'id' | 'timestamp'>) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
  addCardio: (cardio: Omit<CardioLog, 'id' | 'timestamp' | 'xpAwarded'>) => Promise<void>;
  deleteCardio: (cardioId: string) => Promise<void>;
  toggleExerciseCompletion: (
    splitId: string,
    dayId: string,
    exerciseId: string,
    xpValue: number,
    exerciseName: string
  ) => Promise<void>;
  addWorkoutSplit: (
    split: Omit<WorkoutSplit, 'splitId' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  importSplitFromJson: (importedSplit: WorkoutSplit) => Promise<void>;
  updateWorkoutSplit: (
    splitId: string,
    updatedData: Partial<WorkoutSplit>
  ) => Promise<void>;
  deleteWorkoutSplit: (splitId: string) => Promise<void>;
  deleteDayFromSplit: (splitId: string, dayId: string) => Promise<void>;
  deleteExerciseFromSplit: (splitId: string, dayId: string, exerciseId: string) => Promise<void>;
  addExerciseToDay: (splitId: string, dayId: string, exercise: ExerciseItem) => Promise<void>;
  addDayToSplit: (splitId: string, dayName: string, targetFocus?: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  setActiveSplit: (splitId: string) => void;
  updateMacroGoals: (goals: {
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
  }) => Promise<void>;
  // Gamification UI
  levelUpModalData: {
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    rank: string;
    unlockedPerk?: string;
  } | null;
  closeLevelUpModal: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  recentXpNotification: { xp: number; reason: string } | null;
}

const defaultHunterStats = {
  strength: 10,
  agility: 10,
  endurance: 10,
  vitality: 10,
  discipline: 1,
};

const defaultInitialProfile: HunterProfile = {
  userId: 'local-hunter',
  displayName: 'Jon',
  hunterTitle: 'E-Rank Dungeon Scout',
  level: 1,
  totalXp: 0,
  currentLevelXp: 0,
  xpToNextLevel: 1000,
  progressPercent: 0,
  hunterRank: 'E-Rank',
  stats: defaultHunterStats,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  calorieGoal: 2500,
  proteinGoal: 180,
  carbsGoal: 260,
  fatGoal: 70,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial default science-based Solo Leveling routine
const initialDefaultSplits: WorkoutSplit[] = [
  {
    splitId: 'shadow-ppl-split',
    userId: 'local-hunter',
    name: 'Shadow Monarch 3-Day Hypertrophy Split',
    description: 'Science-grounded push-pull-legs architecture with Progressive Overload XP ratings.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    days: [
      {
        id: 'day-1-push',
        dayName: 'Day 1: Power Push (Chest, Shoulders & Triceps)',
        targetFocus: 'Anterior Chain Hypertrophy',
        exercises: [
          {
            id: 'ex-barbell-bench',
            name: 'Barbell Flat Bench Press',
            targetMuscle: 'Chest',
            sets: 4,
            reps: 8,
            weightKg: 85,
            xpValue: 350,
            progressiveOverloadTip: 'Add 2.5kg or push for 9 reps once RPE drops below 8.',
          },
          {
            id: 'ex-incline-db',
            name: 'Incline Dumbbell Press (30°)',
            targetMuscle: 'Upper Chest',
            sets: 3,
            reps: 10,
            weightKg: 30,
            xpValue: 300,
            progressiveOverloadTip: 'Control the 3-second eccentric stretch at the bottom.',
          },
          {
            id: 'ex-cable-lateral',
            name: 'Behind-the-Back Cable Lateral Raise',
            targetMuscle: 'Lateral Deltoids',
            sets: 4,
            reps: 15,
            weightKg: 12,
            xpValue: 220,
            progressiveOverloadTip: 'Peak contraction hold at 90 degrees.',
          },
          {
            id: 'ex-tricep-pushdown',
            name: 'Rope Triceps Pushdown',
            targetMuscle: 'Triceps',
            sets: 3,
            reps: 12,
            weightKg: 35,
            xpValue: 200,
            progressiveOverloadTip: 'Spread rope apart at full lockout.',
          },
        ],
      },
      {
        id: 'day-2-pull',
        dayName: 'Day 2: Shadow Pull (Lats, Upper Back & Biceps)',
        targetFocus: 'Posterior Lat Width & Thickness',
        exercises: [
          {
            id: 'ex-weighted-pullups',
            name: 'Weighted Pull-Ups',
            targetMuscle: 'Lats',
            sets: 4,
            reps: 6,
            weightKg: 15,
            xpValue: 400,
            progressiveOverloadTip: 'Chest to bar with zero kipping momentum.',
          },
          {
            id: 'ex-chest-supported-row',
            name: 'Chest-Supported T-Bar Row',
            targetMuscle: 'Mid-Back / Rhomboids',
            sets: 4,
            reps: 10,
            weightKg: 65,
            xpValue: 320,
            progressiveOverloadTip: 'Full protraction at start, hard scapular retraction.',
          },
          {
            id: 'ex-face-pulls',
            name: 'Cable Face Pulls with External Rotation',
            targetMuscle: 'Rear Delts & Rotator Cuff',
            sets: 3,
            reps: 15,
            weightKg: 25,
            xpValue: 200,
            progressiveOverloadTip: 'Critical for shoulder longevity and posture.',
          },
          {
            id: 'ex-incline-curl',
            name: 'Incline Dumbbell Bicep Curl',
            targetMuscle: 'Biceps Long Head',
            sets: 3,
            reps: 10,
            weightKg: 16,
            xpValue: 250,
            progressiveOverloadTip: 'Full passive stretch behind torso.',
          },
        ],
      },
      {
        id: 'day-3-legs',
        dayName: 'Day 3: Monarch Legs & Core (Quads, Hamstrings & Calves)',
        targetFocus: 'Lower Body Kinetic Force',
        exercises: [
          {
            id: 'ex-barbell-squat',
            name: 'Barbell Back Squat (High-Bar)',
            targetMuscle: 'Quads & Glutes',
            sets: 4,
            reps: 6,
            weightKg: 120,
            xpValue: 500,
            progressiveOverloadTip: 'Break parallel depth with controlled tempo.',
          },
          {
            id: 'ex-romanian-deadlift',
            name: 'Romanian Deadlift (RDL)',
            targetMuscle: 'Hamstrings & Glutes',
            sets: 3,
            reps: 8,
            weightKg: 105,
            xpValue: 420,
            progressiveOverloadTip: 'Hinge back until deep hamstring stretch before firing glutes.',
          },
          {
            id: 'ex-bulgarian-split-squat',
            name: 'Bulgarian Split Squat',
            targetMuscle: 'Unilateral Quads',
            sets: 3,
            reps: 10,
            weightKg: 24,
            xpValue: 350,
            progressiveOverloadTip: 'Elevate rear foot on soft pad.',
          },
          {
            id: 'ex-hanging-leg-raise',
            name: 'Hanging Leg Raises to Bar',
            targetMuscle: 'Lower Abdominals',
            sets: 3,
            reps: 12,
            weightKg: 0,
            xpValue: 250,
            progressiveOverloadTip: 'Tilt pelvis upward at apex of lift.',
          },
        ],
      },
    ],
  },
];

const initialSampleMeals: MealItem[] = [];
const initialSampleCardio: CardioLog[] = [];

const HunterContext = createContext<HunterContextType | undefined>(undefined);

export const HunterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getPhilippineDateString();
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Automatic one-time fresh start wipe requested by user
  try {
    if (typeof window !== 'undefined' && !localStorage.getItem('hunter_fresh_reset_v4')) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('hunter_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('hunter_fresh_reset_v4', 'true');
    }
  } catch {
    // fallback
  }

  // Profile state - clean starting slate (Level 1, 0 XP, Jon)
  const [profile, setProfile] = useState<HunterProfile>(() => {
    const saved = localStorage.getItem('hunter_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.displayName || parsed.displayName.includes('Sung Jin-Woo')) {
          parsed.displayName = 'Jon';
        }
        const totalXp = parsed.totalXp || 0;
        const levelData = calculateLevelData(totalXp);
        return { ...parsed, ...levelData, totalXp, displayName: parsed.displayName || 'Jon' };
      } catch {
        // fallback
      }
    }
    const levelData = calculateLevelData(0);
    return { ...defaultInitialProfile, ...levelData, displayName: 'Jon', totalXp: 0 };
  });

  // Daily log state in Philippine Standard Time (PST, UTC+8)
  const [dailyLog, setDailyLog] = useState<DailyLogData>(() => {
    const today = getPhilippineDateString();
    const saved = localStorage.getItem(`hunter_log_${today}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Strip out pre-logged sample entries so user has completely fresh logs
        const meals = (parsed.meals || []).filter(
          (m: MealItem) => !m.id.startsWith('sample-meal')
        );
        const cardio = (parsed.cardio || []).filter(
          (c: CardioLog) => !c.id.startsWith('sample-cardio')
        );
        return {
          ...parsed,
          meals,
          cardio,
        };
      } catch {
        // fallback
      }
    }
    return {
      date: today,
      userId: 'local-hunter',
      meals: [],
      cardio: [],
      completedExercisesToday: [],
      updatedAt: new Date().toISOString(),
    };
  });

  // Workout splits state
  const [workoutSplits, setWorkoutSplits] = useState<WorkoutSplit[]>(() => {
    const saved = localStorage.getItem('hunter_splits');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return initialDefaultSplits;
  });

  const [activeSplitId, setActiveSplitId] = useState<string | null>('shadow-ppl-split');
  const [levelUpModalData, setLevelUpModalData] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
    rank: string;
    unlockedPerk?: string;
  } | null>(null);

  const [recentXpNotification, setRecentXpNotification] = useState<{
    xp: number;
    reason: string;
  } | null>(null);

  // Multi-user Account Portal State (Default: user: jon pass: jon)
  const [currentAccount, setCurrentAccount] = useState<HunterAccountData | null>(() => {
    // Seed and bind current initial data to jon account
    const jon = ensureJonAccountWithCurrentProgress(
      defaultInitialProfile,
      initialDefaultSplits,
      {}
    );
    const activeUsername = getActiveUsername();
    if (!activeUsername || activeUsername === 'jon') {
      setActiveUsername('jon');
      return jon;
    }
    const accounts = getStoredAccounts();
    return accounts[activeUsername] || jon;
  });

  // Sync sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Synchronize and bind all current progress to the active hunter account (e.g. user: jon pass: jon)
  useEffect(() => {
    if (currentAccount) {
      const accounts = getStoredAccounts();
      const userKey = currentAccount.username.toLowerCase();
      const updatedAccount: HunterAccountData = {
        ...currentAccount,
        profile: {
          ...profile,
          displayName: currentAccount.displayName || profile.displayName,
        },
        dailyLogs: {
          ...(currentAccount.dailyLogs || {}),
          [dailyLog.date]: dailyLog,
        },
        workoutSplits,
        lastLoginAt: new Date().toISOString(),
      };
      accounts[userKey] = updatedAccount;
      saveAccountToStorage(updatedAccount);
    }
  }, [profile, dailyLog, workoutSplits, currentAccount]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setProfile((prev) => ({
          ...prev,
          userId: currentUser.uid,
          displayName: currentUser.displayName || prev.displayName,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Save to localStorage whenever local states change
  useEffect(() => {
    localStorage.setItem('hunter_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`hunter_log_${dailyLog.date}`, JSON.stringify(dailyLog));
  }, [dailyLog]);

  useEffect(() => {
    localStorage.setItem('hunter_splits', JSON.stringify(workoutSplits));
  }, [workoutSplits]);

  // Load date-specific log from local storage when not signed into an account
  useEffect(() => {
    if (user) return;
    if (dailyLog.date === selectedDate) return;
    const saved = localStorage.getItem(`hunter_log_${selectedDate}`);
    if (saved) {
      try {
        setDailyLog(JSON.parse(saved));
        return;
      } catch {
        // fallback
      }
    }
    setDailyLog({
      date: selectedDate,
      userId: 'local-hunter',
      meals: [],
      cardio: [],
      completedExercisesToday: [],
      updatedAt: new Date().toISOString(),
    });
  }, [selectedDate, user, dailyLog.date]);

  // Track active Philippine Date reference for 12:00 AM midnight reset
  const phDateRef = useRef<string>(getPhilippineDateString());

  // Automatic midnight transition checker (Philippine Time Asia/Manila, UTC+8)
  useEffect(() => {
    const checkMidnight = () => {
      const currentPhDate = getPhilippineDateString();
      if (currentPhDate !== phDateRef.current) {
        const previousDate = phDateRef.current;
        phDateRef.current = currentPhDate;

        // Auto-advance date to new Philippine day if user was on the current date
        setSelectedDate((prevDate) => (prevDate === previousDate ? currentPhDate : prevDate));

        // Reset or load daily log for the fresh Philippine day
        const savedLog = localStorage.getItem(`hunter_log_${currentPhDate}`);
        if (savedLog) {
          try {
            setDailyLog(JSON.parse(savedLog));
          } catch {
            setDailyLog({
              date: currentPhDate,
              userId: user ? user.uid : 'local-hunter',
              meals: [],
              cardio: [],
              completedExercisesToday: [],
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          setDailyLog({
            date: currentPhDate,
            userId: user ? user.uid : 'local-hunter',
            meals: [],
            cardio: [],
            completedExercisesToday: [],
            updatedAt: new Date().toISOString(),
          });
        }

        // Display midnight reset alert
        setRecentXpNotification({
          xp: 0,
          reason: 'PH MIDNIGHT RESET: 12:00 AM (Asia/Manila). Daily macro progress & quests reset!',
        });
      }
    };

    const interval = setInterval(checkMidnight, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Sync Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);

    // Snapshot listener on UserProfile
    const unsubProfile: Unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const levelData = calculateLevelData(data.totalXp ?? profile.totalXp);
          setProfile((prev) => ({
            ...prev,
            ...data,
            ...levelData,
            userId: user.uid,
          }));
        } else {
          // Initialize document in Firestore
          const initialData = {
            userId: user.uid,
            displayName: user.displayName || 'Hunter',
            level: profile.level,
            totalXp: profile.totalXp,
            hunterRank: profile.hunterRank,
            calorieGoal: profile.calorieGoal,
            proteinGoal: profile.proteinGoal,
            carbsGoal: profile.carbsGoal,
            fatGoal: profile.fatGoal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setDoc(userDocRef, initialData).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    );

    // Snapshot listener on DailyLog
    const dailyLogDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
    const unsubDaily: Unsubscribe = onSnapshot(
      dailyLogDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as DailyLogData;
          setDailyLog(data);
        } else {
          // If no remote log yet for today, seed with current local state
          const newRemoteLog: DailyLogData = {
            date: selectedDate,
            userId: user.uid,
            meals: dailyLog.date === selectedDate ? dailyLog.meals : [],
            cardio: dailyLog.date === selectedDate ? dailyLog.cardio : [],
            completedExercisesToday: dailyLog.date === selectedDate ? dailyLog.completedExercisesToday : [],
            updatedAt: new Date().toISOString(),
          };
          setDoc(dailyLogDocRef, newRemoteLog).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyLogs/${selectedDate}`);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/dailyLogs/${selectedDate}`);
      }
    );

    // Snapshot listener on WorkoutSplits
    const splitsColRef = collection(db, 'users', user.uid, 'workoutSplits');
    const unsubSplits: Unsubscribe = onSnapshot(
      splitsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedSplits: WorkoutSplit[] = [];
          snapshot.forEach((docSnap) => {
            loadedSplits.push(docSnap.data() as WorkoutSplit);
          });
          setWorkoutSplits(loadedSplits);
        } else {
          // Seed the initial default routine to remote
          initialDefaultSplits.forEach((split) => {
            const splitDoc = doc(db, 'users', user.uid, 'workoutSplits', split.splitId);
            setDoc(splitDoc, { ...split, userId: user.uid }).catch((err) => {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/workoutSplits/${split.splitId}`);
            });
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/workoutSplits`);
      }
    );

    return () => {
      unsubProfile();
      unsubDaily();
      unsubSplits();
    };
  }, [user, selectedDate]);

  // Award XP with level calculation, sound, confetti, and alert modal
  const awardXp = useCallback(
    (xpAmount: number, reason: string) => {
      setRecentXpNotification({ xp: xpAmount, reason });
      sound.play('xp_gain');

      setTimeout(() => {
        setRecentXpNotification(null);
      }, 3500);

      setProfile((prev) => {
        const oldLevel = prev.level;
        const newTotalXp = prev.totalXp + xpAmount;
        const levelData = calculateLevelData(newTotalXp);

        // Check if level increased
        if (levelData.level > oldLevel) {
          triggerLevelUpConfetti();
          sound.play('level_up');
          setLevelUpModalData({
            isOpen: true,
            oldLevel,
            newLevel: levelData.level,
            rank: levelData.hunterRank,
            unlockedPerk: `Attributes increased: +${(levelData.level - oldLevel) * 2} STR, +${(levelData.level - oldLevel) * 2} VIT. Rank Authority: ${levelData.hunterRank}!`,
          });
        }

        const updatedProfile: HunterProfile = {
          ...prev,
          ...levelData,
          totalXp: newTotalXp,
          stats: {
            ...prev.stats,
            strength: prev.stats.strength + Math.floor(xpAmount / 350),
            vitality: prev.stats.vitality + Math.floor(xpAmount / 400),
          },
          updatedAt: new Date().toISOString(),
        };

        // Sync to Firestore if signed in
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(
            userDocRef,
            {
              level: updatedProfile.level,
              totalXp: updatedProfile.totalXp,
              hunterRank: updatedProfile.hunterRank,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          });
        }

        return updatedProfile;
      });
    },
    [user]
  );

  // Add meal
  const addMeal = useCallback(
    async (mealData: Omit<MealItem, 'id' | 'timestamp'>) => {
      const newMeal: MealItem = {
        ...mealData,
        id: 'meal_' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedMeals = [newMeal, ...dailyLog.meals];
      const updatedLog: DailyLogData = {
        ...dailyLog,
        meals: updatedMeals,
        updatedAt: new Date().toISOString(),
      };

      setDailyLog(updatedLog);

      // Award XP for adhering to nutritional discipline
      const mealXp = Math.min(250, Math.max(100, Math.round(newMeal.protein * 3)));
      awardXp(mealXp, `Logged ${newMeal.category}: +${newMeal.protein}g Protein`);

      // Sync Firestore
      if (user) {
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
        await setDoc(logDocRef, updatedLog, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyLogs/${selectedDate}`);
        });
      }
    },
    [dailyLog, selectedDate, user, awardXp]
  );

  // Delete meal
  const deleteMeal = useCallback(
    async (mealId: string) => {
      const updatedMeals = dailyLog.meals.filter((m) => m.id !== mealId);
      const updatedLog: DailyLogData = {
        ...dailyLog,
        meals: updatedMeals,
        updatedAt: new Date().toISOString(),
      };
      setDailyLog(updatedLog);

      if (user) {
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
        await setDoc(logDocRef, updatedLog, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/dailyLogs/${selectedDate}`);
        });
      }
    },
    [dailyLog, selectedDate, user]
  );

  // Add cardio log
  const addCardio = useCallback(
    async (cardioData: Omit<CardioLog, 'id' | 'timestamp' | 'xpAwarded'>) => {
      // Calculate XP based on distance and calories: 100 XP per 1km or 150 cal
      const calculatedXp = Math.min(600, Math.max(150, Math.round(cardioData.distanceKm * 70 + cardioData.activeCaloriesBurned * 0.3)));
      const newCardio: CardioLog = {
        ...cardioData,
        id: 'cardio_' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        xpAwarded: calculatedXp,
      };

      const updatedCardioList = [newCardio, ...dailyLog.cardio];
      const updatedLog: DailyLogData = {
        ...dailyLog,
        cardio: updatedCardioList,
        updatedAt: new Date().toISOString(),
      };
      setDailyLog(updatedLog);

      awardXp(calculatedXp, `Completed ${newCardio.activityType} (${newCardio.distanceKm} km)`);

      // Update agility & endurance stats
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          endurance: prev.stats.endurance + Math.round(newCardio.distanceKm),
          agility: prev.stats.agility + 2,
        },
      }));

      if (user) {
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
        await setDoc(logDocRef, updatedLog, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyLogs/${selectedDate}`);
        });
      }
    },
    [dailyLog, selectedDate, user, awardXp]
  );

  // Delete cardio
  const deleteCardio = useCallback(
    async (cardioId: string) => {
      const updatedCardioList = dailyLog.cardio.filter((c) => c.id !== cardioId);
      const updatedLog: DailyLogData = {
        ...dailyLog,
        cardio: updatedCardioList,
        updatedAt: new Date().toISOString(),
      };
      setDailyLog(updatedLog);

      if (user) {
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
        await setDoc(logDocRef, updatedLog, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/dailyLogs/${selectedDate}`);
        });
      }
    },
    [dailyLog, selectedDate, user]
  );

  // Toggle Exercise completion
  const toggleExerciseCompletion = useCallback(
    async (
      splitId: string,
      dayId: string,
      exerciseId: string,
      xpValue: number,
      exerciseName: string
    ) => {
      const alreadyCompleted = dailyLog.completedExercisesToday.some(
        (c) => c.splitId === splitId && c.dayId === dayId && c.exerciseId === exerciseId
      );

      let updatedCompletions = [...dailyLog.completedExercisesToday];

      if (alreadyCompleted) {
        updatedCompletions = updatedCompletions.filter(
          (c) => !(c.splitId === splitId && c.dayId === dayId && c.exerciseId === exerciseId)
        );
      } else {
        updatedCompletions.push({
          splitId,
          dayId,
          exerciseId,
          xpEarned: xpValue,
          timestamp: new Date().toISOString(),
        });
        // Award XP and play sound
        awardXp(xpValue, `Quest Completed: ${exerciseName} (+${xpValue} XP)`);
        sound.play('quest_complete');
      }

      const updatedLog: DailyLogData = {
        ...dailyLog,
        completedExercisesToday: updatedCompletions,
        updatedAt: new Date().toISOString(),
      };

      setDailyLog(updatedLog);

      if (user) {
        const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', selectedDate);
        await setDoc(logDocRef, updatedLog, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyLogs/${selectedDate}`);
        });
      }
    },
    [dailyLog, selectedDate, user, awardXp]
  );

  // Add custom workout split
  const addWorkoutSplit = useCallback(
    async (
      splitData: Omit<WorkoutSplit, 'splitId' | 'userId' | 'createdAt' | 'updatedAt'>
    ) => {
      const splitId = 'split_' + Date.now();
      const newSplit: WorkoutSplit = {
        ...splitData,
        splitId,
        userId: user ? user.uid : 'local-hunter',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
      };

      const updatedSplits = [...workoutSplits, newSplit];
      setWorkoutSplits(updatedSplits);
      setActiveSplitId(splitId);
      awardXp(150, `Created New Split Routine: ${newSplit.name}`);

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        await setDoc(splitDocRef, newSplit).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/workoutSplits/${splitId}`);
        });
      }
    },
    [workoutSplits, user, awardXp]
  );

  // Update existing custom split
  const updateWorkoutSplit = useCallback(
    async (splitId: string, updatedData: Partial<WorkoutSplit>) => {
      const updatedSplits = workoutSplits.map((s) => {
        if (s.splitId !== splitId) return s;
        return {
          ...s,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        };
      });

      setWorkoutSplits(updatedSplits);
      sound.play('click');

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        const target = updatedSplits.find((s) => s.splitId === splitId);
        if (target) {
          await setDoc(splitDocRef, target, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutSplits/${splitId}`);
          });
        }
      }
    },
    [workoutSplits, user]
  );

  // Delete custom split
  const deleteWorkoutSplit = useCallback(
    async (splitId: string) => {
      const updated = workoutSplits.filter((s) => s.splitId !== splitId);
      setWorkoutSplits(updated);
      if (activeSplitId === splitId && updated.length > 0) {
        setActiveSplitId(updated[0].splitId);
      }

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        await deleteDoc(splitDocRef).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/workoutSplits/${splitId}`);
        });
      }
    },
    [workoutSplits, activeSplitId, user]
  );

  // Delete a specific Day from a Split routine
  const deleteDayFromSplit = useCallback(
    async (splitId: string, dayId: string) => {
      const updatedSplits = workoutSplits.map((s) => {
        if (s.splitId !== splitId) return s;
        const filteredDays = s.days.filter((d) => d.id !== dayId);
        return {
          ...s,
          days: filteredDays,
          updatedAt: new Date().toISOString(),
        };
      });

      setWorkoutSplits(updatedSplits);

      // Clean up completed exercises recorded today for this deleted day
      setDailyLog((prev) => ({
        ...prev,
        completedExercisesToday: prev.completedExercisesToday.filter(
          (c) => !(c.splitId === splitId && c.dayId === dayId)
        ),
        updatedAt: new Date().toISOString(),
      }));

      sound.play('click');

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        const target = updatedSplits.find((s) => s.splitId === splitId);
        if (target) {
          await setDoc(splitDocRef, target, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutSplits/${splitId}`);
          });
        }
      }
    },
    [workoutSplits, user]
  );

  // Delete an individual Exercise (Workout) from a Day in a Split
  const deleteExerciseFromSplit = useCallback(
    async (splitId: string, dayId: string, exerciseId: string) => {
      const updatedSplits = workoutSplits.map((s) => {
        if (s.splitId !== splitId) return s;
        const updatedDays = s.days.map((d) => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            exercises: d.exercises.filter((ex) => ex.id !== exerciseId),
          };
        });
        return {
          ...s,
          days: updatedDays,
          updatedAt: new Date().toISOString(),
        };
      });

      setWorkoutSplits(updatedSplits);

      // Remove completion status if this exercise was checked off today
      setDailyLog((prev) => ({
        ...prev,
        completedExercisesToday: prev.completedExercisesToday.filter(
          (c) => !(c.splitId === splitId && c.dayId === dayId && c.exerciseId === exerciseId)
        ),
        updatedAt: new Date().toISOString(),
      }));

      sound.play('click');

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        const target = updatedSplits.find((s) => s.splitId === splitId);
        if (target) {
          await setDoc(splitDocRef, target, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutSplits/${splitId}`);
          });
        }
      }
    },
    [workoutSplits, user]
  );

  // Add an individual Exercise to a Day
  const addExerciseToDay = useCallback(
    async (splitId: string, dayId: string, exercise: ExerciseItem) => {
      const updatedSplits = workoutSplits.map((s) => {
        if (s.splitId !== splitId) return s;
        const updatedDays = s.days.map((d) => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            exercises: [...d.exercises, exercise],
          };
        });
        return {
          ...s,
          days: updatedDays,
          updatedAt: new Date().toISOString(),
        };
      });

      setWorkoutSplits(updatedSplits);
      awardXp(50, `Added Exercise: ${exercise.name}`);

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        const target = updatedSplits.find((s) => s.splitId === splitId);
        if (target) {
          await setDoc(splitDocRef, target, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutSplits/${splitId}`);
          });
        }
      }
    },
    [workoutSplits, user, awardXp]
  );

  // Add a Day to a Split
  const addDayToSplit = useCallback(
    async (splitId: string, dayName: string, targetFocus: string = 'General Conditioning') => {
      const newDay: WorkoutDay = {
        id: 'day_' + Date.now(),
        dayName,
        targetFocus,
        exercises: [],
      };

      const updatedSplits = workoutSplits.map((s) => {
        if (s.splitId !== splitId) return s;
        return {
          ...s,
          days: [...s.days, newDay],
          updatedAt: new Date().toISOString(),
        };
      });

      setWorkoutSplits(updatedSplits);
      sound.play('click');

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', splitId);
        const target = updatedSplits.find((s) => s.splitId === splitId);
        if (target) {
          await setDoc(splitDocRef, target, { merge: true }).catch((err) => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/workoutSplits/${splitId}`);
          });
        }
      }
    },
    [workoutSplits, user]
  );

  // Full System Reset / Fresh Start
  const resetAllData = useCallback(async () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('hunter_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('hunter_fresh_v4', 'true');
    } catch (e) {
      console.warn('LocalStorage reset error', e);
    }

    // Reset profile to pristine Level 1 with 0 XP
    const cleanLevelData = calculateLevelData(0);
    const freshProfile: HunterProfile = {
      ...defaultInitialProfile,
      ...cleanLevelData,
      displayName: user?.displayName || 'Jon',
      userId: user ? user.uid : 'local-hunter',
      totalXp: 0,
      currentLevelXp: 0,
      level: 1,
      stats: defaultHunterStats,
      streakDays: 1,
      updatedAt: new Date().toISOString(),
    };
    setProfile(freshProfile);

    // Reset Daily Log to empty
    const today = new Date().toISOString().split('T')[0];
    const freshDailyLog: DailyLogData = {
      date: today,
      userId: user ? user.uid : 'local-hunter',
      meals: [],
      cardio: [],
      completedExercisesToday: [],
      updatedAt: new Date().toISOString(),
    };
    setDailyLog(freshDailyLog);

    // Reset Splits to clean default routine
    setWorkoutSplits(initialDefaultSplits);
    setActiveSplitId('shadow-ppl-split');

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, freshProfile).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      });
      const logDocRef = doc(db, 'users', user.uid, 'dailyLogs', today);
      await setDoc(logDocRef, freshDailyLog).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/dailyLogs/${today}`);
      });
    }

    sound.play('quest_complete');
  }, [user]);

  const setActiveSplit = useCallback((splitId: string) => {
    setActiveSplitId(splitId);
  }, []);

  // Update Macro goals
  const updateMacroGoals = useCallback(
    async (goals: {
      calorieGoal: number;
      proteinGoal: number;
      carbsGoal: number;
      fatGoal: number;
    }) => {
      setProfile((prev) => ({
        ...prev,
        ...goals,
        updatedAt: new Date().toISOString(),
      }));

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, goals, { merge: true }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        });
      }
    },
    [user]
  );

  // Save Current Progress Manually to Active Account
  const saveProgressToAccount = useCallback(() => {
    if (currentAccount) {
      const userKey = currentAccount.username.toLowerCase();
      const accounts = getStoredAccounts();
      const updatedAccount: HunterAccountData = {
        ...currentAccount,
        profile: {
          ...profile,
          displayName: currentAccount.displayName || profile.displayName,
        },
        dailyLogs: {
          ...(currentAccount.dailyLogs || {}),
          [dailyLog.date]: dailyLog,
        },
        workoutSplits,
        lastLoginAt: new Date().toISOString(),
      };
      accounts[userKey] = updatedAccount;
      saveAccountToStorage(updatedAccount);
      setCurrentAccount(updatedAccount);
      sound.play('quest_complete');
    }
  }, [currentAccount, profile, dailyLog, workoutSplits]);

  // Login with Hunter Portal credentials (supports user: jon pass: jon)
  const loginAccount = useCallback(
    (uName: string, pass: string) => {
      const cleanUser = uName.trim().toLowerCase();
      // Ensure jon exists with current progress before checking
      ensureJonAccountWithCurrentProgress(profile, workoutSplits, { [dailyLog.date]: dailyLog });
      const accounts = getStoredAccounts();
      const target = accounts[cleanUser];

      if (!target) {
        return { success: false, message: `Hunter account "${uName}" not found.` };
      }

      if (target.password !== pass) {
        return { success: false, message: 'Invalid password. Access Denied.' };
      }

      // Successful login
      target.lastLoginAt = new Date().toISOString();
      saveAccountToStorage(target);
      setActiveUsername(target.username);
      setCurrentAccount(target);

      // Restore user progress
      if (target.profile) {
        setProfile(target.profile);
      }
      if (target.workoutSplits && target.workoutSplits.length > 0) {
        setWorkoutSplits(target.workoutSplits);
        setActiveSplitId(target.workoutSplits[0].splitId);
      }
      if (target.dailyLogs && target.dailyLogs[selectedDate]) {
        setDailyLog(target.dailyLogs[selectedDate]);
      }

      sound.play('quest_complete');
      return { success: true, account: target };
    },
    [profile, workoutSplits, dailyLog, selectedDate]
  );

  // Register new Hunter Portal Account
  const registerAccount = useCallback(
    (uName: string, pass: string, dispName: string) => {
      const cleanUser = uName.trim().toLowerCase();
      const accounts = getStoredAccounts();

      if (accounts[cleanUser]) {
        return { success: false, message: `Username "${uName}" is already taken.` };
      }

      const newLevelData = calculateLevelData(0);
      const newAccountProfile: HunterProfile = {
        ...defaultInitialProfile,
        ...newLevelData,
        userId: `hunter-${cleanUser}`,
        displayName: dispName.trim() || uName.trim(),
        totalXp: 0,
        currentLevelXp: 0,
        level: 1,
        stats: defaultHunterStats,
        streakDays: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newAccount: HunterAccountData = {
        username: cleanUser,
        password: pass,
        displayName: dispName.trim() || uName.trim(),
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: newAccountProfile,
        dailyLogs: {},
        workoutSplits: initialDefaultSplits,
      };

      saveAccountToStorage(newAccount);
      setActiveUsername(cleanUser);
      setCurrentAccount(newAccount);
      setProfile(newAccountProfile);
      setWorkoutSplits(initialDefaultSplits);
      setActiveSplitId('shadow-ppl-split');

      sound.play('level_up');
      return { success: true, account: newAccount };
    },
    []
  );

  // Logout from Hunter Account
  const logoutAccount = useCallback(() => {
    setActiveUsername(null);
    setCurrentAccount(null);
    sound.play('click');
  }, []);

  // Import Workout Split from JSON File
  const importSplitFromJson = useCallback(
    async (importedSplit: WorkoutSplit) => {
      const updatedSplits = [...workoutSplits, importedSplit];
      setWorkoutSplits(updatedSplits);
      setActiveSplitId(importedSplit.splitId);
      awardXp(200, `Imported Split (.JSON): ${importedSplit.name}`);
      sound.play('quest_complete');

      if (user) {
        const splitDocRef = doc(db, 'users', user.uid, 'workoutSplits', importedSplit.splitId);
        await setDoc(splitDocRef, importedSplit).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/workoutSplits/${importedSplit.splitId}`);
        });
      }
    },
    [workoutSplits, user, awardXp]
  );

  const closeLevelUpModal = useCallback(() => {
    setLevelUpModalData(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authLoading,
      profile,
      dailyLog,
      workoutSplits,
      activeSplitId,
      selectedDate,
      setSelectedDate,
      currentAccount,
      loginAccount,
      registerAccount,
      logoutAccount,
      saveProgressToAccount,
      addMeal,
      deleteMeal,
      addCardio,
      deleteCardio,
      toggleExerciseCompletion,
      addWorkoutSplit,
      importSplitFromJson,
      updateWorkoutSplit,
      deleteWorkoutSplit,
      deleteDayFromSplit,
      deleteExerciseFromSplit,
      addExerciseToDay,
      addDayToSplit,
      resetAllData,
      setActiveSplit,
      updateMacroGoals,
      levelUpModalData,
      closeLevelUpModal,
      soundEnabled,
      setSoundEnabled,
      recentXpNotification,
    }),
    [
      user,
      authLoading,
      profile,
      dailyLog,
      workoutSplits,
      activeSplitId,
      selectedDate,
      setSelectedDate,
      currentAccount,
      loginAccount,
      registerAccount,
      logoutAccount,
      saveProgressToAccount,
      addMeal,
      deleteMeal,
      addCardio,
      deleteCardio,
      toggleExerciseCompletion,
      addWorkoutSplit,
      importSplitFromJson,
      updateWorkoutSplit,
      deleteWorkoutSplit,
      deleteDayFromSplit,
      deleteExerciseFromSplit,
      addExerciseToDay,
      addDayToSplit,
      resetAllData,
      setActiveSplit,
      updateMacroGoals,
      levelUpModalData,
      closeLevelUpModal,
      soundEnabled,
      recentXpNotification,
    ]
  );

  return <HunterContext.Provider value={value}>{children}</HunterContext.Provider>;
};

export const useHunter = (): HunterContextType => {
  const context = useContext(HunterContext);
  if (!context) {
    throw new Error('useHunter must be used within a HunterProvider');
  }
  return context;
};

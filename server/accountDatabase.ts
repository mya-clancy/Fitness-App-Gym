import fs from 'fs';
import path from 'path';

export interface HunterAccountData {
  username: string;
  password: string;
  displayName: string;
  createdAt: string;
  lastLoginAt: string;
  profile: any;
  dailyLogs: Record<string, any>;
  workoutSplits: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const SPLITS_FILE = path.join(DATA_DIR, 'splits.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const defaultJonAccount: HunterAccountData = {
  username: 'jon',
  password: 'jon',
  displayName: 'Jon',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  profile: {
    userId: 'hunter-jon',
    displayName: 'Jon',
    hunterTitle: 'E-Rank Dungeon Scout',
    level: 1,
    totalXp: 0,
    currentLevelXp: 0,
    xpToNextLevel: 1000,
    progressPercent: 0,
    hunterRank: 'E-Rank',
    stats: {
      strength: 10,
      agility: 10,
      endurance: 10,
      vitality: 10,
      discipline: 1,
    },
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    calorieGoal: 2500,
    proteinGoal: 180,
    carbsGoal: 260,
    fatGoal: 70,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  dailyLogs: {},
  workoutSplits: [],
};

export function getAllAccounts(): Record<string, HunterAccountData> {
  ensureDataDir();
  if (!fs.existsSync(ACCOUNTS_FILE)) {
    const initial: Record<string, HunterAccountData> = { jon: defaultJonAccount };
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.jon) {
      parsed.jon = defaultJonAccount;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read accounts file:', err);
    return { jon: defaultJonAccount };
  }
}

export function getAccount(username: string): HunterAccountData | null {
  const accounts = getAllAccounts();
  return accounts[username.toLowerCase()] || null;
}

export function saveAccount(account: HunterAccountData): void {
  ensureDataDir();
  const accounts = getAllAccounts();
  const userKey = account.username.toLowerCase();
  
  // If account exists, merge splits and logs
  const existing = accounts[userKey];
  if (existing) {
    accounts[userKey] = {
      ...existing,
      ...account,
      profile: { ...(existing.profile || {}), ...(account.profile || {}) },
      dailyLogs: { ...(existing.dailyLogs || {}), ...(account.dailyLogs || {}) },
      workoutSplits: account.workoutSplits && account.workoutSplits.length > 0
        ? account.workoutSplits
        : (existing.workoutSplits || []),
      lastLoginAt: new Date().toISOString(),
    };
  } else {
    accounts[userKey] = account;
  }

  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write accounts file:', err);
  }
}

export function getAllSplits(): any[] {
  ensureDataDir();
  if (!fs.existsSync(SPLITS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(SPLITS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read splits file:', err);
    return [];
  }
}

export function saveSplits(splits: any[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(SPLITS_FILE, JSON.stringify(splits, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write splits file:', err);
  }
}

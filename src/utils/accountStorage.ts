import { HunterAccountData } from '../types/auth';
import { HunterProfile, DailyLogData, WorkoutSplit } from '../types/hunter';

const ACCOUNTS_KEY = 'hunter_accounts_db';
const ACTIVE_USER_KEY = 'hunter_active_username';

/**
 * Retrieves all stored hunter accounts from persistent storage.
 */
export function getStoredAccounts(): Record<string, HunterAccountData> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse hunter accounts:', err);
    return {};
  }
}

/**
 * Saves or updates an account in persistent storage.
 */
export function saveAccountToStorage(account: HunterAccountData): void {
  try {
    const accounts = getStoredAccounts();
    accounts[account.username.toLowerCase()] = account;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save hunter account:', err);
  }
}

/**
 * Gets currently logged in username from persistent storage.
 */
export function getActiveUsername(): string | null {
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets or clears the active logged in username.
 */
export function setActiveUsername(username: string | null): void {
  try {
    if (username) {
      localStorage.setItem(ACTIVE_USER_KEY, username.toLowerCase());
    } else {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to update active username:', err);
  }
}

/**
 * Ensures user 'jon' with password 'jon' exists and captures/binds all current progress.
 */
export function ensureJonAccountWithCurrentProgress(
  currentProfile: HunterProfile,
  currentSplits: WorkoutSplit[],
  currentLogs: Record<string, DailyLogData>
): HunterAccountData {
  const accounts = getStoredAccounts();
  const jonKey = 'jon';

  if (!accounts[jonKey]) {
    const jonAccount: HunterAccountData = {
      username: 'jon',
      password: 'jon',
      displayName: 'Jon',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      profile: {
        ...currentProfile,
        displayName: 'Jon',
        userId: 'hunter-jon',
      },
      dailyLogs: currentLogs,
      workoutSplits: currentSplits,
    };
    accounts[jonKey] = jonAccount;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return jonAccount;
  } else {
    // If jon already exists, update with current progress if current is fresher
    const existing = accounts[jonKey];
    existing.profile = {
      ...existing.profile,
      ...currentProfile,
      displayName: 'Jon',
    };
    if (currentSplits && currentSplits.length > 0) {
      existing.workoutSplits = currentSplits;
    }
    if (currentLogs && Object.keys(currentLogs).length > 0) {
      existing.dailyLogs = { ...existing.dailyLogs, ...currentLogs };
    }
    accounts[jonKey] = existing;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return existing;
  }
}

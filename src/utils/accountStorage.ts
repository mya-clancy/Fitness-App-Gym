import { HunterAccountData } from '../types/auth';
import { HunterProfile, DailyLogData, WorkoutSplit } from '../types/hunter';

const ACCOUNTS_KEY = 'hunter_accounts_db';
const ACTIVE_USER_KEY = 'hunter_active_username';
const REMEMBER_ME_KEY = 'hunter_remember_me';

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
 * Saves or updates an account in local persistent storage, and pushes to server database.
 */
export function saveAccountToStorage(account: HunterAccountData): void {
  try {
    const accounts = getStoredAccounts();
    accounts[account.username.toLowerCase()] = account;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    // Asynchronously sync to overall backend server
    syncAccountToServer(account).catch(() => {});
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
 * Checks if the user selected Remember Me / Always Login.
 */
export function getRememberMe(): boolean {
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Updates the Remember Me / Always Login preference.
 */
export function setRememberMe(remember: boolean): void {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  } catch (err) {
    console.error('Failed to update remember me status:', err);
  }
}

/**
 * Syncs an account to the server's overall database.
 */
export async function syncAccountToServer(account: HunterAccountData): Promise<void> {
  try {
    await fetch('/api/accounts/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account }),
    });
  } catch (err) {
    // Graceful offline fallback
    console.warn('Backend account sync deferred (offline/local mode):', err);
  }
}

/**
 * Fetches all accounts from the server's overall database.
 */
export async function fetchAccountsFromServer(): Promise<Record<string, HunterAccountData> | null> {
  try {
    const res = await fetch('/api/accounts');
    if (!res.ok) return null;
    const serverAccounts: Record<string, HunterAccountData> = await res.json();
    if (serverAccounts && typeof serverAccounts === 'object') {
      const local = getStoredAccounts();
      const merged = { ...serverAccounts, ...local };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(merged));
      return merged;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch accounts from server:', err);
    return null;
  }
}

/**
 * Syncs overall splits to server database so mobile Chrome can access splits made on PC.
 */
export async function syncSplitsToServer(splits: WorkoutSplit[]): Promise<void> {
  try {
    await fetch('/api/splits/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ splits }),
    });
  } catch (err) {
    console.warn('Backend splits sync deferred:', err);
  }
}

/**
 * Fetches overall splits from server database.
 */
export async function fetchSplitsFromServer(): Promise<WorkoutSplit[] | null> {
  try {
    const res = await fetch('/api/splits');
    if (!res.ok) return null;
    const serverSplits = await res.json();
    if (Array.isArray(serverSplits) && serverSplits.length > 0) {
      return serverSplits;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch splits from server:', err);
    return null;
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
    syncAccountToServer(jonAccount).catch(() => {});
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
    syncAccountToServer(existing).catch(() => {});
    return existing;
  }
}

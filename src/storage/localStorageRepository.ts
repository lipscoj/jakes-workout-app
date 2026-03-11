import { AthleteState } from '../domain/types';

const STORAGE_KEY = 'bigfoot-training-companion-state';
const STORAGE_VERSION = 1;

export type StorageRepository = {
  load: (fallbackState: AthleteState) => Promise<AthleteState>;
  save: (state: AthleteState) => Promise<void>;
  clear: () => Promise<void>;
};

type StoredPayload = {
  version: number;
  athleteState: AthleteState;
};

/**
 * Browser local storage adapter.
 * All persistence flows through this boundary so storage changes stay isolated.
 */
export const localStorageRepository: StorageRepository = {
  async load(fallbackState) {
    const storage = getStorage();
    if (!storage) {
      return fallbackState;
    }

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallbackState;
    }

    try {
      const parsed = JSON.parse(raw) as StoredPayload;

      if (parsed.version !== STORAGE_VERSION) {
        return fallbackState;
      }

      return mergeWithFallback(parsed.athleteState, fallbackState);
    } catch {
      return fallbackState;
    }
  },

  async save(state) {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    const payload: StoredPayload = {
      version: STORAGE_VERSION,
      athleteState: state,
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(payload));
  },

  async clear() {
    const storage = getStorage();
    storage?.removeItem(STORAGE_KEY);
  },
};

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function mergeWithFallback(candidate: AthleteState, fallback: AthleteState): AthleteState {
  return {
    ...fallback,
    ...candidate,
    dailyRoutineProgressByWorkoutId:
      candidate.dailyRoutineProgressByWorkoutId ?? fallback.dailyRoutineProgressByWorkoutId,
    completedSessions: candidate.completedSessions ?? fallback.completedSessions,
    pendingOverrides: candidate.pendingOverrides ?? fallback.pendingOverrides,
    logEntries: candidate.logEntries ?? fallback.logEntries,
    benchmarkValues: candidate.benchmarkValues ?? fallback.benchmarkValues,
    lastCompletedSessionId: candidate.lastCompletedSessionId ?? fallback.lastCompletedSessionId,
    swapOverride: candidate.swapOverride ?? fallback.swapOverride,
  };
}

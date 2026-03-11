import { ReactNode, createContext, startTransition, use, useEffect, useEffectEvent, useState } from 'react';

import { programManifest } from '../data/programManifest';
import { trainingEngine } from '../domain/trainingEngine';
import { AthleteState, ProgramManifest, SessionLogInput } from '../domain/types';
import { localStorageRepository } from '../storage/localStorageRepository';

type TrainingAppContextValue = {
  manifest: ProgramManifest;
  athleteState: AthleteState;
  isHydrated: boolean;
  completeWorkout: (logInput?: SessionLogInput) => void;
  swapTodayWithTomorrow: () => void;
  toggleSupportRoutineItem: (workoutId: string, itemId: string) => void;
  restartProgram: (clearHistory: boolean) => void;
  recordLogEntry: (sessionId: string, input: SessionLogInput) => void;
  setCurrentPhase: (phaseId: string) => void;
  updateBenchmarkValue: (benchmarkId: string, value: string) => void;
};

const TrainingAppContext = createContext<TrainingAppContextValue | null>(null);

/**
 * App state coordinator that wires the pure domain engine to local persistence.
 */
export function TrainingAppProvider({ children }: { children: ReactNode }) {
  const [athleteState, setAthleteState] = useState<AthleteState>(() =>
    trainingEngine.createInitialState(programManifest),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const persistState = useEffectEvent((nextState: AthleteState) => {
    void localStorageRepository.save(nextState);
  });

  useEffect(() => {
    let isMounted = true;

    void localStorageRepository
      .load(trainingEngine.createInitialState(programManifest))
      .then((loadedState) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setAthleteState(loadedState);
          setIsHydrated(true);
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value: TrainingAppContextValue = {
    manifest: programManifest,
    athleteState,
    isHydrated,
    completeWorkout(logInput) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.completeWorkout(programManifest, currentState, logInput).state;
        persistState(nextState);
        return nextState;
      });
    },
    swapTodayWithTomorrow() {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.swapWithTomorrow(currentState);
        persistState(nextState);
        return nextState;
      });
    },
    toggleSupportRoutineItem(workoutId, itemId) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.toggleSupportRoutineItem(currentState, workoutId, itemId);
        persistState(nextState);
        return nextState;
      });
    },
    restartProgram(clearHistory) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.restartProgram(programManifest, currentState, { clearHistory });
        persistState(nextState);
        return nextState;
      });
    },
    recordLogEntry(sessionId, input) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.recordLogEntry(currentState, sessionId, input);
        persistState(nextState);
        return nextState;
      });
    },
    setCurrentPhase(phaseId) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.setCurrentPhase(programManifest, currentState, phaseId);
        persistState(nextState);
        return nextState;
      });
    },
    updateBenchmarkValue(benchmarkId, value) {
      setAthleteState((currentState) => {
        const nextState = trainingEngine.updateBenchmarkValue(currentState, benchmarkId, value);
        persistState(nextState);
        return nextState;
      });
    },
  };

  return <TrainingAppContext value={value}>{children}</TrainingAppContext>;
}

export function useTrainingApp() {
  const context = use(TrainingAppContext);

  if (!context) {
    throw new Error('useTrainingApp must be used inside TrainingAppProvider.');
  }

  return context;
}

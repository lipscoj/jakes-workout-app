/**
 * Domain contracts for the training companion.
 * The app uses tagged unions so each workout variant carries only valid fields.
 */
export type WorkoutKind =
  | 'strength'
  | 'run'
  | 'aerobic'
  | 'durability'
  | 'foot';

export type ExerciseDefinition = {
  id: string;
  name: string;
  purpose: string;
  steps: string[];
  formCues: string[];
  repetitionGuidance: string;
};

export type StrengthBlock = {
  title: string;
  prescription: string;
  exerciseIds: string[];
};

export type RoutineItem = {
  id: string;
  label: string;
  detail: string;
  exerciseId?: string;
};

type WorkoutBase = {
  id: string;
  title: string;
  categoryLabel: string;
  purpose: string;
  coachingNotes: string[];
  benchmarkIds: string[];
};

export type StrengthWorkout = WorkoutBase & {
  kind: 'strength';
  blocks: StrengthBlock[];
  techniqueChecklist: string[];
  exerciseIds: string[];
};

export type RunWorkout = WorkoutBase & {
  kind: 'run';
  warmup: string[];
  mainSetTitle: string;
  cooldown: string[];
  footPrepExerciseIds: string[];
  strideInstructions?: string[];
};

export type AerobicWorkout = WorkoutBase & {
  kind: 'aerobic';
  instructions: string[];
};

export type DurabilityRoutine = WorkoutBase & {
  kind: 'durability';
  items: RoutineItem[];
};

export type FootRoutine = WorkoutBase & {
  kind: 'foot';
  items: RoutineItem[];
};

export type WorkoutTemplate =
  | StrengthWorkout
  | RunWorkout
  | AerobicWorkout
  | DurabilityRoutine
  | FootRoutine;

export type ProgramPhase = {
  id: string;
  name: string;
  focus: string[];
  summary: string;
};

export type RunningProgressionStage = {
  id: string;
  label: string;
  minimumCompletedRuns: number;
  protocol: string;
  notes: string[];
};

export type CoachingRule = {
  id: string;
  title: string;
  body: string;
};

export type BenchmarkDefinition = {
  id: string;
  title: string;
  category: 'strength' | 'running' | 'durability';
  target: string;
  description: string;
  trackingMode: 'manual' | 'computed-run-frequency';
  inputLabel?: string;
  placeholder?: string;
};

export type ProgramManifest = {
  version: number;
  phases: ProgramPhase[];
  workoutSequence: string[];
  supportRoutineIds: string[];
  workoutTemplates: Record<string, WorkoutTemplate>;
  exercises: Record<string, ExerciseDefinition>;
  progressionRules: {
    runningStages: RunningProgressionStage[];
    strengthGuidance: string[];
  };
  coachingRules: CoachingRule[];
  benchmarks: BenchmarkDefinition[];
};

export type SessionLogInput = {
  durationMinutes?: number | null;
  rpe?: number | null;
  backPainLevel?: number | null;
  footPainLevel?: number | null;
  notes?: string;
};

export type SessionLogEntry = {
  id: string;
  sessionId: string;
  recordedAt: string;
} & Required<SessionLogInput>;

export type CompletedSession = {
  id: string;
  completedAt: string;
  workoutTemplateId: string;
  displayTitle: string;
  displayKind: WorkoutKind;
  wasOverride: boolean;
  logEntryId?: string;
};

export type PendingOverride = {
  id: string;
  kind: 'replace-next-run';
  replacementWorkoutId: string;
  createdFromSessionId: string;
  reason: string;
};

export type SwapOverride =
  | { kind: 'none' }
  | { kind: 'tomorrow-first' }
  | { kind: 'current-first-after-swap' };

export type AthleteState = {
  currentPhaseId: string;
  sequenceCursor: number;
  swapOverride: SwapOverride;
  completedSessions: CompletedSession[];
  pendingOverrides: PendingOverride[];
  logEntries: SessionLogEntry[];
  dailyRoutineProgressByWorkoutId: Record<
    string,
    {
      dateKey: string;
      completedItemIds: string[];
    }
  >;
  benchmarkValues: Record<string, string>;
  lastCompletedSessionId: string | null;
};

export type ResolvedWorkout = {
  templateId: string;
  template: WorkoutTemplate;
  overrideReason?: string;
  isOverride: boolean;
};

export type TodayPlan = {
  todayWorkout: ResolvedWorkout;
  tomorrowWorkout: ResolvedWorkout;
  supportRoutines: Array<{
    templateId: string;
    template: DurabilityRoutine | FootRoutine;
    completedItemIds: string[];
  }>;
  conditionalInstructions: string[];
  warnings: string[];
  canSwap: boolean;
  runningProgression: RunningProgressionStage | null;
  strengthGuidance: string[];
};

export type BenchmarkSummary = {
  id: string;
  title: string;
  category: BenchmarkDefinition['category'];
  target: string;
  description: string;
  trackingMode: BenchmarkDefinition['trackingMode'];
  inputLabel?: string;
  placeholder?: string;
  currentValue: string;
};

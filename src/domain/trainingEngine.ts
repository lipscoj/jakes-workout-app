import {
  AthleteState,
  BenchmarkSummary,
  CompletedSession,
  DurabilityRoutine,
  FootRoutine,
  PendingOverride,
  ProgramManifest,
  ResolvedWorkout,
  RunningProgressionStage,
  SessionLogEntry,
  SessionLogInput,
  TodayPlan,
  WorkoutTemplate,
} from './types';

const DEFAULT_STATE_VERSION = 'rebuild';

type CompleteWorkoutResult = {
  state: AthleteState;
  completedSession: CompletedSession;
  logEntry?: SessionLogEntry;
};

type RestartOptions = {
  clearHistory: boolean;
};

/**
 * Pure training engine. All behavior-changing rules live here so screens remain presentational.
 */
export const trainingEngine = {
  createInitialState(manifest: ProgramManifest): AthleteState {
    return {
      currentPhaseId: manifest.phases[0]?.id ?? DEFAULT_STATE_VERSION,
      sequenceCursor: 0,
      swapOverride: { kind: 'none' },
      completedSessions: [],
      pendingOverrides: [],
      logEntries: [],
      dailyRoutineProgressByWorkoutId: {},
      benchmarkValues: {},
      lastCompletedSessionId: null,
    };
  },

  getTodayPlan(manifest: ProgramManifest, state: AthleteState): TodayPlan {
    const todayWorkout = resolveWorkoutForOffset(manifest, state, 0);
    const tomorrowWorkout = resolveWorkoutForOffset(manifest, state, 1);
    const warnings = [...todayWorkout.baseWarnings];
    const conditionalInstructions = [...buildConditionalInstructions(manifest, state, todayWorkout.resolved)];

    if (todayWorkout.overrideReason) {
      warnings.push(todayWorkout.overrideReason);
    }

    return {
      todayWorkout: todayWorkout.resolved,
      tomorrowWorkout: tomorrowWorkout.resolved,
      supportRoutines: getSupportRoutines(manifest, state),
      conditionalInstructions,
      warnings,
      canSwap: state.swapOverride.kind === 'none',
      runningProgression:
        todayWorkout.resolved.template.kind === 'run'
          ? getRunningProgression(manifest, state)
          : null,
      strengthGuidance:
        todayWorkout.resolved.template.kind === 'strength'
          ? manifest.progressionRules.strengthGuidance
          : [],
    };
  },

  getRunningProgression(manifest: ProgramManifest, state: AthleteState): RunningProgressionStage {
    return getRunningProgression(manifest, state);
  },

  getBenchmarkSummaries(manifest: ProgramManifest, state: AthleteState): BenchmarkSummary[] {
    const recentRunCount = getRecentRunCount(state);

    return manifest.benchmarks.map((benchmark) => {
      if (benchmark.trackingMode === 'computed-run-frequency') {
        return {
          ...benchmark,
          currentValue: `${recentRunCount} run${recentRunCount === 1 ? '' : 's'} in the last 7 days`,
        };
      }

      return {
        ...benchmark,
        currentValue: state.benchmarkValues[benchmark.id]?.trim() || 'Not recorded yet',
      };
    });
  },

  swapWithTomorrow(state: AthleteState): AthleteState {
    if (state.swapOverride.kind !== 'none') {
      return state;
    }

    return {
      ...state,
      swapOverride: { kind: 'tomorrow-first' },
    };
  },

  toggleSupportRoutineItem(
    state: AthleteState,
    workoutId: string,
    itemId: string,
    now: Date = new Date(),
  ): AthleteState {
    const dateKey = getDateKey(now);
    const current =
      state.dailyRoutineProgressByWorkoutId[workoutId]?.dateKey === dateKey
        ? state.dailyRoutineProgressByWorkoutId[workoutId]?.completedItemIds ?? []
        : [];

    const next = current.includes(itemId)
      ? current.filter((existingId) => existingId !== itemId)
      : [...current, itemId];

    return {
      ...state,
      dailyRoutineProgressByWorkoutId: {
        ...state.dailyRoutineProgressByWorkoutId,
        [workoutId]: {
          dateKey,
          completedItemIds: next,
        },
      },
    };
  },

  updateBenchmarkValue(state: AthleteState, benchmarkId: string, value: string): AthleteState {
    return {
      ...state,
      benchmarkValues: {
        ...state.benchmarkValues,
        [benchmarkId]: value.trim(),
      },
    };
  },

  setCurrentPhase(manifest: ProgramManifest, state: AthleteState, phaseId: string): AthleteState {
    const phaseExists = manifest.phases.some((phase) => phase.id === phaseId);

    if (!phaseExists) {
      return state;
    }

    return {
      ...state,
      currentPhaseId: phaseId,
    };
  },

  completeWorkout(
    manifest: ProgramManifest,
    state: AthleteState,
    logInput?: SessionLogInput,
  ): CompleteWorkoutResult {
    const currentResolution = resolveWorkoutForOffset(manifest, state, 0).resolved;
    const now = new Date().toISOString();
    const sessionId = `session-${state.completedSessions.length + 1}`;
    const trimmedNotes = logInput?.notes?.trim() ?? '';

    let logEntry: SessionLogEntry | undefined;
    if (hasLogInput(logInput)) {
      logEntry = {
        id: `log-${state.logEntries.length + 1}`,
        sessionId,
        recordedAt: now,
        durationMinutes: logInput?.durationMinutes ?? null,
        rpe: logInput?.rpe ?? null,
        backPainLevel: logInput?.backPainLevel ?? null,
        footPainLevel: logInput?.footPainLevel ?? null,
        notes: trimmedNotes,
      };
    }

    const completedSession: CompletedSession = {
      id: sessionId,
      completedAt: now,
      workoutTemplateId: currentResolution.templateId,
      displayTitle: currentResolution.template.title,
      displayKind: currentResolution.template.kind,
      wasOverride: currentResolution.isOverride,
      logEntryId: logEntry?.id,
    };

    const advancedState = advanceSequence(state);
    const nextPendingOverrides = clearConsumedOverrides(manifest, state);
    const painOverride = buildPainOverride(logEntry, sessionId);

    const nextState: AthleteState = {
      ...advancedState,
      pendingOverrides: painOverride ? [...nextPendingOverrides, painOverride] : nextPendingOverrides,
      completedSessions: [...state.completedSessions, completedSession],
      logEntries: logEntry ? [...state.logEntries, logEntry] : state.logEntries,
      lastCompletedSessionId: sessionId,
    };

    return {
      state: nextState,
      completedSession,
      logEntry,
    };
  },

  recordLogEntry(state: AthleteState, sessionId: string, input: SessionLogInput): AthleteState {
    if (!hasLogInput(input)) {
      return state;
    }

    const existing = state.logEntries.find((entry) => entry.sessionId === sessionId);
    const nextEntry: SessionLogEntry = {
      id: existing?.id ?? `log-${state.logEntries.length + 1}`,
      sessionId,
      recordedAt: existing?.recordedAt ?? new Date().toISOString(),
      durationMinutes: input.durationMinutes ?? existing?.durationMinutes ?? null,
      rpe: input.rpe ?? existing?.rpe ?? null,
      backPainLevel: input.backPainLevel ?? existing?.backPainLevel ?? null,
      footPainLevel: input.footPainLevel ?? existing?.footPainLevel ?? null,
      notes: input.notes?.trim() ?? existing?.notes ?? '',
    };

    const logEntries = existing
      ? state.logEntries.map((entry) => (entry.sessionId === sessionId ? nextEntry : entry))
      : [...state.logEntries, nextEntry];

    const completedSessions = state.completedSessions.map((session) =>
      session.id === sessionId ? { ...session, logEntryId: nextEntry.id } : session,
    );

    const pendingOverride = buildPainOverride(nextEntry, sessionId);

    return {
      ...state,
      completedSessions,
      logEntries,
      pendingOverrides: pendingOverride
        ? [...clearPainOverrides(state.pendingOverrides), pendingOverride]
        : clearPainOverrides(state.pendingOverrides),
    };
  },

  restartProgram(manifest: ProgramManifest, state: AthleteState, options: RestartOptions): AthleteState {
    const initial = this.createInitialState(manifest);

    if (options.clearHistory) {
      return initial;
    }

    return {
      ...initial,
      currentPhaseId: state.currentPhaseId,
      completedSessions: state.completedSessions,
      logEntries: state.logEntries,
      benchmarkValues: state.benchmarkValues,
    };
  },
};

function resolveWorkoutForOffset(
  manifest: ProgramManifest,
  state: AthleteState,
  offset: number,
): {
  resolved: ResolvedWorkout;
  overrideReason?: string;
  baseWarnings: string[];
} {
  const templateId = getTemplateIdForOffset(manifest, state, offset);
  const template = getTemplateById(manifest, templateId);
  const overrideOffset = getOverrideTargetOffset(manifest, state);
  const pendingOverride = state.pendingOverrides.find((override) => override.kind === 'replace-next-run');
  const baseWarnings: string[] = [];

  if (pendingOverride && overrideOffset === offset) {
    const replacement = getTemplateById(manifest, pendingOverride.replacementWorkoutId);

    if (offset === 0) {
      baseWarnings.push('The next run has been replaced because pain was logged above 3/10.');
    }

    return {
      resolved: {
        templateId: replacement.id,
        template: replacement,
        isOverride: true,
        overrideReason: pendingOverride.reason,
      },
      overrideReason: pendingOverride.reason,
      baseWarnings,
    };
  }

  return {
    resolved: {
      templateId: template.id,
      template,
      isOverride: false,
    },
    baseWarnings,
  };
}

function getSupportRoutines(
  manifest: ProgramManifest,
  state: AthleteState,
  now: Date = new Date(),
): TodayPlan['supportRoutines'] {
  const dateKey = getDateKey(now);

  return manifest.supportRoutineIds.map((routineId) => {
    const template = getTemplateById(manifest, routineId);

    if (template.kind !== 'durability' && template.kind !== 'foot') {
      throw new Error(`Support routine must be a durability or foot workout: ${routineId}`);
    }

    const progress = state.dailyRoutineProgressByWorkoutId[routineId];

    return {
      templateId: routineId,
      template: template as DurabilityRoutine | FootRoutine,
      completedItemIds: progress?.dateKey === dateKey ? progress.completedItemIds : [],
    };
  });
}

function getTemplateIdForOffset(manifest: ProgramManifest, state: AthleteState, offset: number): string {
  const sequenceLength = manifest.workoutSequence.length;
  let index = state.sequenceCursor;

  if (state.swapOverride.kind === 'none') {
    index += offset;
  } else if (state.swapOverride.kind === 'tomorrow-first') {
    if (offset === 0) {
      index += 1;
    } else if (offset === 1) {
      index += 0;
    } else {
      index += offset;
    }
  } else if (offset === 0) {
    index += 0;
  } else {
    index += offset + 1;
  }

  return manifest.workoutSequence[((index % sequenceLength) + sequenceLength) % sequenceLength];
}

function getOverrideTargetOffset(manifest: ProgramManifest, state: AthleteState): number | null {
  if (!state.pendingOverrides.length) {
    return null;
  }

  for (let offset = 0; offset < manifest.workoutSequence.length; offset += 1) {
    const templateId = getTemplateIdForOffset(manifest, state, offset);
    const template = getTemplateById(manifest, templateId);

    if (template.kind === 'run') {
      return offset;
    }
  }

  return null;
}

function getTemplateById(manifest: ProgramManifest, templateId: string): WorkoutTemplate {
  const template = manifest.workoutTemplates[templateId];

  if (!template) {
    throw new Error(`Unknown workout template: ${templateId}`);
  }

  return template;
}

function buildConditionalInstructions(
  manifest: ProgramManifest,
  state: AthleteState,
  workout: ResolvedWorkout,
): string[] {
  if (workout.template.kind === 'run') {
    const progression = getRunningProgression(manifest, state);
    const footPrep = workout.template.footPrepExerciseIds
      .map((exerciseId) => manifest.exercises[exerciseId]?.name)
      .filter(Boolean);

    return [
      `Current progression: ${progression.label} - ${progression.protocol}`,
      ...progression.notes,
      `Foot prep before running: ${footPrep.join(', ')}.`,
    ];
  }

  if (workout.template.kind === 'strength') {
    return workout.template.techniqueChecklist.map((item) => `Checklist: ${item}`);
  }

  return workout.template.coachingNotes;
}

function getRunningProgression(manifest: ProgramManifest, state: AthleteState): RunningProgressionStage {
  const completedRuns = state.completedSessions.filter((session) => session.displayKind === 'run').length;

  return manifest.progressionRules.runningStages.reduce((currentStage, candidateStage) => {
    if (completedRuns >= candidateStage.minimumCompletedRuns) {
      return candidateStage;
    }

    return currentStage;
  }, manifest.progressionRules.runningStages[0]);
}

function getRecentRunCount(state: AthleteState): number {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  return state.completedSessions.filter((session) => {
    if (session.displayKind !== 'run') {
      return false;
    }

    const completedAt = new Date(session.completedAt).getTime();
    return completedAt >= sevenDaysAgo && completedAt <= now;
  }).length;
}

function advanceSequence(state: AthleteState): AthleteState {
  if (state.swapOverride.kind === 'none') {
    return {
      ...state,
      sequenceCursor: state.sequenceCursor + 1,
    };
  }

  if (state.swapOverride.kind === 'tomorrow-first') {
    return {
      ...state,
      swapOverride: { kind: 'current-first-after-swap' },
    };
  }

  return {
    ...state,
    sequenceCursor: state.sequenceCursor + 2,
    swapOverride: { kind: 'none' },
  };
}

function clearConsumedOverrides(manifest: ProgramManifest, previousState: AthleteState): PendingOverride[] {
  if (!previousState.pendingOverrides.length) {
    return previousState.pendingOverrides;
  }

  const overrideOffset = getOverrideTargetOffset(manifest, previousState);
  if (overrideOffset !== 0) {
    return previousState.pendingOverrides;
  }

  const currentUnderlyingId = getTemplateIdForOffset(manifest, previousState, 0);
  const currentUnderlyingTemplate = getTemplateById(manifest, currentUnderlyingId);

  if (currentUnderlyingTemplate.kind !== 'run') {
    return previousState.pendingOverrides;
  }

  return clearPainOverrides(previousState.pendingOverrides);
}

function buildPainOverride(logEntry: SessionLogEntry | undefined, sessionId: string): PendingOverride | null {
  if (!logEntry) {
    return null;
  }

  const painPairs = [
    { label: 'back', value: logEntry.backPainLevel },
    { label: 'foot', value: logEntry.footPainLevel },
  ];
  const significant = painPairs.filter((entry) => entry.value !== null && entry.value > 3);

  if (!significant.length) {
    return null;
  }

  const highest = significant.reduce((current, candidate) =>
    (candidate.value ?? 0) > (current.value ?? 0) ? candidate : current,
  );

  return {
    id: `override-${sessionId}`,
    kind: 'replace-next-run',
    replacementWorkoutId: 'low-impact-aerobic',
    createdFromSessionId: sessionId,
    reason: `${highest.label[0].toUpperCase()}${highest.label.slice(1)} pain logged at ${highest.value}/10. The next run is replaced with low-impact aerobic work.`,
  };
}

function clearPainOverrides(overrides: PendingOverride[]): PendingOverride[] {
  return overrides.filter((override) => override.kind !== 'replace-next-run');
}

function hasLogInput(logInput?: SessionLogInput): boolean {
  if (!logInput) {
    return false;
  }

  return (
    logInput.durationMinutes !== undefined ||
    logInput.rpe !== undefined ||
    logInput.backPainLevel !== undefined ||
    logInput.footPainLevel !== undefined ||
    (logInput.notes?.trim().length ?? 0) > 0
  );
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

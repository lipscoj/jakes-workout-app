import { describe, expect, it } from 'vitest';

import { programManifest } from '../data/programManifest';
import { trainingEngine } from './trainingEngine';

describe('trainingEngine', () => {
  it('does not advance the sequence when no workout is completed', () => {
    const state = trainingEngine.createInitialState(programManifest);
    const plan = trainingEngine.getTodayPlan(programManifest, state);

    expect(plan.todayWorkout.template.title).toBe('Lower Strength A');
    expect(plan.tomorrowWorkout.template.title).toBe('Easy Run');
    expect(plan.supportRoutines).toHaveLength(2);
  });

  it('advances exactly one workout after completion', () => {
    const state = trainingEngine.createInitialState(programManifest);
    const nextState = trainingEngine.completeWorkout(programManifest, state).state;
    const plan = trainingEngine.getTodayPlan(programManifest, nextState);

    expect(plan.todayWorkout.template.title).toBe('Easy Run');
    expect(nextState.sequenceCursor).toBe(1);
  });

  it('swaps the next two workouts and resolves correctly across two completions', () => {
    const initial = trainingEngine.createInitialState(programManifest);
    const swapped = trainingEngine.swapWithTomorrow(initial);
    const swappedPlan = trainingEngine.getTodayPlan(programManifest, swapped);

    expect(swappedPlan.todayWorkout.template.title).toBe('Easy Run');
    expect(swappedPlan.tomorrowWorkout.template.title).toBe('Lower Strength A');

    const afterFirstCompletion = trainingEngine.completeWorkout(programManifest, swapped).state;
    const secondPlan = trainingEngine.getTodayPlan(programManifest, afterFirstCompletion);
    expect(secondPlan.todayWorkout.template.title).toBe('Lower Strength A');
    expect(secondPlan.tomorrowWorkout.template.title).toBe('Upper Strength');

    const afterSecondCompletion = trainingEngine.completeWorkout(programManifest, afterFirstCompletion).state;
    const thirdPlan = trainingEngine.getTodayPlan(programManifest, afterSecondCompletion);
    expect(thirdPlan.todayWorkout.template.title).toBe('Upper Strength');
  });

  it('keeps durability and foot routines available daily without changing the main sequence', () => {
    const baseState = trainingEngine.createInitialState(programManifest);
    const toggled = trainingEngine.toggleSupportRoutineItem(baseState, 'durability-foundation', 'curl-up');
    const plan = trainingEngine.getTodayPlan(programManifest, toggled);

    expect(plan.todayWorkout.template.title).toBe('Lower Strength A');
    expect(plan.supportRoutines.find((routine) => routine.templateId === 'durability-foundation')?.completedItemIds).toEqual([
      'curl-up',
    ]);
  });

  it('supports restart with and without history preservation', () => {
    const initial = trainingEngine.createInitialState(programManifest);
    const completed = trainingEngine.completeWorkout(programManifest, initial, {
      notes: 'solid session',
    }).state;

    const keptHistory = trainingEngine.restartProgram(programManifest, completed, {
      clearHistory: false,
    });
    expect(keptHistory.sequenceCursor).toBe(0);
    expect(keptHistory.completedSessions).toHaveLength(1);

    const clearedHistory = trainingEngine.restartProgram(programManifest, completed, {
      clearHistory: true,
    });
    expect(clearedHistory.sequenceCursor).toBe(0);
    expect(clearedHistory.completedSessions).toHaveLength(0);
  });

  it('replaces the next run when pain is logged above 3 out of 10', () => {
    const initial = trainingEngine.createInitialState(programManifest);
    const afterStrength = trainingEngine.completeWorkout(programManifest, initial, {
      footPainLevel: 4,
    }).state;
    const plan = trainingEngine.getTodayPlan(programManifest, afterStrength);

    expect(plan.todayWorkout.template.title).toBe('Low-Impact Aerobic Replacement');
    expect(plan.todayWorkout.isOverride).toBe(true);

    const afterReplacement = trainingEngine.completeWorkout(programManifest, afterStrength).state;
    const nextPlan = trainingEngine.getTodayPlan(programManifest, afterReplacement);
    expect(nextPlan.todayWorkout.template.title).toBe('Upper Strength');
  });

  it('stores manual benchmark values and computes run frequency', () => {
    let state = trainingEngine.createInitialState(programManifest);
    state = trainingEngine.updateBenchmarkValue(state, 'squat-load', '70 lb');
    state = trainingEngine.completeWorkout(programManifest, state).state;
    state = trainingEngine.completeWorkout(programManifest, state).state;

    const summaries = trainingEngine.getBenchmarkSummaries(programManifest, state);

    expect(summaries.find((summary) => summary.id === 'squat-load')?.currentValue).toBe('70 lb');
    expect(summaries.find((summary) => summary.id === 'run-frequency')?.currentValue).toContain('1 run');
  });

  it('supports manual phase switching for the roadmap', () => {
    const state = trainingEngine.createInitialState(programManifest);
    const nextState = trainingEngine.setCurrentPhase(programManifest, state, 'race');

    expect(nextState.currentPhaseId).toBe('race');
  });
});

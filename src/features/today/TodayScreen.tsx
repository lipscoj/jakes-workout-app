import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { trainingEngine } from '../../domain/trainingEngine';
import { SessionLogInput } from '../../domain/types';
import { useTrainingApp } from '../../state/TrainingAppProvider';
import {
  BodyText,
  BulletList,
  Button,
  Card,
  Divider,
  Eyebrow,
  HeroPanel,
  Input,
  Pill,
  Screen,
  SectionTitle,
  StatChip,
  Subtitle,
  Title,
} from '../../ui/primitives';
import { useResponsiveLayout } from '../../ui/responsive';
import { colors, spacing } from '../../ui/theme';

export function TodayScreen() {
  const {
    athleteState,
    manifest,
    isHydrated,
    completeWorkout,
    swapTodayWithTomorrow,
    toggleSupportRoutineItem,
  } = useTrainingApp();
  const [durationMinutes, setDurationMinutes] = useState('');
  const [rpe, setRpe] = useState('');
  const [backPainLevel, setBackPainLevel] = useState('');
  const [footPainLevel, setFootPainLevel] = useState('');
  const [notes, setNotes] = useState('');
  const { isDesktop } = useResponsiveLayout();

  if (!isHydrated) {
    return (
      <Screen>
        <HeroPanel
          eyebrow="Bigfoot Companion"
          title="Loading your trail ledger"
          subtitle="Hydrating the local-only plan from browser storage."
        />
      </Screen>
    );
  }

  const todayPlan = trainingEngine.getTodayPlan(manifest, athleteState);
  const currentWorkout = todayPlan.todayWorkout.template;
  const routineProgress =
    todayPlan.supportRoutines.find((routine) => routine.templateId === todayPlan.todayWorkout.templateId)
      ?.completedItemIds ?? [];
  const phase = manifest.phases.find((candidate) => candidate.id === athleteState.currentPhaseId);
  const lastCompletedSession = athleteState.completedSessions.at(-1);

  function handleCompleteWorkout() {
    const logInput: SessionLogInput = {
      durationMinutes: parseOptionalNumber(durationMinutes),
      rpe: parseOptionalNumber(rpe),
      backPainLevel: parseOptionalNumber(backPainLevel),
      footPainLevel: parseOptionalNumber(footPainLevel),
      notes: notes.trim() || undefined,
    };

    completeWorkout(logInput);
    setDurationMinutes('');
    setRpe('');
    setBackPainLevel('');
    setFootPainLevel('');
    setNotes('');
  }

  return (
    <Screen chrome="dense">
      <HeroPanel
        eyebrow={phase?.name ?? 'Current Phase'}
        title="What do I do today?"
        subtitle={phase?.summary ?? 'Open the app and move immediately.'}
      >
        <View style={styles.heroStats}>
          <StatChip label="Current" value={currentWorkout.categoryLabel} />
          <StatChip label="Next Up" value={todayPlan.tomorrowWorkout.template.categoryLabel} />
        </View>
      </HeroPanel>

      <Card style={styles.leadCard}>
        <View style={styles.titleRow}>
          <Pill tone="primary">{currentWorkout.categoryLabel}</Pill>
          {todayPlan.todayWorkout.isOverride ? <Pill tone="warning">Adjusted</Pill> : null}
        </View>
        <Title>{currentWorkout.title}</Title>
        <Subtitle>{currentWorkout.purpose}</Subtitle>
      </Card>

      <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
        <View style={[styles.primaryColumn, isDesktop && styles.primaryColumnDesktop]}>
          {todayPlan.warnings.length > 0 ? (
            <Card tone="accent">
              <Eyebrow>Guardrails</Eyebrow>
              <SectionTitle>Warnings</SectionTitle>
              <BulletList items={todayPlan.warnings} />
            </Card>
          ) : null}

          <Card>
            <Eyebrow>Execution</Eyebrow>
            <SectionTitle>Instructions</SectionTitle>
            {renderWorkoutInstructions({
              workout: currentWorkout,
              routineProgress,
              onToggleItem(itemId) {
                toggleSupportRoutineItem(todayPlan.todayWorkout.templateId, itemId);
              },
              manifest,
            })}
          </Card>

          <Card tone="muted">
            <Eyebrow>Daily Support</Eyebrow>
            <SectionTitle>Durability + Foot Strength</SectionTitle>
            <Subtitle>These routines stay available every day and do not change the main workout sequence.</Subtitle>
            <View style={[styles.stack, isDesktop && styles.supportGrid]}>
              {todayPlan.supportRoutines.map((routine) => (
                <View key={routine.templateId} style={[styles.supportCard, isDesktop && styles.supportCardDesktop]}>
                  <View style={styles.titleRow}>
                    <Pill tone="primary">{routine.template.categoryLabel}</Pill>
                    <Subtitle>
                      {routine.completedItemIds.length}/{routine.template.items.length} complete today
                    </Subtitle>
                  </View>
                  <BodyText>{routine.template.title}</BodyText>
                  <Subtitle>{routine.template.purpose}</Subtitle>
                  {renderWorkoutInstructions({
                    workout: routine.template,
                    routineProgress: routine.completedItemIds,
                    onToggleItem(itemId) {
                      toggleSupportRoutineItem(routine.templateId, itemId);
                    },
                    manifest,
                  })}
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={[styles.secondaryColumn, isDesktop && styles.secondaryColumnDesktop]}>
          {todayPlan.conditionalInstructions.length > 0 ? (
            <Card tone="muted">
              <Eyebrow>Context</Eyebrow>
              <SectionTitle>Conditional Guidance</SectionTitle>
              <BulletList items={todayPlan.conditionalInstructions} />
            </Card>
          ) : null}

          {todayPlan.runningProgression ? (
            <Card tone="muted">
              <Eyebrow>Progression</Eyebrow>
              <SectionTitle>Running Progression</SectionTitle>
              <BodyText>{todayPlan.runningProgression.protocol}</BodyText>
              <BulletList items={todayPlan.runningProgression.notes} />
            </Card>
          ) : null}

          {todayPlan.strengthGuidance.length > 0 ? (
            <Card tone="muted">
              <Eyebrow>Strength Notes</Eyebrow>
              <SectionTitle>Strength Guidance</SectionTitle>
              <BulletList items={todayPlan.strengthGuidance} />
            </Card>
          ) : null}

          <Card tone="accent">
            <Eyebrow>Preview</Eyebrow>
            <SectionTitle>Tomorrow</SectionTitle>
            <BodyText>{todayPlan.tomorrowWorkout.template.title}</BodyText>
            <Subtitle>{todayPlan.tomorrowWorkout.template.purpose}</Subtitle>
          </Card>

          <Card>
            <Eyebrow>Post-Session</Eyebrow>
            <SectionTitle>Optional Log</SectionTitle>
            <Subtitle>Leave these blank to complete the workout in one tap.</Subtitle>
            <View style={styles.logRow}>
              <View style={styles.logColumn}>
                <Input
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="Minutes"
                  keyboardType="numeric"
                  label="Duration"
                />
              </View>
              <View style={styles.logColumn}>
                <Input
                  value={rpe}
                  onChangeText={setRpe}
                  placeholder="1-10"
                  keyboardType="numeric"
                  label="RPE"
                />
              </View>
            </View>
            <View style={styles.logRow}>
              <View style={styles.logColumn}>
                <Input
                  value={backPainLevel}
                  onChangeText={setBackPainLevel}
                  placeholder="0-10"
                  keyboardType="numeric"
                  label="Back Pain"
                />
              </View>
              <View style={styles.logColumn}>
                <Input
                  value={footPainLevel}
                  onChangeText={setFootPainLevel}
                  placeholder="0-10"
                  keyboardType="numeric"
                  label="Foot Pain"
                />
              </View>
            </View>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes"
              multiline
              label="Notes"
            />
            <Button label="Mark Workout Complete" onPress={handleCompleteWorkout} />
            <Button
              label="Swap Today With Tomorrow"
              onPress={swapTodayWithTomorrow}
              tone="secondary"
              disabled={!todayPlan.canSwap}
            />
          </Card>

          {lastCompletedSession ? (
            <Card tone="muted">
              <Eyebrow>Last Mark</Eyebrow>
              <SectionTitle>Last Completed</SectionTitle>
              <BodyText>{lastCompletedSession.displayTitle}</BodyText>
              <Subtitle>{new Date(lastCompletedSession.completedAt).toLocaleString()}</Subtitle>
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

function renderWorkoutInstructions({
  workout,
  routineProgress,
  onToggleItem,
  manifest,
}: {
  workout: ReturnType<typeof trainingEngine.getTodayPlan>['todayWorkout']['template'];
  routineProgress: string[];
  onToggleItem: (itemId: string) => void;
  manifest: ReturnType<typeof useTrainingApp>['manifest'];
}) {
  if (workout.kind === 'strength') {
    return (
      <View style={styles.stack}>
        {workout.blocks.map((block) => (
          <View key={block.title} style={styles.blockCard}>
            <Eyebrow>{block.title}</Eyebrow>
            <BodyText>{block.prescription}</BodyText>
            <ExerciseLinks exerciseIds={block.exerciseIds} manifest={manifest} />
          </View>
        ))}
      </View>
    );
  }

  if (workout.kind === 'run') {
    return (
      <View style={styles.stack}>
        <Eyebrow>Warmup</Eyebrow>
        <BulletList items={workout.warmup} />
        <Divider />
        <Eyebrow>{workout.mainSetTitle}</Eyebrow>
        <BodyText>Use the current run progression shown below.</BodyText>
        {workout.strideInstructions ? (
          <>
            <Divider />
            <Eyebrow>Strides</Eyebrow>
            <BulletList items={workout.strideInstructions} />
          </>
        ) : null}
        <Divider />
        <Eyebrow>Cooldown</Eyebrow>
        <BulletList items={workout.cooldown} />
        <ExerciseLinks exerciseIds={workout.footPrepExerciseIds} manifest={manifest} />
      </View>
    );
  }

  if (workout.kind === 'aerobic') {
    return <BulletList items={workout.instructions} />;
  }

  return (
    <View style={styles.stack}>
      {workout.items.map((item) => {
        const complete = routineProgress.includes(item.id);

        return (
          <Pressable
            key={item.id}
            onPress={() => onToggleItem(item.id)}
            style={[styles.checkRow, complete && styles.checkRowComplete]}
          >
            <View style={[styles.checkbox, complete && styles.checkboxComplete]} />
            <View style={styles.checkText}>
              <BodyText>{item.label}</BodyText>
              <Subtitle>{item.detail}</Subtitle>
              {item.exerciseId ? (
                <Link
                  href={{
                    pathname: '/exercise/[exerciseId]',
                    params: { exerciseId: item.exerciseId },
                  }}
                  style={styles.inlineLink}
                >
                  Open exercise instructions
                </Link>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function ExerciseLinks({
  exerciseIds,
  manifest,
}: {
  exerciseIds: string[];
  manifest: ReturnType<typeof useTrainingApp>['manifest'];
}) {
  return (
    <View style={styles.exerciseLinks}>
      {exerciseIds.map((exerciseId) => {
        const exercise = manifest.exercises[exerciseId];
        if (!exercise) {
          return null;
        }

        return (
          <Link
            key={exerciseId}
            href={{
              pathname: '/exercise/[exerciseId]',
              params: { exerciseId },
            }}
            style={styles.inlineLink}
          >
            {`• ${exercise.name}`}
          </Link>
        );
      })}
    </View>
  );
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const styles = StyleSheet.create({
  contentGrid: {
    gap: spacing.md,
  },
  contentGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  primaryColumn: {
    gap: spacing.md,
  },
  primaryColumnDesktop: {
    flex: 1.35,
  },
  secondaryColumn: {
    gap: spacing.md,
  },
  secondaryColumnDesktop: {
    flex: 0.95,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  leadCard: {
    marginTop: -44,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
  },
  stack: {
    gap: spacing.sm,
  },
  blockCard: {
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  supportCard: {
    padding: spacing.md,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  supportCardDesktop: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  checkRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: colors.cardStrong,
  },
  checkRowComplete: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginTop: 2,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  checkboxComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    flex: 1,
    gap: 4,
  },
  exerciseLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  inlineLink: {
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'none',
  },
  logRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logColumn: {
    flex: 1,
  },
});

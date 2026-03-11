import { Link } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTrainingApp } from '../../state/TrainingAppProvider';
import {
  BodyText,
  Card,
  Eyebrow,
  HeroPanel,
  Input,
  Pill,
  Screen,
  SectionTitle,
  Subtitle,
} from '../../ui/primitives';
import { useResponsiveLayout } from '../../ui/responsive';
import { colors, spacing } from '../../ui/theme';

export function LibraryScreen() {
  const { manifest } = useTrainingApp();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const { isDesktop } = useResponsiveLayout();

  const exercises = Object.values(manifest.exercises).filter((exercise) => {
    if (!deferredQuery) {
      return true;
    }

    return (
      exercise.name.toLowerCase().includes(deferredQuery) ||
      exercise.purpose.toLowerCase().includes(deferredQuery)
    );
  });

  const routines = Object.values(manifest.workoutTemplates).filter(
    (workout) => workout.kind === 'durability' || workout.kind === 'foot',
  );

  return (
    <Screen chrome="dense">
      <HeroPanel
        eyebrow="Instruction Archive"
        title="Exercise Library"
        subtitle="Every movement keeps its purpose, steps, and form cues inside the app."
      />

      <Card style={styles.searchCard}>
        <Eyebrow>Lookup</Eyebrow>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises or intent"
          label="Search"
        />
      </Card>

      <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
        <Card style={isDesktop && styles.leftColumn}>
          <Eyebrow>Support Work</Eyebrow>
          <SectionTitle>Routines</SectionTitle>
          <View style={styles.stack}>
            {routines.map((routine) => (
              <View key={routine.id} style={styles.routineRow}>
                <Pill tone="primary">{routine.categoryLabel}</Pill>
                <BodyText>{routine.title}</BodyText>
                <Subtitle>{routine.purpose}</Subtitle>
              </View>
            ))}
          </View>
        </Card>

        <Card style={isDesktop && styles.rightColumn}>
          <Eyebrow>Movement Index</Eyebrow>
          <SectionTitle>Exercises</SectionTitle>
          <View style={[styles.exerciseStack, isDesktop && styles.exerciseGrid]}>
            {exercises.map((exercise) => (
              <View key={exercise.id} style={[styles.exerciseRow, isDesktop && styles.exerciseRowDesktop]}>
                <Link
                  href={{
                    pathname: '/exercise/[exerciseId]',
                    params: { exerciseId: exercise.id },
                  }}
                  style={styles.exerciseLink}
                >
                  {exercise.name}
                </Link>
                <Subtitle>{exercise.purpose}</Subtitle>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </Screen>
  );
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
  leftColumn: {
    flex: 0.8,
  },
  rightColumn: {
    flex: 1.2,
  },
  searchCard: {
    marginTop: -38,
  },
  stack: {
    gap: spacing.sm,
  },
  routineRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseStack: {
    gap: spacing.md,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  exerciseRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseRowDesktop: {
    width: '48%',
    paddingBottom: spacing.sm,
  },
  exerciseLink: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
});

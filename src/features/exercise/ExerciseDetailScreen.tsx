import { StyleSheet, View } from 'react-native';

import { useTrainingApp } from '../../state/TrainingAppProvider';
import {
  BulletList,
  Card,
  Eyebrow,
  HeroPanel,
  Pill,
  Screen,
  SectionTitle,
  Subtitle,
  Title,
} from '../../ui/primitives';
import { useResponsiveLayout } from '../../ui/responsive';

export function ExerciseDetailScreen({ exerciseId }: { exerciseId: string }) {
  const { manifest } = useTrainingApp();
  const exercise = manifest.exercises[exerciseId];
  const { isDesktop } = useResponsiveLayout();

  if (!exercise) {
    return (
      <Screen>
        <Card>
          <Title>Exercise not found</Title>
          <Subtitle>Check the hardcoded exercise IDs in the program manifest.</Subtitle>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen chrome="dense">
      <HeroPanel
        eyebrow="Movement Notes"
        title={exercise.name}
        subtitle={exercise.purpose}
      >
        <Pill tone="ghost">{exercise.repetitionGuidance}</Pill>
      </HeroPanel>

      <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
        <Card style={[styles.offsetCard, isDesktop && styles.leftColumn]}>
          <Eyebrow>Execution</Eyebrow>
          <SectionTitle>How to Perform</SectionTitle>
          <BulletList items={exercise.steps} />
        </Card>

        <Card style={isDesktop && styles.rightColumn}>
          <Eyebrow>Form</Eyebrow>
          <SectionTitle>Form Cues</SectionTitle>
          <View style={{ gap: 10 }}>
            <BulletList items={exercise.formCues} />
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentGrid: {
    gap: 16,
  },
  contentGridDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  offsetCard: {
    marginTop: -40,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
});

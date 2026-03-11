import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTrainingApp } from '../../state/TrainingAppProvider';
import {
  BodyText,
  Button,
  Card,
  Eyebrow,
  HeroPanel,
  Pill,
  Screen,
  SectionTitle,
  Subtitle,
} from '../../ui/primitives';
import { useResponsiveLayout } from '../../ui/responsive';
import { colors, spacing } from '../../ui/theme';

export function SettingsScreen() {
  const { manifest, athleteState, restartProgram, setCurrentPhase } = useTrainingApp();
  const [message, setMessage] = useState('Sequence reset keeps history by default.');
  const { isDesktop } = useResponsiveLayout();

  return (
    <Screen chrome="dense">
      <HeroPanel
        eyebrow="Control Room"
        title="Settings"
        subtitle="Reset the active sequence without introducing any server-side complexity."
      />

      <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
        <Card style={[styles.offsetCard, isDesktop && styles.phaseColumn]}>
          <Eyebrow>Phase Control</Eyebrow>
          <SectionTitle>Current Phase</SectionTitle>
          <View style={[styles.stack, isDesktop && styles.phaseGrid]}>
            {manifest.phases.map((phase) => (
              <View
                key={phase.id}
                style={[
                  styles.phaseRow,
                  phase.id === athleteState.currentPhaseId && styles.phaseRowActive,
                  isDesktop && styles.phaseRowDesktop,
                ]}
              >
                <View style={styles.phaseHeader}>
                  <Pill tone={phase.id === athleteState.currentPhaseId ? 'primary' : 'default'}>
                    {phase.id === athleteState.currentPhaseId ? 'Selected' : 'Available'}
                  </Pill>
                  <BodyText>{phase.name}</BodyText>
                </View>
                <Subtitle>{phase.summary}</Subtitle>
                <Button
                  label={phase.id === athleteState.currentPhaseId ? 'Current Phase' : 'Switch To Phase'}
                  tone="secondary"
                  disabled={phase.id === athleteState.currentPhaseId}
                  onPress={() => setCurrentPhase(phase.id)}
                />
              </View>
            ))}
          </View>
        </Card>

        <Card style={isDesktop && styles.resetColumn}>
          <Eyebrow>Reset</Eyebrow>
          <SectionTitle>Restart Program</SectionTitle>
          <Subtitle>{message}</Subtitle>
          <View style={styles.stack}>
            <Button
              label="Restart And Keep History"
              onPress={() => {
                restartProgram(false);
                setMessage('Program restarted. Completed history was preserved.');
              }}
            />
            <Button
              label="Restart And Clear History"
              tone="danger"
              onPress={() => {
                restartProgram(true);
                setMessage('Program restarted. Completed history and logs were cleared.');
              }}
            />
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
  offsetCard: {
    marginTop: -40,
  },
  phaseColumn: {
    flex: 1.2,
  },
  resetColumn: {
    flex: 0.8,
  },
  stack: {
    gap: spacing.sm,
  },
  phaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  phaseRow: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  phaseRowDesktop: {
    width: '48%',
  },
  phaseRowActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  phaseHeader: {
    gap: spacing.xs,
  },
});

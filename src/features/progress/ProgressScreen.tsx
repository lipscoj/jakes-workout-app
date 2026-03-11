import { StyleSheet, View } from 'react-native';

import { trainingEngine } from '../../domain/trainingEngine';
import { useTrainingApp } from '../../state/TrainingAppProvider';
import {
  BodyText,
  BulletList,
  Card,
  Eyebrow,
  HeroPanel,
  Input,
  Pill,
  Screen,
  SectionTitle,
  StatChip,
  Subtitle,
} from '../../ui/primitives';
import { useResponsiveLayout } from '../../ui/responsive';
import { colors, spacing } from '../../ui/theme';

export function ProgressScreen() {
  const { manifest, athleteState, updateBenchmarkValue } = useTrainingApp();
  const benchmarks = trainingEngine.getBenchmarkSummaries(manifest, athleteState);
  const coachingRules = manifest.coachingRules;
  const sessions = [...athleteState.completedSessions].reverse();
  const currentPhaseId = athleteState.currentPhaseId;
  const { isDesktop } = useResponsiveLayout();

  return (
    <Screen chrome="dense">
      <HeroPanel
        eyebrow="Progress Ledger"
        title="Progress"
        subtitle="Lightweight trends only. This tool is about adherence and safe progression."
      >
        <View style={styles.heroStats}>
          <StatChip label="Sessions" value={String(athleteState.completedSessions.length)} />
          <StatChip label="Logs" value={String(athleteState.logEntries.length)} />
        </View>
      </HeroPanel>

      <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
        <View style={[styles.primaryColumn, isDesktop && styles.primaryColumnDesktop]}>
          <Card style={styles.offsetCard}>
            <Eyebrow>Roadmap</Eyebrow>
            <SectionTitle>Program Phases</SectionTitle>
            <View style={[styles.roadmapStack, isDesktop && styles.roadmapGrid]}>
              {manifest.phases.map((phase) => (
                <View
                  key={phase.id}
                  style={[
                    styles.phaseRow,
                    phase.id === currentPhaseId && styles.phaseRowActive,
                    isDesktop && styles.phaseRowDesktop,
                  ]}
                >
                  <Pill tone={phase.id === currentPhaseId ? 'primary' : 'default'}>
                    {phase.id === currentPhaseId ? 'Current' : 'Phase'}
                  </Pill>
                  <BodyText>{phase.name}</BodyText>
                  <Subtitle>{phase.focus.join(' • ')}</Subtitle>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <Eyebrow>Signals</Eyebrow>
            <SectionTitle>Benchmarks</SectionTitle>
            <View style={[styles.benchmarkStack, isDesktop && styles.benchmarkGrid]}>
              {benchmarks.map((benchmark) => (
                <View key={benchmark.id} style={[styles.benchmarkRow, isDesktop && styles.benchmarkRowDesktop]}>
                  <Pill>{benchmark.category}</Pill>
                  <BodyText>{benchmark.title}</BodyText>
                  <Subtitle>{benchmark.currentValue}</Subtitle>
                  <Subtitle>{benchmark.target}</Subtitle>
                  {benchmark.trackingMode === 'manual' ? (
                    <Input
                      value={athleteState.benchmarkValues[benchmark.id] ?? ''}
                      onChangeText={(nextValue) => updateBenchmarkValue(benchmark.id, nextValue)}
                      placeholder={benchmark.placeholder ?? 'Enter value'}
                      label={benchmark.inputLabel ?? 'Current value'}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={[styles.secondaryColumn, isDesktop && styles.secondaryColumnDesktop]}>
          <Card>
            <Eyebrow>Rules</Eyebrow>
            <SectionTitle>Coaching Rules</SectionTitle>
            <BulletList items={coachingRules.map((rule) => `${rule.title}: ${rule.body}`)} />
          </Card>

          <Card>
            <Eyebrow>History</Eyebrow>
            <SectionTitle>Recent History</SectionTitle>
            <View style={styles.historyStack}>
              {sessions.length === 0 ? (
                <Subtitle>No sessions completed yet.</Subtitle>
              ) : (
                sessions.map((session) => {
                  const logEntry = athleteState.logEntries.find((entry) => entry.sessionId === session.id);

                  return (
                    <View key={session.id} style={styles.historyRow}>
                      <BodyText>{session.displayTitle}</BodyText>
                      <Subtitle>{new Date(session.completedAt).toLocaleString()}</Subtitle>
                      {logEntry ? (
                        <Subtitle>
                          {[
                            logEntry.durationMinutes ? `${logEntry.durationMinutes} min` : null,
                            logEntry.rpe ? `RPE ${logEntry.rpe}` : null,
                            logEntry.backPainLevel !== null ? `Back ${logEntry.backPainLevel}/10` : null,
                            logEntry.footPainLevel !== null ? `Foot ${logEntry.footPainLevel}/10` : null,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </Subtitle>
                      ) : (
                        <Subtitle>No log recorded.</Subtitle>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          </Card>
        </View>
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
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  primaryColumn: {
    gap: spacing.md,
  },
  primaryColumnDesktop: {
    flex: 1.2,
  },
  secondaryColumn: {
    gap: spacing.md,
  },
  secondaryColumnDesktop: {
    flex: 0.8,
  },
  heroStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  offsetCard: {
    marginTop: -36,
  },
  benchmarkStack: {
    gap: spacing.sm,
  },
  roadmapStack: {
    gap: spacing.sm,
  },
  roadmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  phaseRow: {
    gap: spacing.xs,
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
  benchmarkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  benchmarkRow: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benchmarkRowDesktop: {
    width: '48%',
  },
  historyStack: {
    gap: spacing.sm,
  },
  historyRow: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

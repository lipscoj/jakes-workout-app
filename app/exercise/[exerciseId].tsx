import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { programManifest } from '../../src/data/programManifest';
import { ExerciseDetailScreen } from '../../src/features/exercise/ExerciseDetailScreen';

export function generateStaticParams() {
  return Object.keys(programManifest.exercises).map((exerciseId) => ({
    exerciseId,
  }));
}

export default function ExerciseRoute() {
  const params = useLocalSearchParams<{ exerciseId?: string }>();

  if (!params.exerciseId) {
    return <Text>Exercise not found.</Text>;
  }

  return <ExerciseDetailScreen exerciseId={params.exerciseId} />;
}

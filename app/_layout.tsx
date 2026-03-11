import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fraunces_400Regular_Italic, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  PublicSans_400Regular,
  PublicSans_500Medium,
  PublicSans_700Bold,
} from '@expo-google-fonts/public-sans';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TrainingAppProvider } from '../src/state/TrainingAppProvider';
import { colors, fonts } from '../src/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    PublicSans_400Regular,
    PublicSans_500Medium,
    PublicSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <TrainingAppProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontSize: 18,
              fontFamily: fonts.displaySemiBold,
              color: colors.text,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercise/[exerciseId]"
            options={{ title: 'Exercise Detail' }}
          />
        </Stack>
      </TrainingAppProvider>
    </SafeAreaProvider>
  );
}

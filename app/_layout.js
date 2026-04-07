import { Stack } from 'expo-router';
import { SettingsProvider } from '../constants/SettingsContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="test" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SettingsProvider>
  );
}

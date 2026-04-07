import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="test" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workout" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
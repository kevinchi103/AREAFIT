import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SettingsProvider } from '../constants/SettingsContext';
import { loadNotifPrefs, applyNotificationPrefs } from '../constants/pushNotifications';
import { loadState } from '../constants/storage';

function NotificationInit() {
  useEffect(() => {
    (async () => {
      try {
        const [prefs, state] = await Promise.all([loadNotifPrefs(), loadState()]);
        await applyNotificationPrefs(prefs, state?.streak || 0);
      } catch (e) {
        // Silently fail — notifications are optional
      }
    })();
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <NotificationInit />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="test" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout" />
        <Stack.Screen name="historial" />
        <Stack.Screen name="retos" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="admin-workouts" options={{ presentation: 'modal' }} />
      </Stack>
    </SettingsProvider>
  );
}

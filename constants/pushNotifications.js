import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PREFS_KEY = '@hab_notif_prefs';

// Notification IDs (for cancelling specific notifications)
const IDS = {
  DAILY_REMINDER:  'daily_workout_reminder',
  STREAK_WARNING:  'streak_at_risk',
};

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ── Permission ───────────────────────────────────────────────────

/**
 * Request notification permissions from the OS.
 * Returns true if granted, false otherwise.
 */
export async function requestNotificationPermission() {
  // Web doesn't support expo-notifications permissions the same way
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'HAB',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Preferences ──────────────────────────────────────────────────

const DEFAULT_PREFS = {
  dailyReminderEnabled: true,
  dailyReminderHour: 18,     // 18:00 default
  dailyReminderMinute: 0,
  streakWarningEnabled: true,
};

export async function loadNotifPrefs() {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export async function saveNotifPrefs(prefs) {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('saveNotifPrefs error:', e);
  }
}

// ── Scheduling ───────────────────────────────────────────────────

/**
 * Schedule (or re-schedule) the daily workout reminder.
 * Fires every day at the given hour:minute.
 */
export async function scheduleDailyReminder(hour = 18, minute = 0) {
  // Cancel existing first
  await Notifications.cancelScheduledNotificationAsync(IDS.DAILY_REMINDER).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.DAILY_REMINDER,
    content: {
      title: '💪 ¡Hora de entrenar!',
      body: 'Tu sesión de hoy te está esperando. ¡No rompas la racha!',
      data: { type: 'reminder' },
    },
    trigger: {
      type: 'daily',
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Schedule a one-time streak-at-risk warning for tonight at 21:00
 * if the user hasn't trained today yet. Call this at app launch.
 */
export async function scheduleStreakWarning(currentStreak = 0) {
  await Notifications.cancelScheduledNotificationAsync(IDS.STREAK_WARNING).catch(() => {});

  if (currentStreak < 2) return; // no streak to protect

  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(21, 0, 0, 0);

  if (tonight <= now) return; // already past 21:00

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.STREAK_WARNING,
    content: {
      title: `🔥 ¡Tu racha de ${currentStreak} días peligra!`,
      body: 'Todavía tienes tiempo de entrenar hoy. ¡No lo pierdas!',
      data: { type: 'streak_warning' },
    },
    trigger: { date: tonight },
  });
}

/**
 * Cancel the streak warning (call after completing a workout).
 */
export async function cancelStreakWarning() {
  await Notifications.cancelScheduledNotificationAsync(IDS.STREAK_WARNING).catch(() => {});
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Apply saved preferences: enable/disable daily reminder and streak warning.
 * Call once at app startup after loading prefs and user state.
 */
export async function applyNotificationPrefs(prefs, streak = 0) {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminder(prefs.dailyReminderHour, prefs.dailyReminderMinute);
  } else {
    await Notifications.cancelScheduledNotificationAsync(IDS.DAILY_REMINDER).catch(() => {});
  }

  if (prefs.streakWarningEnabled) {
    await scheduleStreakWarning(streak);
  } else {
    await cancelStreakWarning();
  }
}

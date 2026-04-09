import { Platform } from 'react-native';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync';
import setNotificationChannelAsync from 'expo-notifications/build/setNotificationChannelAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

import type { Language } from '../types/app';

const ANDROID_CHANNEL_ID = 'workout-reminders';

const DAILY_HOUR = 10;
const DAILY_MINUTE = 0;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Workout reminders',
    importance: AndroidImportance.DEFAULT,
  });
}

function reminderTexts(language: Language) {
  if (language === 'ru') {
    return {
      title: 'Пора потренироваться',
      body: 'Загляни в Giga Tracker и запиши тренировку.',
    };
  }
  return {
    title: 'Time to work out',
    body: 'Open Giga Tracker and log your workout.',
  };
}

export function isNotificationSupported() {
  return Platform.OS !== 'web';
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }
  const { status: existing } = await getPermissionsAsync();
  if (existing === 'granted') {
    return true;
  }
  const { status } = await requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyWorkoutReminder(language: Language): Promise<string | null> {
  if (!isNotificationSupported()) {
    return null;
  }
  await ensureAndroidChannel();
  const { title, body } = reminderTexts(language);
  const id = await scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_HOUR,
      minute: DAILY_MINUTE,
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
  });
  return id;
}

export async function cancelWorkoutReminder(notificationId: string | null | undefined) {
  if (!isNotificationSupported() || !notificationId) {
    return;
  }
  try {
    await cancelScheduledNotificationAsync(notificationId);
  } catch {
  }
}

export async function sendTestWorkoutReminder(language: Language): Promise<void> {
  if (!isNotificationSupported()) {
    return;
  }
  await ensureAndroidChannel();
  const { title, body } = reminderTexts(language);
  await scheduleNotificationAsync({
    content: {
      title,
      body: `[test] ${body}`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
    },
  });
}

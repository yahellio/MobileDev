import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config/storageKeys';
import type { Language, ThemeMode } from '../types/app';

export async function loadSettings() {
  const [savedTheme, savedLanguage, savedUserName, savedReminders, savedReminderId] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.theme),
    AsyncStorage.getItem(STORAGE_KEYS.language),
    AsyncStorage.getItem(STORAGE_KEYS.userName),
    AsyncStorage.getItem(STORAGE_KEYS.remindersEnabled),
    AsyncStorage.getItem(STORAGE_KEYS.dailyReminderNotificationId),
  ]);

  return {
    theme:
      savedTheme === 'light' || savedTheme === 'dark'
        ? (savedTheme as ThemeMode)
        : undefined,
    language:
      savedLanguage === 'ru' || savedLanguage === 'en'
        ? (savedLanguage as Language)
        : undefined,
    userName: savedUserName?.trim() ? savedUserName : undefined,
    remindersEnabled: savedReminders === 'true' ? true : savedReminders === 'false' ? false : undefined,
    dailyReminderNotificationId: savedReminderId?.trim() ? savedReminderId : undefined,
  };
}

export async function saveTheme(theme: ThemeMode) {
  await AsyncStorage.setItem(STORAGE_KEYS.theme, theme);
}

export async function saveLanguage(language: Language) {
  await AsyncStorage.setItem(STORAGE_KEYS.language, language);
}

export async function saveUserName(userName: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.userName, userName);
}

export async function saveRemindersEnabled(enabled: boolean) {
  await AsyncStorage.setItem(STORAGE_KEYS.remindersEnabled, enabled ? 'true' : 'false');
}

export async function saveDailyReminderNotificationId(id: string | null) {
  if (id) {
    await AsyncStorage.setItem(STORAGE_KEYS.dailyReminderNotificationId, id);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.dailyReminderNotificationId);
  }
}

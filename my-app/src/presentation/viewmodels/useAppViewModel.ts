import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { exerciseRepository } from '../../data/repositories/exerciseRepository';
import { quoteRepository } from '../../data/repositories/quoteRepository';
import { subscribeOnlineStatus } from '../../data/network/networkService';
import { initApiCacheDb } from '../../data/cache/apiCacheDb';
import {
  getExerciseCatalogUseCase,
  refreshExerciseCatalogUseCase,
} from '../../domain/usecases/getExerciseCatalog';
import { getRandomQuoteUseCase } from '../../domain/usecases/getRandomQuote';
import { deleteWorkoutRemote, isImageKitConfigured, saveWorkoutRemote, uploadWorkoutImage } from '../../data/remote/workoutRemote';
import { createWorkout, getWorkouts, initDb, removeWorkout, updateWorkout } from '../../db/workouts';
import { translations } from '../../i18n/translations';
import {
  cancelWorkoutReminder,
  ensureNotificationPermission,
  isNotificationSupported,
  scheduleDailyWorkoutReminder,
  sendTestWorkoutReminder,
} from '../../notifications/workoutReminders';
import {
  loadSettings,
  saveDailyReminderNotificationId,
  saveLanguage,
  saveRemindersEnabled,
  saveTheme,
  saveUserName,
} from '../../storage/settings';
import { themePalette } from '../../theme/palette';
import type { Language, Screen, ThemeMode } from '../../types/app';
import type { Workout, WorkoutForm } from '../../types/workout';
import type { RemoteMuscleGroup } from '../../domain/models/exercise';

type QuoteViewData = {
  text: string;
  author: string;
};

type ExerciseLabelMap = Record<string, { ru: string; en: string }>;

function toExerciseLabelMap(catalog: RemoteMuscleGroup[]) {
  const entries: ExerciseLabelMap = {};
  for (const group of catalog) {
    for (const exercise of group.exercises) {
      entries[exercise.id] = {
        ru: exercise.label.ru ?? '',
        en: exercise.label.en ?? '',
      };
    }
  }
  return entries;
}

function splitExerciseCsv(exercisesCsv: string): string[] {
  return exercisesCsv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useAppViewModel() {
  const [language, setLanguage] = useState<Language>('ru');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [userName, setUserName] = useState('User');
  const [isSplashVisible, setSplashVisible] = useState(true);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkoutForm>({
    title: '',
    description: '',
    duration_minutes: '45',
    exercises_csv: '',
    image_url: '',
    image_uri: null,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [quote, setQuote] = useState<QuoteViewData | null>(null);
  const [catalog, setCatalog] = useState<RemoteMuscleGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [exerciseLabelMap, setExerciseLabelMap] = useState<ExerciseLabelMap>({});
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const t = translations[language];
  const colors = themePalette[themeMode];
  const selectedWorkout =
    screen.name === 'details'
      ? workouts.find((workout) => workout.id === screen.workoutId) ?? null
      : null;

  async function refreshWorkouts() {
    const rows = await getWorkouts();
    setWorkouts(rows);
  }

  function openCreateModal() {
    setEditingWorkoutId(null);
    setForm({
      title: '',
      description: '',
      duration_minutes: '45',
      exercises_csv: '',
      image_url: '',
      image_uri: null,
    });
    setModalVisible(true);
  }

  function openEditModal(workout: Workout) {
    setEditingWorkoutId(workout.id);
    setForm({
      title: workout.title,
      description: workout.description,
      duration_minutes: String(workout.duration_minutes),
      exercises_csv: workout.exercises_csv,
      image_url: workout.image_url ?? '',
      image_uri: null,
    });
    setModalVisible(true);
  }

  async function submitForm() {
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    let imageUrl = form.image_url.trim();
    if (form.image_uri && isImageKitConfigured()) {
      try {
        imageUrl = await uploadWorkoutImage(form.image_uri);
      } catch {
        // нет ключа ImageKit или сбой загрузки — оставляем прежний URL
      }
    }

    const data: WorkoutForm = {
      title: form.title.trim(),
      description: form.description.trim(),
      duration_minutes: form.duration_minutes,
      exercises_csv: form.exercises_csv.trim(),
      image_url: imageUrl,
      image_uri: null,
    };

    if (editingWorkoutId === null) {
      const created = await createWorkout(data);
      void saveWorkoutRemote({
        id: created.id,
        title: data.title,
        description: data.description,
        workout_date: created.workout_date,
        duration_minutes: Number(data.duration_minutes) || 0,
        exercises_csv: data.exercises_csv,
        image_url: data.image_url,
      });
    } else {
      await updateWorkout(editingWorkoutId, data);
      const prev = workouts.find((w) => w.id === editingWorkoutId);
      void saveWorkoutRemote({
        id: editingWorkoutId,
        title: data.title,
        description: data.description,
        workout_date: prev?.workout_date ?? new Date().toISOString(),
        duration_minutes: Number(data.duration_minutes) || 0,
        exercises_csv: data.exercises_csv,
        image_url: data.image_url,
      });
    }

    await refreshWorkouts();
    setModalVisible(false);
  }

  async function handleDelete(id: number) {
    void deleteWorkoutRemote(id);
    await removeWorkout(id);
    if (screen.name === 'details' && screen.workoutId === id) {
      setScreen({ name: 'home' });
    }
    await refreshWorkouts();
  }

  async function handleThemeToggle(value: boolean) {
    const nextTheme: ThemeMode = value ? 'dark' : 'light';
    setThemeMode(nextTheme);
    await saveTheme(nextTheme);
  }

  async function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
    await saveLanguage(nextLanguage);
    await loadCatalog(true, nextLanguage);
    const s = await loadSettings();
    if (s.remindersEnabled) {
      const ok = await ensureNotificationPermission();
      if (ok) {
        await cancelWorkoutReminder(s.dailyReminderNotificationId);
        const id = await scheduleDailyWorkoutReminder(nextLanguage);
        if (id) {
          await saveDailyReminderNotificationId(id);
        }
      }
    }
  }

  async function handleRemindersToggle(enabled: boolean) {
    if (!isNotificationSupported()) {
      return;
    }
    if (enabled) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        Alert.alert('', t.remindersPermissionDenied);
        return;
      }
      const prev = await loadSettings();
      await cancelWorkoutReminder(prev.dailyReminderNotificationId);
      const id = await scheduleDailyWorkoutReminder(language);
      if (id) {
        await saveDailyReminderNotificationId(id);
        await saveRemindersEnabled(true);
        setRemindersEnabled(true);
      }
    } else {
      const prev = await loadSettings();
      await cancelWorkoutReminder(prev.dailyReminderNotificationId);
      await saveDailyReminderNotificationId(null);
      await saveRemindersEnabled(false);
      setRemindersEnabled(false);
    }
  }

  async function handleTestReminder() {
    if (!isNotificationSupported()) {
      return;
    }
    const ok = await ensureNotificationPermission();
    if (!ok) {
      Alert.alert('', t.remindersPermissionDenied);
      return;
    }
    await sendTestWorkoutReminder(language);
  }

  async function handleUserNameChange(value: string) {
    setUserName(value);
    await saveUserName(value);
  }

  async function loadQuote() {
    try {
      const data = await getRandomQuoteUseCase(quoteRepository);
      setQuote({ text: data.text, author: data.author });
      setQuoteError(false);
    } catch {
      setQuoteError(true);
    }
  }

  async function loadCatalog(fromRefresh = false, targetLanguage: Language = language) {
    setCatalogLoading(true);
    try {
      const data = fromRefresh
        ? await refreshExerciseCatalogUseCase(exerciseRepository, targetLanguage)
        : await getExerciseCatalogUseCase(exerciseRepository, targetLanguage);
      setCatalog(data);
      setExerciseLabelMap(toExerciseLabelMap(data));
      setCatalogError(false);
    } catch {
      setCatalogError(true);
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const started = Date.now();

      try {
        await initDb();
        await initApiCacheDb();

        const settings = await loadSettings();
        const bootstrapLanguage = settings.language ?? 'ru';
        if (settings.theme) setThemeMode(settings.theme);
        if (settings.language) setLanguage(settings.language);
        if (settings.userName) setUserName(settings.userName);
        if (settings.remindersEnabled === true) {
          setRemindersEnabled(true);
        }

        if (settings.remindersEnabled) {
          const ok = await ensureNotificationPermission();
          if (ok) {
            await cancelWorkoutReminder(settings.dailyReminderNotificationId);
            const id = await scheduleDailyWorkoutReminder(bootstrapLanguage);
            if (id) {
              await saveDailyReminderNotificationId(id);
            }
          }
        }

        const rows = await getWorkouts();
        if (isMounted) {
          setWorkouts(rows);
        }

        // Do not block app startup on network calls.
        void loadQuote();
        void loadCatalog(false, bootstrapLanguage);
      } finally {
        const elapsed = Date.now() - started;
        const minSplashMs = 1200;
        const waitMs = elapsed < minSplashMs ? minSplashMs - elapsed : 0;

        setTimeout(() => {
          if (isMounted) {
            setSplashVisible(false);
          }
        }, waitMs);
      }
    }

    void bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeOnlineStatus((online) => {
      setIsOnline(online);
      if (online) {
        void loadQuote();
        void loadCatalog(true, language);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [language]);

  const exerciseLabelResolver = useMemo(
    () => (id: string) => exerciseLabelMap[id]?.[language] ?? '',
    [exerciseLabelMap, language]
  );

  const selectedExerciseLabels = useMemo(
    () =>
      splitExerciseCsv(form.exercises_csv)
        .map((value) => ({
          id: value,
          label: exerciseLabelResolver(value),
        }))
        .filter((exercise) => exercise.label.trim().length > 0),
    [exerciseLabelResolver, form.exercises_csv]
  );

  return {
    language,
    themeMode,
    userName,
    isSplashVisible,
    screen,
    workouts,
    isModalVisible,
    editingWorkoutId,
    form,
    t,
    colors,
    selectedWorkout,
    isOnline,
    quote,
    quoteError,
    catalog,
    catalogLoading,
    catalogError,
    selectedExerciseLabels,
    setScreen,
    setForm,
    setModalVisible,
    openCreateModal,
    openEditModal,
    submitForm,
    handleDelete,
    handleThemeToggle,
    handleLanguageChange,
    handleUserNameChange,
    exerciseLabelResolver,
    notificationsSupported: isNotificationSupported(),
    remindersEnabled,
    handleRemindersToggle,
    handleTestReminder,
  };
}

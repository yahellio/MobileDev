import { useEffect, useMemo, useState } from 'react';

import { exerciseRepository } from '../../data/repositories/exerciseRepository';
import { quoteRepository } from '../../data/repositories/quoteRepository';
import { subscribeOnlineStatus } from '../../data/network/networkService';
import { initApiCacheDb } from '../../data/cache/apiCacheDb';
import {
  getExerciseCatalogUseCase,
  refreshExerciseCatalogUseCase,
} from '../../domain/usecases/getExerciseCatalog';
import { getRandomQuoteUseCase } from '../../domain/usecases/getRandomQuote';
import { createWorkout, getWorkouts, initDb, removeWorkout, updateWorkout } from '../../db/workouts';
import { translations } from '../../i18n/translations';
import { loadSettings, saveLanguage, saveTheme, saveUserName } from '../../storage/settings';
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
  });

  const [isOnline, setIsOnline] = useState(true);
  const [quote, setQuote] = useState<QuoteViewData | null>(null);
  const [catalog, setCatalog] = useState<RemoteMuscleGroup[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [exerciseLabelMap, setExerciseLabelMap] = useState<ExerciseLabelMap>({});

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
    });
    setModalVisible(true);
  }

  async function submitForm() {
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    if (editingWorkoutId === null) {
      await createWorkout(form);
    } else {
      await updateWorkout(editingWorkoutId, form);
    }

    await refreshWorkouts();
    setModalVisible(false);
  }

  async function handleDelete(id: number) {
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
  };
}

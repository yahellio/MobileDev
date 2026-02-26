import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SplashScreen } from './src/components/SplashScreen';
import { WorkoutFormModal } from './src/components/WorkoutFormModal';
import {
  createWorkout,
  getWorkouts,
  initDb,
  removeWorkout,
  updateWorkout,
} from './src/db/workouts';
import { translations } from './src/i18n/translations';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { loadSettings, saveLanguage, saveTheme, saveUserName } from './src/storage/settings';
import { themePalette } from './src/theme/palette';
import type { Language, Screen, ThemeMode } from './src/types/app';
import type { Workout, WorkoutForm } from './src/types/workout';

function AppContainer() {
  const insets = useSafeAreaInsets();
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

  const t = translations[language];
  const colors = themePalette[themeMode];
  const selectedWorkout =
    screen.name === 'details'
      ? workouts.find((workout) => workout.id === screen.workoutId) ?? null
      : null;

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      const started = Date.now();

      try {
        await initDb();

        const settings = await loadSettings();
        if (settings.theme) setThemeMode(settings.theme);
        if (settings.language) setLanguage(settings.language);
        if (settings.userName) setUserName(settings.userName);

        const rows = await getWorkouts();
        if (isMounted) {
          setWorkouts(rows);
        }
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
  }

  async function handleUserNameChange(value: string) {
    setUserName(value);
    await saveUserName(value);
  }

  if (isSplashVisible) {
    return (
      <>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        <SplashScreen t={t} colors={colors} isDark={themeMode === 'dark'} />
      </>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />

      {screen.name === 'home' && (
        <HomeScreen
          colors={colors}
          t={t}
          language={language}
          userName={userName}
          bottomInset={insets.bottom}
          workouts={workouts}
          onOpenSettings={() => setScreen({ name: 'settings' })}
          onOpenCreateModal={openCreateModal}
          onOpenEditModal={openEditModal}
          onOpenDetails={(workoutId) => setScreen({ name: 'details', workoutId })}
          onDelete={(workoutId) => {
            void handleDelete(workoutId);
          }}
        />
      )}

      {screen.name === 'details' && (
        <DetailsScreen
          colors={colors}
          t={t}
          language={language}
          workout={selectedWorkout}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'settings' && (
        <SettingsScreen
          colors={colors}
          t={t}
          language={language}
          themeMode={themeMode}
          userName={userName}
          onBack={() => setScreen({ name: 'home' })}
          onSelectLanguage={(nextLanguage) => {
            void handleLanguageChange(nextLanguage);
          }}
          onToggleTheme={(isDark) => {
            void handleThemeToggle(isDark);
          }}
          onChangeUserName={(value) => {
            void handleUserNameChange(value);
          }}
        />
      )}

      <WorkoutFormModal
        visible={isModalVisible}
        form={form}
        colors={colors}
        t={t}
        language={language}
        isEditing={editingWorkoutId !== null}
        onChange={setForm}
        onSave={() => {
          void submitForm();
        }}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContainer />
    </SafeAreaProvider>
  );
}

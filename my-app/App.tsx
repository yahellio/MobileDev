import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFirebase } from './src/config/firebase';
import { SplashScreen } from './src/components/SplashScreen';
import { WorkoutFormModal } from './src/components/WorkoutFormModal';
import { useAppViewModel } from './src/presentation/viewmodels/useAppViewModel';
import { AuthScreen } from './src/screens/AuthScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

function AppContainer() {
  const insets = useSafeAreaInsets();
  const vm = useAppViewModel();

  if (vm.isSplashVisible) {
    return (
      <>
        <StatusBar style={vm.themeMode === 'dark' ? 'light' : 'dark'} />
        <SplashScreen t={vm.t} colors={vm.colors} isDark={vm.themeMode === 'dark'} />
      </>
    );
  }

  if (!vm.firebaseUser) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{ flex: 1, backgroundColor: vm.colors.background }}
      >
        <StatusBar style={vm.themeMode === 'dark' ? 'light' : 'dark'} />
        <AuthScreen
          colors={vm.colors}
          t={vm.t}
          firebaseAvailable={getFirebase() !== null}
          submitting={vm.authSubmitting}
          errorMessage={vm.authError}
          onSignIn={(email, password) => {
            void vm.handleAuthSignIn(email, password);
          }}
          onRegister={(email, password, displayName) => {
            void vm.handleAuthRegister(email, password, displayName);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: vm.colors.background }}
    >
      <StatusBar style={vm.themeMode === 'dark' ? 'light' : 'dark'} />

      {vm.screen.name === 'home' && (
        <HomeScreen
          colors={vm.colors}
          t={vm.t}
          language={vm.language}
          userName={vm.userName}
          isOnline={vm.isOnline}
          quote={vm.quote}
          quoteError={vm.quoteError}
          bottomInset={insets.bottom}
          workouts={vm.workouts}
          onOpenSettings={() => vm.setScreen({ name: 'settings' })}
          onOpenCreateModal={vm.openCreateModal}
          onOpenEditModal={vm.openEditModal}
          onOpenDetails={(workoutId) => vm.setScreen({ name: 'details', workoutId })}
          onDelete={(workoutId) => {
            void vm.handleDelete(workoutId);
          }}
        />
      )}

      {vm.screen.name === 'details' && (
        <DetailsScreen
          colors={vm.colors}
          t={vm.t}
          language={vm.language}
          workout={vm.selectedWorkout}
          resolveExerciseLabel={vm.exerciseLabelResolver}
          onBack={() => vm.setScreen({ name: 'home' })}
        />
      )}

      {vm.screen.name === 'settings' && (
        <SettingsScreen
          colors={vm.colors}
          t={vm.t}
          language={vm.language}
          themeMode={vm.themeMode}
          userName={vm.userName}
          accountEmail={vm.firebaseUser?.email ?? null}
          onBack={() => vm.setScreen({ name: 'home' })}
          onSelectLanguage={(nextLanguage) => {
            void vm.handleLanguageChange(nextLanguage);
          }}
          onToggleTheme={(isDark) => {
            void vm.handleThemeToggle(isDark);
          }}
          onChangeUserName={(value) => {
            void vm.handleUserNameChange(value);
          }}
          onSignOut={() => {
            void vm.handleSignOut();
          }}
          notificationsSupported={vm.notificationsSupported}
          remindersEnabled={vm.remindersEnabled}
          onRemindersToggle={(enabled) => {
            void vm.handleRemindersToggle(enabled);
          }}
          onTestReminder={() => {
            void vm.handleTestReminder();
          }}
        />
      )}

      <WorkoutFormModal
        visible={vm.isModalVisible}
        form={vm.form}
        colors={vm.colors}
        t={vm.t}
        language={vm.language}
        muscleGroups={vm.catalog}
        catalogLoading={vm.catalogLoading}
        catalogError={vm.catalogError}
        selectedExercises={vm.selectedExerciseLabels}
        isEditing={vm.editingWorkoutId !== null}
        onChange={vm.setForm}
        onSave={() => {
          void vm.submitForm();
        }}
        onClose={() => vm.setModalVisible(false)}
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

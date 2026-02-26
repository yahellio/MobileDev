import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getExerciseLabel, splitExerciseCsv } from '../data/exerciseCatalog';
import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language } from '../types/app';
import type { Workout } from '../types/workout';
import { formatDate } from '../utils/date';

type DetailsScreenProps = {
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  workout: Workout | null;
  onBack: () => void;
};

export function DetailsScreen({
  colors,
  t,
  language,
  workout,
  onBack,
}: DetailsScreenProps) {
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: 14,
      marginTop: 4,
    },
    textButton: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      gap: 10,
    },
    emptyText: {
      color: colors.secondaryText,
      textAlign: 'center',
    },
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 12,
      marginHorizontal: 16,
      marginTop: 10,
      marginBottom: Math.max(12, insets.bottom + 8),
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    workoutName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    cardText: {
      color: colors.secondaryText,
      fontSize: 14,
    },
    exercisesScroll: {
      flex: 1,
    },
    exercisesListContent: {
      paddingBottom: 6,
    },
  });

  const exerciseLabels = workout
    ? splitExerciseCsv(workout.exercises_csv).map((value) => getExerciseLabel(value, language))
    : [];

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.details}</Text>
        </View>
        <Pressable style={styles.textButton} onPress={onBack}>
          <Text style={styles.textButtonLabel}>{t.back}</Text>
        </Pressable>
      </View>

      {!workout ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>{t.noWorkouts}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.workoutName}>{workout.title}</Text>
          <Text style={styles.subtitle}>{workout.description}</Text>
          <Text style={styles.cardText}>
            {t.duration}: {workout.duration_minutes} {t.minutesShort}
          </Text>
          <Text style={styles.cardText}>
            {t.date}: {formatDate(workout.workout_date, language)}
          </Text>
          <Text style={styles.cardTitle}>{t.exercises}</Text>

          <ScrollView
            style={styles.exercisesScroll}
            contentContainerStyle={styles.exercisesListContent}
            showsVerticalScrollIndicator
          >
            {exerciseLabels.map((exercise, index) => (
              <Text key={`${exercise}-${index}`} style={styles.cardText}>
                • {exercise}
              </Text>
            ))}
            {exerciseLabels.length === 0 && (
              <Text style={styles.cardText}>{t.noExercises}</Text>
            )}
          </ScrollView>
        </View>
      )}
    </>
  );
}

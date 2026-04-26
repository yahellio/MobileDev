import { Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  resolveExerciseLabel: (id: string) => string;
  onBack: () => void;
};

export function DetailsScreen({
  colors,
  t,
  language,
  workout,
  resolveExerciseLabel,
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
    contentColumn: {
      flex: 1,
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
      marginBottom: 0,
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
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    titleImage: {
      width: 72,
      height: 72,
      borderRadius: 8,
      backgroundColor: colors.background,
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
    shareRow: {
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: Math.max(12, insets.bottom + 8),
    },
    shareButton: {
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    shareButtonLabel: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const exerciseLabels = workout
    ? workout.exercises_csv
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => resolveExerciseLabel(value))
    : [];

  async function onShare() {
    if (!workout) {
      return;
    }
    const names = exerciseLabels;
    const parts = [
      `${t.splashTitle}`,
      `${t.title}: ${workout.title}`,
      `${t.description}: ${workout.description}`,
      `${t.duration}: ${workout.duration_minutes} ${t.minutesShort}`,
      `${t.date}: ${formatDate(workout.workout_date, language)}`,
      names.length > 0 ? `${t.exercises}:\n${names.map((n) => `• ${n}`).join('\n')}` : null,
    ].filter(Boolean) as string[];
    const message = parts.join('\n\n');
    try {
      await Share.share({ message, title: workout.title });
    } catch {}
  }

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
        <View style={styles.contentColumn}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              {workout.image_url?.trim() ? (
                <Image source={{ uri: workout.image_url.trim() }} style={styles.titleImage} />
              ) : null}
              <Text style={styles.workoutName}>{workout.title}</Text>
            </View>
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
          <View style={styles.shareRow}>
            <Pressable style={styles.shareButton} onPress={() => void onShare()}>
              <Text style={styles.shareButtonLabel}>{t.share}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language } from '../types/app';
import type { Workout } from '../types/workout';
import { formatDate } from '../utils/date';

type HomeScreenProps = {
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  userName: string;
  isOnline: boolean;
  quote: { text: string; author: string } | null;
  quoteError: boolean;
  bottomInset: number;
  workouts: Workout[];
  onOpenSettings: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (workout: Workout) => void;
  onOpenDetails: (workoutId: number) => void;
  onDelete: (workoutId: number) => void;
};

export function HomeScreen({
  colors,
  t,
  language,
  userName,
  isOnline,
  quote,
  quoteError,
  bottomInset,
  workouts,
  onOpenSettings,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDetails,
  onDelete,
}: HomeScreenProps) {
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
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    iconButtonText: {
      color: colors.text,
      fontSize: 20,
      lineHeight: 22,
      fontWeight: '700',
    },
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    onlineIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: isOnline ? '#22c55e' : '#ef4444',
      borderWidth: 1,
      borderColor: colors.border,
    },
    homeContent: {
      flex: 1,
    },
    quoteCard: {
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: 6,
    },
    quoteText: {
      color: colors.text,
      fontSize: 14,
      fontStyle: 'italic',
    },
    quoteMeta: {
      color: colors.secondaryText,
      fontSize: 12,
    },
    listArea: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 8,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    cardText: {
      color: colors.secondaryText,
      fontSize: 14,
    },
    rowGap: {
      flexDirection: 'row',
      gap: 8,
    },
    textButtonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonDanger: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.danger,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonPrimaryLabel: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    textButtonDangerLabel: {
      color: colors.danger,
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
    bottomBar: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: Math.max(14, bottomInset + 8),
    },
    bottomPrimaryButton: {
      width: '100%',
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
    },
    bottomPrimaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.appTitle}</Text>
          <Text style={styles.subtitle}>
            {t.greeting}, {userName}
          </Text>
        </View>
        <View style={styles.rightControls}>
          <View style={styles.onlineIndicator} />
          <Pressable style={styles.iconButton} onPress={onOpenSettings}>
            <Text style={styles.iconButtonText}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.homeContent}>
        <View style={styles.quoteCard}>
          {!quote && !quoteError && <Text style={styles.quoteMeta}>{t.quoteLoading}</Text>}
          {quote && (
            <>
              <Text style={styles.quoteText}>"{quote.text}"</Text>
              <Text style={styles.quoteMeta}>- {quote.author}</Text>
            </>
          )}
          {quoteError && <Text style={styles.quoteMeta}>{t.quoteUnavailable}</Text>}
        </View>

        <View style={styles.listArea}>
          {workouts.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>{t.noWorkouts}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent}>
              {workouts.map((workout) => (
                <Pressable
                  key={workout.id}
                  style={styles.card}
                  onPress={() => onOpenDetails(workout.id)}
                >
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.cardText}>{workout.description}</Text>
                  <Text style={styles.cardText}>
                    {t.duration}: {workout.duration_minutes} {t.minutesShort}
                  </Text>
                  <Text style={styles.cardText}>
                    {t.date}: {formatDate(workout.workout_date, language)}
                  </Text>

                  <View style={styles.rowGap}>
                    <Pressable
                      style={styles.textButtonPrimary}
                      onPress={() => onOpenEditModal(workout)}
                    >
                      <Text style={styles.textButtonPrimaryLabel}>{t.edit}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.textButtonDanger}
                      onPress={() => onDelete(workout.id)}
                    >
                      <Text style={styles.textButtonDangerLabel}>{t.delete}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.bottomBar}>
          <Pressable style={styles.bottomPrimaryButton} onPress={onOpenCreateModal}>
            <Text style={styles.bottomPrimaryButtonText}>{t.addWorkout}</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { RemoteMuscleGroup } from '../domain/models/exercise';
import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language } from '../types/app';

type ExercisePickerModalProps = {
  visible: boolean;
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  muscleGroups: RemoteMuscleGroup[];
  isLoading: boolean;
  hasError: boolean;
  selectedExerciseIds: string[];
  onApply: (exerciseIds: string[]) => void;
  onClose: () => void;
};

export function ExercisePickerModal({
  visible,
  colors,
  t,
  language,
  muscleGroups,
  isLoading,
  hasError,
  selectedExerciseIds,
  onApply,
  onClose,
}: ExercisePickerModalProps) {
  const initialGroupId = muscleGroups[0]?.id ?? '';
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const exerciseId of selectedExerciseIds) {
      initial[exerciseId] = true;
    }
    return initial;
  });
  const visibleGroups = useMemo(
    () => muscleGroups.filter((group) => group.label[language]?.trim().length > 0),
    [language, muscleGroups]
  );
  const currentGroup = useMemo(
    () => muscleGroups.find((group) => group.id === selectedGroupId) ?? muscleGroups[0],
    [muscleGroups, selectedGroupId]
  );
  const visibleExercises = useMemo(
    () =>
      (currentGroup?.exercises ?? []).filter((exercise) => exercise.label[language]?.trim().length > 0),
    [currentGroup, language]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }
    const nextMap: Record<string, boolean> = {};
    for (const exerciseId of selectedExerciseIds) {
      nextMap[exerciseId] = true;
    }
    setSelectedMap(nextMap);
  }, [selectedExerciseIds, visible]);

  useEffect(() => {
    if (!selectedGroupId && visibleGroups[0]?.id) {
      setSelectedGroupId(visibleGroups[0].id);
      return;
    }
    if (selectedGroupId && !visibleGroups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(visibleGroups[0]?.id ?? '');
    }
  }, [visibleGroups, selectedGroupId]);

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      padding: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 12,
      maxHeight: '90%',
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    groupsScroll: {
      maxHeight: 48,
    },
    groupsRow: {
      gap: 8,
      paddingBottom: 4,
    },
    groupChip: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.background,
    },
    groupChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    groupChipLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    groupChipLabelActive: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    exercisesScroll: {
      maxHeight: 320,
    },
    exerciseRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    exerciseRowActive: {
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    exerciseLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    check: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: '700',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    buttonSecondary: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    buttonPrimaryLabel: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    buttonSecondaryLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  function toggleExercise(exerciseId: string) {
    setSelectedMap((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  }

  function handleApply() {
    const ids = Object.entries(selectedMap)
      .filter(([, isSelected]) => isSelected)
      .map(([exerciseId]) => exerciseId);
    onApply(ids);
  }

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.selectExercises}</Text>
          <Text style={styles.subtitle}>
            {t.selectedExercises}: {selectedCount}
          </Text>
          <Text style={styles.subtitle}>{t.muscleGroups}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.groupsScroll}
            contentContainerStyle={styles.groupsRow}
          >
            {visibleGroups.map((group) => {
              const isActive = group.id === selectedGroupId;
              return (
                <Pressable
                  key={group.id}
                  style={[styles.groupChip, isActive && styles.groupChipActive]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Text style={isActive ? styles.groupChipLabelActive : styles.groupChipLabel}>
                    {group.label[language]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.exercisesScroll}>
            {isLoading && <Text style={styles.subtitle}>{t.catalogLoading}</Text>}
            {hasError && <Text style={styles.subtitle}>{t.catalogUnavailable}</Text>}
            {!isLoading && !hasError && visibleExercises.length === 0 && (
              <Text style={styles.subtitle}>{t.noExercises}</Text>
            )}
            {visibleExercises.map((exercise) => {
              const isSelected = !!selectedMap[exercise.id];
              return (
                <Pressable
                  key={exercise.id}
                  style={[styles.exerciseRow, isSelected && styles.exerciseRowActive]}
                  onPress={() => toggleExercise(exercise.id)}
                >
                  <Text style={styles.exerciseLabel}>{exercise.label[language]}</Text>
                  <Text style={styles.check}>{isSelected ? '✓' : ''}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={styles.buttonPrimary} onPress={handleApply}>
              <Text style={styles.buttonPrimaryLabel}>{t.chooseExercises}</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={onClose}>
              <Text style={styles.buttonSecondaryLabel}>{t.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

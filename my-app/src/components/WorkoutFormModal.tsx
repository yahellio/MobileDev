import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExercisePickerModal } from './ExercisePickerModal';
import {
  getExerciseLabel,
  splitExerciseCsv,
} from '../data/exerciseCatalog';
import type { TranslationDictionary } from '../i18n/translations';
import type { ThemeColors } from '../theme/palette';
import type { Language } from '../types/app';
import type { WorkoutForm } from '../types/workout';

type WorkoutFormModalProps = {
  visible: boolean;
  form: WorkoutForm;
  colors: ThemeColors;
  t: TranslationDictionary;
  language: Language;
  isEditing: boolean;
  onChange: (next: WorkoutForm) => void;
  onSave: () => void;
  onClose: () => void;
};

export function WorkoutFormModal({
  visible,
  form,
  colors,
  t,
  language,
  isEditing,
  onChange,
  onSave,
  onClose,
}: WorkoutFormModalProps) {
  const [isExercisePickerVisible, setExercisePickerVisible] = useState(false);
  const selectedExerciseValues = useMemo(
    () => splitExerciseCsv(form.exercises_csv),
    [form.exercises_csv]
  );
  const selectedExerciseLabels = useMemo(
    () => selectedExerciseValues.map((value) => getExerciseLabel(value, language)),
    [language, selectedExerciseValues]
  );
  const selectedExerciseIds = useMemo(
    () =>
      selectedExerciseValues
        .map((value) => value.trim())
        .filter((value): value is string => Boolean(value)),
    [selectedExerciseValues]
  );

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      justifyContent: 'center',
      padding: 16,
    },
    modalCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 10,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    inputLabel: {
      color: colors.secondaryText,
      fontSize: 13,
    },
    inputLabelButton: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputLabelButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    inputLabelButtonIcon: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.background,
    },
    rowGap: {
      flexDirection: 'row',
      gap: 8,
    },
    textButton: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    textButtonLabel: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '600',
    },
    textButtonPrimaryLabel: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    selectedListBox: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.background,
      maxHeight: 190,
      minHeight: 48,
    },
    selectedListContent: {
      gap: 6,
    },
    selectedItem: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '500',
    },
    emptySelected: {
      color: colors.secondaryText,
      fontSize: 13,
    },
  });

  return (
    <>
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>{isEditing ? t.updateWorkout : t.createWorkout}</Text>

            <Text style={styles.inputLabel}>{t.title}</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(value) => onChange({ ...form, title: value })}
              placeholder={t.title}
              placeholderTextColor={colors.secondaryText}
            />

            <Text style={styles.inputLabel}>{t.description}</Text>
            <TextInput
              style={styles.input}
              value={form.description}
              onChangeText={(value) => onChange({ ...form, description: value })}
              placeholder={t.description}
              placeholderTextColor={colors.secondaryText}
            />

            <Text style={styles.inputLabel}>{t.durationMinutes}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.duration_minutes}
              onChangeText={(value) => onChange({ ...form, duration_minutes: value })}
              placeholder={t.durationMinutes}
              placeholderTextColor={colors.secondaryText}
            />

            <Pressable
              style={styles.inputLabelButton}
              onPress={() => setExercisePickerVisible(true)}
            >
              <Text style={styles.inputLabelButtonText}>{t.selectedExercises}</Text>
              <Text style={styles.inputLabelButtonIcon}>›</Text>
            </Pressable>
            <View style={styles.selectedListBox}>
              <ScrollView showsVerticalScrollIndicator>
                <View style={styles.selectedListContent}>
                  {selectedExerciseLabels.length === 0 ? (
                    <Text style={styles.emptySelected}>{t.noSelectedExercises}</Text>
                  ) : (
                    selectedExerciseLabels.map((name, idx) => (
                      <Text key={`${name}-${idx}`} style={styles.selectedItem}>
                        • {name}
                      </Text>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>

            <View style={styles.rowGap}>
              <Pressable style={styles.textButtonPrimary} onPress={onSave}>
                <Text style={styles.textButtonPrimaryLabel}>{t.save}</Text>
              </Pressable>
              <Pressable style={styles.textButton} onPress={onClose}>
                <Text style={styles.textButtonLabel}>{t.cancel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ExercisePickerModal
        visible={isExercisePickerVisible}
        colors={colors}
        t={t}
        language={language}
        selectedExerciseIds={selectedExerciseIds}
        onApply={(exerciseIds) => {
          onChange({ ...form, exercises_csv: exerciseIds.join(', ') });
          setExercisePickerVisible(false);
        }}
        onClose={() => setExercisePickerVisible(false)}
      />
    </>
  );
}

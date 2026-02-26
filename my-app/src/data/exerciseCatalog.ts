import type { Language } from '../types/app';

type LocalizedText = Record<Language, string>;

export type ExerciseItem = {
  id: string;
  label: LocalizedText;
};

export type MuscleGroup = {
  id: string;
  label: LocalizedText;
  exercises: ExerciseItem[];
};

export const EXERCISE_CATALOG: MuscleGroup[] = [
  {
    id: 'chest',
    label: { ru: 'Грудь', en: 'Chest' },
    exercises: [
      { id: 'push_ups', label: { ru: 'Отжимания', en: 'Push-ups' } },
      { id: 'dumbbell_press', label: { ru: 'Жим гантелей лежа', en: 'Dumbbell Bench Press' } },
      { id: 'incline_press', label: { ru: 'Жим на наклонной скамье', en: 'Incline Bench Press' } },
      { id: 'chest_fly', label: { ru: 'Разводка гантелей', en: 'Dumbbell Fly' } },
    ],
  },
  {
    id: 'back',
    label: { ru: 'Спина', en: 'Back' },
    exercises: [
      { id: 'pull_ups', label: { ru: 'Подтягивания', en: 'Pull-ups' } },
      { id: 'barbell_row', label: { ru: 'Тяга штанги в наклоне', en: 'Barbell Row' } },
      { id: 'seated_row', label: { ru: 'Тяга блока сидя', en: 'Seated Cable Row' } },
      { id: 'lat_pulldown', label: { ru: 'Тяга верхнего блока', en: 'Lat Pulldown' } },
    ],
  },
  {
    id: 'legs',
    label: { ru: 'Ноги', en: 'Legs' },
    exercises: [
      { id: 'squats', label: { ru: 'Приседания', en: 'Squats' } },
      { id: 'lunges', label: { ru: 'Выпады', en: 'Lunges' } },
      { id: 'leg_press', label: { ru: 'Жим ногами', en: 'Leg Press' } },
      { id: 'romanian_deadlift', label: { ru: 'Румынская тяга', en: 'Romanian Deadlift' } },
    ],
  },
  {
    id: 'shoulders',
    label: { ru: 'Плечи', en: 'Shoulders' },
    exercises: [
      { id: 'overhead_press', label: { ru: 'Жим над головой', en: 'Overhead Press' } },
      { id: 'lateral_raise', label: { ru: 'Махи в стороны', en: 'Lateral Raise' } },
      { id: 'front_raise', label: { ru: 'Махи перед собой', en: 'Front Raise' } },
      { id: 'rear_delt_fly', label: { ru: 'Разводка на заднюю дельту', en: 'Rear Delt Fly' } },
    ],
  },
  {
    id: 'arms',
    label: { ru: 'Руки', en: 'Arms' },
    exercises: [
      { id: 'biceps_curl', label: { ru: 'Сгибания на бицепс', en: 'Biceps Curl' } },
      { id: 'hammer_curl', label: { ru: 'Молотковые сгибания', en: 'Hammer Curl' } },
      { id: 'triceps_pushdown', label: { ru: 'Разгибания на блоке', en: 'Triceps Pushdown' } },
      { id: 'dips', label: { ru: 'Отжимания на брусьях', en: 'Dips' } },
    ],
  },
  {
    id: 'core',
    label: { ru: 'Пресс', en: 'Core' },
    exercises: [
      { id: 'plank', label: { ru: 'Планка', en: 'Plank' } },
      { id: 'crunches', label: { ru: 'Скручивания', en: 'Crunches' } },
      { id: 'russian_twist', label: { ru: 'Русские скручивания', en: 'Russian Twist' } },
      { id: 'leg_raises', label: { ru: 'Подъемы ног', en: 'Leg Raises' } },
    ],
  },
];

const EXERCISE_LIST = EXERCISE_CATALOG.flatMap((group) => group.exercises);

export function splitExerciseCsv(exercisesCsv: string): string[] {
  return exercisesCsv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function resolveExerciseId(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  const byId = EXERCISE_LIST.find((exercise) => exercise.id === normalized);
  if (byId) {
    return byId.id;
  }

  const byLabel = EXERCISE_LIST.find(
    (exercise) =>
      exercise.label.ru.toLowerCase() === normalized.toLowerCase() ||
      exercise.label.en.toLowerCase() === normalized.toLowerCase()
  );

  return byLabel?.id ?? null;
}

export function getExerciseLabel(value: string, language: Language): string {
  const id = resolveExerciseId(value);
  if (!id) {
    return value;
  }
  return EXERCISE_LIST.find((exercise) => exercise.id === id)?.label[language] ?? value;
}

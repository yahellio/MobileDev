import { fetchWgerExercisesByMuscle, fetchWgerMuscles } from '../api/wgerApi';
import {
  getCachedExerciseById,
  getCachedExercisesByMuscle,
  getCachedMuscles,
  replaceCachedExercisesByMuscle,
  replaceCachedMuscles,
} from '../cache/apiCacheDb';
import { getIsOnline } from '../network/networkService';
import type { ExerciseRepository } from '../../domain/repositories/ExerciseRepository';
import type { RemoteMuscleGroup } from '../../domain/models/exercise';
import type { Language } from '../../types/app';

const WGER_LANGUAGE_EN = 2;
const WGER_LANGUAGE_RU = 5;

const MUSCLE_RU_BY_LATIN: Record<string, string> = {
  'Anterior deltoid': 'Передняя дельтовидная',
  'Biceps brachii': 'Бицепс плеча',
  'Biceps femoris': 'Бицепс бедра',
  'Brachialis': 'Плечевая мышца',
  'Gastrocnemius': 'Икроножная',
  'Gluteus maximus': 'Большая ягодичная',
  'Latissimus dorsi': 'Широчайшая спины',
  'Obliquus externus abdominis': 'Наружная косая живота',
  'Pectoralis major': 'Большая грудная',
  'Quadriceps femoris': 'Квадрицепс бедра',
  'Rectus abdominis': 'Прямая мышца живота',
  'Serratus anterior': 'Передняя зубчатая',
  'Soleus': 'Камбаловидная',
  'Trapezius': 'Трапециевидная',
  'Triceps brachii': 'Трицепс плеча',
};

function toLocalizedLabel(primary: string, fallback?: string) {
  return { ru: (primary ?? '').trim(), en: (fallback ?? '').trim() };
}

function hasCyrillic(value: string) {
  return /[А-Яа-яЁё]/.test(value);
}

function mapMuscleNames(rawName: string, rawNameEn: string) {
  const name = (rawName ?? '').trim();
  const nameEn = (rawNameEn ?? '').trim();
  const english = nameEn || name;
  const latinSource = name || nameEn;

  const translatedRu =
    (hasCyrillic(name) ? name : '') ||
    MUSCLE_RU_BY_LATIN[latinSource] ||
    MUSCLE_RU_BY_LATIN[nameEn] ||
    '';

  const russian = translatedRu || english;

  return {
    name_ru: russian,
    name_en: english,
  };
}

function buildCatalogFromCache(
  muscles: Array<{ id: number; name_ru: string; name_en: string }>,
  exercisesByMuscle: Map<number, Array<{ id: number; name_ru: string; name_en: string }>>
): RemoteMuscleGroup[] {
  return muscles.map((muscle) => ({
    id: String(muscle.id),
    label: toLocalizedLabel(muscle.name_ru, muscle.name_en),
    exercises: (exercisesByMuscle.get(muscle.id) ?? []).map((exercise) => ({
      id: String(exercise.id),
      label: toLocalizedLabel(exercise.name_ru, exercise.name_en),
    })),
  }));
}

async function readCachedCatalog() {
  const muscles = await getCachedMuscles();
  const exercisesByMuscle = new Map<
    number,
    Array<{ id: number; name_ru: string; name_en: string }>
  >();

  for (const muscle of muscles) {
    const exercises = await getCachedExercisesByMuscle(muscle.id);
    exercisesByMuscle.set(
      muscle.id,
      exercises.map((exercise) => ({
        id: exercise.id,
        name_ru: exercise.name_ru,
        name_en: exercise.name_en,
      }))
    );
  }

  return {
    catalog: buildCatalogFromCache(
      muscles.map((muscle) => ({
        id: muscle.id,
        name_ru: muscle.name_ru,
        name_en: muscle.name_en,
      })),
      exercisesByMuscle
    ),
    fetchedAt: muscles[0]?.fetched_at,
  };
}

async function refreshRemoteCatalog() {
  const muscles = await fetchWgerMuscles();
  const fetchedAt = Date.now();

  await replaceCachedMuscles(
    muscles.map((muscle) => {
      const mapped = mapMuscleNames(muscle.name ?? '', muscle.name_en ?? '');
      return {
        id: muscle.id,
        name_ru: mapped.name_ru,
        name_en: mapped.name_en,
      };
    }),
    fetchedAt
  );

  for (const muscle of muscles) {
    try {
      const [exercisesEn, exercisesRu] = await Promise.all([
        fetchWgerExercisesByMuscle(muscle.id, WGER_LANGUAGE_EN),
        fetchWgerExercisesByMuscle(muscle.id, WGER_LANGUAGE_RU),
      ]);

      const nameEnById = new Map<number, string>();
      for (const exercise of exercisesEn) {
        nameEnById.set(exercise.id, exercise.name.trim());
      }
      const nameRuById = new Map<number, string>();
      for (const exercise of exercisesRu) {
        nameRuById.set(exercise.id, exercise.name.trim());
      }
      const ids = new Set<number>([...nameEnById.keys(), ...nameRuById.keys()]);

      await replaceCachedExercisesByMuscle(
        muscle.id,
        Array.from(ids).map((exerciseId) => ({
          id: exerciseId,
          name_en: nameEnById.get(exerciseId) ?? '',
          name_ru: nameRuById.get(exerciseId) || nameEnById.get(exerciseId) || '',
        })),
        fetchedAt
      );
    } catch {

    }
  }

  const refreshed = (await readCachedCatalog()).catalog;
  if (refreshed.length === 0) {
    throw new Error('Exercise catalog refresh returned empty result');
  }
  return refreshed;
}

export const exerciseRepository: ExerciseRepository = {
  async getCatalog(_language: Language) {
    const cached = await readCachedCatalog();

    try {
      return await refreshRemoteCatalog();
    } catch {
      const online = await getIsOnline();
      if (online && cached.catalog.length > 0) {
        return cached.catalog;
      }
    }

    if (cached.catalog.length > 0) {
      return cached.catalog;
    }

    throw new Error('Exercise catalog is unavailable');
  },

  async refreshCatalog(_language: Language) {
    try {
      return await refreshRemoteCatalog();
    } catch {
      return (await readCachedCatalog()).catalog;
    }
  },

  async getLabelById(id: string, language: Language) {
    const exerciseId = Number(id);
    if (!Number.isFinite(exerciseId)) {
      return null;
    }
    const row = await getCachedExerciseById(exerciseId);
    if (!row) {
      return null;
    }
    return language === 'ru' ? row.name_ru : row.name_en;
  },
};

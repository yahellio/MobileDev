import { fetchJson } from './http';

type WgerListResponse<T> = {
  count: number;
  next: string | null;
  results: T[];
};

type WgerMuscleDto = {
  id: number;
  name: string;
  name_en?: string;
};

type WgerExerciseDto = {
  id: number;
  translations?: Array<{
    language: number;
    name: string;
  }>;
};

export async function fetchWgerMuscles() {
  const response = await fetchJson<WgerListResponse<WgerMuscleDto>>(
    'https://wger.de/api/v2/muscle/'
  );
  return response.results;
}

function getExerciseName(dto: WgerExerciseDto, languageId: number) {
  return dto.translations?.find((translation) => translation.language === languageId)?.name || '';
}

export async function fetchWgerExercisesByMuscle(muscleId: number, languageId: number) {
  const collected: WgerExerciseDto[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetchJson<WgerListResponse<WgerExerciseDto>>(
      `https://wger.de/api/v2/exerciseinfo/?muscles=${muscleId}&language=${languageId}&limit=${limit}&offset=${offset}`
    );

    collected.push(...response.results);
    if (!response.next) {
      break;
    }
    offset += limit;
  }

  return collected.map((exercise) => ({
    id: exercise.id,
    name: getExerciseName(exercise, languageId).trim(),
  }));
}

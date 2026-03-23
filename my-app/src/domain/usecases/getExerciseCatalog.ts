import type { ExerciseRepository } from '../repositories/ExerciseRepository';
import type { Language } from '../../types/app';

export function getExerciseCatalogUseCase(
  exerciseRepository: ExerciseRepository,
  language: Language
) {
  return exerciseRepository.getCatalog(language);
}

export function refreshExerciseCatalogUseCase(
  exerciseRepository: ExerciseRepository,
  language: Language
) {
  return exerciseRepository.refreshCatalog(language);
}

export function getExerciseLabelUseCase(
  exerciseRepository: ExerciseRepository,
  id: string,
  language: Language
) {
  return exerciseRepository.getLabelById(id, language);
}

import type { RemoteMuscleGroup } from '../models/exercise';
import type { Language } from '../../types/app';

export type ExerciseRepository = {
  getCatalog(language: Language): Promise<RemoteMuscleGroup[]>;
  refreshCatalog(language: Language): Promise<RemoteMuscleGroup[]>;
  getLabelById(id: string, language: Language): Promise<string | null>;
};

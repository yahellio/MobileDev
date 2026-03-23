import type { Language } from '../../types/app';

export type LocalizedLabel = Record<Language, string>;

export type RemoteExerciseItem = {
  id: string;
  label: LocalizedLabel;
};

export type RemoteMuscleGroup = {
  id: string;
  label: LocalizedLabel;
  exercises: RemoteExerciseItem[];
};

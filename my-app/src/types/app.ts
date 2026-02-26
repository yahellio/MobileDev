export type Language = 'ru' | 'en';
export type ThemeMode = 'light' | 'dark';

export type Screen =
  | { name: 'home' }
  | { name: 'details'; workoutId: number }
  | { name: 'settings' };

import type { ThemeMode } from '../types/app';

export const themePalette = {
  light: {
    background: '#F5F7FB',
    card: '#FFFFFF',
    text: '#111827',
    secondaryText: '#6B7280',
    primary: '#3B82F6',
    danger: '#DC2626',
    border: '#E5E7EB',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#E5E7EB',
    secondaryText: '#94A3B8',
    primary: '#60A5FA',
    danger: '#F87171',
    border: '#334155',
  },
} as const;

export type ThemeColors = (typeof themePalette)[ThemeMode];

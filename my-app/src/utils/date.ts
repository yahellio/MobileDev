import type { Language } from '../types/app';

export function formatDate(isoDate: string, language: Language) {
  const date = new Date(isoDate);
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

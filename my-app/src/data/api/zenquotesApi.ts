import { fetchJson } from './http';

export type ZenQuoteDto = {
  q: string;
  a: string;
};

export async function fetchRandomZenQuote() {
  const payload = await fetchJson<ZenQuoteDto[]>('https://zenquotes.io/api/random');
  const first = payload[0];
  if (!first?.q) {
    throw new Error('Quote payload is empty');
  }
  return {
    text: first.q.trim(),
    author: first.a?.trim() || 'Unknown',
  };
}

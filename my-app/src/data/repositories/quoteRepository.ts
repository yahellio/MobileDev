import { getCachedQuote, saveCachedQuote } from '../cache/apiCacheDb';
import { fetchRandomZenQuote } from '../api/zenquotesApi';
import { getIsOnline } from '../network/networkService';
import type { QuoteRepository } from '../../domain/repositories/QuoteRepository';

const QUOTE_TTL_MS = 1000 * 60 * 60 * 6;

function isFresh(timestamp: number, ttlMs: number) {
  return Date.now() - timestamp <= ttlMs;
}

export const quoteRepository: QuoteRepository = {
  async getRandomQuote() {
    const cached = await getCachedQuote();
    const online = await getIsOnline();

    if (cached && isFresh(cached.fetched_at, QUOTE_TTL_MS) && !online) {
      return {
        text: cached.text,
        author: cached.author,
        fetchedAt: cached.fetched_at,
      };
    }

    if (online) {
      try {
        const remote = await fetchRandomZenQuote();
        const fetchedAt = Date.now();
        await saveCachedQuote(remote.text, remote.author, fetchedAt);
        return { ...remote, fetchedAt };
      } catch {
        // Ignore and fallback to cache below.
      }
    }

    if (cached) {
      return {
        text: cached.text,
        author: cached.author,
        fetchedAt: cached.fetched_at,
      };
    }

    throw new Error('Quote is unavailable');
  },
};

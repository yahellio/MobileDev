import type { Quote } from '../models/quote';

export type QuoteRepository = {
  getRandomQuote(): Promise<Quote>;
};

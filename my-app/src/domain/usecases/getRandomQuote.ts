import type { QuoteRepository } from '../repositories/QuoteRepository';

export function getRandomQuoteUseCase(quoteRepository: QuoteRepository) {
  return quoteRepository.getRandomQuote();
}

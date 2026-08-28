import { describe, expect, it } from 'vitest';
import { formatProductSummary, type Product } from './products';

describe('formatProductSummary', () => {
  it('uses a singular label for one live product', () => {
    const products: Product[] = [{ name: 'Hello Factory', domain: 'hello-factory.sociobot.in', state: 'live' }];
    expect(formatProductSummary(products)).toBe('1 tool live · 1 tracked');
  });

  it('handles an empty fleet honestly', () => {
    expect(formatProductSummary([])).toBe('No tools released yet.');
  });
});

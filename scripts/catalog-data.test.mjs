import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { normalizeSnapshot } from './catalog-data.mjs';

describe('controller catalogue publication', () => {
  it('@claim:snapshot-pictures publishes every controller row with usable kind, shelf, detail, and preserved image paths', async () => {
    const source = JSON.parse(await readFile('.factory/input/latest-catalog.json', 'utf8'));
    const output = normalizeSnapshot(source);
    const knownCategories = new Set(source.catalog.categories.map((category) => category.id));
    const expectedFallbacks = source.catalog.products.filter((entry) => !entry.category || !knownCategories.has(entry.category)).length;
    expect(output.catalog.products).toHaveLength(source.catalog.count);
    expect(Object.keys(output.details)).toHaveLength(source.catalog.count);
    expect(output.catalog.products.every((entry) => entry.kind && entry.category)).toBe(true);
    expect(output.catalog.products.filter((entry) => entry.category === 'new')).toHaveLength(expectedFallbacks);
    expect(output.catalog.products.filter((entry) => entry.image)).toHaveLength(Object.keys(source.images).length);
    for (const [slug] of Object.entries(source.images)) expect(output.details[slug].image).toBe(`/shots/${slug}.webp`);
  });
});

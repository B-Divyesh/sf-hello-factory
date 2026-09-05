import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { normalizeSnapshot } from './catalog-data.mjs';

describe('controller catalogue publication', () => {
  it('@claim:snapshot-pictures publishes every current row with its original description, QA record, and a local picture', async () => {
    const source = JSON.parse(await readFile('.factory/input/latest-catalog.json', 'utf8'));
    const output = normalizeSnapshot(source);
    const knownCategories = new Set(source.catalog.categories.map((category) => category.id));
    const expectedFallbacks = source.catalog.products.filter((entry) => !entry.category || !knownCategories.has(entry.category)).length;
    expect(output.catalog.products).toHaveLength(source.catalog.count);
    expect(Object.keys(output.details)).toHaveLength(source.catalog.count);
    expect(output.catalog.products.every((entry) => entry.kind && entry.category)).toBe(true);
    expect(output.catalog.products.filter((entry) => entry.category === 'new')).toHaveLength(expectedFallbacks);
    expect(output.catalog.products.filter((entry) => entry.image)).toHaveLength(source.catalog.count);
    for (const sourceEntry of source.catalog.products) {
      const product = output.catalog.products.find((entry) => entry.slug === sourceEntry.slug);
      expect(product.description).toBe(sourceEntry.description);
      expect(product.why).toBe(sourceEntry.why);
      expect(product.qa).toEqual(sourceEntry.qa);
      expect(product.image).toBe(`/shots/${sourceEntry.slug}.webp`);
      expect(output.details[sourceEntry.slug].description).toBe(source.details[sourceEntry.slug].description);
      expect(output.details[sourceEntry.slug].qa).toEqual(source.details[sourceEntry.slug].qa);
      expect(output.details[sourceEntry.slug].image).toBe(`/shots/${sourceEntry.slug}.webp`);
    }
    expect(Object.keys(output.images)).toHaveLength(Object.keys(source.images).length);
  });

  it('rejects a current product without a picture instead of publishing a placeholder', () => {
    const source = {
      catalog: { count: 1, categories: [], products: [{ slug: 'missing-picture', class: 'static-web', territory: 'utilities' }] },
      details: { 'missing-picture': { slug: 'missing-picture' } },
      images: {},
    };
    expect(() => normalizeSnapshot(source)).toThrow('Missing picture for current product missing-picture.');
  });

  it('does not put an unclassified audio or creative tool on the playable Games shelf', () => {
    const source = {
      catalog: { count: 1, categories: [], products: [{ slug: 'audio-loop', class: 'pwa-offline', territory: 'games-creative' }] },
      details: { 'audio-loop': { slug: 'audio-loop' } },
      images: { 'audio-loop': 'https://hello-factory.sociobot.in/shots/audio-loop.webp' },
    };
    expect(normalizeSnapshot(source).catalog.products[0].kind).toBe('product');
  });

  it('accepts only same-slug public pictures or exact Hello Factory work-order picture paths', () => {
    const base = {
      catalog: { count: 1, categories: [], products: [{ slug: 'picture-check', class: 'static-web', territory: 'utilities' }] },
      details: { 'picture-check': { slug: 'picture-check' } },
    };
    expect(() => normalizeSnapshot({ ...base, images: { 'picture-check': 'https://sociobotblob.blob.core.windows.net/factory-evidence/hello-factory-repair-1/input/shots/picture-check.webp' } })).not.toThrow();
    expect(() => normalizeSnapshot({ ...base, images: { 'picture-check': 'https://sociobotblob.blob.core.windows.net/factory-evidence/another-product/input/shots/picture-check.webp' } })).toThrow('outside its authorised Hello Factory path');
    expect(() => normalizeSnapshot({ ...base, images: { 'picture-check': 'https://hello-factory.sociobot.in/shots/different-product.webp' } })).toThrow('outside its authorised Hello Factory path');
  });
});

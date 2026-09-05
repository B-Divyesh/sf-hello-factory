import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { productDocumentTitle, productMetaDescription } from './metadata';

type SourceProduct = { title: string; description: string; why?: string };

describe('product route metadata', () => {
  it('bounds every pinned product title and description without altering its controller record', async () => {
    const pin = JSON.parse(await readFile('.factory/input/catalog-pin.json', 'utf8')) as { sourceSha256: string };
    const raw = await readFile(`.factory/input/snapshots/${pin.sourceSha256}.json`, 'utf8');
    const source = JSON.parse(raw) as { catalog: { products: SourceProduct[] } };
    const before = JSON.stringify(source);
    const metadata = source.catalog.products.map((product) => ({
      title: productDocumentTitle(product.title),
      description: productMetaDescription(product.why || product.description),
    }));

    expect(metadata.every(({ title }) => title.length <= 60)).toBe(true);
    expect(metadata.every(({ description }) => description.length <= 155)).toBe(true);
    expect(metadata.some(({ title }) => title.endsWith('… — Hello Factory'))).toBe(true);
    expect(metadata.some(({ description }) => description.endsWith('…'))).toBe(true);
    expect(JSON.stringify(source)).toBe(before);
  });
});

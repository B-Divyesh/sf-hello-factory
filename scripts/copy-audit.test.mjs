import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('plain-words audit', () => {
  it('records the quantitative copy facts from the pinned source', async () => {
    const [pinText, audit] = await Promise.all([
      readFile('.factory/input/catalog-pin.json', 'utf8'),
      readFile('.factory/copy-audit.md', 'utf8'),
    ]);
    const pin = JSON.parse(pinText);
    const source = JSON.parse(await readFile(`.factory/input/snapshots/${pin.sourceSha256}.json`, 'utf8'));
    const whyLines = source.catalog.products.map((product) => String(product.why ?? '').trim()).filter(Boolean);
    const wordCounts = whyLines.map((line) => line.split(/\s+/u).length);
    const recorded = audit.match(/pinned source has (\d+) products and (\d+) non-empty `why` lines[\s\S]*?All \d+ `why` lines are (\d+) words or fewer/u);

    expect(recorded, 'The copy audit has parseable pin counts').toBeTruthy();
    if (!recorded) throw new Error('The copy audit pin counts could not be parsed.');
    expect(Number(recorded[1])).toBe(source.catalog.products.length);
    expect(Number(recorded[2])).toBe(whyLines.length);
    expect(Number(recorded[3])).toBe(Math.max(...wordCounts));
    expect(audit).toContain(pin.sourceSha256);
  });
});

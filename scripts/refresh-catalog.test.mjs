import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { refreshCatalog } from './refresh-catalog.mjs';

function snapshot(slug, generated) {
  const product = {
    slug,
    title: slug,
    url: `https://${slug}.sociobot.in`,
    class: 'static-web',
    territory: 'utilities',
    description: `Open ${slug}.`,
    why: `Use ${slug}.`,
    paid: false,
    state: 'RELEASED',
    kind: 'product',
    category: 'life',
    qa: { strict_zero_review: true, reviewed_at: generated, status: 'RELEASED' },
  };
  return {
    catalog: { generated, count: 1, categories: [{ id: 'life', title: 'Life' }], products: [product] },
    details: { [slug]: { ...product, detail: `Details for ${slug}.` } },
    images: { [slug]: `https://hello-factory.sociobot.in/shots/${slug}.webp` },
  };
}

describe('fresh catalogue build boundary', () => {
  it('@claim:fresh-snapshot replaces a stale public catalogue with the newly fetched snapshot after the UI exists', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hello-factory-refresh-'));
    const input = join(root, 'latest-catalog.json');
    const output = join(root, 'dist');
    await mkdir(join(output, 'p', 'stale-tool'), { recursive: true });
    await mkdir(join(output, 'products'), { recursive: true });
    const shell = '<!doctype html><html lang="en"><head><title>Tool</title></head><body><main><h1>Tool</h1></main></body></html>';
    await writeFile(join(output, 'p', 'index.html'), shell);
    await writeFile(join(output, 'p', 'stale-tool', 'index.html'), shell);
    await writeFile(join(output, 'products', 'stale-tool.json'), '{}');
    await writeFile(join(output, 'products.json'), JSON.stringify(snapshot('stale-tool', '2026-09-05T19:00:00Z').catalog));
    await writeFile(input, JSON.stringify(snapshot('stale-tool', '2026-09-05T19:00:00Z')));

    const current = snapshot('fresh-tool', '2026-09-05T20:00:00Z');
    let fetched = false;
    const result = await refreshCatalog({
      snapshotPath: input,
      outputDirectory: output,
      skipImages: true,
      fetchSnapshot: async (destination) => {
        fetched = true;
        await writeFile(destination, JSON.stringify(current));
      },
    });

    const published = JSON.parse(await readFile(join(output, 'products.json'), 'utf8'));
    const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
    expect(fetched).toBe(true);
    expect(result).toMatchObject({ generated: current.catalog.generated, count: 1, currentPictures: 1, images: 1 });
    expect(published.products.map((entry) => entry.slug)).toEqual(['fresh-tool']);
    expect(await readFile(join(output, 'products', 'fresh-tool.json'), 'utf8')).toContain('Details for fresh-tool.');
    await expect(readFile(join(output, 'products', 'stale-tool.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(readFile(join(output, 'p', 'stale-tool', 'index.html'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    expect(sitemap).toContain('/p/fresh-tool/');
    expect(sitemap).not.toContain('/p/stale-tool/');
  });
});

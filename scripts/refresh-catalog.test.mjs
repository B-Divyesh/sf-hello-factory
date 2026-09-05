import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { publishCatalog } from './catalog-data.mjs';
import { refreshCatalog } from './refresh-catalog.mjs';
import { pinLatestSnapshot, resolvePinnedSnapshot } from './snapshot-data.mjs';

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

function hash(raw) { return createHash('sha256').update(raw).digest('hex'); }

async function makeOutput(root) {
  const output = join(root, 'dist');
  await mkdir(join(output, 'p'), { recursive: true });
  await writeFile(join(output, 'p', 'index.html'), '<!doctype html><html lang="en"><head><title>Tool</title></head><body><main><h1>Tool</h1></main></body></html>');
  return output;
}

function blobRunner(sources) {
  return async (_command, args) => {
    const name = args[args.indexOf('--name') + 1];
    const file = args[args.indexOf('--file') + 1];
    if (!sources.has(name)) throw new Error(`No authorized fixture for ${name}`);
    await writeFile(file, sources.get(name));
  };
}

describe('pinned catalogue build boundary', () => {
  it('@claim:pinned-snapshot lets an explicit refresh select an immutable source while ordinary builds keep reproducing it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hello-factory-pin-'));
    const inputDirectory = join(root, 'input');
    const output = await makeOutput(root);
    const firstRaw = Buffer.from(`${JSON.stringify(snapshot('first-tool', '2026-09-05T20:00:00Z'))}\n`);
    const firstSha = hash(firstRaw);
    const sources = new Map([
      ['hello-factory-controller/input/latest-catalog.json', firstRaw],
      [`hello-factory-controller/input/snapshots/${firstSha}.json`, firstRaw],
    ]);

    const firstPin = await pinLatestSnapshot({ inputDirectory, run: blobRunner(sources) });
    expect(firstPin).toMatchObject({ sourceSha256: firstSha, count: 1, images: 1 });
    const pinnedFirst = await resolvePinnedSnapshot(inputDirectory);
    await publishCatalog({ snapshotPath: pinnedFirst.snapshotPath, outputDirectory: output, skipImages: true });
    expect(JSON.parse(await readFile(join(output, 'products.json'), 'utf8')).products.map((entry) => entry.slug)).toEqual(['first-tool']);

    // The controller pointer can now move, but a normal build resolves the
    // tracked pin and still publishes the exact first source.
    const laterRaw = Buffer.from(`${JSON.stringify(snapshot('later-tool', '2026-09-05T21:00:00Z'))}\n`);
    const laterSha = hash(laterRaw);
    sources.set('hello-factory-controller/input/latest-catalog.json', laterRaw);
    sources.set(`hello-factory-controller/input/snapshots/${laterSha}.json`, laterRaw);
    const stillPinned = await resolvePinnedSnapshot(inputDirectory);
    await publishCatalog({ snapshotPath: stillPinned.snapshotPath, outputDirectory: output, skipImages: true });
    const ordinaryBuild = JSON.parse(await readFile(join(output, 'products.json'), 'utf8'));
    const ordinarySummary = JSON.parse(await readFile(join(output, 'catalog-build.json'), 'utf8'));
    expect(ordinaryBuild.products.map((entry) => entry.slug)).toEqual(['first-tool']);
    expect(ordinarySummary.sourceSha256).toBe(firstSha);
    await expect(readFile(join(output, 'products', 'first-tool.json'), 'utf8')).resolves.toContain('Details for first-tool.');
    await expect(readFile(join(output, 'p', 'first-tool', 'index.html'), 'utf8')).resolves.toContain('<main>');
    await expect(readFile(join(output, 'sitemap.xml'), 'utf8')).resolves.toContain('/p/first-tool/');

    // A deliberate refresh is the only operation that moves the deployment pin.
    const refreshed = await refreshCatalog({ inputDirectory, outputDirectory: output, skipImages: true, pinSnapshot: ({ inputDirectory: dir }) => pinLatestSnapshot({ inputDirectory: dir, run: blobRunner(sources) }) });
    expect(refreshed.pin.sourceSha256).toBe(laterSha);
    expect(JSON.parse(await readFile(join(output, 'products.json'), 'utf8')).products.map((entry) => entry.slug)).toEqual(['later-tool']);
    expect(JSON.parse(await readFile(join(output, 'catalog-build.json'), 'utf8')).sourceSha256).toBe(laterSha);
  });

  it('does not replace the existing pin when the controller pointer has a current product without a picture', async () => {
    const root = await mkdtemp(join(tmpdir(), 'hello-factory-incomplete-'));
    const inputDirectory = join(root, 'input');
    const completeRaw = Buffer.from(`${JSON.stringify(snapshot('complete-tool', '2026-09-05T20:00:00Z'))}\n`);
    const completeSha = hash(completeRaw);
    const sources = new Map([
      ['hello-factory-controller/input/latest-catalog.json', completeRaw],
      [`hello-factory-controller/input/snapshots/${completeSha}.json`, completeRaw],
    ]);
    await pinLatestSnapshot({ inputDirectory, run: blobRunner(sources) });
    const pinBefore = await readFile(join(inputDirectory, 'catalog-pin.json'), 'utf8');
    const incomplete = snapshot('missing-picture', '2026-09-05T22:00:00Z');
    incomplete.images = {};
    sources.set('hello-factory-controller/input/latest-catalog.json', Buffer.from(`${JSON.stringify(incomplete)}\n`));

    await expect(pinLatestSnapshot({ inputDirectory, run: blobRunner(sources) })).rejects.toThrow('Missing picture for current product missing-picture.');
    expect(await readFile(join(inputDirectory, 'catalog-pin.json'), 'utf8')).toBe(pinBefore);
    expect((await resolvePinnedSnapshot(inputDirectory)).sourceSha256).toBe(completeSha);
  });
});

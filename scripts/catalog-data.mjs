import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const IMAGE_ORIGIN = 'https://hello-factory.sociobot.in';

export function inferKind(entry) {
  if (entry.kind) return entry.kind;
  if (entry.class === 'browser-game' || entry.territory === 'browser-games') return 'game';
  if (['desktop-app', 'cli-installers', 'android-apk', 'ios-ipa', 'android'].includes(entry.class)) return 'installable';
  if (String(entry.class).startsWith('library-')) return 'library';
  if (entry.class === 'cli' || entry.territory === 'devtools-data') return 'devtool';
  if (entry.class === 'browser-extension') return 'extension';
  if (entry.territory === 'games-creative') return 'game';
  return 'product';
}

export function normalizeSnapshot(input) {
  if (!input || typeof input !== 'object' || !input.catalog || !input.details || !input.images) {
    throw new Error('The catalogue snapshot must contain catalog, details, and images.');
  }
  const sourceProducts = input.catalog.products;
  if (!Array.isArray(sourceProducts) || input.catalog.count !== sourceProducts.length) {
    throw new Error('The catalogue count does not match its product rows.');
  }
  const knownCategories = new Set((input.catalog.categories ?? []).map((category) => category.id));
  const seen = new Set();

  const normalize = (source) => {
    const entry = structuredClone(source);
    if (!SLUG.test(entry.slug) || seen.has(entry.slug)) throw new Error(`Invalid or duplicate product slug: ${entry.slug}`);
    seen.add(entry.slug);
    entry.kind = inferKind(entry);
    if (!entry.category || !knownCategories.has(entry.category)) entry.category = 'new';
    const imageUrl = input.images[entry.slug];
    if (imageUrl) entry.image = `/shots/${entry.slug}.webp`;
    else delete entry.image;
    return entry;
  };

  const products = sourceProducts.map(normalize);
  const details = {};
  for (const product of products) {
    const source = input.details[product.slug];
    if (!source) throw new Error(`Missing detail row for ${product.slug}.`);
    const detail = structuredClone(source);
    detail.kind = product.kind;
    detail.category = product.category;
    if (product.image) detail.image = product.image;
    else delete detail.image;
    details[product.slug] = detail;
  }

  return {
    catalog: { ...structuredClone(input.catalog), count: products.length, products },
    details,
    images: structuredClone(input.images),
  };
}

function sitemap(catalog) {
  const changed = String(catalog.generated ?? '').slice(0, 10);
  const urls = ['/', '/catalog/', '/demo/', '/privacy/', '/terms/', ...catalog.products.map((entry) => `/p/${entry.slug}`)];
  const nodes = urls.map((path) => `  <url><loc>${IMAGE_ORIGIN}${path}</loc>${changed ? `<lastmod>${changed}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</urlset>\n`;
}

async function fetchImage(url, destination) {
  const parsed = new URL(url);
  if (parsed.origin !== IMAGE_ORIGIN || !/^\/shots\/[a-z0-9-]+\.webp$/.test(parsed.pathname)) {
    throw new Error('A snapshot image is outside this product\'s public shots path.');
  }
  let failure;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(parsed, { signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (new URL(response.url).origin !== IMAGE_ORIGIN) throw new Error('redirected outside the product origin');
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 100 || !String(response.headers.get('content-type')).includes('image/webp')) throw new Error('not a WebP image');
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
      return;
    } catch (error) {
      failure = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw failure;
}

async function downloadImages(images, outputDirectory) {
  const queue = Object.entries(images);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(12, queue.length) }, async () => {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      const [slug, url] = queue[index];
      if (!SLUG.test(slug)) throw new Error(`Invalid image slug: ${slug}`);
      await fetchImage(url, join(outputDirectory, 'shots', `${slug}.webp`));
    }
  });
  await Promise.all(workers);
}

export async function publishCatalog({ snapshotPath, outputDirectory, skipImages = false }) {
  const raw = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const normalized = normalizeSnapshot(raw);
  await mkdir(join(outputDirectory, 'products'), { recursive: true });
  await writeFile(join(outputDirectory, 'products.json'), `${JSON.stringify(normalized.catalog, null, 2)}\n`);
  await Promise.all(Object.entries(normalized.details).map(([slug, detail]) =>
    writeFile(join(outputDirectory, 'products', `${slug}.json`), `${JSON.stringify(detail, null, 2)}\n`)));
  await writeFile(join(outputDirectory, 'sitemap.xml'), sitemap(normalized.catalog));
  if (!skipImages) await downloadImages(normalized.images, outputDirectory);
  return { count: normalized.catalog.count, images: Object.keys(normalized.images).length };
}

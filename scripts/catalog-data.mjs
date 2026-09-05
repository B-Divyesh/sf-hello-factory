import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const IMAGE_ORIGIN = 'https://hello-factory.sociobot.in';
const PRIVATE_IMAGE_ORIGIN = 'https://sociobotblob.blob.core.windows.net';
const PRIVATE_IMAGE_PATH = /^\/factory-evidence\/(hello-factory(?:-[a-z0-9]+)*)\/input\/shots\/([a-z0-9][a-z0-9-]{0,60})\.webp$/;
const execFileAsync = promisify(execFile);

export function inferKind(entry) {
  if (entry.kind) return entry.kind;
  if (entry.class === 'browser-game' || entry.territory === 'browser-games') return 'game';
  if (['desktop-app', 'cli-installers', 'android-apk', 'ios-ipa', 'android'].includes(entry.class)) return 'installable';
  if (String(entry.class).startsWith('library-')) return 'library';
  if (entry.class === 'cli' || entry.territory === 'devtools-data') return 'devtool';
  if (entry.class === 'browser-extension') return 'extension';
  return 'product';
}

export function countBy(rows, key) {
  const totals = {};
  for (const row of rows) {
    const value = String(row[key] ?? '(missing)');
    totals[value] = (totals[value] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)));
}

function parseImageSource(slug, rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error(`Picture source for ${slug} is not a URL.`); }
  if (parsed.username || parsed.password || parsed.hash) throw new Error(`Picture source for ${slug} contains unsupported URL data.`);
  const path = decodeURIComponent(parsed.pathname);
  if (parsed.origin === IMAGE_ORIGIN && path === `/shots/${slug}.webp`) return { type: 'public', parsed };
  const privateMatch = parsed.origin === PRIVATE_IMAGE_ORIGIN ? path.match(PRIVATE_IMAGE_PATH) : null;
  if (privateMatch && privateMatch[2] === slug) {
    return { type: 'private', parsed, blobName: path.replace('/factory-evidence/', '') };
  }
  throw new Error(`Picture source for ${slug} is outside its authorised Hello Factory path.`);
}

export function normalizeSnapshot(input) {
  if (!input || typeof input !== 'object' || !input.catalog || !input.details || !input.images) {
    throw new Error('The catalogue snapshot must contain catalog, details, and images.');
  }
  const sourceProducts = input.catalog.products;
  if (!Array.isArray(sourceProducts) || input.catalog.count !== sourceProducts.length) {
    throw new Error('The catalogue count does not match its product rows.');
  }
  if (Array.isArray(input.details) || Array.isArray(input.images)) {
    throw new Error('Catalogue details and images must be keyed by slug.');
  }
  const detailKeys = Object.keys(input.details);
  if (detailKeys.length !== sourceProducts.length) throw new Error('The detail count does not match the catalogue count.');
  for (const [slug, url] of Object.entries(input.images)) {
    if (!SLUG.test(slug)) throw new Error(`Invalid image slug: ${slug}`);
    parseImageSource(slug, url);
  }

  const knownCategories = new Set((input.catalog.categories ?? []).map((category) => category.id));
  const seen = new Set();
  const products = sourceProducts.map((source) => {
    const entry = structuredClone(source);
    if (!SLUG.test(entry.slug) || seen.has(entry.slug)) throw new Error(`Invalid or duplicate product slug: ${entry.slug}`);
    seen.add(entry.slug);
    if (!input.details[entry.slug]) throw new Error(`Missing detail row for ${entry.slug}.`);
    if (!input.images[entry.slug]) throw new Error(`Missing picture for current product ${entry.slug}.`);
    entry.kind = inferKind(entry);
    if (!entry.category || !knownCategories.has(entry.category)) entry.category = 'new';
    entry.image = `/shots/${entry.slug}.webp`;
    return entry;
  });
  for (const slug of detailKeys) if (!seen.has(slug)) throw new Error(`Detail row ${slug} is not in the current catalogue.`);

  const details = {};
  for (const product of products) {
    const detail = structuredClone(input.details[product.slug]);
    detail.kind = product.kind;
    detail.category = product.category;
    detail.image = product.image;
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
  const urls = ['/', '/catalog/', '/demo/', '/privacy/', '/terms/', ...catalog.products.map((entry) => `/p/${entry.slug}/`)];
  const nodes = urls.map((path) => `  <url><loc>${IMAGE_ORIGIN}${path}</loc>${changed ? `<lastmod>${changed}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${nodes}\n</urlset>\n`;
}

export function webpDimensions(bytes) {
  if (bytes.length < 30 || bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') return null;
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = bytes.subarray(offset, offset + 4).toString('ascii');
    const length = bytes.readUInt32LE(offset + 4);
    const data = offset + 8;
    if (data + length > bytes.length) return null;
    if (type === 'VP8X' && length >= 10) return { width: 1 + bytes.readUIntLE(data + 4, 3), height: 1 + bytes.readUIntLE(data + 7, 3) };
    if (type === 'VP8L' && length >= 5 && bytes[data] === 0x2f) {
      const bits = bytes.readUInt32LE(data + 1);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff) };
    }
    if (type === 'VP8 ' && length >= 10 && bytes[data + 3] === 0x9d && bytes[data + 4] === 0x01 && bytes[data + 5] === 0x2a) {
      return { width: bytes.readUInt16LE(data + 6) & 0x3fff, height: bytes.readUInt16LE(data + 8) & 0x3fff };
    }
    offset = data + length + (length % 2);
  }
  return null;
}

async function assertRealWebp(path, slug) {
  const bytes = await readFile(path);
  const dimensions = webpDimensions(bytes);
  if (bytes.length < 100 || !dimensions || dimensions.width < 1 || dimensions.height < 1) {
    throw new Error(`Picture ${slug} is not a decodable WebP image.`);
  }
  return { bytes: bytes.length, ...dimensions };
}

async function fetchImage(slug, url, destination) {
  const source = parseImageSource(slug, url);
  await mkdir(dirname(destination), { recursive: true });
  if (source.type === 'private') {
    try {
      await execFileAsync('az', [
        'storage', 'blob', 'download',
        '--account-name', 'sociobotblob',
        '--container-name', 'factory-evidence',
        '--name', source.blobName,
        '--file', destination,
        '--auth-mode', 'login',
        '--overwrite', 'true',
        '--no-progress',
        '--only-show-errors',
        '--output', 'none',
      ], { maxBuffer: 1024 * 1024 });
      return await assertRealWebp(destination, slug);
    } catch (error) {
      throw new Error(`Authorised private picture ${slug} could not be downloaded or decoded.`, { cause: error });
    }
  }

  let failure;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(source.parsed, { redirect: 'follow', signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (new URL(response.url).origin !== IMAGE_ORIGIN) throw new Error('redirected outside the product origin');
      if (!String(response.headers.get('content-type')).toLowerCase().includes('image/webp')) throw new Error('unexpected content type');
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
      return await assertRealWebp(destination, slug);
    } catch (error) {
      failure = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw new Error(`Public Hello Factory picture ${slug} could not be downloaded or decoded.`, { cause: failure });
}

async function downloadImages(images, outputDirectory) {
  const queue = Object.entries(images);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(12, queue.length) }, async () => {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      const [slug, url] = queue[index];
      await fetchImage(slug, url, join(outputDirectory, 'shots', `${slug}.webp`));
    }
  });
  await Promise.all(workers);
}

function deploymentSummary(rawBytes, raw, normalized, imagesVerified) {
  const products = normalized.catalog.products;
  return {
    sourceSha256: createHash('sha256').update(rawBytes).digest('hex'),
    generated: normalized.catalog.generated,
    count: products.length,
    details: Object.keys(normalized.details).length,
    currentPictures: products.filter((entry) => entry.image).length,
    preservedPictures: Object.keys(normalized.images).length,
    states: countBy(products, 'state'),
    sourceKinds: countBy(raw.catalog.products, 'kind'),
    publishedKinds: countBy(products, 'kind'),
    imagesVerified,
  };
}

async function clearGeneratedRoutes(outputDirectory) {
  const routeRoot = join(outputDirectory, 'p');
  try {
    const entries = await readdir(routeRoot, { withFileTypes: true });
    await Promise.all(entries.filter((entry) => entry.isDirectory()).map((entry) => rm(join(routeRoot, entry.name), { recursive: true, force: true })));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

export async function publishCatalog({ snapshotPath, outputDirectory, skipImages = false }) {
  const rawBytes = await readFile(snapshotPath);
  const raw = JSON.parse(rawBytes);
  const normalized = normalizeSnapshot(raw);
  const productShell = await readFile(join(outputDirectory, 'p', 'index.html'));

  await rm(join(outputDirectory, 'products'), { recursive: true, force: true });
  await clearGeneratedRoutes(outputDirectory);
  await mkdir(join(outputDirectory, 'products'), { recursive: true });
  await writeFile(join(outputDirectory, 'products.json'), `${JSON.stringify(normalized.catalog, null, 2)}\n`);
  await Promise.all(Object.entries(normalized.details).map(([slug, detail]) =>
    writeFile(join(outputDirectory, 'products', `${slug}.json`), `${JSON.stringify(detail, null, 2)}\n`)));
  await Promise.all(normalized.catalog.products.map(async ({ slug }) => {
    const routeDirectory = join(outputDirectory, 'p', slug);
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(join(routeDirectory, 'index.html'), productShell);
  }));
  await writeFile(join(outputDirectory, 'sitemap.xml'), sitemap(normalized.catalog));

  if (!skipImages) {
    await rm(join(outputDirectory, 'shots'), { recursive: true, force: true });
    await downloadImages(normalized.images, outputDirectory);
  }
  const summary = deploymentSummary(rawBytes, raw, normalized, !skipImages);
  await writeFile(join(outputDirectory, 'catalog-build.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await verifyPublishedCatalog({ snapshotPath, outputDirectory, requireImages: !skipImages });
  return { ...summary, images: summary.preservedPictures };
}

export async function verifyPublishedCatalog({ snapshotPath, outputDirectory, requireImages = true }) {
  const rawBytes = await readFile(snapshotPath);
  const raw = JSON.parse(rawBytes);
  const normalized = normalizeSnapshot(raw);
  const published = JSON.parse(await readFile(join(outputDirectory, 'products.json'), 'utf8'));
  if (JSON.stringify(published) !== JSON.stringify(normalized.catalog)) throw new Error('Published products do not match the fetched snapshot.');

  const expectedSlugs = normalized.catalog.products.map((entry) => entry.slug);
  const detailFiles = (await readdir(join(outputDirectory, 'products'))).filter((name) => name.endsWith('.json')).sort();
  if (JSON.stringify(detailFiles) !== JSON.stringify(expectedSlugs.map((slug) => `${slug}.json`).sort())) throw new Error('Published detail files do not match the fetched snapshot.');
  for (const slug of expectedSlugs) {
    const detail = JSON.parse(await readFile(join(outputDirectory, 'products', `${slug}.json`), 'utf8'));
    if (JSON.stringify(detail) !== JSON.stringify(normalized.details[slug])) throw new Error(`Published detail ${slug} does not match the fetched snapshot.`);
    const route = await stat(join(outputDirectory, 'p', slug, 'index.html'));
    if (!route.isFile() || route.size < 100) throw new Error(`Published route for ${slug} is missing.`);
  }

  const mapSlugs = Object.keys(normalized.images).sort();
  if (requireImages) {
    const shotFiles = (await readdir(join(outputDirectory, 'shots'))).filter((name) => name.endsWith('.webp')).sort();
    if (JSON.stringify(shotFiles) !== JSON.stringify(mapSlugs.map((slug) => `${slug}.webp`).sort())) throw new Error('Published pictures do not match the fetched image map.');
    for (const slug of mapSlugs) await assertRealWebp(join(outputDirectory, 'shots', `${slug}.webp`), slug);
  }

  const sitemapText = await readFile(join(outputDirectory, 'sitemap.xml'), 'utf8');
  const locations = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedLocations = ['/', '/catalog/', '/demo/', '/privacy/', '/terms/', ...expectedSlugs.map((slug) => `/p/${slug}/`)].map((path) => `${IMAGE_ORIGIN}${path}`);
  if (JSON.stringify(locations) !== JSON.stringify(expectedLocations)) throw new Error('Published sitemap does not match the fetched snapshot.');

  const expectedSummary = deploymentSummary(rawBytes, raw, normalized, requireImages);
  const actualSummary = JSON.parse(await readFile(join(outputDirectory, 'catalog-build.json'), 'utf8'));
  if (JSON.stringify(actualSummary) !== JSON.stringify(expectedSummary)) throw new Error('Published deployment summary does not match the fetched snapshot.');
  return expectedSummary;
}

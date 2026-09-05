import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publishCatalog } from './catalog-data.mjs';
import { fetchLatestSnapshot } from './snapshot-data.mjs';

export async function refreshCatalog({
  snapshotPath = '.factory/input/latest-catalog.json',
  outputDirectory = 'dist',
  fetchSnapshot = fetchLatestSnapshot,
  skipImages = false,
} = {}) {
  await fetchSnapshot(snapshotPath);
  return publishCatalog({ snapshotPath, outputDirectory, skipImages });
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await refreshCatalog();
  console.log(`Published fresh snapshot ${result.generated}: ${result.count} products and ${result.images} preserved pictures.`);
}

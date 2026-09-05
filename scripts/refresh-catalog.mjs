import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publishCatalog } from './catalog-data.mjs';
import { pinLatestSnapshot } from './snapshot-data.mjs';

export async function refreshCatalog({
  inputDirectory = '.factory/input',
  outputDirectory = 'dist',
  pinSnapshot = pinLatestSnapshot,
  skipImages = false,
} = {}) {
  const pin = await pinSnapshot({ inputDirectory });
  const result = await publishCatalog({ snapshotPath: pin.snapshotPath, outputDirectory, skipImages });
  return { ...result, pin };
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await refreshCatalog();
  console.log(`Published fresh snapshot ${result.generated}: ${result.count} products and ${result.images} preserved pictures.`);
}

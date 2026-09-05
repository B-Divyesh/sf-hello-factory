import { resolve } from 'node:path';
import { publishCatalog } from './catalog-data.mjs';
import { resolvePinnedSnapshot } from './snapshot-data.mjs';

const suppliedSnapshot = process.argv[2];
const snapshotPath = suppliedSnapshot ? resolve(suppliedSnapshot) : (await resolvePinnedSnapshot()).snapshotPath;
const outputDirectory = resolve(process.argv[3] ?? 'dist');
const result = await publishCatalog({
  snapshotPath,
  outputDirectory,
  skipImages: process.env.CATALOG_SKIP_IMAGES === '1',
});
console.log(`Published snapshot ${result.generated}: ${result.count} products and ${result.images} preserved pictures.`);

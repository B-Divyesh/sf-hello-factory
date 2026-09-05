import { resolve } from 'node:path';
import { publishCatalog } from './catalog-data.mjs';

const snapshotPath = resolve(process.argv[2] ?? '.factory/input/latest-catalog.json');
const outputDirectory = resolve(process.argv[3] ?? 'dist');
const result = await publishCatalog({
  snapshotPath,
  outputDirectory,
  skipImages: process.env.CATALOG_SKIP_IMAGES === '1',
});
console.log(`Published ${result.count} catalogue entries and preserved ${result.images} pictures.`);

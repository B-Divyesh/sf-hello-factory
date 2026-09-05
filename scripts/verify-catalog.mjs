import { resolve } from 'node:path';
import { verifyPublishedCatalog } from './catalog-data.mjs';

const snapshotPath = resolve(process.argv[2] ?? '.factory/input/latest-catalog.json');
const outputDirectory = resolve(process.argv[3] ?? 'dist');
const result = await verifyPublishedCatalog({ snapshotPath, outputDirectory, requireImages: true });
console.log(JSON.stringify(result, null, 2));

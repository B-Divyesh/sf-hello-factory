import { resolve } from 'node:path';
import { verifyPublishedCatalog } from './catalog-data.mjs';
import { resolvePinnedSnapshot } from './snapshot-data.mjs';

const suppliedSnapshot = process.argv[2];
const snapshotPath = suppliedSnapshot ? resolve(suppliedSnapshot) : (await resolvePinnedSnapshot()).snapshotPath;
const outputDirectory = resolve(process.argv[3] ?? 'dist');
const result = await verifyPublishedCatalog({ snapshotPath, outputDirectory, requireImages: true });
console.log(JSON.stringify(result, null, 2));

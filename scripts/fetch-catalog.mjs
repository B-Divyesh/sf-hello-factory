import { pinLatestSnapshot } from './snapshot-data.mjs';

const pin = await pinLatestSnapshot();
console.log(`Pinned authorized controller snapshot ${pin.sourceSha256}: ${pin.count} products and ${pin.images} pictures.`);

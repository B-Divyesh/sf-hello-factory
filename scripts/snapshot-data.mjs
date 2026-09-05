import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { normalizeSnapshot } from './catalog-data.mjs';

const execFileAsync = promisify(execFile);
const ACCOUNT = 'sociobotblob';
const CONTAINER = 'factory-evidence';
const BLOB = 'hello-factory-controller/input/latest-catalog.json';
const SNAPSHOT_PREFIX = 'hello-factory-controller/input/snapshots';
const DEFAULT_INPUT = '.factory/input';
const PIN_NAME = 'catalog-pin.json';

function hasSnapshotShape(value) {
  return value && typeof value === 'object' && value.catalog && value.details && value.images;
}

function sha256(raw) {
  return createHash('sha256').update(raw).digest('hex');
}

function parseAndValidate(raw, label) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
  if (!hasSnapshotShape(parsed)) throw new Error(`${label} is incomplete.`);
  // Picture coverage is part of the input contract. Do not pin something that
  // the publisher would correctly refuse to release.
  normalizeSnapshot(parsed);
  return parsed;
}

async function downloadBlob(blob, destination, run = execFileAsync) {
  await mkdir(dirname(destination), { recursive: true });
  await run('az', [
    'storage', 'blob', 'download',
    '--account-name', ACCOUNT,
    '--container-name', CONTAINER,
    '--name', blob,
    '--file', destination,
    '--auth-mode', 'login',
    '--overwrite', 'true',
    '--no-progress',
    '--only-show-errors',
    '--output', 'none',
  ], { maxBuffer: 1024 * 1024 });
}

async function downloadAtomically(blob, target, run = execFileAsync) {
  const temporary = `${target}.download-${process.pid}-${Date.now()}`;
  try {
    await downloadBlob(blob, temporary, run);
    await rename(temporary, target);
    return target;
  } catch (error) {
    await rm(temporary, { force: true });
    throw new Error('The authorised catalogue snapshot could not be downloaded.', { cause: error });
  }
}

function inputPaths(inputDirectory = DEFAULT_INPUT) {
  const root = resolve(inputDirectory);
  return {
    root,
    latest: join(root, 'latest-catalog.json'),
    pin: join(root, PIN_NAME),
    snapshots: join(root, 'snapshots'),
  };
}

/**
 * Explicitly refresh the controller pointer, then pin the controller's retained
 * immutable source. Normal builds never call this function.
 */
export async function pinLatestSnapshot({ inputDirectory = DEFAULT_INPUT, run = execFileAsync } = {}) {
  const paths = inputPaths(inputDirectory);
  await mkdir(paths.root, { recursive: true });
  await downloadAtomically(BLOB, paths.latest, run);
  const pointerRaw = await readFile(paths.latest);
  const pointer = parseAndValidate(pointerRaw, 'The controller latest snapshot');
  const sourceSha256 = sha256(pointerRaw);
  const retainedPath = join(paths.snapshots, `${sourceSha256}.json`);
  const remoteRetainedBlob = `${SNAPSHOT_PREFIX}/${sourceSha256}.json`;

  await downloadAtomically(remoteRetainedBlob, retainedPath, run);
  const retainedRaw = await readFile(retainedPath);
  if (sha256(retainedRaw) !== sourceSha256) {
    throw new Error('The retained controller snapshot does not match the latest pointer.');
  }
  const retained = parseAndValidate(retainedRaw, 'The retained controller snapshot');
  const pin = {
    schemaVersion: 1,
    sourceSha256,
    snapshot: `snapshots/${sourceSha256}.json`,
    generated: retained.catalog.generated,
    count: retained.catalog.count,
    details: Object.keys(retained.details).length,
    images: Object.keys(retained.images).length,
  };
  const temporaryPin = `${paths.pin}.write-${process.pid}-${Date.now()}`;
  await writeFile(temporaryPin, `${JSON.stringify(pin, null, 2)}\n`);
  await rename(temporaryPin, paths.pin);
  return { ...pin, latestPath: paths.latest, snapshotPath: retainedPath, pinPath: paths.pin };
}

/** Resolve and verify the immutable input selected by the tracked catalog pin. */
export async function resolvePinnedSnapshot(inputDirectory = DEFAULT_INPUT) {
  const paths = inputPaths(inputDirectory);
  let pin;
  try {
    pin = JSON.parse(await readFile(paths.pin, 'utf8'));
  } catch (error) {
    throw new Error('The tracked catalogue pin is missing or invalid. Run npm run catalog:refresh explicitly.', { cause: error });
  }
  if (pin?.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(pin.sourceSha256) || typeof pin.snapshot !== 'string') {
    throw new Error('The tracked catalogue pin is invalid.');
  }
  const snapshotPath = resolve(paths.root, pin.snapshot);
  const snapshotsRoot = `${paths.snapshots}/`;
  if (!snapshotPath.startsWith(snapshotsRoot) || basename(snapshotPath) !== `${pin.sourceSha256}.json` || relative(paths.snapshots, snapshotPath).includes('..')) {
    throw new Error('The tracked catalogue pin points outside its retained snapshot directory.');
  }
  let raw;
  try {
    raw = await readFile(snapshotPath);
  } catch (error) {
    throw new Error('The tracked catalogue snapshot is missing. Run npm run catalog:refresh explicitly.', { cause: error });
  }
  if (sha256(raw) !== pin.sourceSha256) throw new Error('The tracked catalogue snapshot hash does not match its pin.');
  const parsed = parseAndValidate(raw, 'The tracked catalogue snapshot');
  if (pin.generated !== parsed.catalog.generated || pin.count !== parsed.catalog.count || pin.details !== Object.keys(parsed.details).length || pin.images !== Object.keys(parsed.images).length) {
    throw new Error('The tracked catalogue pin metadata does not match its snapshot.');
  }
  return { ...pin, snapshotPath };
}

// Retained for external callers that need only the moving pointer. Build and
// publication commands use resolvePinnedSnapshot instead.
export async function fetchLatestSnapshot(destination = '.factory/input/latest-catalog.json', run = execFileAsync) {
  const target = resolve(destination);
  await downloadAtomically(BLOB, target, run);
  parseAndValidate(await readFile(target), 'The downloaded catalogue snapshot');
  return target;
}

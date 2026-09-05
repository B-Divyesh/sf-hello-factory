import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ACCOUNT = 'sociobotblob';
const CONTAINER = 'factory-evidence';
const BLOB = 'hello-factory-controller/input/latest-catalog.json';

function hasSnapshotShape(value) {
  return value && typeof value === 'object' && value.catalog && value.details && value.images;
}

/** Fetch only the controller-authorised Hello Factory catalogue blob and replace the local input atomically. */
export async function fetchLatestSnapshot(destination = '.factory/input/latest-catalog.json', run = execFileAsync) {
  const target = resolve(destination);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.download-${process.pid}-${Date.now()}`;
  try {
    await run('az', [
      'storage', 'blob', 'download',
      '--account-name', ACCOUNT,
      '--container-name', CONTAINER,
      '--name', BLOB,
      '--file', temporary,
      '--auth-mode', 'login',
      '--overwrite', 'true',
      '--no-progress',
      '--only-show-errors',
      '--output', 'none',
    ], { maxBuffer: 1024 * 1024 });
    const parsed = JSON.parse(await readFile(temporary, 'utf8'));
    if (!hasSnapshotShape(parsed)) throw new Error('The downloaded catalogue snapshot is incomplete.');
    await rename(temporary, target);
    return target;
  } catch (error) {
    await rm(temporary, { force: true });
    const message = error instanceof SyntaxError || error?.message === 'The downloaded catalogue snapshot is incomplete.'
      ? error.message
      : 'The authorised catalogue snapshot could not be downloaded.';
    throw new Error(message, { cause: error });
  }
}

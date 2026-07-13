import { cp, readdir } from 'node:fs/promises';
import path from 'node:path';

const source = path.resolve('public');
const destination = path.resolve('.');
const entries = await readdir(source, { withFileTypes: true });

for (const entry of entries) {
  await cp(
    path.join(source, entry.name),
    path.join(destination, entry.name),
    { force: true, recursive: entry.isDirectory() },
  );
}

console.log(`Synced ${entries.length} top-level public/ entries to the branch-deployment mirror.`);

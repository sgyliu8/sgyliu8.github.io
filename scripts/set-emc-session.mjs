import {writeFile} from 'node:fs/promises';

const [slugSha256, expiresAt, ...extra] = process.argv.slice(2);
if (extra.length || !/^[0-9a-f]{64}$/.test(slugSha256 ?? '') ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(expiresAt ?? '') ||
    !(Date.parse(expiresAt) > Date.now())) {
  console.error('Usage: npm run emc:session -- <64-character SHA-256 digest> <future UTC expiry ending in Z>');
  process.exit(1);
}

const session = JSON.stringify({slugSha256, expiresAt}, null, 2) + '\n';
for (const target of ['../public/emc/session.json', '../emc/session.json']) {
  await writeFile(new URL(target, import.meta.url), session);
}
console.log('Updated the public session digest and its deployment mirror.');

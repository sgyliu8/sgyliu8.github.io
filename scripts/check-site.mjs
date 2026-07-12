import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve('public');
const errors = [];

const prohibited = [
  ['private street address', /Crown Mill|LN5\s*7QD/i],
  ['private UK phone number', /0770\s*653\s*6289|0745\s*327\s*1319/i],
  ['private Chinese contact number', /00393427676402/i],
  ['private email address', /arthurliuyang@126\.com/i],
  ['compensation detail', /65000\s*(?:元|RMB|CNY)|15\s*薪/i],
  ['incorrect ASME paper number', /GT2024-123937/i],
  ['incorrect UAV patent number', /CN2058762433?U/i],
];

const requiredFiles = [
  'index.html',
  'cv/index.html',
  '404.html',
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/icons/favicon.svg',
  'assets/img/og-card.png',
  'assets/Curriculum_Vitae.pdf',
  'about.html',
  'robots.txt',
  'sitemap.xml',
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  }));
  return nested.flat();
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function collectIds(html) {
  return [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function collectReferences(html) {
  const attributes = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  const refreshes = [...html.matchAll(/<meta\s[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"';\s>]+)[^"']*["']/gi)]
    .map((match) => match[1]);
  return [...attributes, ...refreshes];
}

function localTarget(reference) {
  if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(reference)) return null;

  const [withoutFragment, fragment = ''] = reference.split('#', 2);
  const cleanPath = withoutFragment.split('?')[0];
  return { cleanPath, fragment };
}

function resolvePublicPath(sourceFile, cleanPath) {
  let candidate;
  if (!cleanPath) {
    candidate = sourceFile;
  } else if (cleanPath.startsWith('/')) {
    candidate = path.join(root, cleanPath.slice(1));
  } else {
    candidate = path.resolve(path.dirname(sourceFile), cleanPath);
  }

  if (candidate.endsWith(path.sep) || path.extname(candidate) === '') {
    candidate = path.join(candidate, 'index.html');
  }

  return candidate;
}

function isInsidePublic(candidate) {
  const relativePath = path.relative(root, candidate);
  return relativePath === '' || (!relativePath.startsWith(`..${path.sep}`) && relativePath !== '..' && !path.isAbsolute(relativePath));
}

for (const file of requiredFiles) {
  try {
    await access(path.join(root, file));
  } catch {
    errors.push(`Missing required file: ${file}`);
  }
}

const files = await walk(root);
const textFiles = files.filter((file) => /\.(?:html|css|js|json|xml|txt|svg)$/i.test(file));

for (const file of textFiles) {
  const content = await readFile(file, 'utf8');
  for (const [label, pattern] of prohibited) {
    if (pattern.test(content)) errors.push(`${relative(file)} contains ${label}`);
  }
}

try {
  const manifest = JSON.parse(await readFile(path.join(root, 'site.webmanifest'), 'utf8'));
  if (manifest.start_url !== '/') errors.push('site.webmanifest start_url must be /');
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) errors.push('site.webmanifest is missing icons');
} catch (error) {
  errors.push(`site.webmanifest is invalid JSON: ${error.message}`);
}

const cssFiles = files.filter((file) => file.endsWith('.css'));
for (const file of cssFiles) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const target = localTarget(match[1]);
    if (!target) continue;
    const targetPath = resolvePublicPath(file, target.cleanPath);
    if (!isInsidePublic(targetPath)) {
      errors.push(`${relative(file)} references a path outside public/: ${match[1]}`);
      continue;
    }
    try { await access(targetPath); } catch { errors.push(`${relative(file)} has broken CSS reference: ${match[1]}`); }
  }
}

const htmlFiles = files.filter((file) => file.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const ids = collectIds(html);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) {
    errors.push(`${relative(file)} has duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);
  }

  if (!/<html\s[^>]*lang=["'][^"']+["']/i.test(html)) {
    errors.push(`${relative(file)} is missing a document language`);
  }

  if (!/<title>[^<]+<\/title>/i.test(html)) {
    errors.push(`${relative(file)} is missing a title`);
  }

  if (['index.html', 'cv/index.html'].includes(relative(file))) {
    if (!/<meta\s+name=["']description["']/i.test(html)) {
      errors.push(`${relative(file)} is missing a meta description`);
    }
    if (!/<link\s+rel=["']canonical["']/i.test(html)) {
      errors.push(`${relative(file)} is missing a canonical URL`);
    }
  }

  for (const reference of collectReferences(html)) {
    const target = localTarget(reference);
    if (!target) continue;

    const targetPath = resolvePublicPath(file, target.cleanPath);
    if (!isInsidePublic(targetPath)) {
      errors.push(`${relative(file)} references a path outside public/: ${reference}`);
      continue;
    }
    try {
      await access(targetPath);
    } catch {
      errors.push(`${relative(file)} has broken local reference: ${reference}`);
      continue;
    }

    if (target.fragment && targetPath.endsWith('.html')) {
      const targetHtml = targetPath === file ? html : await readFile(targetPath, 'utf8');
      const targetIds = new Set(collectIds(targetHtml));
      if (!targetIds.has(target.fragment)) {
        errors.push(`${relative(file)} links to missing fragment: ${reference}`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Site validation passed: ${htmlFiles.length} HTML files, ${files.length} public files, 0 broken internal references.`);

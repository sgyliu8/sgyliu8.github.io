import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve('public');
const errors = [];

try {
  const deploymentWorkflow = await readFile(path.resolve('.github/workflows/static.yml'), 'utf8');
  if (!/path:\s*\.\/public\b/.test(deploymentWorkflow)) {
    errors.push('GitHub Pages must deploy the canonical public/ site tree');
  }
} catch (error) {
  errors.push(`Unable to verify the GitHub Pages deployment path: ${error.message}`);
}

const prohibited = [
  ['private street address', /Crown Mill|LN5\s*7QD/i],
  ['private UK phone number', /0770\s*653\s*6289|0745\s*327\s*1319/i],
  ['private Chinese contact number', /00393427676402/i],
  ['private email address', /arthurliuyang@126\.com/i],
  ['compensation detail', /65000\s*(?:元|RMB|CNY)|15\s*薪/i],
  ['incorrect ASME paper number', /GT2024-123937/i],
  ['incorrect UAV patent number', /CN2058762433?U/i],
  ['incorrect CEng capitalisation', /CENG/],
  ['superseded English hero wording', /Turning\s+complex\s+measurements/i],
  ['superseded Chinese hero wording', /将复杂测量/],
  ['retired portrait-in-process component', /\bvisual-profile\b/i],
  ['unapproved AVIC SVG asset', /avic\.svg/i],
  ['unapproved Siemens Energy SVG asset', /siemens-energy\.svg/i],
  ['outdated present-tense date label', /2024\s*[—–-]\s*Now/i],
  ['incorrect power-distribution wording', /workload\s+distribution/i],
  ['misleading CEng and IMechE credential grouping', /PhD\s*·\s*CEng\s*·\s*IMechE/i],
  ['stale static CV download link', /href=["']\/assets\/Curriculum_Vitae(?:_ZH)?\.pdf["']/i],
  ['inconsistent Chinese AVIC organisation name', /中国航空工业(?:集团)?（AVIC）/],
  ['abrupt superseded Step 02/03 explanation', /Step 02 establishes whether the data are fit for purpose|02 asks whether the data are fit for purpose|第\s*02\s*步确认数据是否适用于当前任务/],
  ['singular systems-architecture wording', /engineering software and system architecture/i],
  ['incorrect First-Class capitalisation', /First Class Honours/],
  ['incorrect simulation-product capitalisation', /\bXflow\b|\bXFoil\b/],
  ['abbreviated journal title', /Proceedings of the IMechE, Part A/],
  ['abbreviated 2020 paper title', /An Integrated PCA, Artificial Neural Network/],
  ['outdated Cranfield–AVIC end month', /Sep(?:tember)?\s+2021|2021\s*年\s*9\s*月/],
  ['imprecise Chinese IMechE registration wording', /经\s*IMechE\s*注册/],
  ['incomplete systems-architecture metadata', /Engineering software architecture|工程软件架构/],
];

const requiredFiles = [
  'index.html',
  'cv/index.html',
  'zh/index.html',
  'zh/cv/index.html',
  '404.html',
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/fonts/inter/index.css',
  'assets/fonts/inter/LICENSE',
  'assets/fonts/inter/files/inter-latin-wght-normal.woff2',
  'assets/fonts/inter/files/inter-latin-ext-wght-normal.woff2',
  'assets/icons/favicon.svg',
  'assets/img/og-card.png',
  'assets/img/og-card-zh.png',
  'assets/img/logos/avic.png',
  'assets/img/logos/liverpool.svg',
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
  const attributes = [...html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)].map((match) => match[1]);
  const sourceSets = [...html.matchAll(/\b(?:srcset|imagesrcset)=["']([^"']+)["']/gi)]
    .flatMap((match) => match[1]
      .split(',')
      .map((candidate) => candidate.trim().split(/\s+/)[0])
      .filter(Boolean));
  const refreshes = [...html.matchAll(/<meta\s[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"';\s>]+)[^"']*["']/gi)]
    .map((match) => match[1]);
  return [...attributes, ...sourceSets, ...refreshes];
}

function normaliseVisibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(?:0*38|x0*26);/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .normalize('NFC');
}

function hasClass(html, className) {
  return [...html.matchAll(/\bclass=["']([^"']*)["']/gi)]
    .some((match) => match[1].split(/\s+/).includes(className));
}

function includesNormalisedPhrase(text, phrase) {
  return text.replace(/\s+/g, '').includes(phrase.replace(/\s+/g, ''));
}

function requireOrderedText(page, text, phrases, label) {
  let offset = 0;
  for (const phrase of phrases) {
    const index = text.indexOf(phrase, offset);
    if (index === -1) {
      errors.push(`${page} is missing ${label}: ${phrase}`);
      return;
    }
    offset = index + phrase.length;
  }
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

for (const stalePdf of ['assets/Curriculum_Vitae.pdf', 'assets/Curriculum_Vitae_ZH.pdf', 'public/assets/Curriculum_Vitae.pdf', 'public/assets/Curriculum_Vitae_ZH.pdf']) {
  try {
    await access(path.resolve(stalePdf));
    errors.push(`Stale static CV asset must be retired: ${stalePdf}`);
  } catch {
    // Expected: browser print/save is the canonical PDF path.
  }
}

for (const image of ['assets/img/og-card.png', 'assets/img/og-card-zh.png']) {
  try {
    const png = await readFile(path.join(root, image));
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    if (width !== 1200 || height !== 630) errors.push(`${image} must be 1200×630`);
    if (png.byteLength > 250_000) errors.push(`${image} must remain below 250 KB`);
  } catch {
    // The required-file check above reports a missing asset.
  }
}

const files = await walk(root);
const textFiles = files.filter((file) => /\.(?:html|css|js|json|xml|txt|svg)$/i.test(file));

for (const retiredAsset of ['assets/img/logos/avic.svg', 'assets/img/logos/siemens-energy.svg']) {
  if (files.some((file) => relative(file) === retiredAsset)) {
    errors.push(`Retired logo asset must be removed: ${retiredAsset}`);
  }
}

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
const pageHtml = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  pageHtml.set(relative(file), html);
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

  if (['index.html', 'cv/index.html', 'zh/index.html', 'zh/cv/index.html'].includes(relative(file))) {
    if (!/<meta\s+name=["']description["']/i.test(html)) {
      errors.push(`${relative(file)} is missing a meta description`);
    }
    if (!/<link\s+rel=["']canonical["']/i.test(html)) {
      errors.push(`${relative(file)} is missing a canonical URL`);
    }
    if (!/<meta\s+name=["']twitter:image["']/i.test(html)) {
      errors.push(`${relative(file)} is missing an explicit Twitter/X share image`);
    }
    if (!/<main\b[^>]*\bid=["']main-content["'][^>]*\btabindex=["']-1["']/i.test(html)
      && !/<main\b[^>]*\btabindex=["']-1["'][^>]*\bid=["']main-content["']/i.test(html)) {
      errors.push(`${relative(file)} must make the skip-link target programmatically focusable`);
    }
    if (!/hreflang=["']en-GB["']/i.test(html) || !/hreflang=["']zh-CN["']/i.test(html)) {
      errors.push(`${relative(file)} is missing bilingual hreflang links`);
    }
    if (!/assets\/fonts\/inter\/index\.css/i.test(html)) {
      errors.push(`${relative(file)} is missing the self-hosted Inter stylesheet`);
    }

    const navigation = html.match(/<nav class=["']primary-nav["'][\s\S]*?<\/nav>/i)?.[0] || '';
    const contentAnchors = [...navigation.matchAll(/href=["'](?:\/zh\/|\/)?#(?:about|expertise|work|experience|research|contact)["']/gi)];
    if (contentAnchors.length > 4) {
      errors.push(`${relative(file)} has more than four primary content anchors`);
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

const primaryPages = ['index.html', 'cv/index.html', 'zh/index.html', 'zh/cv/index.html'];
const homePages = ['index.html', 'zh/index.html'];

for (const page of primaryPages) {
  const html = pageHtml.get(page) || '';
  const text = normaliseVisibleText(html);

  if (!hasClass(html, 'brand-avatar')) {
    errors.push(`${page} is missing the header brand-avatar`);
  }
  if (!text.includes('AVIC')) {
    errors.push(`${page} is missing the Cranfield–AVIC collaboration`);
  }
}

for (const page of ['cv/index.html', 'zh/cv/index.html']) {
  const html = pageHtml.get(page) || '';
  if (!hasClass(html, 'cv-print-contact') || !/sgyliu@gmail\.com/.test(html) || !/linkedin\.com\/in\/yliu991/.test(html)) {
    errors.push(`${page} must retain email and LinkedIn details in browser print/save output`);
  }
}

const pathwayRequirements = {
  'index.html': {
    steps: ['Define the question', 'Acquire & qualify the evidence', 'Validate the model & interpretation', 'Decide, deploy & monitor'],
    distinction: 'High-quality data can still be interpreted by the wrong model; a plausible model is not defensible when the underlying evidence is weak. Both gates must pass before deployment.',
  },
  'zh/index.html': {
    steps: ['定义工程问题', '获取并确认数据可信度', '验证模型与解释', '决策、交付与监测'],
    distinction: '高质量数据仍可能被错误模型解释；看似合理的模型若建立在薄弱证据上，也无法支撑工程决策。只有两道门槛都通过，结果才进入交付。',
  },
};

for (const [page, requirement] of Object.entries(pathwayRequirements)) {
  const html = pageHtml.get(page) || '';
  const text = normaliseVisibleText(html);
  requireOrderedText(page, text, requirement.steps, 'the ordered four-step data-to-decision pathway');
  if (!includesNormalisedPhrase(text, requirement.distinction)) {
    errors.push(`${page} is missing the complete two-gate explanation for evidence quality and interpretation validity`);
  }
}

for (const page of homePages) {
  const html = pageHtml.get(page) || '';
  if (!/src=["']\/assets\/img\/logos\/avic\.png["']/i.test(html)) {
    errors.push(`${page} must use the official local AVIC PNG logo`);
  }
  if (!/src=["']\/assets\/img\/logos\/liverpool\.svg["']/i.test(html)) {
    errors.push(`${page} must reference the full University of Liverpool lockup`);
  }
  if (!/yang-cranfield-phd-graduation-\d+\.(?:webp|jpe?g)/i.test(html)) {
    errors.push(`${page} is missing the Cranfield graduation journey image`);
  }
  if (!/yang-manchester-model-aircraft-\d+\.(?:webp|jpe?g)/i.test(html)) {
    errors.push(`${page} is missing the Manchester model-aircraft journey image`);
  }
}

try {
  const liverpoolLogo = await readFile(path.join(root, 'assets/img/logos/liverpool.svg'), 'utf8');
  const viewBox = liverpoolLogo.match(/\bviewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (!viewBox || Number(viewBox[1]) / Number(viewBox[2]) < 3) {
    errors.push('assets/img/logos/liverpool.svg must contain the full horizontal University of Liverpool lockup, not a crest-only mark');
  }
} catch {
  // The required-file check above reports the missing asset.
}

const chineseCv = await readFile(path.join(root, 'zh/cv/index.html'), 'utf8');
if (/>\s*Vibration damping component for a drone and drone with the same\s*</i.test(chineseCv)) {
  errors.push('zh/cv/index.html contains the untranslated UAV patent title');
}
if (/<a\s+class=["']brand["']\s+href=["']\/["']/i.test(chineseCv)) {
  errors.push('zh/cv/index.html brand must return to the Chinese homepage');
}
if (/<a\s+href=["']\/["']>个人主页<\/a>/i.test(chineseCv)) {
  errors.push('zh/cv/index.html contact link must return to the Chinese homepage');
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Site validation passed: ${htmlFiles.length} HTML files, ${files.length} public files, 0 broken internal references.`);

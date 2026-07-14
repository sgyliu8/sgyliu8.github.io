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

try {
  const manifest = JSON.parse(await readFile(path.join(root, 'site.webmanifest'), 'utf8'));
  const expectedName = 'Yang Liu — Gas-Turbine Whole-Engine Performance & Industrial AI/ML';
  const expectedDescription = 'Gas-turbine whole-engine performance, systems engineering, experimental validation and deployable industrial AI/ML.';
  if (manifest.name !== expectedName) {
    errors.push(`site.webmanifest name must be: ${expectedName}`);
  }
  if (manifest.description !== expectedDescription) {
    errors.push(`site.webmanifest description must be: ${expectedDescription}`);
  }
} catch (error) {
  errors.push(`Unable to verify site.webmanifest positioning: ${error.message}`);
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
  ['retired CEng-through-IMechE label', /CEng\s+through\s+IMechE/i],
  ['retired IMechE review wording', /IMechE\s+(?:reviewed|professional review)|Professionally reviewed by the Institution of Mechanical Engineers|经\s*(?:英国机械工程师学会（IMechE）|IMechE)\s*专业评审/i],
  ['Dr and PhD used together in a name line', /Dr\s+Yang\s+Liu\s*,?\s*PhD|Yang\s+Liu\s*,\s*PhD\s*,\s*CEng|刘杨(?:博士)?\s*[，,·]\s*PhD/i],
  ['retired gas-turbine-only hero label', /Dr\s+Yang\s+Liu\s*·\s*Gas-turbine\s+R&D|刘杨博士\s*·\s*燃气轮机研发/i],
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
  ['incorrect paper-aircraft win count', /Three wins at Cranfield|Three university competition wins|三次在克兰菲尔德夺冠|三次大学纸飞机比赛夺冠/],
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
  'assets/img/engineering/xag-p20-cfd-640.webp',
  'assets/img/engineering/xag-p20-cfd-928.webp',
  'assets/img/engineering/xag-p20-cfd-928.jpg',
  'assets/img/engineering/xag-evtol-study-public-414.png',
  'assets/img/engineering/polimi-gear-test-bench-640.webp',
  'assets/img/engineering/polimi-gear-test-bench-960.webp',
  'assets/img/engineering/polimi-gear-test-bench-1469.webp',
  'assets/img/engineering/polimi-gear-test-bench-1469.png',
  'assets/img/profile/yang-polimiride-family-640.webp',
  'assets/img/profile/yang-polimiride-family-960.webp',
  'assets/img/profile/yang-polimiride-family-1280.webp',
  'assets/img/profile/yang-polimiride-family-1600.webp',
  'assets/img/profile/yang-polimiride-family-1600.jpg',
  'assets/img/profile/yang-polimiride-family-2048.webp',
  'assets/img/profile/yang-polimiride-family-2048.jpg',
  'assets/img/profile/tennis-racket-collection-480.webp',
  'assets/img/profile/tennis-racket-collection-720.webp',
  'assets/img/profile/tennis-racket-collection-960.webp',
  'assets/img/profile/tennis-racket-collection-960.jpg',
  'assets/img/profile/tennis-racket-collection-1536.webp',
  'assets/img/profile/tennis-racket-collection-1536.jpg',
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
    .replace(/&ndash;|&#(?:8211|x2013);/gi, '–')
    .replace(/&mdash;|&#(?:8212|x2014);/gi, '—')
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

function countClass(html, className) {
  return [...html.matchAll(/\bclass=["']([^"']*)["']/gi)]
    .filter((match) => match[1].split(/\s+/).includes(className))
    .length;
}

function classElementHtml(html, className, tag = '[a-z][\\w:-]*') {
  const pattern = new RegExp(
    "<(" + tag + ")\\b(?=[^>]*\\bclass=[\"'][^\"']*\\b"
      + className
      + "\\b[^\"']*[\"'])[^>]*>[\\s\\S]*?<\\/\\1>",
    'i',
  );
  return html.match(pattern)?.[0] || '';
}

function includesNormalisedPhrase(text, phrase) {
  return text.replace(/\s+/g, '').includes(phrase.replace(/\s+/g, ''));
}

function attributeValue(tag, attribute) {
  const pattern = new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i');
  return tag.match(pattern)?.[1] || '';
}

function metaContent(html, attribute, value) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .find((candidate) => attributeValue(candidate, attribute) === value);
  return tag ? attributeValue(tag, 'content').replace(/&amp;/gi, '&') : '';
}

function pageTitle(html) {
  return (html.match(/<title>([^<]+)<\/title>/i)?.[1] || '').replace(/&amp;/gi, '&');
}

function sectionSlice(html, id, followingIds = []) {
  const startPattern = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, 'i');
  const start = html.search(startPattern);
  if (start === -1) return '';

  const candidates = followingIds
    .map((followingId) => html.slice(start + 1).search(new RegExp(`<section\\b[^>]*\\bid=["']${followingId}["'][^>]*>`, 'i')))
    .filter((index) => index !== -1)
    .map((index) => start + 1 + index);
  const end = candidates.length ? Math.min(...candidates) : html.length;
  return html.slice(start, end);
}

function structuredPerson(html, page) {
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block[1]);
      const records = Array.isArray(parsed?.['@graph']) ? parsed['@graph'] : [parsed];
      const person = records.find((record) => {
        const types = Array.isArray(record?.['@type']) ? record['@type'] : [record?.['@type']];
        return types.includes('Person');
      });
      if (person) return person;
    } catch (error) {
      errors.push(`${page} contains invalid JSON-LD: ${error.message}`);
    }
  }
  return null;
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

for (const file of files) {
  const mirroredFile = path.resolve(relative(file));
  try {
    const [canonical, mirrored] = await Promise.all([readFile(file), readFile(mirroredFile)]);
    if (!canonical.equals(mirrored)) {
      errors.push(`${relative(file)} differs from the root deployment mirror; run npm run sync:root`);
    }
  } catch {
    errors.push(`${relative(file)} is missing from the root deployment mirror; run npm run sync:root`);
  }
}

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

const positioningRequirements = {
  'index.html': [
    'Dr Yang Liu, CEng',
    'gas-turbine whole-engine performance',
    'industrial AI/ML',
    'component matching',
    'off-design operability',
    'model–test correlation',
    'Senior Engineer – R&D',
    'Postdoctoral Researcher',
    'Researcher – Aero-Engine Performance & Diagnostics',
    'Whole-engine performance',
    'Industrial AI/ML',
  ],
  'zh/index.html': [
    '刘杨博士，CEng',
    '燃气轮机整机性能',
    '工业 AI/ML',
    '部件匹配',
    '非设计工况与可运行性',
    '模型—试验关联',
    '高级工程师（研发）',
    '博士后研究员',
    '航空发动机性能与诊断研究员',
  ],
  'cv/index.html': [
    'Dr Yang Liu, CEng',
    'Chartered Engineer (CEng)',
    'Institution of Mechanical Engineers (IMechE)',
    'gas-turbine whole-engine performance',
    'Senior Engineer – R&D',
    'Postdoctoral Researcher',
    'Researcher – Aero-Engine Performance & Diagnostics',
    'Gas-turbine whole-engine performance, integration & technical authority',
    'CEng · Gas Turbines · Industrial AI/ML',
    'Gas-turbine whole-engine performance, systems engineering, experimental validation, diagnostics, industrial imaging, AI/ML and research translation',
    'Lincoln, United Kingdom',
  ],
  'zh/cv/index.html': [
    '刘杨博士，CEng',
    '英国特许工程师（CEng）',
    '英国机械工程师学会（IMechE）',
    '燃气轮机整机性能',
    '高级工程师（研发）',
    '博士后研究员',
    '航空发动机性能与诊断研究员',
    '燃气轮机整机性能、系统集成与技术决策',
    'CEng · 燃气轮机 · 工业 AI/ML',
    '燃气轮机整机性能、系统工程、试验验证、故障诊断、工业成像、AI/ML 与科研成果转化',
    '英国林肯',
  ],
};

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

for (const [page, phrases] of Object.entries(positioningRequirements)) {
  const text = normaliseVisibleText(pageHtml.get(page) || '');
  for (const phrase of phrases) {
    if (!includesNormalisedPhrase(text, phrase)) errors.push(`${page} is missing required positioning copy: ${phrase}`);
  }
}

const homepageMetadata = {
  'index.html': {
    title: 'Dr Yang Liu, CEng | Gas-Turbine Whole-Engine Performance & Industrial AI/ML',
    description: 'Chartered Engineer and Senior Engineer specialising in gas-turbine whole-engine performance, systems integration, diagnostics, experimental validation and deployable industrial AI/ML.',
    ogTitle: 'Dr Yang Liu, CEng | Whole-Engine Performance & Industrial AI/ML',
    ogDescription: 'Gas-turbine whole-engine expertise strengthened by industrial imaging, deployable AI/ML, experimental validation and evidence-based engineering decisions.',
  },
  'zh/index.html': {
    title: '刘杨博士，CEng | 燃气轮机整机性能与工业 AI/ML',
    description: '刘杨博士，英国特许工程师（CEng）和高级工程师，专注燃气轮机整机性能、系统集成、故障诊断、试验验证与可部署工业 AI/ML。',
    ogTitle: '刘杨博士，CEng | 整机性能与工业 AI/ML',
    ogDescription: '以燃气轮机整机性能为核心，融合工业成像、可部署 AI/ML、试验验证与工程证据驱动的技术决策。',
  },
};

for (const [page, expected] of Object.entries(homepageMetadata)) {
  const html = pageHtml.get(page) || '';
  const actual = {
    title: pageTitle(html),
    description: metaContent(html, 'name', 'description'),
    ogTitle: metaContent(html, 'property', 'og:title'),
    ogDescription: metaContent(html, 'property', 'og:description'),
  };
  for (const [field, value] of Object.entries(expected)) {
    if (actual[field] !== value) errors.push(`${page} ${field} must be: ${value}`);
  }
}

const structuredDataRequirements = {
  'index.html': {
    jobTitle: 'Senior Engineer – R&D',
    knowsAbout: [
      'Gas-turbine whole-engine performance',
      'Thermodynamic cycle design',
      'Component matching',
      'Systems integration',
      'Off-design performance and operability',
      'Control–performance interaction',
      'Gas-path diagnostics and prognostics',
      'Model–test correlation',
      'Experimental testing and validation',
      'Industrial imaging',
      'Computer vision',
      'Deployable AI and machine learning',
      'Engineering research translation',
    ],
  },
  'zh/index.html': {
    jobTitle: '高级工程师（研发）',
    knowsAbout: [
      '燃气轮机整机性能',
      '热力循环设计',
      '部件匹配',
      '系统集成',
      '非设计工况与可运行性',
      '控制—性能耦合',
      '气路诊断与状态预测',
      '模型—试验关联',
      '试验与工程验证',
      '工业成像',
      '计算机视觉',
      '可部署人工智能与机器学习',
      '科研成果工程化',
    ],
  },
};

for (const [page, expected] of Object.entries(structuredDataRequirements)) {
  const person = structuredPerson(pageHtml.get(page) || '', page);
  if (!person) {
    errors.push(`${page} is missing Person JSON-LD`);
    continue;
  }
  if (person.jobTitle !== expected.jobTitle) {
    errors.push(`${page} JSON-LD jobTitle must be: ${expected.jobTitle}`);
  }
  if (JSON.stringify(person.knowsAbout) !== JSON.stringify(expected.knowsAbout)) {
    errors.push(`${page} JSON-LD knowsAbout must use the approved ordered whole-engine and industrial AI/ML topics`);
  }
  if (person.worksFor?.name !== 'Siemens Energy') {
    errors.push(`${page} JSON-LD must retain Siemens Energy as the current employer`);
  }
  const alumni = Array.isArray(person.alumniOf) ? person.alumniOf.map((entry) => entry?.name) : [];
  for (const institution of ['Cranfield University', 'Imperial College London', 'University of Liverpool']) {
    if (!alumni.includes(institution)) errors.push(`${page} JSON-LD must retain ${institution}`);
  }
  if (!Array.isArray(person.sameAs) || !person.sameAs.includes('https://www.linkedin.com/in/yliu991/')) {
    errors.push(`${page} JSON-LD must retain the LinkedIn sameAs URL`);
  }
  if (!/^https:\/\/sgyliu8\.github\.io\/(?:zh\/)?$/.test(person.url || '')) {
    errors.push(`${page} JSON-LD must retain its canonical homepage URL`);
  }
  if (/Chief Engineer|总工程师/.test(person.jobTitle || '')) {
    errors.push(`${page} JSON-LD must not claim an unverified current Chief Engineer title`);
  }
}

for (const page of ['cv/index.html', 'zh/cv/index.html']) {
  const html = pageHtml.get(page) || '';
  const printContact = classElementHtml(html, 'cv-print-contact', 'p');
  const printText = normaliseVisibleText(printContact);
  if (!printContact) {
    errors.push(page + ' is missing .cv-print-contact');
  }
  if (!/mailto:sgyliu@gmail\.com/i.test(printContact) || !printText.includes('sgyliu@gmail.com')) {
    errors.push(page + ' print contact must retain sgyliu@gmail.com');
  }
  const expectedPublicCvUrl = page === 'cv/index.html'
    ? 'https://sgyliu8.github.io/cv/'
    : 'https://sgyliu8.github.io/zh/cv/';
  const expectedPublicCvText = page === 'cv/index.html'
    ? 'sgyliu8.github.io/cv/'
    : 'sgyliu8.github.io/zh/cv/';
  if (!printContact.includes(`href="${expectedPublicCvUrl}"`)
    || !printText.includes(expectedPublicCvText)) {
    errors.push(page + ' print contact must link to its canonical Public CV URL');
  }
  if (/linkedin\.com/i.test(printContact)) {
    errors.push(page + ' must not include LinkedIn inside .cv-print-contact');
  }

  const locations = html.match(/\bclass=["'][^"']*\bcv-location\b[^"']*["']/gi) || [];
  if (locations.length !== 1) {
    errors.push(page + ' must contain exactly one .cv-location row');
  }

  const hero = classElementHtml(html, 'cv-hero', 'section');
  const heroOrder = ['cv-summary', 'cv-location', 'cv-print-contact'].map((className) => hero.indexOf(className));
  if (!hero || heroOrder.some((index) => index === -1)
    || !(heroOrder[0] < heroOrder[1] && heroOrder[1] < heroOrder[2])) {
    errors.push(page + ' must order summary, location and print contact consistently');
  }

  const entries = [...html.matchAll(/<article\s+class=["']cv-entry["'][^>]*>([\s\S]*?)<\/article>/gi)]
    .map((match) => match[1]);
  const bulletCounts = entries.map((entry) => (entry.match(/<li\b/gi) || []).length);
  if (entries.length !== 4 || bulletCounts.join(',') !== '4,3,3,2') {
    errors.push(page + ' must retain four Experience entries with bilingual bullet parity 4,3,3,2');
  }

  const expectedLanguageRoute = page === 'cv/index.html' ? '/zh/cv/' : '/cv/';
  const languageSwitch = [...html.matchAll(/<a\b(?=[^>]*\bclass=["'][^"']*\blanguage-switch\b[^"']*["'])[^>]*>/gi)][0]?.[0] || '';
  if (attributeValue(languageSwitch, 'href') !== expectedLanguageRoute) {
    errors.push(`${page} language switch must route to ${expectedLanguageRoute}`);
  }
}

const staleCvCopy = {
  'cv/index.html': [
    ['whole-engine design for gas turbines', /whole-engine design for gas turbines/i],
    ['Based in Lincoln, United Kingdom', /Based in Lincoln, United Kingdom/i],
    ['Senior Engineer — Digital Tools & Instrumentation (R&D)', /Senior Engineer\s*—\s*Digital Tools & Instrumentation \(R&D\)/i],
    ['Postdoctoral Researcher — Mechanical Engineering', /Postdoctoral Researcher\s*—\s*Mechanical Engineering/i],
    ['Gas-Turbine Performance & Diagnostics Researcher / Platform Developer', /Gas-Turbine Performance & Diagnostics Researcher\s*\/\s*Platform Developer/i],
    ['Built the PYTHIA test-data interface', /Built the PYTHIA test-data interface/i],
  ],
  'zh/cv/index.html': [
    ['专注燃气轮机总体设计', /专注燃气轮机总体设计/],
    ['现于英国林肯工作', /现于英国林肯工作/],
    ['高级工程师——数字工具与测量技术（研发）', /高级工程师——数字工具与测量技术（研发）/],
    ['机械工程博士后研究员', /机械工程博士后研究员/],
    ['燃气轮机性能与故障诊断研究员 / 平台开发工程师', /燃气轮机性能与故障诊断研究员\s*\/\s*平台开发工程师/],
    ['开发 PYTHIA 试验数据接口', /开发 PYTHIA 试验数据接口/],
  ],
};

const staleHomepageCopy = {
  'index.html': [
    ['Senior Engineer — Digital Tools & Instrumentation (R&D)', /Senior Engineer\s*[—-]\s*Digital Tools & Instrumentation\s*\(R&D\)/i],
    ['Postdoctoral Researcher — Mechanical Engineering', /Postdoctoral Researcher\s*[—-]\s*Mechanical Engineering/i],
    ['Gas-Turbine Performance & Diagnostics Researcher / Platform Developer', /Gas-Turbine Performance\s*&\s*Diagnostics Researcher\s*\/\s*Platform Developer/i],
    ['whole-engine design for gas turbines', /whole-engine design for gas turbines/i],
    ['Contributed performance, diagnostic and prognostic algorithms', /Contributed performance, diagnostic and prognostic algorithms/i],
  ],
  'zh/index.html': [
    ['高级工程师——数字工具与测量技术（研发）', /高级工程师\s*——\s*数字工具与测量技术（研发）/],
    ['机械工程博士后研究员', /机械工程博士后研究员/],
    ['燃气轮机性能与故障诊断研究员 / 平台开发工程师', /燃气轮机性能与故障诊断研究员\s*\/\s*平台开发工程师/],
    ['专注燃气轮机总体设计', /专注燃气轮机总体设计/],
  ],
};

for (const [page, patterns] of Object.entries(staleHomepageCopy)) {
  const html = (pageHtml.get(page) || '').replace(/&amp;/gi, '&');
  for (const [label, pattern] of patterns) {
    if (pattern.test(html)) errors.push(`${page} contains retired homepage copy: ${label}`);
  }

  const hero = sectionSlice(html, 'top', ['about']);
  const retiredPrimaryIdentity = page === 'index.html'
    ? 'Thermal Power & Propulsion Systems'
    : '热能动力与推进系统';
  if (includesNormalisedPhrase(normaliseVisibleText(hero), retiredPrimaryIdentity)) {
    errors.push(`${page} still uses ${retiredPrimaryIdentity} as a primary Hero identity`);
  }
}

for (const [page, patterns] of Object.entries(staleCvCopy)) {
  const html = (pageHtml.get(page) || '').replace(/&amp;/gi, '&');
  for (const [label, pattern] of patterns) {
    if (pattern.test(html)) errors.push(page + ' contains retired Public CV copy: ' + label);
  }

  const firstCapability = normaliseVisibleText(classElementHtml(html, 'cv-capability-card', 'article'));
  const retiredCapability = page === 'cv/index.html'
    ? 'Thermal power & propulsion systems'
    : '热能动力与推进系统';
  if (includesNormalisedPhrase(firstCapability, retiredCapability)) {
    errors.push(page + ' first Capability card still uses retired title: ' + retiredCapability);
  }
}

const pathwayRequirements = {
  'index.html': {
    steps: ['Define the question', 'Acquire and qualify the evidence', 'Validate the model and interpretation', 'Decide, deploy and monitor'],
    distinction: ['evidence is fit for the intended decision', 'model and interpretation are supported by that qualified evidence', 'return upstream'],
  },
  'zh/index.html': {
    steps: ['定义工程问题', '获取并评价工程证据', '验证模型与解释', '决策、部署与监测'],
    distinction: ['证据是否适用于预期决策', '模型与解释是否得到这些合格证据的支持', '返回上游'],
  },
};

for (const [page, requirement] of Object.entries(pathwayRequirements)) {
  const html = pageHtml.get(page) || '';
  const text = normaliseVisibleText(html);
  requireOrderedText(page, text, requirement.steps, 'the ordered four-step data-to-decision pathway');
  if (requirement.distinction.some((phrase) => !includesNormalisedPhrase(text, phrase))) {
    errors.push(`${page} is missing the complete two-gate explanation and upstream return for evidence quality and interpretation validity`);
  }
}

const homepageStructure = {
  'index.html': {
    expertiseTitle: 'Whole-engine performance',
    experienceOrder: ['Senior Engineer – R&D', 'Postdoctoral Researcher', 'Researcher – Aero-Engine Performance & Diagnostics', 'XAG'],
    researchHeadings: ['Selected publications', 'Patents and published applications'],
    contactCopy: ['Discuss a whole-engine, R&D or intelligent-engineering opportunity.', 'Chief Engineer, Principal Expert and senior R&D leadership opportunities'],
    languageRoute: '/zh/',
  },
  'zh/index.html': {
    expertiseTitle: '燃气轮机整机性能',
    experienceOrder: ['高级工程师（研发）', '博士后研究员', '航空发动机性能与诊断研究员', '极飞科技（XAG）'],
    researchHeadings: ['精选论文', '专利与公开专利申请'],
    contactCopy: ['沟通整机、研发或智能工程方向的机会。', '整机总工程师、首席专家及高级研发技术领导岗位'],
    languageRoute: '/',
  },
};

for (const page of homePages) {
  const html = pageHtml.get(page) || '';
  const structure = homepageStructure[page];
  const sectionLabelCount = countClass(html, 'section-label');
  const hero = sectionSlice(html, 'top', ['about']);
  const expertise = sectionSlice(html, 'expertise', ['work']);
  const experience = sectionSlice(html, 'experience', ['research']);
  const research = sectionSlice(html, 'research', ['framework', 'beyond']);
  const contact = sectionSlice(html, 'contact');
  const expertiseCards = [...expertise.matchAll(/<article\b(?=[^>]*\bclass=["'][^"']*\bexpertise-card\b[^"']*["'])[^>]*>[\s\S]*?<\/article>/gi)]
    .map((match) => match[0]);

  if (sectionLabelCount !== 8) {
    errors.push(`${page} must expose exactly eight unnumbered main-section labels, including the engineering framework`);
  }
  if (/\bcard-number\b/.test(html)) {
    errors.push(`${page} must not use decorative numbering in Expertise cards`);
  }
  if (expertiseCards.length !== 6) {
    errors.push(`${page} must retain exactly six Expertise cards`);
  }
  if (!expertiseCards[0] || !hasClass(expertiseCards[0], 'expertise-featured')
    || !includesNormalisedPhrase(normaliseVisibleText(expertiseCards[0]), structure.expertiseTitle)) {
    errors.push(`${page} first Expertise card must be the featured whole-engine capability`);
  }
  if (/class=["']section-index["'][^>]*>\s*0[1-7]\s*\//i.test(html)) {
    errors.push(`${page} still exposes numbered 01–07 main-section labels`);
  }
  if (countClass(hero, 'hero-strengths') !== 1) {
    errors.push(`${page} must contain exactly one .hero-strengths dual-strength card in the Hero`);
  }
  if (countClass(hero, 'strength-panel') !== 2) {
    errors.push(`${page} Hero dual-strength card must contain exactly two .strength-panel elements`);
  }
  requireOrderedText(page, normaliseVisibleText(experience), structure.experienceOrder, 'equivalent Experience role order');
  if (countClass(research, 'research-group') !== 2) {
    errors.push(`${page} Research section must contain exactly two .research-group elements`);
  }
  requireOrderedText(page, normaliseVisibleText(research), structure.researchHeadings, 'Publications and Patents research groups');

  const researchIndex = html.search(/<section\b[^>]*\bid=["']research["']/i);
  const pathwayIndex = html.search(/\bclass=["'][^"']*\bdecision-framework\b/i);
  const beyondIndex = html.search(/<section\b[^>]*\bid=["']beyond["']/i);
  const journeyIndex = html.search(/\bclass=["'][^"']*\bjourney-section\b/i);
  if ([researchIndex, pathwayIndex, beyondIndex].some((index) => index === -1)
    || !(researchIndex < pathwayIndex && pathwayIndex < beyondIndex)) {
    errors.push(`${page} must place the engineering decision framework after Research and before Beyond Engineering`);
  }
  if (journeyIndex !== -1 && journeyIndex < researchIndex) {
    errors.push(`${page} must keep personal journey content after the professional Research evidence`);
  }
  for (const phrase of structure.contactCopy) {
    if (!includesNormalisedPhrase(normaliseVisibleText(contact), phrase)) {
      errors.push(`${page} Contact section is missing senior-role opportunity positioning: ${phrase}`);
    }
  }

  const languageSwitch = [...html.matchAll(/<a\b(?=[^>]*\bclass=["'][^"']*\blanguage-switch\b[^"']*["'])[^>]*>/gi)][0]?.[0] || '';
  if (attributeValue(languageSwitch, 'href') !== structure.languageRoute) {
    errors.push(`${page} language switch must route to ${structure.languageRoute}`);
  }
  if (hasClass(html, 'work-card-art') || hasClass(html, 'work-symbol')) {
    errors.push(`${page} must use real evidence assets instead of handcrafted work-card illustrations`);
  }
  if (hasClass(html, 'personal-story')) {
    errors.push(`${page} must keep personal-life imagery after the professional evidence sections`);
  }
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
  for (const requiredImage of [
    'polimi-gear-test-bench-1469',
    'xag-p20-cfd-928',
    'xag-evtol-study-public-414',
    'yang-polimiride-family-2048',
    'tennis-racket-collection-1536',
  ]) {
    if (!html.includes(requiredImage)) errors.push(`${page} is missing required media placement: ${requiredImage}`);
  }
  if (!hasClass(html, 'journey-milestone') || !hasClass(html, 'beyond-gallery')) {
    errors.push(`${page} is missing the paper-aircraft milestone or Beyond the Lab gallery`);
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

#!/usr/bin/env node
import { chromium } from 'playwright';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK_DIR = join(ROOT, 'src/content/work');
const SCREENSHOTS_DIR = join(ROOT, 'public/screenshots');
const VIEWPORT = { width: 640, height: 480 };
const DEVICE_SCALE = 2;

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const k = line.slice(0, colon).trim();
    const v = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    out[k] = v;
  }
  return out;
}

await mkdir(SCREENSHOTS_DIR, { recursive: true });

const files = await readdir(WORK_DIR);
const entries = [];

for (const file of files) {
  if (!file.endsWith('.md')) continue;
  const content = await readFile(join(WORK_DIR, file), 'utf8');
  const fm = parseFrontmatter(content);
  if (fm.spotlight === 'true' && fm.external) {
    entries.push({ slug: file.replace('.md', ''), url: fm.external, github: fm.github || null });
  }
}

if (!entries.length) {
  console.log('No spotlight entries with external URLs.');
  process.exit(0);
}

const browser = await chromium.launch();
const context = await browser.newContext({ deviceScaleFactor: DEVICE_SCALE });
const page = await context.newPage();
await page.setViewportSize(VIEWPORT);

for (const { slug, url } of entries) {
  console.log(`→ ${slug}: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, `${slug}.png`),
    });
    console.log(`  ✓ saved screenshots/${slug}.png`);
  } catch (err) {
    console.error(`  ✗ failed: ${err.message}`);
  }
}

await browser.close();

// Update commit date cache
const ghHeaders = {
  'Accept': 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }),
};
const cachePath = join(ROOT, 'src/data/commit-cache.json');
const cache = JSON.parse(await readFile(cachePath, 'utf8').catch(() => '{}'));

for (const { github } of entries) {
  if (!github) continue;
  try {
    const res = await fetch(`https://api.github.com/repos/${github}/commits?per_page=1`, { headers: ghHeaders });
    if (!res.ok) {
      console.warn(`  ✗ GitHub API ${res.status} for ${github} — skipping cache update`);
      continue;
    }
    const [commit] = await res.json();
    const date = commit?.commit?.committer?.date;
    if (date) {
      cache[github] = date;
      console.log(`  ✓ cached commit date for ${github}`);
    }
  } catch {
    console.warn(`  ✗ could not fetch commit date for ${github}`);
  }
}

await mkdir(dirname(cachePath), { recursive: true });
await writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n');
console.log('commit-cache.json updated');

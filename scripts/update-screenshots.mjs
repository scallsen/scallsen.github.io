#!/usr/bin/env node
import { chromium } from 'playwright';
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORK_DIR = join(ROOT, 'src/content/work');
const SCREENSHOTS_DIR = join(ROOT, 'public/screenshots');
const VIEWPORT = { width: 1280, height: 800 };

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
    entries.push({ slug: file.replace('.md', ''), url: fm.external });
  }
}

if (!entries.length) {
  console.log('No spotlight entries with external URLs.');
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize(VIEWPORT);

for (const { slug, url } of entries) {
  console.log(`→ ${slug}: ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.screenshot({
      path: join(SCREENSHOTS_DIR, `${slug}.png`),
      clip: { x: 0, y: 0, ...VIEWPORT },
    });
    console.log(`  ✓ saved screenshots/${slug}.png`);
  } catch (err) {
    console.error(`  ✗ failed: ${err.message}`);
  }
}

await browser.close();

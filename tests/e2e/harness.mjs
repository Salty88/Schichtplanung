// Startet index.html in Chromium (ohne Server, per file://) und sammelt Prüfergebnisse.
import { chromium } from 'playwright-core';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CANDIDATES = [
  process.env.CHROMIUM,
  '/opt/pw-browsers/chromium',
  '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].filter(Boolean);
const CHROMIUM = CANDIDATES.find((p) => fs.existsSync(p));

let failed = 0;
export function check(name, ok, detail = '') {
  if (ok) console.log(`  ok     ${name}`);
  else {
    failed++;
    console.log(`  FEHLER ${name}${detail ? ` (${detail})` : ''}`);
  }
}

export async function startApp({ viewport = { width: 1300, height: 900 } } = {}) {
  const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
  const page = await browser.newPage({ viewport, locale: 'de-DE' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
  await page.waitForSelector('.grid-wrap');
  return { browser, page, errors };
}

export async function finish(app, title) {
  check('Keine Skriptfehler', app.errors.length === 0, app.errors.join(' | '));
  await app.browser.close();
  console.log(failed ? `${title}: ${failed} Fehler` : `${title}: alles in Ordnung`);
  if (failed) process.exit(1);
}

export const stats = (page) => page.$$eval('.stats .stat b', (n) => n.map((x) => Number(x.textContent)));

// Die Auswertung pro Mitarbeiter ist standardmäßig aus (§ 87 Abs. 1 Nr. 6 BetrVG) und wird hier eingeschaltet.
export async function enableEval(page) {
  if (await page.$('[data-act=tab][data-v=ev]')) return;
  await page.click('[data-act=tab][data-v=set]');
  await page.check('#evon');
}

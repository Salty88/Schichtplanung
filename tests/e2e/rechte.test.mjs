// Rechte: Wochenschicht ändern, Admin-PIN, Ansichtsdatei, Betrachter in claude.ai
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const row = (id, w) => page.$$eval(`td.d[data-id=${id}][data-w="${w}"]`, (n) => n.slice(0, 5).map((x) => x.textContent).join(''));
const tabs = () => page.$$eval('.tab', (n) => n.map((x) => x.dataset.v).join(','));
try {
  // Wochenschicht ändern: fester Mitarbeiter und Springer, mit Rückmeldung
  await page.click('td.d[data-id=a1][data-w="2"][data-d="2"]');
  await page.click('[data-act=scope][data-v=woche]');
  await page.click('[data-act=setc][data-c=F]');
  check('Wochenschicht A1 KW 3 auf Früh', (await row('a1', 2)) === 'FFFFF', await row('a1', 2));
  check('Rückmeldung nach Schichtänderung', (await page.textContent('.msg')).includes('Frühschicht in KW 3'));
  await page.click('td.d[data-id=s1][data-w="2"][data-d="0"]');
  await page.click('[data-act=scope][data-v=woche]');
  await page.click('[data-act=setc][data-c=N]');
  check('Wochenschicht Springer 1 KW 3 auf Nacht', (await row('s1', 2)) === 'NNNNN', await row('s1', 2));

  // Admin-PIN setzen, speichern, neu laden: startet in der Ansicht
  await page.click('[data-act=tab][data-v=set]');
  await page.fill('#pin1', '4711');
  await page.fill('#pin2', '4711');
  await page.click('[data-act=pin-set]');
  await page.waitForFunction(() => document.querySelector('.msg') && document.querySelector('.msg').textContent.includes('PIN gesetzt'));
  await page.click('[data-act=save]');
  await page.reload();
  await page.waitForSelector('.grid-wrap');
  check('Mit PIN: nur Jahresplan und Auswertung', (await tabs()) === 'plan,ev', await tabs());
  check('Mit PIN: kein Speichern-Knopf', (await page.$$('[data-act=save]')).length === 0);
  await page.click('td.d[data-id=a2][data-w="5"][data-d="1"]');
  check('Ansicht: Tag-Fenster ohne Änderungsknöpfe', (await page.$$('.sheet [data-act=setc], .sheet [data-act=setd]')).length === 0);
  await page.keyboard.press('Escape');
  await page.click('[data-act=unlock]');
  await page.fill('#pin-in', '0000');
  await page.click('[data-act=pin-ok]');
  await page.waitForSelector('.sheet .msg.bad');
  check('Falsche PIN wird abgelehnt', (await tabs()) === 'plan,ev');
  await page.fill('#pin-in', '4711');
  await page.click('[data-act=pin-ok]');
  await page.waitForFunction(() => document.querySelectorAll('.tab').length > 2);
  check('Richtige PIN schaltet Bearbeiten frei', (await tabs()).includes('ma'));
  check('Gespeicherte Änderung ist noch da', (await row('a1', 2)) === 'FFFFF');

  // Ansichtsdatei erstellen und öffnen
  await page.click('[data-act=tab][data-v=set]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=snap]')]);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sp-')), 'ansicht.html');
  await dl.saveAs(file);
  const vctx = await app.browser.newContext();
  const v = await vctx.newPage();
  await v.goto(pathToFileURL(file).href);
  await v.waitForSelector('.grid-wrap');
  check('Ansichtsdatei: nur lesen', (await v.textContent('.pill.role')).includes('Ansichtsdatei'));
  check('Ansichtsdatei: kein Freischalten', (await v.$$('[data-act=unlock]')).length === 0);
  check('Ansichtsdatei: Plan enthält die Änderung', (await v.$$eval('td.d[data-id=a1][data-w="2"]', (n) => n.slice(0, 5).map((x) => x.textContent).join(''))) === 'FFFFF');
  check('Ansichtsdatei: Drucken möglich', (await v.$$('[data-act=print]')).length === 1);
  await vctx.close();

  // Betrachter in claude.ai (canEdit = false)
  const c2 = await app.browser.newContext();
  await c2.addInitScript(() => { window.claude = { use: (n) => Promise.resolve(n === 'user' ? { canEdit: () => Promise.resolve(false) } : null) }; });
  const g = await c2.newPage();
  await g.goto(page.url());
  await g.waitForSelector('.grid-wrap');
  await g.waitForFunction(() => document.querySelectorAll('.tab').length === 2);
  check('claude.ai-Betrachter: nur Ansicht', (await g.textContent('.pill.role')) === 'Nur Ansicht');
  check('claude.ai-Betrachter: kein Freischalten ohne Rechte', (await g.$$('[data-act=unlock]')).length === 0);
  await c2.close();
} finally {
  await finish(app, 'Rechte');
}

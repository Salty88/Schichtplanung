// Infotexte: Vorlage, eigener Text, Tag/Woche, Ausrufezeichen, Infobox beim Überfahren, Übersicht und Druck
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const ctx = page.context();
try {
  // Info für einen Tag aus einer Vorlage
  await page.click('td.d[data-id=a2][data-w="4"][data-d="2"]');
  await page.click('.tpl[data-act=tpl-use][data-i="0"]');
  check('Vorlage füllt das Textfeld', (await page.inputValue('#note-in')) === 'Schulung extern');
  await page.click('[data-act=note-set]');
  check('Ausrufezeichen am Tag', (await page.$$('td.d.hasnote[data-id=a2][data-w="4"][data-d="2"] .nb')).length === 1);
  check('Nur dieser Tag markiert', (await page.$$('td.d.hasnote[data-id=a2]')).length === 1);
  check('Schichtkürzel bleibt erhalten', ['F', 'S', 'N'].includes(await page.$eval('td.d[data-id=a2][data-w="4"][data-d="2"]', (e) => e.firstChild.textContent)));

  // Infobox beim Überfahren
  await page.hover('td.d[data-id=a2][data-w="4"][data-d="2"]');
  await page.waitForSelector('.tip');
  check('Infobox zeigt den Text', (await page.textContent('.tip')).includes('Schulung extern'));
  await page.mouse.move(5, 5);
  check('Infobox verschwindet wieder', (await page.$$('.tip')).length === 0);

  // Eigener Text als Vorlage merken und für die ganze Woche setzen
  await page.click('td.d[data-id=b1][data-w="6"][data-d="0"]');
  await page.click('[data-act=scope][data-v=woche]');
  await page.fill('#note-in', 'Einweisung Anlage 3');
  await page.click('[data-act=tpl-add]');
  check('Neue Vorlage gespeichert', (await page.$$eval('.tpl[data-act=tpl-use]', (n) => n.map((x) => x.textContent))).includes('Einweisung Anlage 3'));
  await page.click('[data-act=note-set]');
  check('Ganze Woche markiert (Mo bis Fr)', (await page.$$('td.d.hasnote[data-id=b1][data-w="6"]')).length === 5);
  check('Rückmeldung nennt 5 Tage', (await page.textContent('.msg')).includes('5 Tage'));

  // Wochenansicht: Ausrufezeichen und Liste in der Infobox
  await page.click('[data-act=view][data-v=wochen]');
  await page.hover('td.c[data-id=b1][data-w="6"]');
  await page.waitForSelector('.tip li');
  check('Wochenansicht: Infobox listet 5 Tage', (await page.$$('.tip li')).length === 5);
  await page.click('[data-act=view][data-v=tage]');

  // Jahresübersicht: sichtbar, aber nicht änderbar
  await page.click('[data-act=area][data-v=uebersicht]');
  check('Übersicht: Ausrufezeichen sichtbar', (await page.$$('td.d.hasnote')).length === 6);
  await page.click('td.d[data-id=a2][data-w="4"][data-d="2"]');
  check('Übersicht: Info im Fenster lesbar, ohne Bearbeiten', (await page.textContent('.sheet .infobox')).includes('Schulung extern') && (await page.$$('#note-in')).length === 0);
  await page.keyboard.press('Escape');
  await page.click('[data-act=area][data-v=planung]');

  // Druck: Ausrufezeichen und Liste
  await page.click('[data-act=print]');
  await page.selectOption('#prm', '1');
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-act=printgo]')]);
  await pop.waitForLoadState();
  const info = await pop.evaluate(() => ({ sup: document.querySelectorAll('td sup').length, li: [...document.querySelectorAll('.notes li')].map((x) => x.textContent) }));
  await pop.close();
  check('Druck Februar: Ausrufezeichen an 6 Tagen', info.sup === 6, String(info.sup));
  check('Druck Februar: Liste mit den Infos', info.li.length === 6 && info.li.some((x) => x.includes('Einweisung Anlage 3')), info.li.join(' | '));

  // Info löschen
  await page.click('td.d[data-id=a2][data-w="4"][data-d="2"]');
  await page.click('[data-act=note-del]');
  check('Info gelöscht', (await page.$$('td.d.hasnote[data-id=a2]')).length === 0);
} finally {
  await finish(app, 'Infotexte');
}

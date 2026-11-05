// Freie Farben für Schichten und eigene Abwesenheitsarten
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const cellStyle = (sel) => page.$eval(sel, (e) => { const c = getComputedStyle(e); return c.backgroundColor + '|' + c.color; });
try {
  // Frühschicht weiß mit schwarzer Schrift über die Vorlage „Weiß“
  await page.click('[data-act=tab][data-v=sch]');
  await page.click('[data-act=preset][data-k=s][data-i="0"][title="Weiß"]');
  check('Vorlage „Weiß“ setzt Fläche und Schrift', (await page.inputValue('#scb-0')) === '#ffffff' && (await page.inputValue('#scf-0')) === '#1b2433');
  // Schriftfarbe frei wählbar
  await page.$eval('#scf-0', (e) => { e.value = '#ff0000'; e.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.click('[data-act=tab][data-v=plan]');
  const f = await page.$eval('td.d[data-id=a3][data-w="0"][data-d="0"]', (e) => e.textContent);
  check('A3 hat in KW 1 Frühschicht', f === 'F', f);
  check('Plan zeigt weiße Fläche mit roter Schrift', (await cellStyle('td.d[data-id=a3][data-w="0"][data-d="0"]')) === 'rgb(255, 255, 255)|rgb(255, 0, 0)');

  // Neue Abwesenheit „Schulung“ mit Kürzel SCH
  await page.click('[data-act=tab][data-v=ab]');
  check('Reiter Abwesenheiten zeigt GLZ, Urlaub, Krank', (await page.$$('[data-act=abw-del]')).length === 3);
  await page.click('[data-act=abw-add]');
  await page.fill('#an2-3', 'Schulung');
  await page.press('#an2-3', 'Tab');
  await page.fill('#ac-3', 'sch');
  await page.press('#ac-3', 'Tab');
  check('Kürzel wird groß geschrieben', (await page.inputValue('#ac-3')) === 'SCH');
  await page.fill('#ac-3', 'F');
  await page.press('#ac-3', 'Tab');
  check('Kürzel einer Schicht wird abgelehnt', (await page.inputValue('#ac-3')) === 'SCH' && (await page.textContent('.msg')).includes('vergeben'));

  // Schulung eine ganze Woche eintragen
  await page.click('[data-act=tab][data-v=plan]');
  await page.click('td.d[data-id=b1][data-w="5"][data-d="1"]');
  check('Dialog bietet „Schulung“ an', (await page.textContent('.sheet')).includes('Schulung'));
  await page.click('[data-act=scope][data-v=woche]');
  await page.click('[data-act=setd][data-c=SCH]');
  const sch = await page.$$eval('td.d[data-id=b1][data-w="5"]', (n) => n.map((x) => x.textContent).join(''));
  check('Schulung Mo bis Fr eingetragen', sch === 'SCHSCHSCHSCHSCH', sch);
  check('Legende zeigt Schulung', (await page.textContent('.legend')).includes('Schulung'));

  // Abwesenheit in Verwendung lässt sich nicht löschen, Auswertung zählt sie
  await page.click('[data-act=tab][data-v=ab]');
  check('Verwendete Abwesenheit nicht löschbar', await page.$eval('[data-act=abw-del][data-i="3"]', (e) => e.disabled));
  await page.click('[data-act=tab][data-v=ev]');
  const head = await page.$$eval('table.ev thead th', (n) => n.map((x) => x.textContent));
  check('Auswertung hat eine Spalte Schulung', head.some((h) => h.includes('Schulung')));
  const b1 = await page.$$eval('table.ev tbody tr', (trs) => trs.map((tr) => [...tr.children].map((td) => td.textContent.trim())).find((r) => r[0] === 'B1'));
  const col = head.findIndex((h) => h.includes('Schulung'));
  check('Auswertung: B1 hat 5 Tage Schulung', b1 && b1[col] === '5', b1 && b1.join('|'));
} finally {
  await finish(app, 'Farben und Abwesenheiten');
}

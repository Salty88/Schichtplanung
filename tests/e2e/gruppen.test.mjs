// Gruppenbaum: Werk › Halle A › Gruppe 1 / Gruppe 2, eigene Anlagen und Springer je Gruppe, Zusammenschau
import { startApp, check, finish, stats } from './harness.mjs';

const app = await startApp();
const { page } = app;
const lastId = (sel) => page.$$eval(sel, (n) => n[n.length - 1].id.slice(3));
try {
  await page.click('[data-act=tab][data-v=gr]');
  check('Bestehender Plan liegt in „Gruppe 1“', (await page.inputValue('#gn-g1')) === 'Gruppe 1');

  await page.click('[data-act=gr-add][data-parent=""]');
  const werk = await lastId('.tnode input[type=text]');
  await page.fill('#gn-' + werk, 'Werk');
  await page.press('#gn-' + werk, 'Tab');
  await page.click(`[data-act=gr-add][data-parent="${werk}"]`);
  const halle = await lastId('.tnode input[type=text]');
  await page.fill('#gn-' + halle, 'Halle A');
  await page.press('#gn-' + halle, 'Tab');
  await page.selectOption('#gp-g1', halle);
  await page.click(`[data-act=gr-add][data-parent="${halle}"]`);
  const ids = await page.$$eval('.tnode input[type=text]', (n) => n.map((x) => x.id.slice(3)));
  const g2 = ids.find((x) => ![werk, halle, 'g1'].includes(x));
  await page.fill('#gn-' + g2, 'Gruppe 2');
  await page.press('#gn-' + g2, 'Tab');
  await page.fill('#ga-' + g2, '2');
  await page.press('#ga-' + g2, 'Tab');

  const tree = await page.$$eval('.tnode', (n) => n.map((x) => x.style.getPropertyValue('--d') + ':' + x.querySelector('input').value));
  check('Baum: Werk › Halle A › Gruppe 1 + Gruppe 2', tree.join('|') === '0:Werk|1:Halle A|2:Gruppe 1|2:Gruppe 2', tree.join('|'));
  check('Gruppe mit Inhalt lässt sich nicht löschen', await page.$eval(`[data-act=gr-del][data-id="${werk}"]`, (e) => e.disabled));
  check('Eine Gruppe kann nicht unter sich selbst liegen', !(await page.$$eval(`#gp-${werk} option`, (o) => o.map((x) => x.value))).includes(werk));

  // Gruppe 2: drei Leute, einer davon Springer
  await page.click(`[data-act=gopen][data-id="${g2}"]`);
  await page.click('[data-act=tab][data-v=ma]');
  for (let i = 0; i < 3; i++) await page.click('[data-act=ma-add]');
  const mids = await page.$$eval('[data-act=ma-del]', (n) => n.map((x) => x.dataset.id));
  check('Neue Mitarbeiter landen in der gewählten Gruppe', mids.length === 3, String(mids.length));
  for (const id of mids) await page.selectOption('#r-' + id, 'r3');
  await page.selectOption('#p-' + mids[1], '1');
  await page.check('#s-' + mids[2]);

  await page.click('[data-act=tab][data-v=plan]');
  check('Gruppe 2: Grenze sind ihre 2 Anlagen', (await page.textContent('.stats .stat')).includes('mehr als 2'));
  const [over2] = await stats(page);
  check('Gruppe 2: keine Überbelegung', over2 === 0, String(over2));

  // Halle A zeigt beide Gruppen zusammen
  await page.click('[data-act=gpick]');
  await page.click(`[data-act=gsel][data-id="${halle}"]`);
  check('Halle A: 20 Mitarbeiter, 8 Anlagen', (await page.textContent('.ginfo')).startsWith('20 Mitarbeiter · 8 Anlagen'));
  const secs = await page.$$eval('tr.sec .secname', (n) => n.map((x) => x.textContent));
  check('Halle A: beide Gruppen als Abschnitte', secs.length === 2 && secs[1].endsWith('Gruppe 2'), secs.join(' / '));
  const [overAll] = await stats(page);
  check('Halle A: keine Überbelegung', overAll === 0, String(overAll));

  await page.click('[data-act=tab][data-v=ev]');
  check('Auswertung umfasst beide Gruppen', (await page.$$('table.ev tbody tr')).length === 21);
} finally {
  await finish(app, 'Gruppen');
}

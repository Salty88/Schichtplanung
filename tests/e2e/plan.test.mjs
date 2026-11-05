// Jahresplan: Kalender, Besetzung, Springer-Ausgleich, Abwesenheiten, Namen, eigene Schichten, Auswertung
import { startApp, check, finish, stats } from './harness.mjs';

const app = await startApp();
const { page } = app;
try {
  check('Planjahr 2027 hat 52 KW', (await page.textContent('.brand small')).includes('52 Kalenderwochen'));
  check('Tagesansicht: 52 x 7 Tagesspalten', (await page.$$eval('tr.dy th', (n) => n.length)) === 364);
  check('KW 1/2027 beginnt am Montag, 4. Januar', (await page.$eval('tr.dy th', (n) => n.textContent)) === 'Mo4');

  // Zeitleiste: Monate mit ihren KWs (KW gehört zum Monat ihres Donnerstags)
  const months = await page.$$eval('.timeline .mon', (n) => n.map((m) => [m.querySelector('.mname').textContent, [...m.querySelectorAll('.kw')].map((k) => +k.textContent)]));
  check('Zeitleiste: 12 Monate', months.length === 12, String(months.length));
  check('Zeitleiste: alle 52 KWs genau einmal', months.flatMap((m) => m[1]).join(',') === Array.from({ length: 52 }, (_, i) => i + 1).join(','));
  check('Zeitleiste: KW 26 gehört zum Juli, KW 13 zum April', months[6][1][0] === 26 && months[3][1][0] === 13, `${months[6][1]} / ${months[3][1]}`);
  await page.click('.kw[data-w="26"]');
  await page.waitForFunction(() => document.querySelector('.kw.vis')?.textContent === '27', null, { timeout: 5000 }).catch(() => {});
  check('Tipp auf KW 27 springt dorthin und markiert Juli', (await page.$eval('.kw.vis', (e) => e.textContent)) === '27' && (await page.$eval('.mon.vis .mname', (e) => e.textContent)) === 'Jul');

  let [over, under] = await stats(page);
  check('Keine Woche mit mehr als 6 in einer Schicht', over === 0, String(over));
  check('Keine ungleich verteilte Woche', under === 0, String(under));
  const fair = await page.$$eval('.spfair .stat', (n) => n.map((x) => Number(x.textContent.match(/(\d+) Sprünge/)[1])));
  check('Springer-Sprünge fair verteilt (Unterschied höchstens 1)', Math.max(...fair) - Math.min(...fair) <= 1, fair.join(','));

  // Urlaub über zwei ganze Wochen: Springer gleichen aus
  await page.click('td.d[data-id=a1][data-w="29"][data-d="0"]');
  await page.fill('#bisd', '2027-08-06');
  await page.click('[data-act=setd][data-c=U]');
  check('Urlaub nur Mo bis Fr eingetragen', (await page.$$('td.d.ab-U[data-id=a1]')).length === 10);
  [over, under] = await stats(page);
  check('Mit Urlaub weiterhin keine Überbelegung', over === 0 && under === 0, `${over}/${under}`);

  // Einzelner Krankheitstag
  await page.click('td.d[data-id=a2][data-w="2"][data-d="1"]');
  await page.click('[data-act=setd][data-c=K]');
  check('Krankheitstag sichtbar', (await page.textContent('td.d[data-id=a2][data-w="2"][data-d="1"]')) === 'K');

  // Name im Plan ändern
  await page.click('[data-act=name][data-id=s2]');
  await page.fill('#nm-edit', 'Erika Beispiel');
  await page.keyboard.press('Enter');
  check('Name im Plan geändert', (await page.textContent('[data-act=name][data-id=s2] b')).startsWith('Erika Beispiel'));

  // Eigene Schicht, Schichtmodell und Mitarbeiter
  await page.click('[data-act=tab][data-v=sch]');
  check('Frühschicht 05:00 bis 13:05', (await page.inputValue('#sv-0')) === '05:00' && (await page.inputValue('#sb-0')) === '13:05');
  await page.click('[data-act=sch-add]');
  await page.fill('#sn-3', 'Normalarbeitszeit');
  await page.press('#sn-3', 'Tab');
  await page.click('[data-act=tab][data-v=rh]');
  await page.click('[data-act=rh-add]');
  const rid = await page.$$eval('[data-act=rh-del]', (n) => n[n.length - 1].dataset.id);
  await page.click(`[data-act=rh-push][data-id=${rid}][data-c=T]`);
  await page.click(`[data-act=rh-rm][data-id=${rid}][data-i="0"]`);
  await page.click('[data-act=tab][data-v=ma]');
  await page.click('[data-act=ma-add]');
  const mid = await page.$$eval('[data-act=ma-del]', (n) => n[n.length - 1].dataset.id);
  await page.selectOption('#r-' + mid, rid);

  // Auswertung
  await page.click('[data-act=tab][data-v=ev]');
  const rows = await page.$$eval('table.ev tbody tr', (trs) => trs.map((tr) => [...tr.children].map((td) => td.textContent.trim())));
  const a1 = rows.find((r) => r[0] === 'A1');
  check('Auswertung: A1 hat 10 Urlaubstage', a1 && a1[6] === '10', a1 && a1.join('|'));
  const neu = rows.find((r) => r[0] === 'Neu');
  check('Auswertung: neue Person 52 Wochen Normalarbeitszeit', neu && neu[5].startsWith('52'), neu && neu.join('|'));
  check('Auswertung: Summenzeile vorhanden', rows[rows.length - 1][0] === 'Summe');

  // Handybreite: kein seitliches Scrollen der Seite
  await page.setViewportSize({ width: 400, height: 850 });
  await page.click('[data-act=tab][data-v=plan]');
  check('Kein seitliches Scrollen bei 400 px', (await page.evaluate(() => document.documentElement.scrollWidth)) <= 400);
} finally {
  await finish(app, 'Jahresplan');
}

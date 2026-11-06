// Arbeitstage frei wählbar (Normal), Pausen, eigene Arbeitszeiten pro Tag und Stundenberechnung
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const days7 = (id, w) => page.$$eval(`td.d[data-id=${id}][data-w="${w}"]`, (n) => n.map((x) => x.firstChild ? x.firstChild.textContent : '·').join(''));
const evalCell = (name, col) => page.$$eval('table.ev tr', (rows, [name, col]) => {
  const head = [...rows[0].children].map((c) => c.textContent.replace(/­/g, ''));
  const i = head.findIndex((h) => h.startsWith(col));
  const r = rows.find((x) => x.children[0] && x.children[0].textContent.startsWith(name));
  return r ? r.children[i].textContent : null;
}, [name, col]);
try {
  // Pause in der Schicht und Hinweis nach ArbZG
  await page.click('[data-act=tab][data-v=sch]');
  const card0 = () => page.textContent('.cards .card:nth-child(1)');
  check('Schicht F: netto 8:05 ohne Pause', (await card0()).includes('8:05 Std.'));
  check('Hinweis Mindestpause (ArbZG § 4)', (await card0()).includes('ArbZG § 4'));
  await page.fill('#sp-0', '30');
  await page.dispatchEvent('#sp-0', 'change');
  check('Mit 30 Min. Pause: netto 7:35, kein Hinweis', (await card0()).includes('7:35 Std.') && !(await card0()).includes('ArbZG'));

  // Arbeitstage Mo bis Do für den 6-Wochen-Rhythmus
  await page.click('[data-act=tab][data-v=rh]');
  await page.click('[data-act=wd][data-id=r6][data-d="4"]');
  check('Freitag abgewählt', (await page.getAttribute('[data-act=wd][data-id=r6][data-d="4"]', 'aria-pressed')) === 'false');
  check('Rückmeldung nennt 4 Arbeitstage', (await page.textContent('.msg')).includes('4 Arbeitstage (Mo bis Do)'));
  await page.click('[data-act=tab][data-v=plan]');
  const b = await days7('b1', 3);
  check('B1 arbeitet nur Mo bis Do', b.length === 4, b);
  check('Freitag ist frei und nicht antippbar', (await page.$$('td.d.we[data-id=b1]')).length === 0 && (await page.$$('td.d[data-id=b1][data-d="4"]')).length === 0);
  check('Gruppenkopf zeigt Mo bis Do', (await page.$$eval('tr.sec .secname', (n) => n.map((x) => x.textContent).join('|'))).includes('Mo bis Do'));

  // Urlaub ganze Woche: nur die 4 Arbeitstage
  await page.click('td.d[data-id=b1][data-w="12"][data-d="1"]');
  await page.click('[data-act=scope][data-v=woche]');
  check('Hinweis nennt Donnerstag als letzten Tag', (await page.textContent('.sheet')).includes('bis Donnerstag'));
  await page.click('[data-act=setd][data-c=U]');
  check('Urlaub Mo bis Do', (await days7('b1', 12)) === 'UUUU', await days7('b1', 12));

  // Eigene Zeiten pro Tag für die Wechselschicht (F und S)
  await page.click('[data-act=tab][data-v=rh]');
  await page.check('#rz-r2');
  check('Zeitentabelle erscheint', (await page.$$('table.zt tbody tr')).length === 5);
  await page.fill('#zr2F0v', '07:00'); await page.dispatchEvent('#zr2F0v', 'change');
  await page.fill('#zr2F0b', '15:30'); await page.dispatchEvent('#zr2F0b', 'change');
  await page.fill('#zr2F0p', '30'); await page.dispatchEvent('#zr2F0p', 'change');
  check('Montag netto 8:00', (await page.textContent('table.zt tbody tr:nth-child(1) td.std')) === '8:00');
  await page.click('[data-act=z-all][data-id=r2][data-c=F]');
  const fr = await page.$$eval('table.zt tbody td.std', (n) => n.map((x) => x.textContent));
  check('Auf alle Tage übertragen', fr.every((x) => x === '8:00'), fr.join(' '));
  check('Wochenstunden F 40:00', (await page.$eval('#rz-r2', (e) => e.closest('.zbox').querySelector('.hrs').textContent)).includes('40:00'));
  await page.click('[data-act=zc][data-id=r2][data-c=S]');
  await page.fill('#zr2S4b', '20:00'); await page.dispatchEvent('#zr2S4b', 'change');
  check('Freitag Spät kürzer: 6:55', (await page.textContent('table.zt tbody tr:nth-child(5) td.std')) === '6:55');

  // Tag-Fenster und Infobox zeigen Zeit und Stunden
  await page.click('[data-act=tab][data-v=plan]');
  const t = await page.getAttribute('td.d[data-id=c1][data-w="2"][data-d="0"]', 'title');
  check('Infobox am Tag nennt Zeit und Stunden', /bis .*Std\./.test(t), t);
  await page.click('td.d[data-id=c1][data-w="2"][data-d="0"]');
  check('Tag-Fenster zeigt Arbeitszeit', (await page.textContent('.sheet')).includes('Arbeitszeit:'));
  await page.keyboard.press('Escape');

  // Auswertung: Stunden pro Mitarbeiter
  const a1 = (await days7('a1', 0))[0];
  await page.click('[data-act=tab][data-v=ev]');
  await page.fill('#evv', '1'); await page.dispatchEvent('#evv', 'change');
  await page.fill('#evb', '1'); await page.dispatchEvent('#evb', 'change');
  const exp = { F: '37:55', S: '44:35', N: '35:00' }[a1];
  const got = await evalCell('A1', 'Arbeitsstunden');
  check('A1 KW 1: Stunden passen zur Schicht ' + a1, got === exp, got + ' statt ' + exp);
  await page.fill('#evv', '13'); await page.dispatchEvent('#evv', 'change');
  await page.fill('#evb', '13'); await page.dispatchEvent('#evb', 'change');
  check('B1 KW 13: 0 Arbeitsstunden, Urlaubsstunden gezählt', (await evalCell('B1', 'Arbeitsstunden')) === '0:00' && (await evalCell('B1', 'Abwesend')) !== '0:00', await evalCell('B1', 'Abwesend'));

  // Nach Neuladen bleibt alles erhalten
  await page.reload(); await page.waitForSelector('.grid-wrap');
  check('Nach Neuladen: Mo bis Do erhalten', (await days7('b1', 3)).length === 4);
} finally {
  await finish(app, 'Arbeitszeiten');
}

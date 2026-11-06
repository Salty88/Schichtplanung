// Zwei Bereiche (Jahresplanung, Jahresübersicht) und Conti-Schichtmodelle
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const days7 = (id, w) => page.$$eval(`td.d[data-id=${id}][data-w="${w}"]`, (n) => n.map((x) => x.textContent || '·').join(''));
try {
  // Bereiche
  check('Start in der Jahresplanung mit allen Reitern', (await page.$$('.tab')).length === 8);
  await page.click('[data-act=area][data-v=uebersicht]');
  check('Jahresübersicht: keine Reiter', (await page.$$('.tab')).length === 0);
  check('Jahresübersicht: keine Werkzeuge, kein Verschieben', (await page.$$('details[data-dd=tools], [data-act=ph]')).length === 0);
  await page.click('td.d[data-id=a2][data-w="3"][data-d="1"]');
  check('Jahresübersicht: Tag-Fenster nur mit Infos', (await page.$$('.sheet [data-act=setc], .sheet [data-act=setd]')).length === 0);
  await page.keyboard.press('Escape');
  await page.selectOption('#uep', 'a2');
  check('Jahresübersicht: Mitarbeiter filtern zeigt eine Zeile', (await page.$$eval('tbody tr:not(.sec)', (n) => n.length)) === 1);
  check('Jahresübersicht: Drucken verfügbar', (await page.$$('[data-act=print]')).length === 1);
  await page.click('[data-act=area][data-v=planung]');
  check('Zurück in die Jahresplanung', (await page.$$('.tab')).length === 8 && (await page.$$('tbody tr:not(.sec)')).length > 1);

  // Conti für den 9-Wochen-Rhythmus
  check('Normal: nur Mo bis Fr belegt, Wochenende nicht antippbar', (await days7('a1', 3)).length === 5, await days7('a1', 3));
  await page.click('[data-act=tab][data-v=set]');
  await page.click('[data-act=conti][data-id=r9][data-v="1"]');
  await page.click('[data-act=tab][data-v=plan]');
  const c = await days7('a1', 3);
  check('Conti: Schicht auch Sa und So', c.length === 7 && !c.includes('·') && new Set(c).size === 1, c);
  check('Normales Modell bleibt Mo bis Fr', (await days7('b1', 3)).length === 5, await days7('b1', 3));
  check('Gruppenkopf zeigt Conti', (await page.textContent('tr.sec .secname')).includes('Conti'));
  const satF = await page.$$eval('tfoot tr', (rows) => rows.map((r) => r.children[1 + 3 * 7 + 5].textContent).join('/'));
  check('Besetzung am Samstag wird gezählt', satF.split('/').reduce((a, b) => a + +b, 0) === 6, satF);

  // Urlaub ganze Woche bei Conti: Mo bis So
  await page.click('td.d[data-id=a1][data-w="10"][data-d="5"]');
  await page.click('[data-act=scope][data-v=woche]');
  check('Conti: Hinweis nennt Sonntag', (await page.textContent('.sheet')).includes('bis Sonntag'));
  await page.click('[data-act=setd][data-c=U]');
  check('Conti: Urlaub Mo bis So', (await days7('a1', 10)) === 'UUUUUUU', await days7('a1', 10));

  // Zurück auf Normal
  await page.click('[data-act=tab][data-v=rh]');
  await page.click('[data-act=conti][data-id=r9][data-v="0"]');
  await page.click('[data-act=tab][data-v=plan]');
  check('Wieder Normal: Wochenende frei', (await days7('a1', 3)).length === 5, await days7('a1', 3));
} finally {
  await finish(app, 'Bereiche und Conti');
}

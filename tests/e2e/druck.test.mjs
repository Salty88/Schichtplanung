// Drucken: Monat, Quartal, Jahr in Wochen, einzelner Mitarbeiter; Dialog liegt über allem
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const ctx = page.context();
async function printWith(setup) {
  await page.click('[data-act=print]');
  await setup();
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-act=printgo]')]);
  await pop.waitForLoadState();
  const info = await pop.evaluate(() => ({
    title: document.title,
    pages: document.querySelectorAll('section.page').length,
    rows: document.querySelectorAll('tbody tr').length,
    foot: document.querySelectorAll('tfoot tr').length,
    u: [...document.querySelectorAll('td')].filter((t) => t.textContent.endsWith('U')).length,
    cols: document.querySelector('thead tr:last-child') ? document.querySelector('thead tr:last-child').children.length : 0,
  }));
  await pop.close();
  return info;
}
try {
  // Eine Woche Urlaub für A1 in KW 28 (12. bis 16. Juli 2027)
  await page.click('td.d[data-id=a1][data-w="27"][data-d="0"]');
  await page.click('[data-act=scope][data-v=woche]');
  await page.click('[data-act=setd][data-c=U]');

  // Dialog liegt über der Gruppenleiste
  await page.click('[data-act=print]');
  const top = await page.evaluate(() => { const r = document.querySelector('.sheet').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + 12); return !!el.closest('.sheet'); });
  check('Druckfenster liegt über allem', top);
  await page.keyboard.press('Escape');

  const m = await printWith(() => page.selectOption('#prm', '6'));
  check('Monat Juli: Titel', m.title === 'Schichtplan Gruppe 1 · Juli 2027', m.title);
  check('Monat Juli: 31 Tagesspalten + Name', m.cols === 32, String(m.cols));
  check('Monat Juli: 5 Urlaubstage sichtbar', m.u === 5, String(m.u));
  check('Monat Juli: Besetzung F, S, N gedruckt', m.foot === 3, String(m.foot));

  const q = await printWith(async () => { await page.click('[data-act=prset][data-k=zeit][data-v=quartal]'); await page.click('[data-act=prset][data-k=quartal][data-v="2"]'); });
  check('3. Quartal: eine Seite pro Monat', q.pages === 3, String(q.pages));

  const y = await printWith(async () => { await page.click('[data-act=prset][data-k=zeit][data-v=jahr]'); await page.click('[data-act=prset][data-k=ansicht][data-v=wochen]'); await page.uncheck('#prb'); });
  check('Jahr in Wochen: eine Seite, 52 KW-Spalten', y.pages === 1 && y.cols === 53, `${y.pages}/${y.cols}`);
  check('Ohne Besetzung: keine Fußzeilen', y.foot === 0, String(y.foot));

  const p = await printWith(async () => { await page.click('[data-act=prset][data-k=umfang][data-v=person]'); await page.selectOption('#prp', 'a1'); });
  check('Mitarbeiter A1: Jahreskalender mit 12 Monatszeilen', p.title === 'Schichtplan A1 · Jahr 2027' && p.rows === 12, `${p.title} / ${p.rows}`);
  check('Mitarbeiter A1: Urlaub im Kalender', p.u === 5, String(p.u));
} finally {
  await finish(app, 'Drucken');
}

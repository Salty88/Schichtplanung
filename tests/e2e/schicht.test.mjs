// Schicht ändern: nur ein Tag, ganze Woche, Zeitraum über das Wochenende, zurücksetzen
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const days = (id, w) => page.$$eval(`td.d[data-id=${id}][data-w="${w}"]`, (n) => n.slice(0, 5).map((x) => x.textContent).join(''));
const besetzung = (w, d) => page.$$eval('tfoot tr', (rows, i) => rows.map((r) => r.children[i].textContent).join('/'), 1 + w * 7 + d);
try {
  // A3 hat in KW 1 Frühschicht (FFFFF)
  check('Ausgang: A3 KW 1 Frühschicht', (await days('a3', 0)) === 'FFFFF', await days('a3', 0));
  const vorher = await besetzung(0, 2);

  // Nur dieser Tag: Mittwoch auf Nacht
  await page.click('td.d[data-id=a3][data-w="0"][data-d="2"]');
  check('Standard ist „Nur dieser Tag“', (await page.getAttribute('[data-act=scope][data-v=tag]', 'aria-pressed')) === 'true');
  await page.click('[data-act=setc][data-c=N]');
  check('Nur Mittwoch geändert, Rest der Woche bleibt', (await days('a3', 0)) === 'FFNFF', await days('a3', 0));
  check('Rückmeldung nennt den Tag', (await page.textContent('.msg')).includes('Nachtschicht am Mi'));
  const nachher = await besetzung(0, 2);
  check('Tagesbesetzung am Mittwoch angepasst', vorher !== nachher, `${vorher} -> ${nachher}`);
  check('Wochenansicht markiert die Woche als teilweise geändert', await page.evaluate(async () => {
    document.querySelector('[data-act=view][data-v=wochen]').click();
    await new Promise((r) => setTimeout(r, 50));
    const c = document.querySelector('td.c[data-id=a3][data-w="0"]');
    const ok = c.classList.contains('part') && c.textContent === 'F';
    document.querySelector('[data-act=view][data-v=tage]').click();
    return ok;
  }));

  // Zurücksetzen nur für diesen Tag
  await page.click('td.d[data-id=a3][data-w="0"][data-d="2"]');
  await page.click('[data-act=setc][data-c=__auto]');
  check('„Wie geplant“ stellt den Tag zurück', (await days('a3', 0)) === 'FFFFF', await days('a3', 0));

  // Zeitraum über das Wochenende: Fr KW 2 bis Di KW 3
  const a3w2 = await days('a3', 1);
  const a3w3 = await days('a3', 2);
  await page.click('td.d[data-id=a3][data-w="1"][data-d="4"]');
  await page.click('[data-act=scope][data-v=zeit]');
  await page.fill('#bisd', '2027-01-19');
  await page.click('[data-act=setc][data-c=S]');
  check('Zeitraum Fr bis Di: Freitag gesetzt', (await days('a3', 1)) === a3w2.slice(0, 4) + 'S', await days('a3', 1));
  check('Zeitraum Fr bis Di: Mo und Di der Folgewoche gesetzt', (await days('a3', 2)) === 'SS' + a3w3.slice(2), await days('a3', 2));
  check('Wochenende bleibt frei', (await page.$$eval('td.d.we[data-id], tr td.d.we', (n) => n.every((x) => x.textContent === ''))));
  check('Rückmeldung nennt 3 Arbeitstage', (await page.textContent('.msg')).includes('3 Arbeitstage'));

  // Zeitraum über volle Wochen: als Wochenschicht
  await page.click('td.d[data-id=a4][data-w="4"][data-d="0"]');
  await page.click('[data-act=scope][data-v=zeit]');
  await page.fill('#bisd', '2027-02-12');
  await page.click('[data-act=setc][data-c=F]');
  check('Zeitraum über zwei volle Wochen: beide komplett Früh', (await days('a4', 4)) === 'FFFFF' && (await days('a4', 5)) === 'FFFFF', (await days('a4', 4)) + ' ' + (await days('a4', 5)));

  // Ganze Woche
  await page.click('td.d[data-id=b1][data-w="8"][data-d="3"]');
  await page.click('[data-act=scope][data-v=woche]');
  await page.click('[data-act=setc][data-c=N]');
  check('Ganze Woche: B1 KW 9 komplett Nacht', (await days('b1', 8)) === 'NNNNN', await days('b1', 8));

  // Bleibt nach Speichern und Neuladen erhalten
  await page.click('[data-act=save]');
  await page.reload();
  await page.waitForSelector('.grid-wrap');
  check('Nach Neuladen: Tageswechsel im Zeitraum erhalten', (await days('a3', 2)).startsWith('SS'), await days('a3', 2));
} finally {
  await finish(app, 'Schicht ändern');
}

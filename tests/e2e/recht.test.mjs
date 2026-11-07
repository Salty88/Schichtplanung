// Anforderungskatalog: Datenschutz (Art. 9 DSGVO), Regelprüfung (ArbZG, JArbSchG, MuSchG), Begründung,
// Freigabe (§ 87 BetrVG), Änderungsprotokoll, Auskunft (Art. 15 DSGVO), Auswertung aus, keine Drittanbieter
import fs from 'node:fs';
import { startApp, check, finish } from './harness.mjs';

const app = await startApp();
const { page } = app;
const ctx = page.context();
const external = [];
page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) external.push(r.url()); });
try {
  check('Auswertung standardmäßig aus', (await page.$$('[data-act=tab][data-v=ev]')).length === 0);
  check('Hinweis Testversion und „Software warnt, Arbeitgeber entscheidet“', (await page.textContent('footer.foot')).includes('Arbeitgeber entscheidet'));

  // Krank ist vertraulich: Planung sieht K, Übersicht nur „abwesend“
  await page.click('td.d[data-id=a2][data-w="5"][data-d="1"]');
  await page.click('[data-act=setd][data-c=K]');
  await page.click('td.d[data-id=a2][data-w="5"][data-d="2"]');
  await page.click('[data-act=setd][data-c=U]');
  check('Planung zeigt K', (await page.textContent('td.d[data-id=a2][data-w="5"][data-d="1"]')) === 'K');
  await page.click('[data-act=area][data-v=uebersicht]');
  const ue = await page.$eval('td.d[data-id=a2][data-w="5"][data-d="1"]', (e) => ({ t: e.textContent, title: e.title }));
  check('Übersicht zeigt nur ABW, kein Krank', ue.t === 'ABW' && !ue.title.includes('Krank'), JSON.stringify(ue));
  check('Urlaub bleibt sichtbar', (await page.textContent('td.d[data-id=a2][data-w="5"][data-d="2"]')) === 'U');
  check('Legende der Übersicht ohne Krank', !(await page.textContent('.legend')).includes('Krank'));
  // Druck aus der Übersicht
  await page.click('[data-act=print]');
  await page.selectOption('#prm', '1');
  check('Übersicht: keine Option für Gründe im Druck', (await page.$$('#prg')).length === 0);
  let [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-act=printgo]')]);
  await pop.waitForLoadState();
  let txt = await pop.textContent('body');
  await pop.close();
  check('Aushang ohne Krank, mit „abwesend“', !txt.includes('Krank') && txt.includes('abwesend'));
  await page.click('[data-act=area][data-v=planung]');

  // Regelprüfung
  await page.click('[data-act=tab][data-v=chk]');
  const chk = await page.textContent('#app');
  check('Prüfung meldet fehlende Pausen (§ 4 ArbZG)', chk.includes('Pause zu kurz (§ 4 ArbZG)'));
  check('Prüfung meldet Rückwärtswechsel (BAuA)', chk.includes('Rückwärtswechsel'));
  check('Prüfung meldet Nachtschichten in Folge (BAuA)', chk.includes('Nachtschichten in Folge'));

  // Veröffentlichen gesperrt, solange Grenzwertverstöße offen sind
  await page.click('[data-act=tab][data-v=plan]');
  await page.click('[data-act=fg][data-v=pruefung]');
  await page.fill('#fg-vermerk', 'kein Betriebsrat im Testbetrieb');
  await page.click('[data-act=fg][data-v=pubnobr]');
  check('Veröffentlichen mit offenen Verstößen gesperrt', (await page.textContent('.msg')).includes('Grenzwert'));

  // Begründen für alle
  await page.click('[data-act=tab][data-v=chk]');
  await page.click('details.rule[data-rule=pause] summary');
  await page.fill('#bga-pause', 'Test: Pausenregelung laut BV vom 01.01.2027');
  await page.click('[data-act=bg-all][data-k=pause]');
  check('Begründung gespeichert', (await page.textContent('.msg')).includes('Begründung für'));
  const hart = await page.$eval('.panel .stats .stat b', (b) => b.textContent);
  check('Keine offenen Grenzwertverstöße mehr', hart === '0', hart);

  // Jetzt veröffentlichen
  await page.click('[data-act=tab][data-v=plan]');
  await page.fill('#fg-vermerk', 'kein Betriebsrat im Testbetrieb');
  await page.click('[data-act=fg][data-v=pubnobr]');
  check('Plan veröffentlicht', (await page.textContent('.fbar')).includes('Veröffentlicht am'));
  await page.click('td.d[data-id=b2][data-w="6"][data-d="3"]');
  await page.click('[data-act=setd][data-c=G]');
  check('Status „Geändert nach Veröffentlichung“', (await page.textContent('.fbar')).includes('Geändert nach Veröffentlichung'));
  check('Geänderter Tag markiert', (await page.$$('td.d.chg[data-id=b2][data-w="6"][data-d="3"]')).length === 1);

  // Einsatzbeschränkung: Nachtschicht gesperrt
  await page.click('[data-act=tab][data-v=ma]');
  await page.selectOption('#sz-c1', 'jug');
  await page.click('[data-act=tab][data-v=plan]');
  await page.click('td.d[data-id=c1][data-w="8"][data-d="1"]');
  await page.click('[data-act=setc][data-c=N]');
  check('Nachtschicht für Jugendliche gesperrt', (await page.textContent('.msg')).includes('keine Arbeit zwischen 20 und 6 Uhr'));
  await page.keyboard.press('Escape');
  await page.click('[data-act=tab][data-v=chk]');
  check('Einsatzbeschränkung in der Prüfung, ohne Begründungsmöglichkeit', (await page.$$('details.rule[data-rule=schutz]')).length === 1 && (await page.$$('#bga-schutz')).length === 0);
  await page.click('[data-act=area][data-v=uebersicht]');
  check('Übersicht verrät die Einsatzbeschränkung nicht', !(await page.textContent('#app')).includes('Jugendliche'));
  await page.click('[data-act=area][data-v=planung]');

  // Protokoll
  await page.click('[data-act=tab][data-v=prot]');
  await page.fill('#uname', 'Testplaner'); await page.dispatchEvent('#uname', 'change');
  const prot = await page.textContent('#app');
  const row = await page.$$eval('table.prot tr', (rs) => rs.map((r) => [...r.children].map((c) => c.textContent).join('|')).find((x) => x.includes('2027-02-09')) || '');
  check('Protokoll mit Krank-Eintrag (vorher/nachher)', row.includes('Abwesenheit|A2|2027-02-09||K'), row);
  check('Protokoll: Prüfsummenkette intakt', prot.includes('Prüfsummenkette intakt'));
  check('Protokoll: Planstatus protokolliert', prot.includes('planstatus') || prot.includes('freigabe'));

  // Auskunft nach Art. 15
  await page.click('[data-act=tab][data-v=ma]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=ausk][data-id=a2]')]);
  const ak = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  check('Auskunft enthält Tage, Abwesenheit und Protokoll', ak.person.name === 'A2' && ak.tage.some((x) => x.abwesenheit === 'Krank') && ak.protokoll.length > 0);

  // Ansichtsdatei ohne vertrauliche Daten
  await page.click('[data-act=tab][data-v=set]');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=snap]')]);
  const snap = fs.readFileSync(await dl2.path(), 'utf8');
  const st = JSON.parse(snap.split('id="state">')[1].split('</' + 'script>')[0]);
  check('Ansichtsdatei: kein Krank, kein Protokoll, keine Einsatzbeschränkung', !JSON.stringify(st.tage).includes('"K"') && st.protokoll.length === 0 && st.mitarbeiter.every((m) => !m.schutz) && !st.abwesenheiten.some((x) => x.code === 'K'));

  // Systembeschreibung
  const [dl3] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=kat]')]);
  const kat = fs.readFileSync(await dl3.path(), 'utf8');
  check('Systembeschreibung mit Datenfeldern und Rollen', kat.includes('## Datenfelder') && kat.includes('## Rollen') && kat.includes('Krank'));

  // Auswertung einschalten wird protokolliert
  await page.check('#evon');
  check('Auswertung eingeschaltet', (await page.$$('[data-act=tab][data-v=ev]')).length === 1);

  check('Keine Anfragen an Dritte (keine externen Schriften)', external.length === 0, external.join(' '));
} finally {
  await finish(app, 'Rechtliche Anforderungen');
}

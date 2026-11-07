# iShifter: Umsetzungsstand zum Anforderungskatalog

Stand: 7. November 2026. Grundlage ist der rechtlich belegte Anforderungskatalog für Schichtplanungs-Software (MVP-Prioritäten 1 bis 3).
Diese Übersicht ist keine Rechtsberatung. Sie zeigt, was die App heute technisch leistet und wo Grenzen liegen.

**Wichtigste Grenze:** Die App ist eine einzelne HTML-Datei ohne Server. Alles, was echte Zugriffskontrolle, Verschlüsselung, manipulationssichere Protokolle oder signierte Updates verlangt, braucht eine Server-Version (On-Premise-Webanwendung mit Anmeldung). Diese Punkte sind unten als **Server nötig** markiert.

Legende: ✅ umgesetzt · 🟡 teilweise · 🖥️ Server nötig · ⬜ offen

## Priorität 1

| Nr. | Anforderung | Stand | Umsetzung / Grenze |
|---|---|---|---|
| 1 | Rollen- und Rechtekonzept | 🟡 🖥️ | Jahresplanung (planen) und Jahresübersicht (nur lesen), Ansichtsdatei, echte Rechte über claude.ai (Bearbeiten/Ansehen). Fehlt: Planer nur für eigene Bereiche, Personal-Rolle, Mitarbeiter-Rolle. Braucht Anmeldung am Server. |
| 2 | Trennung Verfügbarkeit und Abwesenheitsgrund | 🟡 🖥️ | Abwesenheitsarten lassen sich als „vertraulich“ markieren (Krank ab Werk). Übersicht, Aushang-Druck, Plan-CSV und Ansichtsdatei zeigen nur „abwesend“ (ABW); die Ansichtsdatei enthält den Grund gar nicht. Einsatzbeschränkungen sind für Leser unsichtbar. Fehlt: Verschlüsselung dieser Felder, Zugriff nur für eine Personal-Rolle (Server). |
| 3 | Regelprüfung ArbZG | ✅ | Reiter „Prüfung“: § 3 (über 10 Std. am Tag, über 48 Std. pro Woche im Schnitt von 24 Wochen), § 4 (Pausen), § 5 (11 Std. Ruhezeit), §§ 9 bis 11 (Sonn- und Feiertagsarbeit mit Ausnahmegrundlage, 15 freie Sonntage, Ersatzruhetag in 2 bzw. 8 Wochen), Feiertagskalender Baden-Württemberg. Pflichtbegründung beim Übersteuern, Veröffentlichen gesperrt bei offenen Grenzwertfällen. Noch offen: Nachtarbeitnehmer-Kennzeichen und Untersuchungserinnerung (§ 6), Ausgleichskonto über frei wählbaren Bezugszeitraum. |
| 4 | Regelsätze JArbSchG und MuSchG | 🟡 | Einsatzbeschränkung je Person (Jugendliche / Mutterschutz, vertraulich). Geprüft: keine Arbeit 20 bis 6 Uhr, höchstens 8 bzw. 8,5 Std. am Tag, Ruhezeit 12 bzw. 11 Std., Sonn- und Feiertage. Harte Sperre beim Setzen einer Schicht im Tag-Fenster, nicht begründbar. Fehlt: 40-Std.-Woche und 60 Min. Pause (JArbSchG), 90 Std. in der Doppelwoche (MuSchG), Samstagsruhe, Ausnahme bis 23 Uhr (§ 14 Abs. 2 JArbSchG); der Springer-Ausgleich beachtet die Sperren noch nicht automatisch (die Prüfung meldet es). |
| 5 | Änderungsprotokoll | 🟡 🖥️ | Jede Änderung mit Zeit, Name, Bereich, vorher/nachher; Prüfsummenkette erkennt nachträgliche Änderungen; CSV-Export; Filter je Person. Der Name ist ohne Anmeldung nicht geprüft, und die Kette schützt nicht vor dem Löschen der ganzen Datei. Manipulationssicher nur mit Server. |
| 6 | Freigabe-Workflow | ✅ | Entwurf, In Prüfung, BR-Zustimmung mit Datum und Vermerk, Veröffentlicht, „Geändert nach Veröffentlichung“ mit markierten Tagen; Verlauf im Protokoll. Ohne Betriebsrat: Veröffentlichen mit Pflichtvermerk. |
| 7 | CRA-Grundlagen | 🟡 🖥️ | Sichtbarer Hinweis „Testversion“ (Art. 4 Abs. 3), keine Verbindungen zu Dritten (keine externen Schriften, keine Telemetrie), [SECURITY.md](../SECURITY.md) mit Meldeweg, SBOM ([sbom.cdx.json](../sbom.cdx.json), keine Fremdkomponenten). Fehlt: signierte Updates, Meldeprozess 24 h/72 h als gelebter Ablauf, technische Dokumentation, Konformitätserklärung, CE. |
| 8 | Datensicherung, Härtungsleitfaden | 🟡 | Sicherung herunterladen und einspielen (Einstellungen). Härtungsleitfaden für den Betrieb im Firmennetz: offen (sinnvoll erst mit Server). |
| 9 | Auskunftsexport je Person | ✅ | Reiter „Mitarbeiter“ → „Auskunft“: JSON mit Stammdaten, allen Tagen, Zeiten, Abwesenheiten, Infos, Begründungen und Protokolleinträgen der Person. |
| 10 | Löschkonzept | ✅ | Fristen je Datenart (vertrauliche Gründe, übrige Abwesenheiten, Infos, Protokoll), „Fristen jetzt anwenden“ löscht und schwärzt Protokollinhalte; die Löschung wird protokolliert. Hinweis: ältere Sicherungsdateien und Seitenversionen enthalten die Daten weiter. |

## Priorität 2

| Nr. | Anforderung | Stand | Umsetzung / Grenze |
|---|---|---|---|
| 11 | Ist-Zeit-Erfassung, Soll/Ist | ⬜ 🖥️ | Offen. Die Stunden in der App sind Planwerte. |
| 12 | BAuA-Warnregeln | 🟡 | Höchstzahl Nächte in Folge (einstellbar, Standard 3), Vorwärtsrotation, mindestens 48 Std. frei nach Nachtschichten, als Warnung mit Begründung. Fehlt: geblockte Wochenenden. |
| 13 | Tarifprofil M+E BW | ⬜ | Offen (tarifliche Nachtzeit 19 bis 6 Uhr, Spätarbeit, Zuschlagsarten-Export). |
| 14 | Urlaubsmodul mit Antrag und Genehmigung | ⬜ 🖥️ | Offen; heute nur Eintrag durch Planende. |
| 15 | BR-Ansicht, Sonderschichten | 🟡 | Jahresübersicht mit Planstatus und markierten Änderungen; Systembeschreibung für den BR. Fehlt: eigene BR-Rolle, Kennzeichnung Sonderschicht/Mehrarbeit, BR-Reports. |
| 16 | Supportmodus mit anonymisierten Daten | ⬜ | Offen. |
| 17 | Ergonomie, Barrierefreiheit | 🟡 | Tastaturbedienung, ARIA-Rollen, Hell/Dunkel, Hinweise und Rückmeldungen. Keine formale Prüfung nach DIN EN ISO 9241-110 oder WCAG 2.1 AA. |

## Priorität 3

Mitarbeiter-Wünsche, SAP/Workday-Schnittstellen, Wochenhöchstarbeitszeit-Modus und erklärte automatische Planerzeugung sind offen. Der vorhandene Springer-Ausgleich arbeitet nach festen Regeln (dynamische Programmierung), lernt nicht und nutzt keine Verhaltens- oder Leistungsdaten; das ist in der Systembeschreibung dokumentiert.

## Weitere Punkte aus dem Katalog

- **Auswertungen standardmäßig aus (§ 87 Abs. 1 Nr. 6 BetrVG):** ✅ Die Auswertung pro Mitarbeiter ist ab Werk ausgeschaltet; das Einschalten wird protokolliert. Die Personenübersicht im Druck erscheint nur mit eingeschalteter Auswertung.
- **Systembeschreibung als BV-Anlage:** ✅ Einstellungen → „Systembeschreibung herunterladen“ (Datenfelder, Zwecke, Sichtbarkeit, Löschfristen, Rollen, Auswertungen, automatische Verfahren, Grenzen).
- **Weitere Herstellerdokumente** (BV-Vorlage, TOM, VVT-Baustein, DSFA-Schwellwertanalyse, AV-Vertrag, Datenschutzhinweise, Pilotvertrag): ⬜ offen. Die Systembeschreibung ist die technische Grundlage dafür; die Texte sollten mit Fachleuten (Arbeitsrecht, Datenschutz) erstellt werden.

## Empfohlene nächste Schritte

1. Rechtliche Klärung vor jedem Pilot im eigenen Betrieb (§ 69b UrhG, Nebentätigkeit, Pilotvertrag), siehe Katalog „Offene Rechtsfragen“.
2. Entscheidung über die Server-Version: Sie ist Voraussetzung für echte Rollen, Personal-Rolle, Verschlüsselung, manipulationssicheres Protokoll, Ist-Zeiten und signierte Updates.
3. Danach Priorität 2 in dieser Reihenfolge: Ist-Zeiten, Urlaubsmodul, Tarifprofil, BR-Rolle.

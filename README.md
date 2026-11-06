# Schichtplanung

Jahresschichtplan im Browser für Mac, iPad und Android.
Die App ist eine einzelne HTML-Datei ohne Backend, ohne Installation und ohne Build-Schritt.

## Starten

- **Direkt:** `index.html` im Browser öffnen (Doppelklick genügt).
- **Über GitHub Pages:** In den Repository-Einstellungen unter *Pages* den Branch `main` und den Ordner `/` wählen. Hinweis: Bei einem privaten Repository ist GitHub Pages nur mit einem kostenpflichtigen GitHub-Tarif möglich, und die veröffentlichte Seite ist dann öffentlich erreichbar.

## Funktionen

- **Jahresplan** für alle Kalenderwochen des Planjahres (ISO-Wochen, 52 oder 53), im Leitstand-Design mit hellem und dunklem Modus (Umschalter Auto / Hell / Dunkel oben, Auto folgt dem Gerät).
  - **Zeitleiste:** 12 Monate mit ihren KWs (eine KW gehört zum Monat ihres Donnerstags). Antippen springt dorthin, beim Scrollen leuchtet die aktuelle Stelle mit.
  - **Tagesansicht:** jede KW mit Mo bis So. Gearbeitet wird Mo bis Fr, Sa und So sind frei.
  - **Wochenansicht:** kompakte Jahresübersicht.
- **Gruppen als Baum** (Reiter „Gruppen“), z. B. Werk › Halle › Gruppe: beliebig viele Gruppen und Untergruppen anlegen, umbenennen und verschieben. Jede Gruppe hat eigene Mitarbeiter, eine eigene Zahl an Anlagen und eigene Springer; der Ausgleich rechnet pro Gruppe. Oben wählst du die Gruppe, eine übergeordnete Ebene zeigt alle Untergruppen zusammen. Schichten und Schichtmodelle gelten für alle Gruppen.
- **Abwesenheiten pro Tag:** GLZ, Urlaub, Krank und eigene Arten (Reiter „Abwesenheiten“, z. B. Schulung, Dienstreise), jeweils mit Kürzel und eigenen Farben. Eintragen für einen Tag, mit einem Tipp für die ganze Woche (Mo bis Fr) oder für einen Zeitraum (nur Werktage).
- **Schicht der Woche ändern:** pro Person und KW, auf Wunsch über mehrere Wochen.
- **Besetzung:** unten im Plan pro Tag bzw. Woche. Rot heißt mehr als erlaubt (Zahl der Anlagen), gelb heißt ungleich verteilt.
- **Springer-Ausgleich:** Mitarbeiter mit „Springer“ werden automatisch so eingeteilt, dass keine Schicht mehr Leute hat als Anlagen und die Schichten möglichst gleich besetzt sind. Abweichungen vom eigenen Rhythmus („Sprünge“) werden so selten wie möglich und fair auf die Springer verteilt.
- **Startverteilung vorschlagen:** sucht günstige Startwochen für alle, deren Startwoche nicht als „fest“ markiert ist.
- **Auswertung:** pro Mitarbeiter Wochen je Schicht, Tage Urlaub/Krank/GLZ, Arbeitstage und Sprünge, für einen frei wählbaren Zeitraum (KW von/bis, Monat oder Quartal), dazu Arbeitsstunden und Abwesenheitsstunden.
- **Eigene Schichten:** Kürzel, Name, Uhrzeit, Pause, Flächen- und Schriftfarbe frei wählbar (Farbwähler und Vorlagen, z. B. Weiß); „zählt für Anlagen“ und „für Springer“ einstellbar.
- **Schichtmodelle:** Wochenfolgen aus den Schichten, z. B. `N N N S F S F S F`. Jeder Mitarbeiter bekommt ein Modell und eine Startwoche.
- **Namen:** im Plan auf den Namen tippen oder im Reiter „Mitarbeiter“ ändern.
- **Drucken** (Knopf in der Gruppenleiste): Monat, Quartal, Halbjahr oder ganzes Jahr; die gewählte Gruppe als Tagesansicht (eine Seite pro Monat) oder Wochenansicht (eine Seite), wahlweise mit Besetzung pro Schicht; oder ein einzelner Mitarbeiter als Jahreskalender mit Übersicht. A4 quer, farbig, mit Legende. In claude.ai wird statt des Druckdialogs eine Druckdatei gespeichert.
- **Export:** Plan und Auswertung als CSV für Excel, Sicherung als JSON (herunterladen und wieder einspielen).

## Voreinstellung

| Schicht | Zeit |
|---|---|
| Frühschicht (F, blau) | 05:00 bis 13:05 |
| Spätschicht (S, grün) | 13:05 bis 22:00 |
| Nachtschicht (N, orange) | 22:00 bis 05:00 |

Vorbelegt ist eine Beispielgruppe „Gruppe 1“ mit 17 Platzhaltern auf 6 Anlagen:

| Gruppe | Personen | Schichtmodell |
|---|---|---|
| A1 bis A6 | 6 | 9 Wochen: N N N S F S F S F |
| B1 bis B3 | 3 | 6 Wochen: N N S F F S |
| C1 | 1 | Wechselschicht: F S |
| D1 bis D3 | 3 | Wochenwechsel: N S F |
| Springer 1 bis 4 | 4 | Wochenwechsel N S F, gleichen aus |

## Infotexte

Im Tag-Fenster unter **Info**: eigenen Text eingeben oder eine Vorlage antippen (Vorlagen anlegen per „Als Vorlage merken“ oder unter Einstellungen). Gilt für Tag, Woche oder Zeitraum. Tage mit Info zeigen ein rotes Ausrufezeichen, beim Überfahren mit der Maus erscheint eine Infobox mit dem Text. Sichtbar auch in der Jahresübersicht und im Druck (mit Liste unter dem Plan). Bitte keine Gesundheitsangaben eintragen.

## Zwei Bereiche

- **Jahresplanung:** Plan, Auswertung, Mitarbeiter, Gruppen, Schichtmodelle, Schichten, Abwesenheiten und Einstellungen. Nur für Admins bzw. freigeschaltete Personen.
- **Jahresübersicht:** der Plan als reine Übersicht, ohne jede Möglichkeit zur Änderung. Gruppe wählen, einzelnen Mitarbeiter herausfiltern, Tage oder Wochen, Drucken. Wer keine Planungsrechte hat, sieht nur diesen Bereich.

## Normal und Conti, Arbeitstage und Arbeitszeiten

Pro Schichtmodell (Reiter Schichtmodelle, kurz auch unter Einstellungen):

- **Conti:** die Schicht der Woche läuft an allen 7 Tagen. Wochenenden sind antippbar, „Ganze Woche“ und Zeiträume zählen Sa und So mit, die Besetzung wird auch am Wochenende berechnet.
- **Normal:** die Arbeitstage sind frei wählbar (Knöpfe Mo bis So), z. B. Mo bis Fr, Mo bis Do oder Mo bis Sa. Nur Arbeitstage sind antippbar und zählen für Urlaub, Zeiträume und Besetzung.
- **Arbeitszeiten:** Standard sind die Zeiten der Schicht (Von, Bis, Pause im Reiter Schichten). Mit „eigene Zeiten pro Tag“ gibt es pro Schicht des Modells eine Tabelle Von, Bis, Pause je Arbeitstag, z. B. freitags kürzer. „Auf alle Tage übertragen“ und „Auf Schichtzeit zurücksetzen“ helfen beim Ausfüllen.
- **Stunden:** netto (ohne Pause), über Mitternacht korrekt. Angezeigt pro Tag (Tag-Fenster, Infobox), pro Woche und Schicht sowie als Durchschnitt über den Rhythmus. Die Auswertung, der CSV-Export und der Personendruck zeigen Arbeitsstunden und die Stunden, die an Abwesenheitstagen geplant gewesen wären.
- **Hinweise nach Arbeitszeitgesetz:** zu kurze Pause (§ 4 ArbZG: über 6 Std. mindestens 30 Min., über 9 Std. mindestens 45 Min.) und mehr als 10 Std. am Tag (§ 3 ArbZG). Das sind Hinweise, keine Rechtsprüfung; Tarifverträge und Betriebsvereinbarungen können abweichen.

## Admin und Ansicht

- **In claude.ai (echte Rechte):** Den Link über das Teilen-Menü weitergeben. Wer bearbeiten darf, ist Admin und plant. Wer nur ansehen darf, sieht Jahresplan, Auswertung und Drucken und kann nichts ändern. Das prüft claude.ai serverseitig.
- **Ansichtsdatei** (Einstellungen → Zugriff): eine Kopie des aktuellen Plans für Kollegen, nur zum Ansehen, Auswerten und Drucken. Änderungen am Original erreichen sie nicht. Nach Planänderungen neu erstellen.
- **Admin-PIN** (Einstellungen → Zugriff): Die App startet in der Ansicht, „Bearbeiten freischalten“ fragt nach der PIN. Das schützt vor versehentlichem Ändern, ist aber kein Schutz gegen technisch versierte Personen, weil die App ohne Server läuft.

## Wo die Daten liegen

- Alle Eingaben werden **im Browser des jeweiligen Geräts** gespeichert („Speichern“ oben rechts). Sie landen **nicht** im Repository.
- Für einen anderen Browser oder ein anderes Gerät: unter *Einstellungen* „Sicherung herunterladen“ und dort „Sicherung einspielen“.
- Wird die Datei als claude.ai-Artifact geöffnet, speichert sie sich dort als neue Version selbst.
- Echte Mitarbeiterdaten (Namen, Krankheitstage) gehören nie ins Repository. „Krank“ ist eine Gesundheitsangabe: keine Gründe oder Diagnosen eintragen.

## So rechnet der Ausgleich

1. Alle Nicht-Springer laufen fest nach ihrem Schichtmodell. Eingetragene Abweichungen gelten vorrangig.
2. Wer Mo bis Fr komplett abwesend ist, zählt in dieser Woche nicht zur Besetzung.
3. Für die Springer werden alle Wochen des Jahres gemeinsam optimiert (dynamische Programmierung). Kosten:
   - mehr Leute als Anlagen in einer Schicht: sehr hoch,
   - ungleiche Verteilung über die Schichten: mittel,
   - ein Springer verlässt seinen normalen Ablauf: niedrig (direkt von Nacht auf Früh etwas höher).
4. Danach werden gleichwertige Pläne zwischen den Springern getauscht, damit Sprünge und Nachtwochen gerecht verteilt sind.

Einzelne Fehltage (GLZ, ein Tag krank) ändern die Wocheneinteilung nicht. Sie erscheinen in der Tagesbesetzung.

## Tests

Browser-Tests mit `playwright-core`. Die App selbst braucht keine Pakete.

```bash
npm install
npm run test:e2e
```

Chromium: Standardpfad `/opt/pw-browsers/chromium`, sonst über `CHROMIUM=/pfad/zu/chrome`.

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
- **Abwesenheiten pro Tag:** GLZ, Urlaub, Krank, auch über einen Zeitraum (nur Werktage).
- **Schicht der Woche ändern:** pro Person und KW, auf Wunsch über mehrere Wochen.
- **Besetzung:** unten im Plan pro Tag bzw. Woche. Rot heißt mehr als erlaubt (Zahl der Anlagen), gelb heißt ungleich verteilt.
- **Springer-Ausgleich:** Mitarbeiter mit „Springer“ werden automatisch so eingeteilt, dass keine Schicht mehr Leute hat als Anlagen und die Schichten möglichst gleich besetzt sind. Abweichungen vom eigenen Rhythmus („Sprünge“) werden so selten wie möglich und fair auf die Springer verteilt.
- **Startverteilung vorschlagen:** sucht günstige Startwochen für alle, deren Startwoche nicht als „fest“ markiert ist.
- **Auswertung:** pro Mitarbeiter Wochen je Schicht, Tage Urlaub/Krank/GLZ, Arbeitstage und Sprünge, für einen frei wählbaren Zeitraum (KW von/bis, Monat oder Quartal).
- **Eigene Schichten:** Kürzel, Name, Uhrzeit, Farbe; „zählt für Anlagen“ und „für Springer“ einstellbar.
- **Schichtmodelle:** Wochenfolgen aus den Schichten, z. B. `N N N S F S F S F`. Jeder Mitarbeiter bekommt ein Modell und eine Startwoche.
- **Namen:** im Plan auf den Namen tippen oder im Reiter „Mitarbeiter“ ändern.
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

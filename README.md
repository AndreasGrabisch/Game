# Minispiele

Eine kindgerechte 2D-Browserspiel-Sammlung für Kinder ab ca. 6 Jahren.

**Für Eltern:** *Samuels Spielewelt* läuft im Browser (ohne Anmeldung): Kinder wählen auf dem Spielplatz-Hub kleine Spiele mit großen Buttons — Fahrrad basteln, Detektivfälle, Farben sortieren, kurze Probefahrt. Fortschritt und Sterne bleiben nur auf dem Gerät gespeichert (`localStorage`); mit „Neu starten“ im Menü kann alles zurückgesetzt werden. Ton lässt sich stummschalten, Texte können vorgelesen werden. Ideal für kurze Spielrunden (einige Minuten) auf Handy oder Tablet, Hoch- und Querformat.

Über die **Spiele-Auswahl** startest du einzelne Minispiele:

- **Samuel baut sein Fahrrad** — Missionen, Werkstatt und Probefahrt
- **Detektivspiel** — Detektiv-Sachen in einem 9-Schubladen-Schrank finden (falsche Schublade → alles mischt sich neu)
- **Farben sortieren** — bunte Sachen in den Eimer mit der gleichen Farbe legen

## Online spielen

**https://andreasgrabisch.github.io/Game/**

### Einmalig aktivieren (falls die Seite 404 zeigt)

1. GitHub → Repo **Game** → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **gh-pages** / **/ (root)** → **Save**  
   (Nicht „GitHub Actions“ als Source, wenn der Deploy den Branch `gh-pages` befüllt.)
4. Nach 1–2 Minuten ist die URL erreichbar

Auf Android: Link in Chrome öffnen → Menü (⋮) → **Zum Startbildschirm hinzufügen**.

### Neu deployen (nach Änderungen)

```bash
npm run deploy
```

Das baut das Spiel und pusht es auf den `gh-pages`-Branch.

> **Hinweis:** Automatisches Deploy via GitHub Actions ist eingerichtet (`.github/workflows/deploy.yml`), läuft aber erst, wenn GitHub Actions in den Account-Einstellungen (**Billing & plans**) freigeschaltet ist.

## Lokal spielen

```bash
npm install
npm run dev
```

Dann im Browser öffnen: http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Missionen

| # | Titel | Status |
|---|-------|--------|
| 1 | Runde Räder | ✅ Spielbar |
| 2 | Pedale & Kette | ✅ Spielbar |
| 3 | Lenker | ✅ Spielbar |
| 4 | Klingel (Bonus) | ✅ Spielbar |
| — | Probefahrt | ✅ Nach 3 Kern-Teilen |
| — | Schatzkiste & Sterne | ✅ Hub |
| — | Detektiv (3 Fälle) | ✅ Spielbar |

## Technik

- TypeScript + Vite + Phaser 3
- Comic-Stil mit prozeduralen Grafiken (keine externen Sprites nötig)
- Fortschritt wird in `localStorage` gespeichert

## Steuerung

- **Maus / Touch:** Räder ziehen, Lenker bewegen, Farben sortieren, über Pfützen springen
- **Tastatur:** Pfeiltasten lenken, Leertaste springt
- **Buttons:** Groß und touchfreundlich

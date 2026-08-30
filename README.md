# Samuel baut sein Fahrrad

Ein kindgerechtes 2D-Browserspiel für Kinder ab ca. 6 Jahren.

Samuel sammelt technisches Wissen in kurzen Missionen (~5 Min.) und baut daraus Schritt für Schritt sein Fahrrad.

## Online spielen

**https://andreasgrabisch.github.io/Game/**

### Einmalig aktivieren (falls die Seite 404 zeigt)

1. GitHub → Repo **Game** → **Settings** → **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **gh-pages** / **/ (root)** → **Save**
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
| 3 | Lenker | 🔜 Geplant |

## Technik

- TypeScript + Vite + Phaser 3
- Comic-Stil mit prozeduralen Grafiken (keine externen Sprites nötig)
- Fortschritt wird in `localStorage` gespeichert

## Steuerung

- **Maus / Touch:** Räder ziehen und auf die Achsen legen
- **Buttons:** Groß und touchfreundlich

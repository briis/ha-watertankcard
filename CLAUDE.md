# CLAUDE.md

## What this project is

A Home Assistant custom Lovelace card distributed via HACS (as a custom repository, not in the default store). It displays water tank status — fill level, volume, and sensor-to-surface distance — as an animated visual card.

GitHub: https://github.com/briis/ha-watertankcard

## Project structure

```
src/water-tank-card.js   — single-source card (edit this)
dist/water-tank-card.js  — built output (committed, attached to releases)
dev-preview.html         — standalone browser harness for local dev
rollup.config.mjs        — bundles src → dist, minifies for production
hacs.json                — HACS metadata (name, filename, render_readme)
.github/workflows/
  release.yml            — builds & publishes a GitHub release on vX.Y.Z tags
  validate.yml           — HACS validation on push/PR to main
```

## Dev environment

Runs inside a VS Code devcontainer (see `.devcontainer/`). The container is started automatically by VS Code.

**Port:** the dev server runs on **3000** (changed from 5000, which macOS AirPlay Receiver occupies on the host).

```sh
npm start          # rollup --watch + serve on :3000 (run inside the container)
```

Open http://localhost:3000/dev-preview.html to preview the card live with sliders for level, volume, distance, capacity, theme, and language.

`docker-compose.yml` is an alternative entry point (maps `3000:3000`), but normal dev happens via the VS Code devcontainer.

## Build

```sh
npm run build      # production bundle → dist/water-tank-card.js
```

Rollup minifies for production and skips the inline source map. Always build before tagging a release.

## Releasing

```sh
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

The `release.yml` workflow fires on the tag, runs `npm ci && npm run build`, and attaches `dist/water-tank-card.js` to the GitHub release. No manual upload needed.

## Card architecture

Everything lives in **`src/water-tank-card.js`** as a single ES module. No framework — plain custom elements with shadow DOM.

Key pieces:

| Symbol | Purpose |
|---|---|
| `TRANSLATIONS` | i18n strings for `en` and `da`; follows `hass.language`. Also contains `editor_*` keys used to translate field labels in the UI editor. |
| `editorLabel(lang, name)` | Looks up an `editor_*` key from `TRANSLATIONS` for the given language; used by `computeLabel` in the editor. |
| `DEFAULTS` | Default entity IDs and `tank_capacity: null` |
| `STYLES` | Shadow DOM CSS (light/dark theme via CSS custom properties) |
| `WaterTankCardEditor` | UI config editor — uses `ha-form` with `EDITOR_SCHEMA`. Field labels are translated automatically via `editorLabel`. |
| `WaterTankCard` | The card itself; standard HA custom element API |

### HA card API surface

- `setConfig(config)` — merges with `DEFAULTS`, rebuilds DOM
- `set hass(hass)` — updates state display
- `getConfigElement()` — returns the `ha-form`-based editor element
- `getStubConfig()` — default config shown when card is added via UI
- `getLayoutOptions()` — declares preferred grid size (4 col, min 2×2, max 6 col)
- `getCardSize()` — returns `4`

### Config options

| Key | Type | Default | Notes |
|---|---|---|---|
| `entity_level` | string | `sensor.water_tank_monitor_water_tank_level` | Sensor in `%` |
| `entity_volume` | string | `sensor.water_tank_monitor_water_tank_volume` | Sensor in `L` |
| `entity_distance` | string | `sensor.water_tank_monitor_water_tank_distance` | Sensor in `m` |
| `tank_capacity` | number | `null` | When set, shows "X / Y L" |
| `title` | string | `Water Tank` / `Vandtank` | Card title |

### Fill colour thresholds

| Level | Colour |
|---|---|
| > 30% | Blue |
| 15–30% | Orange |
| ≤ 15% | Red |

## Adding a language

1. Add a key block to `TRANSLATIONS` in `src/water-tank-card.js` — include both the card strings and the `editor_*` label keys (copy the `en` block as a template).
2. Add a matching option to the `<select id="langSelect">` in `dev-preview.html`.

Language is detected automatically from `hass.language`; no config option is exposed to the user.

# TOP! — Live Event Time Control

**A single HTML file. No install. No server. No internet required.**

Clock, stopwatch and countdown timer for live event production — designed for stage managers, event directors, and broadcast operators.

![TOP! screenshot](https://raw.githubusercontent.com/noar-justedit/top/main/screenshot.png)

---

## Features

- **Reference clock** — Gorgy Timing-style circular dial with 60-segment second ring, date display
- **Timer** — countdown with overtime detection, live adjustment while running, color-coded progress ring (green → amber → red → blinking)
- **Stopwatch** — start/pause/reset, digital and Gorgy dial view
- **Sound cues** — 15 embedded audio files: 5 min, 2 min, 1 min, 30 s, 20 s, then 10 s → 1 s countdown
- **OBS integration** — per-tool Browser Source URLs with transparent background
- **Stream Deck / Bitfocus Companion** — full control via keyboard shortcuts, no plugin needed
- **Fully offline** — all assets embedded as base64, works with no internet connection
- **Responsive** — portrait and landscape layouts, scales to any screen size

---

## Usage

1. Download [`top.html`](https://github.com/noar-justedit/top/blob/main/top.html)
2. Open it in any modern browser (Chrome, Firefox, Safari, Brave…)
3. That's it.

Or host it on any web server and open the URL on any device.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Timer start / pause |
| `R` | Timer reset |
| `←` `→` | Navigate Hours / Min / Sec |
| `↑` `↓` or `+` `−` | Increment / decrement active unit |
| `C` | Stopwatch start / pause |
| `X` | Stopwatch reset |
| `F1` | Clock fullscreen toggle |
| `F2` | Timer fullscreen toggle |
| `F3` | Stopwatch fullscreen toggle |
| `Esc` | Exit fullscreen |

---

## OBS Integration

Each tool can run as a standalone transparent Browser Source in OBS Studio.

Click the **⬡ OBS** button on any tool card to copy its URL.

| Tool | URL |
|---|---|
| Clock | `top.html?tool=clock&obs=1` |
| Timer — digital | `top.html?tool=timer&obs=1` |
| Timer — Gorgy dial | `top.html?tool=timer&obs=1&dial=1` |
| Stopwatch — digital | `top.html?tool=chrono&obs=1` |
| Stopwatch — Gorgy dial | `top.html?tool=chrono&obs=1&dial=1` |

**In OBS:** right-click the Browser Source → **Interact** to control via mouse. All keyboard shortcuts work from within Interact mode. Controls auto-hide after 4 seconds of inactivity.

---

## Timer Presets

Quick-adjust buttons add or subtract time from the running timer:

`+1 min` `+5 mins` `+10 mins` `+15 mins` `+20 mins`
`−1 min` `−5 mins` `−10 mins` `−15 mins` `−20 mins`

---

## Overtime

When the timer reaches zero, it continues counting up in red (`+00:00:00`) with a blinking **OVERTIME** badge. Sound cues stop at zero.

---

## License

GPL-3.0 — see [LICENSE](LICENSE)

© 2025-2026 [JustEdit](https://www.just-edit.fr)

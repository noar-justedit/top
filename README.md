# TOP! — Live Event Time Control

**A single HTML file. No install. No server. No internet required.**

Clock, stopwatch, countdown timer and OBS media countdown for live event production — designed for stage managers, event directors, and broadcast operators.

![TOP! — Live Event Time Control](https://raw.githubusercontent.com/noar-justedit/top/main/screenshot-v2.png)

**Use it now:** [noar-justedit.github.io/top](https://noar-justedit.github.io/top/)

---

## Features

- **Reference clock** — Gorgy Timing-style circular dial with 60-segment second ring, date display
- **Timer** — countdown with overtime detection, live adjustment while running, color-coded progress ring (green → amber → red → blinking)
- **Stopwatch** — start/pause/reset, digital and Gorgy dial view
- **OBS Media Countdown** — connects to OBS Studio via WebSocket v5 and counts down the media source currently playing (Media Source, VLC playlists, playlist plugins). Auto-detects the on-air source, ignores looping backdrops, source filter with per-scene checkboxes and Audio/Video type switches. Shows "STAND BY" with the current scene name when nothing is playing
- **Sound cues** — voice announcements at 5 min, 2 min, 1 min, 30 s, 20 s, then 10 → 1 s countdown, on both Timer and OBS Media Countdown. Master volume slider in the top bar
- **Flexible layout** — 2×2 grid, drag & drop card reordering, resizable columns and rows, per-card HIDE (collapse) and SOLO view. Everything is remembered between sessions
- **OBS integration** — per-tool Browser Source URLs with transparent background
- **Stream Deck / Bitfocus Companion** — full control via keyboard shortcuts, no plugin needed
- **Fully offline** — all assets embedded, Clock / Stopwatch / Timer work with no internet connection

---

## Usage

1. Download [`index.html`](https://github.com/noar-justedit/top/blob/main/index.html)
2. Open it in any modern browser (Chrome, Firefox, Safari, Brave…)
3. That's it.

Or use it directly at [noar-justedit.github.io/top](https://noar-justedit.github.io/top/) — on iPhone/iPad, open it in Safari and tap **Share → Add to Home Screen** for a native-like app.

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
| `F1` | Clock — solo view toggle |
| `F2` | Timer — solo view toggle |
| `F3` | Stopwatch — solo view toggle |
| `F4` | OBS Media — solo view toggle |
| `Esc` | Exit solo view |

Every action maps to a key — which means full **Stream Deck** or **Bitfocus Companion** control out of the box.

---

## Layout

- **Drag** a card by its title to swap it with another card
- **Drag** the divider between columns or rows to resize the grid; **double-click** a divider to reset
- **HIDE** collapses a card to its title bar
- **SOLO** shows a single card full-page; press `Esc` or click **SOLO** again to return to the grid

All of this is saved in the browser and restored on next load.

---

## OBS Integration

### Browser Sources

Each tool can run as a standalone transparent Browser Source in OBS Studio. Click the **⬡ OBS** button on any card to copy its URL.

| Tool | URL |
|---|---|
| Clock | `?tool=clock&obs=1` |
| Timer — digital | `?tool=timer&obs=1` |
| Timer — Gorgy dial | `?tool=timer&obs=1&dial=1` |
| Stopwatch — digital | `?tool=chrono&obs=1` |
| Stopwatch — Gorgy dial | `?tool=chrono&obs=1&dial=1` |
| OBS Media Countdown — dial only | `?tool=media&obs=1` |
| OBS Media Countdown — full card | `?tool=media` |

**In OBS:** right-click the Browser Source → **Interact** to control via mouse. Controls auto-hide after 4 seconds of inactivity.

### OBS Media Countdown setup

1. In OBS: **Tools → WebSocket Server Settings** → enable the WebSocket server, note the port (default 4455) and password
2. In TOP!: click the wifi icon (red = disconnected) on the OBS Media Countdown card → enter host / port / password → **Connect**
3. **Auto mode** picks the media source currently playing in the program scene. Or select a specific source from the dropdown
4. Click **☰ SOURCE FILTER** to choose exactly which sources Auto mode should consider, grouped by scene. Unchecked sources are always ignored. Use the **AUDIO** / **VIDEO** switches to narrow by file type, **Select All** / **Deselect All** for bulk changes, and `Shift+Click` a source to select it alone

---

## Timer Presets

Quick-adjust buttons add or subtract time from the running timer:

`+1 MIN` `+5 MINS` `+10 MINS` `+15 MINS` `+20 MINS`
`−1 MIN` `−5 MINS` `−10 MINS` `−15 MINS` `−20 MINS`

---

## Overtime

When the timer reaches zero, it continues counting up in red (`+MM:SS`) with a blinking **OVERTIME** badge. Sound cues stop at zero.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

---

## License

GPL-3.0 — see [LICENSE](LICENSE)

© 2025-2026 [JustEdit](https://www.just-edit.fr)

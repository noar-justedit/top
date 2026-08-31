# TOP! — Live Event Time Control

**A single HTML file. No install. No server. No internet required.**

Clock, stopwatch, countdown timer and OBS media countdown for live event production — designed for stage managers, event directors, and broadcast operators.

![TOP! — Live Event Time Control](https://raw.githubusercontent.com/noar-justedit/top/main/screenshot-v2.png)

**Use it now:** [noar-justedit.github.io/top](https://noar-justedit.github.io/top/)

---

## Features

- **Reference clock** — Gorgy Timing-style circular dial with 60-segment second ring, date display
- **Timers** — as many independent countdowns as you need. Each one has its own name, colour, duration, presets, sound switch and overtime. Live adjustment while running, color-coded progress ring (green → amber → red → blinking)
- **Stopwatches** — as many as you need, each with its own name and colour. Start/pause/reset, digital and Gorgy dial view
- **OBS Media Countdown** — connects to OBS Studio via WebSocket v5 and counts down the media source currently playing (Media Source, VLC playlists, playlist plugins). Auto-detects the on-air source, ignores looping backdrops, source filter with per-scene checkboxes and Audio/Video type switches. Connection settings are remembered and reconnect automatically. Shows "STAND BY" with the current scene name when nothing is playing
- **Sound cues** — voice announcements at 5 min, 2 min, 1 min, 30 s, 20 s, then 10 → 1 s countdown, on both Timer and OBS Media Countdown. Master volume slider in the top bar
- **Cards you add and remove** — `+ NEW CARD` adds a timer, a stopwatch or the OBS Media Countdown; every card has a close button and a maximize button. Type the grid shape you want (`3 × 2`, `4 × 1`…) in the top bar and the rows share the screen height. Drag & drop reordering between any two cards. Everything is remembered between sessions
- **OBS integration** — per-tool Browser Source URLs with transparent background
- **Stream Deck / Bitfocus Companion** — full control via keyboard shortcuts, no plugin needed
- **Fully offline** — all assets embedded, Clock / Stopwatch / Timer work with no internet connection

---

## Usage

1. Download [`index.html`](https://github.com/noar-justedit/top/blob/main/index.html)
2. Open it in any modern browser (Chrome, Firefox, Safari, Brave…)
3. That's it.

Or use it directly at [noar-justedit.github.io/top](https://noar-justedit.github.io/top/) — on iPhone/iPad, open it in Safari and tap **Share → Add to Home Screen** for a native-like app. Tapping the controls twice in a row no longer zooms the page; pinch zoom still works.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Selected timer start / pause |
| `R` | Selected timer reset |
| `Tab` / `Shift`+`Tab` | Select next / previous timer |
| `←` `→` | Navigate Hours / Min / Sec |
| `↑` `↓` or `+` `−` | Increment / decrement active unit |
| `C` | Stopwatch start / pause |
| `X` | Stopwatch reset |
| `F1` | Maximize the clock |
| `F2` | Maximize the first timer |
| `F3` | Maximize the first stopwatch |
| `F4` | Maximize the OBS Media card |
| `Esc` | Close the open dialog, else exit fullscreen, else back to the grid |

Every action maps to a key — which means full **Stream Deck** or **Bitfocus Companion** control out of the box. The full list is in the **`⌨ SHORTCUTS`** dialog in the top bar.

Hold the on-screen `+` or `−` button to run the value up or down; it speeds up as you hold.

---

## Cards

TOP! opens on a 2 × 2 grid: **Clock**, **Timer**, **Stopwatch** and **OBS Media Countdown**.

Click **`+ NEW CARD`** in the top bar to add one — a timer, a stopwatch, or the OBS Media Countdown if you closed it. Pick one kind at a time. Timers and stopwatches then ask for a name and a colour.

Every card carries three buttons: **⬡ OBS** for its Browser Source URL, **maximize** to give it the whole page, and **close** (with a confirmation). Anything you close comes back from `+ NEW CARD` — including the clock, which is offered only when there is none on the grid.

The grid holds exactly `columns × rows` cards, so adding a fifth card to a 2 × 2 means enlarging the grid first.

## Multiple Timers and Stopwatches

Give a timer a name, a colour and a starting duration — a new card appears with its own countdown. Stopwatches work the same way.

Timers and stopwatches are completely independent: starting, pausing, adjusting or resetting one never affects another. Each timer card has its own presets, its own SOUND switch and its own overtime.

New timers are added to the same grid as the other cards, side by side. **Drag a card by its title onto another to swap them** — the order is remembered.

**The colour identifies the timer** — it outlines the card and marks the pip and the name, and it stays on whether the timer is selected or not. The countdown itself keeps the green → amber → red state code, so how urgent a timer is reads the same way on all of them.

**Keyboard shortcuts follow the selected timer.** Click a card to select it: it lights up with a glow in its own colour and shows an `ARMED` badge, and `Space`, `R` and the arrow keys act on it. `Tab` cycles through the timers. With a single timer, nothing changes — it is selected by default.

Use **`✎ EDIT`** on a timer or a stopwatch card to rename and recolour it — and, for a timer, to change its duration. Names, colours, durations and switches are remembered between sessions.

> Voice cues are off by default on a new timer. Several timers announcing at once would talk over each other, so turn SOUND on only for the timer that should speak.

---

## Layout

Set the shape of the grid in the top bar: **`GRID  3 × 2`** means three columns and two rows.

**Portrait and landscape each keep their own shape.** Rotate a tablet and the layout you set for that way round comes back. The first time you use an orientation, TOP! picks a sensible shape — two columns on a tablet held upright, one on a phone — and you change it from there.

The rows share the height of the screen, so the whole surface fits without scrolling — `3 × 2` gives each row half the space under the top bar, `2 × 1` gives full-height cards. Fewer rows means taller cards.

A row never gets shorter than the tightest card needs. Past that point the page scrolls rather than cutting a card in half, which is what happens on a phone with four cards stacked.

Every card lives in that one grid, timers included — so the grid also sets **how many cards you can have**. A `3 × 2` grid holds six; `+ NEW` refuses to add a seventh and tells you why, and a grid shape too small for the cards already on screen is refused as well.

**Resize the tracks** by dragging the space between two columns or two rows: one grows, its neighbour shrinks, and the rows keep sharing the screen height. **Double-click** a splitter to even that axis out. Proportions are kept per grid shape, so your `3 × 2` and your `2 × 2` layouts each keep their own.

A card too short for its content **shrinks what is inside** rather than hiding it — smaller digits, tighter controls. In the smallest rows the timer presets step aside and the OBS dial gives way to its text readouts. Solo and full-screen views always show a card at full size.

- **Drag** any card by the `☰` grip at the left of its title and drop it on another to swap the two — a timer can swap with the clock, the stopwatch or the OBS Media card
- **Drag** the space between two columns or two rows to resize them; **double-click** it to even that axis out
- **Maximize** shows a single card full-page; press `Esc` or click the button again to return to the grid
- **Close** removes a card from the grid, after a confirmation

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
| Extra timer — digital | `?tool=xtimer&obs=1&name=…&color=…&dur=…` |
| Extra timer — Gorgy dial | `?tool=xtimer&obs=1&dial=1&name=…&color=…&dur=…` |
| OBS Media Countdown — dial only | `?tool=media&obs=1` |
| OBS Media Countdown — full card | `?tool=media` |

**In OBS:** right-click the Browser Source → **Interact** to control via mouse. Controls auto-hide after 4 seconds of inactivity.

Each extra timer has its own **⬡ OBS** button that builds the right URL for you — the name, colour and duration travel in the URL, because a Browser Source is a separate browser and cannot read this window's saved timers.

> Each Browser Source is an independent instance of TOP!. A timer started in your control window does not drive the timer shown in an OBS Browser Source — control each one where it runs. Cross-window synchronisation is planned.

### OBS Media Countdown setup

1. In OBS: **Tools → WebSocket Server Settings** → enable the WebSocket server, note the port (default 4455) and password
2. In TOP!: click the wifi icon (red = disconnected) on the OBS Media Countdown card → enter host / port / password → **Connect**
3. Turn on **Remember** to save the settings so TOP! reconnects on its own next time — recommended for a Browser Source that has to come back up by itself after an OBS restart
4. **Auto mode** picks the media source currently playing in the program scene. Or select a specific source from the dropdown
5. Click **☰ SOURCE FILTER** to choose exactly which sources Auto mode should consider, grouped by scene. Unchecked sources are always ignored. Use the **AUDIO** / **VIDEO** switches to narrow by file type, **Select All** / **Deselect All** for bulk changes, and `Shift+Click` a source to select it alone

> **Remember stores the OBS password in clear text** in the browser's local storage. It never leaves the machine, but any script running on the same origin can read it. Leave the switch off on a shared computer.

### Reaching an OBS on another machine

Browsers only allow an insecure `ws://` connection from an HTTPS page when the target is local. So on [noar-justedit.github.io/top](https://noar-justedit.github.io/top/) (served over HTTPS), the OBS Media Countdown can only reach an OBS running **on the same machine**.

To control an OBS on another machine, open `index.html` locally (`file://`) or serve it over plain `http://`. TOP! detects the case and tells you instead of failing silently.

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

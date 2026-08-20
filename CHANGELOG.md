# Changelog

## v2.1.1 — 2026-08

**Maintenance release: connection settings that stick, and honest error messages.**

### Fixed — OBS WebSocket
- **Connection settings are now remembered.** Host and port are always saved; the password is saved only when the new **Remember** switch is on. TOP! **reconnects automatically** on load, so an OBS Browser Source (`?tool=media`) comes back online on its own after a restart — no more retyping the password before every show
- No more endless retry loop when authentication cannot succeed: a missing password now reports **Password required** and a rejected one reports **Wrong password** (OBS close code 4009), both stopping cleanly instead of retrying every 3 s forever. A genuine network drop still retries as before
- **Clear message when HTTPS blocks a remote OBS.** A page served over HTTPS may only open a `ws://` connection to a local address; any other host is blocked by the browser. TOP! now detects this before connecting and explains it, instead of reporting a misleading "Invalid address"
- New error line under the connection settings for all of the above
- OBS scene and source names are HTML-escaped before being displayed in the Source Filter
- Media polling and scene-visibility refresh are now self-scheduling loops instead of fixed intervals, so passes can no longer overlap and stack up requests against OBS on large scene collections

### Fixed — UI
- `Esc` now closes the **Shortcuts** and **Source Filter** modals (the handler was unreachable). Priority is modal → page fullscreen → solo view
- Card header buttons wrap to a second row instead of being clipped — the OBS Media Countdown settings gear was cut off at every window width
- The Timer **SOUND** switch is persisted between sessions, and now defaults to **ON** to match the OBS Media Countdown card

---

## v2.1.0 — 2026-08

**Major release: OBS integration goes deep.**

### New — OBS Media Countdown card
- New fourth card that connects to **OBS Studio via WebSocket v5** and displays a live countdown of the media source currently playing (Media Source, VLC playlists, playlist plugins)
- **Auto mode** — detects the playing source in the program scene, ignoring looping backdrops and off-air sources (nested scenes and groups resolved)
- **Source Filter** — pick exactly which sources Auto mode should ever consider, checkbox list grouped by scene. Unchecked sources are always ignored, even if they're the only one live. New sources are checked by default. `Shift+Click` a source to select it alone. Select All / Deselect All buttons. Always accessible from the card header
- **Audio / Video type switches** — narrow the source list to video files or audio files only, detected by file extension
- Sources without a duration (images, color/text generators, browser sources, webcam/screen/game captures) are excluded from the list automatically
- **STAND BY** state — while no source is playing, the dial shows "STAND BY" in amber instead of a blank timer, with the current OBS scene name underneath. The scene name stays visible once media starts too
- Gorgy dial + media name, scene name, progress bar, elapsed/remaining — both views always visible
- Voice cues at 5 min, 2 min, 1 min, 30 s, 20 s and 10 → 1 s (same set as the Timer)
- Connection status via Lucide wifi icons — green when connected, red when disconnected — auto-reconnect every 3 s
- Dedicated OBS Browser Source URLs: dial only (`?tool=media&obs=1`) or full card (`?tool=media`)

### New — Layout
- **2 × 2 grid** — four cards, equal columns
- **Drag & drop** — grab any card by its title to swap positions; layout is saved and restored
- **Resizable grid** — drag the divider between columns or rows; double-click to reset; saved and restored
- **HIDE button** on every card — collapse a card to its title bar when unused
- **SOLO button** replaces per-card full screen — shows a single card in-page; `F1`–`F4` toggle solo per tool, `Esc` exits
- Dial text now scales to the card's actual on-screen size (not just the browser window), so it keeps fitting the ring when columns are resized or a card goes solo

### New — Audio
- **Master volume slider** in the top bar, controlling all voice cues; click the icon to mute/unmute; saved and restored
- Timer sound cues now match on both Timer and OBS Media Countdown

### Improved
- Timer and dials hide the hours when zero (`05:00` instead of `00:05:00`)
- Dial typography unified across Stopwatch, Timer and OBS Media (mono, tabular figures)
- Timer preset buttons redesigned: uppercase, larger, more readable
- OBS Media dial fully matches the Timer dial (ring thickness, bezel, glow, colors)

### Under the hood
- Single HTML file, still fully offline for Clock / Stopwatch / Timer (OBS card requires a local OBS WebSocket connection)
- All preferences persisted in the browser: card order, grid sizes, collapsed cards, volume, sound switches, source filter selection, WebSocket settings

---

## v1.6 — 2026-07
- OBS button moved rightmost on each card
- Full English audit (UI + source code)
- GPL-3.0 license header, open-sourced at github.com/noar-justedit/top

## v1.5 — 2026-07
- OBS mode: `?tool=`, `?obs=1`, `?dial=1` URL parameters
- Per-card ⬡ OBS button with copyable Browser Source URLs
- Auto-hiding control panel in OBS mode

## v1.4 — 2026-06
- 15 embedded voice files (5 min → 1 s), sound switch
- Adaptive clock font scaling

## v1.2 — 2026-06
- Live timer adjustment while running, cumulative presets
- Overtime mode with blinking badge
- Full keyboard control (Stream Deck / Companion ready)
- Portrait/landscape layouts, per-tool full screen, shortcuts popup

## v1.0 — 2026-06
- Initial release: clock, stopwatch, countdown timer in one standalone HTML file

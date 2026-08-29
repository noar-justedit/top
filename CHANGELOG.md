# Changelog

## v2.5.0 — 2026-08

**Usable on a tablet, and no more cards cut in half.**

### Fixed — Touch
- **Double-tapping no longer zooms the page.** On iPad, tapping the timer's `+` / `−` buttons twice in a row triggered iOS's double-tap-to-zoom instead of stepping the value — in Safari and in Brave alike, since every iOS browser runs on WebKit. `touch-action: manipulation` removes that gesture on the controls while leaving pinch zoom and scrolling untouched, and it also drops the 300 ms delay browsers add before firing a tap
- The viewport tag no longer claims `user-scalable=no`: iOS has ignored it since iOS 10, and it only blocked zoom for people who need it on other platforms
- Long-pressing a button no longer raises the iOS text-selection callout

### New — Press and hold
- **Holding `+` or `−` runs the value**, slowly at first then faster. Far fewer taps on a tablet, and handy with a mouse too. A single click still steps once, and keyboard activation is unchanged

### Fixed — Cards cut off
- **A card too short for its content now shrinks its content instead of hiding it.** Since v2.3.0 the rows share the screen height, which meant that on an iPad in landscape, or on a MacBook at `2 × 2`, the Timer's **START and RESET sat below the fold inside the card** and the OBS Media card lost its dial and readouts
- Cards are measured and compacted in three steps: smaller digits, tighter steppers and presets, no keyboard reminder, and an OBS dial tied to the height available. Below roughly 285 px of row height the presets step aside — holding `+` / `−` covers the same ground — and the OBS dial gives way to its text readouts
- The OBS connection panel, which is only open while OBS is disconnected and eats about 105 px, now floats over a short card instead of pushing everything else out of view
- Solo and OBS views are untouched: there the cards have the whole page

Measured before and after on iPad (landscape), 1920 × 1080, 1512 × 945, 1440 × 900 and 1280 × 800: every control is now reachable without scrolling inside a card at `2 × 2` and `3 × 3`.

---

## v2.4.0 — 2026-08

**Resizable tracks are back, one splitter per boundary.**

### New — Grid
- **Every boundary between two columns and between two rows carries a splitter.** Drag it to make one track wider or taller at its neighbour's expense; **double-click** to even that axis out again. A `3 × 2` grid gives two vertical splitters and one horizontal one, instead of the single centre divider of v2.1
- **The rows still share the screen height** while you resize: making one row taller makes the other shorter, and the grid keeps fitting the screen exactly
- **Proportions are remembered per grid shape.** Your `3 × 2` layout and your `2 × 2` layout each keep their own column widths and row heights, so switching back and forth does not lose either
- A track never shrinks below 150 px
- The keyboard help lists the two layout gestures

### Fixed
- **TOP! no longer breaks when the browser blocks site data.** In a strict private window, or with cookies blocked, the first `localStorage` read threw and the page came up blank. Storage access is now guarded: preferences simply are not remembered
- **Grid shapes that could not be reached.** Going from `4 × 1` to `1 × 4` had to pass through an invalid `1 × 1`, which was refused and overwritten on the spot. Columns and rows are now judged as a pair: an invalid value is kept on screen in red, the layout stays put, and it applies as soon as the pair is valid again
- Column and row splitters overlapped where they cross, making a 16 px band of every column splitter grab the wrong axis. Columns now win that square
- The Clock card overflowed by a few pixels and showed a stray scrollbar: the dial sizing ignored its own vertical margins

---

## v2.3.1 — 2026-08

### New
- **Grip handle.** Every card title now starts with a `☰` icon, and that icon is what moves the card. The title itself is no longer draggable, so selecting a timer by clicking its header no longer risks starting a drag
- **The grid can't be overfilled.** `+ NEW` refuses to add a timer when the grid has no free cell — a `3 × 2` grid holds six cards — and says so instead of pushing a card off screen. The button greys out when the grid is full
- Likewise, **a grid shape too small for the cards already on screen is refused** and the field reverts, with the same explanation
- **The first timer is a timer like any other**: it can be renamed, recoloured, re-timed with `✎ EDIT` and removed with `✕`, and it carries its own `+ NEW` button. Every timer card now has all three
- **TOP! always keeps one timer.** Removing the last one is refused

### Under the hood
- New cards are cloned from a pristine copy of the Timer card taken at startup, so the first timer can be deleted without breaking the "+ NEW" button
- The id `timerCard` is now a role rather than a fixed card: delete the card holding it and it is handed to another timer, so `F2` and the `?tool=timer` Browser Source keep working
- Every timer, including the first, is saved to the timer list — name, colour, duration, sound switch and view

---

## v2.3.0 — 2026-08

**One grid, the shape you want.**

### New — Grid layout
- **`GRID` control in the top bar**: type the number of columns and rows, e.g. `3 × 2`. The layout applies immediately and is remembered
- **The rows share the screen height.** `3 × 2` means each row is half of the space under the top bar, so the whole surface fits the screen with no scrolling. Fewer rows means taller cards
- **One single grid for every card.** Timers created with `+ NEW` are placed in the same grid as the Clock, Timer, Stopwatch and OBS Media cards instead of a separate area below
- **Drag & drop works between any two cards.** A timer can now swap places with the clock, the stopwatch or the OBS Media card — one rule for all of them. The order is remembered
- The grid now uses the **full width of the window** instead of being capped at 1180 px
- A card whose content needs more room than its row **scrolls inside itself**, so nothing is ever clipped and the grid never grows past the screen

### Removed
- The draggable column and row dividers, replaced by the `GRID` control. Any layout saved with them is ignored — set your columns and rows once and it is remembered
- The manual resize handle on the Clock card, which conflicted with rows of a fixed height

### Fixed
- Timer cards restored from a previous session had their **HIDE, SOLO and ⬡ OBS buttons bound twice**, so a click toggled the state on and straight back off and nothing appeared to happen
- A timer card created after the page had loaded could end up with **no listeners at all** on those same buttons, and could not be used as a drag & drop target

---

## v2.2.0 — 2026-08

**Multiple independent timers.**

### New — Timers
- **`+ NEW` button** on the Timer card. Give the timer a name, a colour and a starting duration, and a new card appears with its own countdown
- **Timers are fully independent** — each one has its own duration, its own start / pause / reset, its own presets, its own sound switch and its own overtime. Starting one never touches another
- **Colour as identity.** The chosen colour outlines the card and marks its pip and its name, and stays on whether the timer is selected or not. The countdown itself keeps the green → amber → red state code, so urgency reads the same way on every timer whatever colour you picked
- **Selected timer.** Click a card to select it — it lights up with a glow in its own colour and shows an `ARMED` badge. `Space`, `R` and the arrow keys act on the selected timer, so a Stream Deck can drive any of them. `Tab` / `Shift+Tab` cycles through timers
- **`✎ EDIT`** to rename, recolour or re-time a timer; **`✕`** to remove it
- Extra timers get their own **HIDE**, **SOLO** and **⬡ OBS** buttons, exactly like the built-in cards
- Extra timers are **remembered between sessions** — name, colour, duration, sound switch and dial/digital view
- New timers are added **side by side** in their own auto-filling grid below the main 2 × 2 grid, so the drag & drop and the column/row resizers of the main grid are unchanged
- **Timer cards can be reordered** by dragging one by its title onto another to swap them, exactly like the main grid. The order is remembered
- Voice cues are **off by default** on a new timer: with several timers running, they would otherwise talk over each other

### New — OBS
- Dedicated Browser Source URLs for every extra timer (`?tool=xtimer&obs=1&…`), carrying the name, colour and duration in the URL — a Browser Source is a separate browser and cannot read this window's saved timers

### Changed
- `Space` and `R` now act on the **selected** timer rather than always the built-in one. With a single timer nothing changes: it is selected by default
- The keyboard help and the on-card hint were updated accordingly

### Under the hood
- The Timer is no longer a singleton: a `bindTimer()` factory attaches an independent instance to a card, and a new card is a clone of the original Timer card, so there is no second copy of the markup to keep in sync

---

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

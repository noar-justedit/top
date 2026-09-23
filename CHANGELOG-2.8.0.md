# À coller en haut de CHANGELOG.md

*(Le conteneur de la session a été recyclé depuis la 2.7.0 : je n'avais plus ton CHANGELOG.md complet. Renvoie-le moi et je te rends le fichier entier plutôt que ce bloc.)*

---

## v2.8.0 — 2026-09

### New — Screen projector: the whole grid on a second display

- **A screen projector button in the top bar** opens a second window carrying the whole grid — the same cards, in the same places, in the same shape — with every control taken away: no card buttons, no START / PAUSE / RESET, no `+` `−`, no presets, no sound switches, no OBS settings, no drag handles, no splitters
- **The figures take the room the controls left.** Each card measures what it has and sizes its display to match, so a timer fills its cell and a stopwatch with hundredths still fits
- **Each card keeps the view chosen in the control window** — digital or Gorgy dial, card by card, followed live if you switch one mid-show
- The grid follows: change the shape, add a card, close one, rename or recolour a timer, and the second screen reports it

### New — Send a single card to a second screen

- **A screen button on every card** opens that card alone on another display: big figures, its name, its colour, no controls. Timer, stopwatch, clock and the OBS Media Countdown all work
- Both modes can run at once, on two different displays
- **The two windows agree to the millisecond.** What travels is not the digits but the *deadline*, read on the machine's clock: the second window does its own counting and corrects itself eight times a second. Measured agreement: under 10 ms, including on a 4K display
- **Placed on the other display in one click** on Chrome and Edge, which can ask the system where the screens are — the browser asks permission the first time. Safari and Firefox have no such API: the window opens normally, you drag it across and double-click for full screen, and the browser reopens it there next time
- A second screen keeps itself awake, **dims when it stops hearing** the control window rather than freeze on a number that is no longer true, and closes when the control window does
- It is also a plain URL (`?screen=1`, or `?tool=timer&screen=1&cid=…`), so it can be bookmarked or reopened by hand and will re-attach on its own

> This works between windows of the same browser on the same machine. It does not reach an OBS Browser Source, which is a separate browser — those remain independent instances.

### Changed — The top bar

- Reordered in the order it gets used: **GRID**, **`+ NEW CARD`**, then full screen, screen projector, stay awake and keyboard shortcuts as icons, then the master volume
- `AWAKE` became **Stay awake** and wears a cup, the sign every "keep this machine awake" tool uses
- **Every control now says what it does on hover**, in a proper tooltip instead of the browser's slow grey box — the card buttons, the view switch, the OBS URL button, and the top-bar icons, which report their state as well: whether the screen keeping was actually granted, whether a projector window is open, why `+ NEW CARD` is refusing

### Fixed

- **The OBS Media Countdown Browser Source showed its text panels.** `?tool=media&obs=1` is meant to be the dial alone, but the "no media playing / scene / elapsed / remaining" block was still drawn underneath it. A rule carrying an id was overriding the one that hides it

# TOP! v2.8.0 — send your cards to a second screen

Extended desktop, one click: the whole grid — or any single card — appears on the other display, counting in step with your control window.

## Screen projector

A **screen projector** button in the top bar opens a second window carrying **your whole grid**: the same cards, in the same places, in the same shape — with everything you press taken away. No card buttons, no START / PAUSE / RESET, no `+` `−`, no presets, no sound switches, no OBS settings, no drag handles, no splitters. The card name, its colour, and the figure.

And because the controls no longer take any room, the figures take it: each card measures what it has left and sizes its display to match, so a timer fills its cell and a stopwatch with hundredths still fits.

Each card shows **the view you chose in the control window** — digital or Gorgy dial, card by card, changed live if you switch one mid-show.

The grid follows too. Change `3 × 2` to `2 × 3` and the second screen changes. Add a card, it appears. Close one, it goes. Rename a timer or recolour it and the screen reports it.

## One card, full size

The screen button on a card still sends **that card alone** — big figures, its name, its colour — for the display the speaker or the room is watching. Both modes can run at once, on two different displays.

## How they stay together

What crosses between the windows is not the digits but the **deadline**, read on the machine's own clock. The second window does its own counting and corrects itself eight times a second, so a late or lost message changes nothing on screen. Measured agreement: **under 10 ms**, including on a 4K display.

**Placing the window.** Chrome and Edge can ask the system where your displays are, so TOP! opens the window straight onto the second one — the browser asks permission the first time. Safari and Firefox have no such API: the window opens normally, you drag it across and double-click for full screen, and the browser reopens it there next time.

A second screen keeps itself awake, dims if it stops hearing the control window rather than freeze on a number that is no longer true, and closes when the control window does. It is also a plain URL (`?screen=1`, or `?tool=timer&screen=1&cid=…`), so it can be bookmarked and will re-attach on its own.

> This works between windows of the same browser on the same machine. It does not reach an OBS Browser Source, which is a separate browser — those stay independent instances.

## A tidier top bar

The bar now reads left to right in the order you use it: **GRID**, **`+ NEW CARD`**, then full screen, screen projector, stay awake and keyboard shortcuts as icons, then the master volume.

`AWAKE` became **Stay awake** and wears a cup — the sign every "keep this machine awake" tool uses. And **every control now says what it does when you hover it**, in a proper tooltip rather than the browser's slow grey box: the card buttons, the view switch, the OBS URL button, and the icons in the top bar, which report their state as well — whether the screen keeping is actually granted, whether a projector window is open, why `+ NEW CARD` is refusing.

## Fixed

**The OBS Media Countdown Browser Source showed its text panels.** `?tool=media&obs=1` is meant to be the dial alone, but the "no media playing / scene / elapsed / remaining" block was still drawn underneath it. A rule carrying an id was overriding the one meant to hide it.

---

Still one HTML file, no install, no server, works offline. GPL-3.0.

**Download:** `index.html` · **Try it:** [noar-justedit.github.io/top](https://noar-justedit.github.io/top/)

# TOP! v2.7.0 — the screen stays awake, and maximized cards fill it

One new feature, three fixes — one of them on a bug that shipped in 2.6.2.

## ☀ AWAKE — no more screen going to sleep mid-show

A new button in the top bar asks the machine not to dim or sleep while TOP! is on screen. It is on by default and the choice is remembered.

It is the browser's own Screen Wake Lock: no permission dialog, no extension, nothing to install. The lock is released when the tab goes to the background and taken again when you come back to it. Chrome, Edge, Brave, Firefox and Safari 16.4 and later — iPad and iPhone included — support it; on an older browser the button is greyed out and says so.

It keeps the *screen* awake, not the machine: a closed laptop lid still sleeps, and a screensaver imposed by a company policy still wins.

## Maximized cards now fill the screen

**The clock is no longer cut off.** Maximized, the dial was sized on the width of the card, so on a 16:10 laptop or an iPad in landscape its bottom ran off the screen and the page scrolled. It is now sized on the room actually left on screen, and stays whole from a 390 px phone to a 1920 px display, in both orientations. On a portrait screen — where the width is what limits the circle — it centres itself in the leftover height instead of leaving the page half empty.

**Same for the round dials** of the OBS Media Countdown, the timers and the stopwatches. They stayed at their grid size: a 300 px dial on a 900 px screen. They now take the height the card leaves them — 480 px instead of 300 px on a 1440 × 900 display. The digital views are unchanged.

## Fixed — extra-timer Browser Sources were blank in 2.6.2

An `?tool=xtimer&obs=1…` Browser Source showed nothing at all. The anti-flicker veil introduced in 2.6.2 was lifted at the end of the boot sequence, and the extra-timer path returns from that sequence early — so the page stayed hidden for good. The veil is now lifted whatever route the boot takes.

If you built OBS scenes on extra-timer Browser Sources with 2.6.2, this is the update that brings them back.

## Changed — the scene name in the OBS dial

The dial now shows the scene name on its own, without the `Scene:` label. The line is sized with the dial and clipped to the width of the circle at the height it sits at, so a long scene name is shortened with an ellipsis rather than running under the ring.

---

Still one HTML file, no install, no server, works offline. GPL-3.0.

**Download:** `index.html` · **Try it:** [noar-justedit.github.io/top](https://noar-justedit.github.io/top/)

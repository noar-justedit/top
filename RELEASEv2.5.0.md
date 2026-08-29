# TOP! v2.5.0

**Usable on a tablet, and no more cards cut in half.**

## Double-tap no longer zooms

On iPad, tapping the timer's `+` / `−` buttons twice in a row fired iOS's double-tap-to-zoom instead of stepping the value. It happened in Safari and in Brave alike — every browser on iOS runs on WebKit, so they share the gesture.

The controls now declare `touch-action: manipulation`, which removes that gesture while leaving pinch zoom and scrolling exactly as they were. It also drops the 300 ms delay browsers add before firing a tap, so the buttons answer immediately.

The viewport tag no longer claims `user-scalable=no` either: iOS has ignored it since iOS 10, and elsewhere it only got in the way of people who need to zoom.

## Hold to run the value

Hold `+` or `−` and the value runs, slowly at first then faster. Far fewer taps on a tablet, and handy with a mouse. A single click still steps once.

## Cards no longer hide their own controls

Since v2.3.0 the rows share the height of the screen, and a card too tall for its row scrolled inside itself. In practice that meant that on an iPad in landscape, or on a MacBook at `2 × 2`, **the Timer's START and RESET sat below the fold inside the card**, and the OBS Media card lost its dial and its readouts.

A short card now **shrinks its content instead of hiding it**: smaller digits, tighter steppers and presets, no keyboard reminder, and an OBS dial sized to the height available. Below roughly 285 px of row height the presets step aside — holding `+` / `−` covers the same ground — and the OBS dial gives way to its text readouts. The OBS connection panel, only open while OBS is disconnected, now floats over a short card rather than pushing everything else out of view.

Solo and OBS views are untouched: there a card has the whole page.

Measured on iPad in landscape and at 1920 × 1080, 1512 × 945, 1440 × 900 and 1280 × 800: every control is reachable without scrolling inside a card, at `2 × 2` as well as `3 × 3`.

## Install

Download `index.html` and open it in any modern browser. No install, no server, works offline.

**Full changelog:** [CHANGELOG.md](CHANGELOG.md)

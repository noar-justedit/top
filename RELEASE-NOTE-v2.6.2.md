# TOP! v2.6.2

## No more flicker at launch

The clock dial used to paint at its full CSS size and then shrink into place — a visible jump on every load. The page now waits the two frames it takes to measure and size everything, then appears already laid out. A safety timer lifts the veil whatever happens, so a script error can never leave you with a blank page.

## One grid per orientation

Portrait and landscape now **each remember their own grid shape**. Rotate a tablet and the layout you set for that way round comes back, with the `GRID` field showing the right numbers.

Before, portrait silently forced a single column and the field kept displaying the landscape shape — it lied about what was on screen.

The first time an orientation is used its shape is derived: portrait fits as many columns as stay readable — two on a tablet held upright, one on a phone — and stacks the rest. And a shape always grows to hold every card, so rotating into an orientation whose saved shape is too small no longer leaves cards spilling into rows nobody asked for.

Splitters work in portrait too.

## Small screens

The top bar no longer pushes the page sideways on a phone: it wraps, and the subtitle, the logo and the button padding step back as the screen narrows.

A row never gets shorter than the tightest card needs. Below that the page scrolls instead of cutting a card in half — on a phone some scrolling is unavoidable, and it beats a START button hidden below the fold.

Measured with four cards: iPad landscape 2 × 2 and portrait 2 × 2, both filling the screen with nothing cut. iPhone portrait 1 × 4 and landscape 2 × 2, both scrolling with every card intact.

## Install

Download `index.html` and open it in any modern browser. No install, no server, works offline.

**Full changelog:** [CHANGELOG.md](CHANGELOG.md)

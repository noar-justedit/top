# Sections à ajouter dans README.md

*(Renvoie-moi ton README.md et je te rends le fichier complet plutôt que ces morceaux.)*

---

## 1 — Dans la liste **Features**, ajouter avant « Screen stays awake »

```markdown
- **Second screen** — a screen projector button puts your whole grid on another display, stripped of every control; a button on each card sends that card alone, full size. Both stay in step with the control window
```

## 2 — Nouvelle section, à placer juste après **Cards**

```markdown
## Second Screen

**Screen projector** in the top bar opens a second window carrying your whole grid: the same
cards, in the same places, in the same shape — with everything you press taken away. No card
buttons, no START / PAUSE / RESET, no `+` `−`, no presets, no sound switches, no OBS settings,
no drag handles, no splitters. The card name, its colour, and the figure.

Because the controls no longer take any room, the figures take it: each card measures what it
has left and sizes its display to match. Each card also keeps **the view you chose in the
control window** — digital or Gorgy dial, card by card, followed live if you switch one
mid-show. Change the grid shape, add a card, close one, rename or recolour a timer: the second
screen reports it.

The **screen button on a card** does the other job — that card alone on another display, big
figures, its name, its colour. It is what the speaker or the room watches. Both modes can run
at once, on two different displays.

**How they stay together.** What crosses between the windows is not the digits but the
deadline, read on the machine's own clock — the second window does its own counting and
corrects itself eight times a second, so a late or lost message changes nothing on screen.
Measured agreement: under 10 ms, including on a 4K display.

**Placing the window.** On Chrome and Edge, TOP! can ask the system where your displays are and
open the window straight onto the second one — the browser asks permission the first time.
Safari and Firefox have no such API: the window opens normally, you drag it onto the other
display and double-click it for full screen. The browser reopens it in the same place next time.

A second screen keeps itself awake on its own. If it stops hearing the control window it dims
rather than freeze on a number that is no longer true, and closing the control window closes
its screens with it.

A screen is also a plain URL, so you can bookmark it or reopen it by hand and it will
re-attach on its own:

| What | URL |
|---|---|
| The whole grid | `?screen=1` |
| Clock | `?tool=clock&screen=1` |
| Timer | `?tool=timer&screen=1&cid=…` |
| Stopwatch | `?tool=chrono&screen=1&cid=…` |
| OBS Media Countdown | `?tool=media&screen=1` |

> This works between windows of the same browser on the same machine. It does not reach
> an OBS Browser Source, which is a separate browser — those stay independent instances.
```

## 3 — Nouvelle section courte, après **Keyboard Shortcuts**

```markdown
## The Top Bar

Left to right, in the order you use it: **GRID**, **`+ NEW CARD`**, then full screen, screen
projector, stay awake and keyboard shortcuts as icons, then the master volume.

Hover any control and it says what it does — and, for the icons, what state it is in: whether
the screen keeping was actually granted, whether a projector window is open, why `+ NEW CARD`
is refusing to add a seventh card to a 3 × 2 grid.
```

## 4 — Dans la section **Layout**, à la fin de la liste à puces

```markdown
- **Second screen** sends the whole grid, or one card, to another display, in step with this window
```

## 5 — Dans **OBS Integration → Browser Sources**, sous le tableau

Remplacer la note existante sur les instances indépendantes par :

```markdown
> Each Browser Source is an independent instance of TOP!. A timer started in your control
> window does not drive the timer shown in an OBS Browser Source — control each one where
> it runs. For a display you drive from the control window, use **Second screen** instead:
> it is a browser window, not an OBS source, and it stays in step.
```

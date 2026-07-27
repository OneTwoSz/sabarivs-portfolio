# sabarivs-portfolio

Portfolio site for Sabari VS. Scrolling flies a camera forward through a corridor
of content planes, with a WebGL point field streaming past in the same direction.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5180.

```bash
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

## How the scroll works

This is the part to understand before changing anything.

The document itself has **no content**. It is a single empty `.driver` div whose
only job is to be tall enough to scroll. All the content lives in `.stage`, which
is `position: fixed` with a CSS `perspective`, and every panel inside it is
absolutely positioned on top of every other one.

Scroll position is read as a **camera position**:

```
t = scrollY / (viewportHeight * PANEL_VH)     // t = 2.5 → halfway between panels 2 and 3
d = t - i                                     // this panel's signed distance from the camera
translateZ(d * PANEL_Z)
```

So a panel at `d = -1` is one step ahead of you (small, blurred, faint), `d = 0` is
at the focal plane (sharp, full size, readable), and `d = +0.8` is rushing past the
camera. Panels outside `-1.45 < d < 1.0` are set to `display: none`, so only about
three exist at a time no matter how many you add.

The same `t` is multiplied by `PANEL_WORLD` and handed to the shader as `uTravel`,
which is what makes the point field move with you rather than independently.

All three constants live at the top of `src/lib/hooks.ts`:

| Constant | Effect |
| --- | --- |
| `PANEL_VH` | Scroll distance per panel, in viewport heights. Lower = faster flight. |
| `PANEL_Z` | Z-distance between panels in px. Higher = more dramatic rush. |
| `PANEL_WORLD` | How far the point field travels per panel. Higher = faster starfield. |

Two consequences worth knowing:

- **Every panel must fit in one viewport.** There is no scrolling *within* a panel.
  If you add content, check it at ~660px tall — the type scales use `vh` units
  partly for this reason.
- Panels are ordered by an explicit `z-index` written each frame, because DOM order
  would otherwise paint distant panels over near ones.

## What's where

| Path | What it holds |
| --- | --- |
| `src/data/content.ts` | **All copy, projects, and the flight order.** Edit this, not the components. |
| `src/lib/hooks.ts` | The flight loop, the tuning constants, smooth scroll, pointer tracking. |
| `src/styles/global.css` | The whole design system — colors, type scale, every panel's layout. |
| `src/components/HeroCanvas.tsx` | The WebGL point field (raw WebGL, one draw call, no 3D library). |
| `src/components/Chrome.tsx` | Preloader, grain/vignette, header, progress bar, section nav. |
| `src/sections/Sections.tsx` | Every panel's markup, switched on `panel.kind`. |

### Adding a project or a role

Append to `PROJECTS` or `EXPERIENCE` in `src/data/content.ts`. Both render as
rows inside a single panel, so nothing else needs touching — but both panels are
near the height limit, so **check the result at ~640px tall** before committing.
Project rows link out to `href`; keep `index` sequential.

### Adding or reordering a section

1. Add an entry to `SECTIONS` — this drives the jump menu, the header label, and
   the number shown on the panel.
2. Add an entry to `PANELS` pointing at that section id. Several panels may share
   a section; the jump menu targets the first one.
3. Add a `case` for the new `kind` in `src/sections/Sections.tsx`.

`SECTION_ENTRY` is derived, so nothing else needs updating.

## Design

- Background `#121010`, foreground `#f4f2f0`, accent `#ff5d2e` (used sparingly:
  progress bar, section numbers, hover states).
- Display type: **Unbounded** 900/700. UI and body: **Space Grotesk** 300/400,
  with 0.2–0.3em tracking on uppercase labels.
- Both loaded from Google Fonts in `index.html`. The preloader waits on
  `document.fonts.ready` (2.5s cap) so display type never swaps mid-view.

## Motion and accessibility

- `prefers-reduced-motion: reduce` turns the camera off entirely. `html.flat`
  drops the driver, un-fixes the stage, and lays the panels out as an ordinary
  scrolling document — no Z, no blur, no smooth scroll. The shader's time and
  pointer response also stop, so the field goes still rather than disappearing.
- The WebGL loop pauses on `visibilitychange` and on `webglcontextlost`.
- If WebGL is unavailable the canvas is skipped entirely; the site is fully
  readable without it.
- All content is real DOM text, so it is selectable, searchable, and indexable.

## Deploying

Static output, no server. Build command `npm run build`, publish directory `dist`.
Works as-is on Vercel, Netlify, or Cloudflare Pages.

Because it is a single page with in-page anchors, no SPA rewrite rule is needed.

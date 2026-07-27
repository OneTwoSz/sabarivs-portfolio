# sabarivs-portfolio

Portfolio site for Sabari VS — a single-page, scroll-driven editorial site with a
WebGL particle field behind the type.

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

## What's where

| Path | What it holds |
| --- | --- |
| `src/data/content.ts` | **All copy, projects, and links.** Edit this, not the components. |
| `src/styles/global.css` | The whole design system — colors, type scale, every section's layout. |
| `src/components/HeroCanvas.tsx` | The WebGL point field (raw WebGL, one draw call, no 3D library). |
| `src/components/Chrome.tsx` | Preloader, grain/vignette, header, progress bar, section nav. |
| `src/components/Section.tsx` | Shared section wrapper — numbers each section and wires up reveals. |
| `src/sections/Sections.tsx` | The nine sections themselves. |
| `src/lib/hooks.ts` | Smooth scroll, scroll progress, reveal observer, pointer tracking. |

### Adding a project

Append to `PROJECTS` in `src/data/content.ts`. The index string is what renders in
the left column, so keep it sequential.

### Adding or reordering a section

1. Add an entry to `SECTIONS` in `src/data/content.ts` — this drives the jump menu,
   the active-section label, and each section's displayed number.
2. Export a component from `src/sections/Sections.tsx` wrapped in `<Section id="...">`.
3. Render it in `src/App.tsx` in the same order as `SECTIONS`.

## Design

- Background `#121010`, foreground `#f4f2f0`, accent `#ff5d2e` (used sparingly:
  progress bar, section numbers, hover states).
- Display type: **Unbounded** 900/700. UI and body: **Space Grotesk** 300/400,
  with 0.2–0.3em tracking on uppercase labels.
- Both loaded from Google Fonts in `index.html`. The preloader waits on
  `document.fonts.ready` (2.5s cap) so display type never swaps mid-view.

## Motion and accessibility

- `prefers-reduced-motion: reduce` disables smooth scroll, the grain animation,
  every reveal transition, and the shader's time and pointer response — the field
  goes still rather than disappearing.
- The WebGL loop pauses on `visibilitychange` and on `webglcontextlost`.
- If WebGL is unavailable the canvas is skipped entirely; the site is fully
  readable without it.
- All content is real DOM text, so it is selectable, searchable, and indexable.

## Deploying

Static output, no server. Build command `npm run build`, publish directory `dist`.
Works as-is on Vercel, Netlify, or Cloudflare Pages.

Because it is a single page with in-page anchors, no SPA rewrite rule is needed.

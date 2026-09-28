import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Grain, Overlay, Preloader } from './components/Chrome'
import { Panel } from './sections/Sections'
import { PANELS, SECTION_ENTRY, type SectionId } from './data/content'
import { PANEL_VH, prefersReducedMotion, useFlight, useSmoothScroll } from './lib/hooks'

const HeroCanvas = lazy(() => import('./components/HeroCanvas'))

export default function App() {
  const [ready, setReady] = useState(false)
  const [panelIndex, setPanelIndex] = useState(0)

  const panels = useRef<(HTMLElement | null)[]>([])
  const travel = useRef(0)
  const progressFill = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)

  const flat = useMemo(() => prefersReducedMotion(), [])
  const scrollTo = useSmoothScroll(ready)

  const onPanelChange = useCallback((i: number) => setPanelIndex(i), [])

  useFlight({
    count: PANELS.length,
    panels,
    travel,
    progressFill,
    hint,
    onPanelChange,
  })

  // Hold the loader until fonts are in, so display type never swaps mid-view.
  useEffect(() => {
    let cancelled = false
    const finish = () => {
      if (!cancelled) window.setTimeout(() => setReady(true), 300)
    }
    const fonts = document.fonts as FontFaceSet | undefined
    if (fonts) Promise.race([fonts.ready, wait(2500)]).then(finish)
    else wait(600).then(finish)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-locked', !ready)
  }, [ready])

  useEffect(() => {
    document.documentElement.classList.toggle('flat', flat)
  }, [flat])

  const jump = useCallback(
    (id: SectionId) => {
      const target = SECTION_ENTRY[id] ?? 0
      if (flat) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        scrollTo(target * window.innerHeight * PANEL_VH)
      }
    },
    [flat, scrollTo],
  )

  const safeIndex = Number.isFinite(panelIndex)
    ? Math.min(Math.max(panelIndex, 0), PANELS.length - 1)
    : 0
  const activeSection = (PANELS[safeIndex] ?? PANELS[0]).section

  return (
    <>
      <Suspense fallback={null}>
        <HeroCanvas travel={travel} />
      </Suspense>

      {/* The document is only a scroll driver — the panels themselves are fixed.
          One extra viewport of length lets the final panel settle at the focal plane. */}
      {!flat && (
        <div
          className="driver"
          style={{ height: `calc(${(PANELS.length - 1) * PANEL_VH * 100}vh + 100vh)` }}
          aria-hidden="true"
        />
      )}

      <main className="stage">
        {PANELS.map((data, i) => (
          <Panel
            key={i}
            data={data}
            index={i}
            ref={(el) => {
              panels.current[i] = el
            }}
          />
        ))}
      </main>

      <Grain />
      <Overlay
        active={activeSection}
        onJump={jump}
        progressRef={progressFill}
        hintRef={hint}
      />
      <Preloader done={ready} />
    </>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

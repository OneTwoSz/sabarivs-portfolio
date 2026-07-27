import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Grain, Overlay, Preloader } from './components/Chrome'
import {
  Contact,
  Intro,
  Manifesto,
  Numbers,
  Path,
  Pitch,
  Research,
  Story,
  Work,
} from './sections/Sections'
import type { SectionId } from './data/content'
import { useScrollState, useSmoothScroll } from './lib/hooks'

const HeroCanvas = lazy(() => import('./components/HeroCanvas'))

export default function App() {
  const [ready, setReady] = useState(false)
  const { progress, active } = useScrollState()
  const scrollTo = useSmoothScroll(ready)
  const depth = useRef(0)

  // Feed scroll depth to the shader without re-rendering the canvas.
  depth.current = progress

  // Hold the loader until fonts are in, so the display type never swaps mid-view.
  useEffect(() => {
    let cancelled = false
    const finish = () => {
      if (!cancelled) window.setTimeout(() => setReady(true), 300)
    }

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fonts) Promise.race([fonts.ready, wait(2500)]).then(finish)
    else wait(600).then(finish)

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle('is-locked', !ready)
  }, [ready])

  const jump = (id: SectionId) => {
    const el = document.getElementById(id)
    if (el) scrollTo(el)
  }

  return (
    <>
      <Suspense fallback={null}>
        <HeroCanvas depth={depth} />
      </Suspense>

      <main className="shell">
        <Intro ready={ready} />
        <Pitch />
        <Path />
        <Story />
        <Numbers />
        <Work />
        <Research />
        <Manifesto />
        <Contact />
      </main>

      <Grain />
      <Overlay progress={progress} active={active} onJump={jump} />
      <Preloader done={ready} />
    </>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

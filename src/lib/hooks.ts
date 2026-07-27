import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react'
import Lenis from 'lenis'

/** Scroll distance, in viewport heights, that moves the camera one panel forward. */
export const PANEL_VH = 0.9

/** How far the CSS camera travels between panels, in px of Z. */
export const PANEL_Z = 1000

/** World units the point field travels per panel. */
export const PANEL_WORLD = 8

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Hermite fade between two edges, like GLSL smoothstep. */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Smooth scrolling. Returns a scrollTo helper taking a pixel offset. */
export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return

    const lenis = new Lenis({ duration: 1.4, wheelMultiplier: 0.9, touchMultiplier: 1.6 })
    lenisRef.current = lenis

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return (offset: number) => {
    if (lenisRef.current) lenisRef.current.scrollTo(offset)
    else window.scrollTo({ top: offset, behavior: 'smooth' })
  }
}

type FlightArgs = {
  count: number
  panels: MutableRefObject<(HTMLElement | null)[]>
  /** Written every frame, in world units, for the WebGL field to read. */
  travel: MutableRefObject<number>
  progressFill: RefObject<HTMLElement>
  hint: RefObject<HTMLElement>
  /** Called only when the nearest panel changes, so React re-renders rarely. */
  onPanelChange: (index: number) => void
}

/**
 * The scroll model. The document is just a tall empty driver; the panels are
 * fixed and stacked on Z. Scrolling moves a virtual camera forward through
 * them, so each panel rushes toward you, holds at the focal plane, then flies
 * past. Everything here writes to the DOM directly — no React state per frame.
 */
export function useFlight({
  count,
  panels,
  travel,
  progressFill,
  hint,
  onPanelChange,
}: FlightArgs) {
  useEffect(() => {
    if (prefersReducedMotion()) {
      // Flat fallback: every panel sits still and readable, no camera.
      panels.current.forEach((el) => {
        if (!el) return
        el.style.display = ''
        el.style.transform = ''
        el.style.pointerEvents = 'auto'
        const inner = el.firstElementChild as HTMLElement | null
        if (inner) {
          inner.style.opacity = '1'
          inner.style.filter = 'none'
        }
      })
      return
    }

    const coarse = window.matchMedia('(max-width: 860px)').matches
    let lastIndex = -1
    let frame = 0

    const render = () => {
      const panelPx = window.innerHeight * PANEL_VH
      const t = window.scrollY / panelPx

      travel.current = t * PANEL_WORLD

      for (let i = 0; i < count; i++) {
        const el = panels.current[i]
        if (!el) continue

        const d = t - i

        // Cull anything not in the corridor; keeps us to ~3 live panels.
        if (d < -1.45 || d > 1.0) {
          if (el.style.display !== 'none') el.style.display = 'none'
          continue
        }
        if (el.style.display === 'none') el.style.display = ''

        // d < 0 → still ahead of the camera. d > 0 → passing behind it.
        el.style.transform = `translateZ(${(d * PANEL_Z).toFixed(1)}px)`
        el.style.pointerEvents = Math.abs(d) < 0.35 ? 'auto' : 'none'
        // Panels never intersect, so painting order is purely nearest-first.
        // DOM order would put later (further) panels on top, hence this.
        el.style.zIndex = String(1000 + Math.round(d * 100))

        const inner = el.firstElementChild as HTMLElement | null
        if (!inner) continue

        // Approaching panels stay faint until they are close, so the panel at
        // the focal plane is never competing with a legible ghost behind it.
        const opacity =
          d < 0 ? smoothstep(-1.45, -0.35, d) : 1 - smoothstep(0.25, 0.8, d)
        inner.style.opacity = opacity.toFixed(3)

        // Focus falls off either side of the focal plane. Skipped on small
        // screens — blurring full-viewport type is the expensive part.
        if (!coarse) {
          const blur = clamp((Math.abs(d) - 0.1) * 9, 0, 8)
          inner.style.filter = blur < 0.05 ? 'none' : `blur(${blur.toFixed(2)}px)`
        }
      }

      const index = clamp(Math.round(t), 0, count - 1)
      if (index !== lastIndex) {
        lastIndex = index
        onPanelChange(index)
      }

      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
      if (progressFill.current) {
        progressFill.current.style.width = `${(progress * 100).toFixed(2)}%`
      }
      if (hint.current) {
        hint.current.style.opacity = t > 0.12 ? '0' : '1'
      }

      frame = requestAnimationFrame(render)
    }

    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [count, panels, travel, progressFill, hint, onPanelChange])
}

/** Normalised pointer position (-1…1) for the field's parallax. */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return pointer
}

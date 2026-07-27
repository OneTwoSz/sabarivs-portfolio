import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { SECTIONS, type SectionId } from '../data/content'

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Smooth scrolling. Returns a scrollTo helper that works with or without Lenis. */
export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return

    const lenis = new Lenis({ duration: 1.15, wheelMultiplier: 0.9, touchMultiplier: 1.6 })
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

  return (target: HTMLElement) => {
    if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: 0 })
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/** Page scroll progress (0–1) plus the id of the section currently in view. */
export function useScrollState() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState<SectionId>('intro')

  useEffect(() => {
    let ticking = false

    const measure = () => {
      ticking = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)

      // The active section is the last one whose top has crossed 45% of the viewport.
      const line = window.innerHeight * 0.45
      let current: SectionId = SECTIONS[0].id
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) current = s.id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { progress, active }
}

/** Adds the `in` class to every `.reveal` inside the ref once it enters the viewport. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))
    if (!targets.length) return

    if (prefersReducedMotion()) {
      targets.forEach((t) => t.classList.add('in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.15 },
    )

    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return ref
}

/** Normalised pointer position (-1…1), smoothed, for the hero shader. */
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

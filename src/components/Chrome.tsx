import { useEffect, useRef, useState } from 'react'
import { SECTIONS, SITE, type SectionId } from '../data/content'

export function Grain() {
  return (
    <>
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

export function Preloader({ done }: { done: boolean }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (done) {
      setPct(100)
      return
    }
    // creep toward 92% while assets settle; the real completion snaps it to 100
    const id = window.setInterval(() => {
      setPct((p) => (p >= 92 ? p : p + Math.max(1, Math.round((92 - p) * 0.12))))
    }, 90)
    return () => window.clearInterval(id)
  }, [done])

  return (
    <div className={`loader${done ? ' done' : ''}`} aria-hidden={done}>
      <div className="word">
        {'SABARI'.split('').map((ch, i) => (
          <span key={i} style={{ animationDelay: `${i * 60}ms` }}>
            {ch}
          </span>
        ))}
      </div>
      <div className="bar">
        <i style={{ width: `${pct}%` }} />
      </div>
      <div className="pct">{String(pct).padStart(3, '0')}%</div>
    </div>
  )
}

export function Overlay({
  progress,
  active,
  onJump,
}: {
  progress: number
  active: SectionId
  onJump: (id: SectionId) => void
}) {
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const activeLabel = SECTIONS.find((s) => s.id === active)?.label ?? 'intro'

  return (
    <div className="overlay">
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <header className="header">
        <a className="brand" href="#intro" onClick={(e) => (e.preventDefault(), onJump('intro'))}>
          <span className="mark">{SITE.initials}</span>
          <span className="sep" aria-hidden="true" />
          <span className="full">{SITE.name}</span>
        </a>
        <div className="status">{SITE.status}</div>
      </header>

      <nav className="section-nav" ref={navRef} aria-label="Sections">
        <ul className={`section-menu${open ? ' open' : ''}`}>
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button
                className={s.id === active ? 'active' : ''}
                onClick={() => {
                  onJump(s.id)
                  setOpen(false)
                }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span> {s.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="section-label"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          section <b>{activeLabel}</b>
          <i className={`chev${open ? ' open' : ''}`} aria-hidden="true" />
        </button>
      </nav>

      <div className="hint" style={{ opacity: progress > 0.02 ? 0 : 1 }} aria-hidden="true">
        <span>scroll</span>
        <div className="line" />
      </div>
    </div>
  )
}

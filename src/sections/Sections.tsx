import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Section } from '../components/Section'
import {
  LINKS,
  MANIFESTO,
  NUMBERS,
  PATH,
  PITCH,
  PROJECTS,
  RESEARCH,
  SITE,
  STORY,
} from '../data/content'
import { useReveal } from '../lib/hooks'

/* ------------------------------------------------------------------ 01 --- */

export function Intro({ ready }: { ready: boolean }) {
  const [lit, setLit] = useState(false)

  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => setLit(true), 120)
    return () => window.clearTimeout(id)
  }, [ready])

  const lines = ['Sabari', 'VS']

  return (
    <section id="intro" className={`section intro${lit ? ' lit' : ''}`}>
      <h1>
        {lines.map((line, i) => (
          <span className="line" key={line}>
            <span style={{ '--delay': `${i * 110}ms` } as CSSProperties}>{line}</span>
          </span>
        ))}
      </h1>

      <IntroMeta />
    </section>
  )
}

function IntroMeta() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div className="intro-meta" ref={ref}>
      <div className="col reveal" style={{ '--delay': '500ms' } as CSSProperties}>
        <div className="kicker">Role</div>
        <p>Software engineer &amp; web developer — full-stack, with the interface taken seriously.</p>
      </div>
      <div className="col reveal" style={{ '--delay': '620ms' } as CSSProperties}>
        <div className="kicker">Based in</div>
        <p>{SITE.location}</p>
      </div>
      <div className="col reveal" style={{ '--delay': '740ms' } as CSSProperties}>
        <div className="kicker">Status</div>
        <p>Open to roles and select freelance work.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ 02 --- */

export function Pitch() {
  return (
    <Section id="pitch" title="pitch">
      <p className="pitch-lead reveal">{PITCH.lead}</p>
      <p className="pitch-body reveal" style={{ '--delay': '140ms' } as CSSProperties}>
        {PITCH.body}
      </p>
    </Section>
  )
}

/* ------------------------------------------------------------------ 03 --- */

export function Path() {
  return (
    <Section id="path" title="the path">
      <div>
        {PATH.map((row, i) => (
          <div
            className="path-row reveal"
            key={row.year}
            style={{ '--delay': `${i * 70}ms` } as CSSProperties}
          >
            <div className="year">{row.year}</div>
            <h3 className="title">{row.title}</h3>
            <p className="detail">{row.detail}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ 04 --- */

export function Story() {
  const [first, ...rest] = STORY
  return (
    <Section id="story" title="short story">
      <div className="story">
        <p className="first reveal">{first}</p>
        <div className="rest reveal" style={{ '--delay': '160ms' } as CSSProperties}>
          {rest.map((p, i) => (
            <p className="body-text" key={i}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ 05 --- */

export function Numbers() {
  return (
    <Section id="numbers" title="numbers">
      <div className="numbers">
        {NUMBERS.map((n, i) => (
          <div
            className="cell reveal"
            key={n.label}
            style={{ '--delay': `${i * 90}ms` } as CSSProperties}
          >
            <div className="value">{n.value}</div>
            <div className="label">{n.label}</div>
            <div className="note">{n.note}</div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ 06 --- */

export function Work() {
  return (
    <Section id="work" title="case studies">
      <div className="work-list">
        {PROJECTS.map((p, i) => {
          const inner = (
            <>
              <div className="top">
                <span className="idx">{p.index}</span>
                <h3 className="name">{p.title}</h3>
                <span className="year">{p.year}</span>
              </div>
              <div className="bottom">
                <span aria-hidden="true" />
                <div>
                  <p className="blurb">{p.blurb}</p>
                  <ul className="tags">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  {p.href && (
                    <span className="go">
                      view project <span aria-hidden="true">→</span>
                    </span>
                  )}
                </div>
              </div>
            </>
          )

          const style = { '--delay': `${i * 60}ms` } as CSSProperties

          return p.href ? (
            <a
              className="work-row reveal"
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              style={style}
            >
              {inner}
            </a>
          ) : (
            <div className="work-row reveal" key={p.title} style={style}>
              {inner}
            </div>
          )
        })}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------------ 07 --- */

export function Research() {
  return (
    <Section id="research" title="research">
      <a
        className="research reveal"
        href={RESEARCH.href}
        target="_blank"
        rel="noreferrer noopener"
      >
        <span className="kicker">{RESEARCH.kicker}</span>
        <h3>{RESEARCH.title}</h3>
        <p className="body-text">{RESEARCH.body}</p>
        <span className="doi">DOI {RESEARCH.doi} →</span>
      </a>
    </Section>
  )
}

/* ------------------------------------------------------------------ 08 --- */

export function Manifesto() {
  return (
    <Section id="manifesto" title="manifesto">
      <ul className="manifesto">
        {MANIFESTO.map((line, i) => (
          <li
            className="reveal"
            key={i}
            style={{ '--delay': `${i * 80}ms` } as CSSProperties}
          >
            <span className="n">{String(i + 1).padStart(2, '0')}</span>
            <p className="t">{line}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ------------------------------------------------------------------ 09 --- */

export function Contact() {
  const year = useRef(new Date().getFullYear()).current

  return (
    <Section id="contact" title="let's talk" className="contact">
      <p className="big reveal">
        Got something
        <br />
        worth building?
        <br />
        <a href={`mailto:${SITE.email}`}>Say hello →</a>
      </p>

      <div className="contact-links reveal" style={{ '--delay': '160ms' } as CSSProperties}>
        {LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener">
            <div className="k">{l.label}</div>
            <div className="v">{l.value}</div>
          </a>
        ))}
      </div>

      <div className="colophon reveal" style={{ '--delay': '260ms' } as CSSProperties}>
        <span>© {year} {SITE.name}</span>
        <span>Built with React, WebGL &amp; Vite</span>
        <span>{SITE.location}</span>
      </div>
    </Section>
  )
}

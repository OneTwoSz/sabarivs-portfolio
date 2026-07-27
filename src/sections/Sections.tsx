import { forwardRef } from 'react'
import {
  EDUCATION,
  EXPERIENCE,
  LINKS,
  MANIFESTO,
  NUMBERS,
  PITCH,
  PROJECTS,
  RESEARCH,
  SECTIONS,
  SITE,
  STORY,
  type Panel as PanelData,
} from '../data/content'

/** One Z-plane in the flight. The inner element carries opacity and blur so the
 *  outer one is left free for the 3D transform. */
const Plane = forwardRef<HTMLElement, { id?: string; className?: string; children: React.ReactNode }>(
  function Plane({ id, className = '', children }, ref) {
    return (
      <section ref={ref} id={id} className={`panel ${className}`.trim()}>
        <div className="panel-inner">{children}</div>
      </section>
    )
  },
)

function Head({ section, note }: { section: string; note?: string }) {
  const i = SECTIONS.findIndex((s) => s.id === section)
  return (
    <div className="panel-head">
      <span className="num">{String(i + 1).padStart(2, '0')}</span>
      <span className="kicker">{SECTIONS[i]?.label}</span>
      <span className="rule" aria-hidden="true" />
      {note && <span className="kicker note">{note}</span>}
    </div>
  )
}

export const Panel = forwardRef<HTMLElement, { data: PanelData; index: number }>(
  function Panel({ data }, ref) {
    switch (data.kind) {
      case 'intro':
        return (
          <Plane ref={ref} id="intro" className="p-intro">
            <h1 className="display">
              <span>Sabari</span>
              <span>VS</span>
            </h1>
            <div className="intro-meta">
              <div className="col">
                <div className="kicker">Currently</div>
                <p>Software Developer at Quantifi — risk systems, and the front ends on them.</p>
              </div>
              <div className="col">
                <div className="kicker">Based in</div>
                <p>{SITE.location}</p>
              </div>
              <div className="col">
                <div className="kicker">Also</div>
                <p>Full-stack freelance work, and one ACM paper.</p>
              </div>
            </div>
          </Plane>
        )

      case 'pitch':
        return (
          <Plane ref={ref} id="pitch">
            <Head section="pitch" />
            <p className="pitch-lead">{PITCH.lead}</p>
            <p className="pitch-body">{PITCH.body}</p>
          </Plane>
        )

      case 'experience':
        return (
          <Plane ref={ref} id="experience">
            <Head section="experience" note="now at Quantifi" />
            <div className="path-list">
              {EXPERIENCE.map((row) => (
                <div className="path-row" key={row.company + row.date}>
                  <div className="year">{row.date}</div>
                  <h3 className="title">
                    {row.role}
                    <span className="at">{row.company}</span>
                  </h3>
                  <p className="detail">{row.detail}</p>
                </div>
              ))}
            </div>
            <div className="education">
              <span className="kicker">Education</span>
              {EDUCATION.map((e) => (
                <p key={e.title}>
                  <b>{e.title}</b> — {e.detail}
                </p>
              ))}
            </div>
          </Plane>
        )

      case 'story': {
        const [first, ...rest] = STORY
        return (
          <Plane ref={ref} id="story">
            <Head section="story" />
            <div className="story">
              <p className="first">{first}</p>
              <div className="rest">
                {rest.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </Plane>
        )
      }

      case 'numbers':
        return (
          <Plane ref={ref} id="numbers">
            <Head section="numbers" />
            <div className="numbers">
              {NUMBERS.map((n) => (
                <div className="cell" key={n.label}>
                  <div className="value">{n.value}</div>
                  <div className="label">{n.label}</div>
                  <div className="note">{n.note}</div>
                </div>
              ))}
            </div>
          </Plane>
        )

      case 'work':
        return (
          <Plane ref={ref} id="work">
            <Head section="work" note={`${PROJECTS.length} selected`} />
            <div className="work-list">
              {PROJECTS.map((p) => (
                <a
                  className="work-row"
                  key={p.title}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <span className="idx">{p.index}</span>
                  <span className="name">{p.title}</span>
                  <span className="meta">{p.tags.join(' · ')}</span>
                  <span className="year">{p.year}</span>
                  <span className="arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </Plane>
        )

      case 'research':
        return (
          <Plane ref={ref} id="research">
            <Head section="research" />
            <a className="research" href={RESEARCH.href} target="_blank" rel="noreferrer noopener">
              <span className="kicker">{RESEARCH.kicker}</span>
              <h3>{RESEARCH.title}</h3>
              <p>{RESEARCH.body}</p>
              <span className="doi">DOI {RESEARCH.doi} →</span>
            </a>
          </Plane>
        )

      case 'manifesto':
        return (
          <Plane ref={ref} id="manifesto">
            <Head section="manifesto" />
            <ul className="manifesto">
              {MANIFESTO.map((line, i) => (
                <li key={i}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <p className="t">{line}</p>
                </li>
              ))}
            </ul>
          </Plane>
        )

      case 'contact':
        return (
          <Plane ref={ref} id="contact" className="p-contact">
            <p className="big display">
              Got something
              <br />
              worth building?
            </p>
            <a className="mail" href={`mailto:${SITE.email}`}>
              {SITE.email} <span aria-hidden="true">→</span>
            </a>
            <div className="contact-links">
              {LINKS.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer noopener">
                  <span className="k">{l.label}</span>
                  <span className="v">{l.value}</span>
                </a>
              ))}
            </div>
            <div className="colophon">
              <span>
                © {new Date().getFullYear()} {SITE.name}
              </span>
              <span>Built with React, WebGL &amp; Vite</span>
            </div>
          </Plane>
        )
    }
  },
)

import { forwardRef } from 'react'
import {
  LINKS,
  MANIFESTO,
  NUMBERS,
  PATH,
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
                <div className="kicker">Role</div>
                <p>Software engineer &amp; web developer — full-stack, interface taken seriously.</p>
              </div>
              <div className="col">
                <div className="kicker">Based in</div>
                <p>{SITE.location}</p>
              </div>
              <div className="col">
                <div className="kicker">Status</div>
                <p>Open to roles and select freelance work.</p>
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

      case 'path':
        return (
          <Plane ref={ref} id="path">
            <Head section="path" />
            <div className="path-list">
              {PATH.map((row) => (
                <div className="path-row" key={row.year}>
                  <div className="year">{row.year}</div>
                  <h3 className="title">{row.title}</h3>
                  <p className="detail">{row.detail}</p>
                </div>
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
          <Plane ref={ref} id="work" className="p-title">
            <Head section="work" note={`${PROJECTS.length} selected`} />
            <h2 className="display big">
              Case
              <br />
              Studies
            </h2>
            <p className="pitch-body">
              Products, client work, and one research build — each of them shipped, each of
              them with a constraint that made it interesting.
            </p>
          </Plane>
        )

      case 'project': {
        const p = data.project
        return (
          <Plane ref={ref} className="p-project">
            <div className="panel-head">
              <span className="num">{p.index}</span>
              <span className="kicker">case study</span>
              <span className="rule" aria-hidden="true" />
              <span className="kicker note">{p.year}</span>
            </div>
            <h2 className="project-name display">{p.title}</h2>
            <p className="project-blurb">{p.blurb}</p>
            <ul className="tags">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {p.href && (
              <a className="go" href={p.href} target="_blank" rel="noreferrer noopener">
                view project <span aria-hidden="true">→</span>
              </a>
            )}
          </Plane>
        )
      }

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

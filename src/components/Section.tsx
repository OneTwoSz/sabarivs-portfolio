import type { ReactNode } from 'react'
import { SECTIONS, type SectionId } from '../data/content'
import { useReveal } from '../lib/hooks'

export function Section({
  id,
  title,
  className = '',
  children,
}: {
  id: SectionId
  title?: string
  className?: string
  children: ReactNode
}) {
  const ref = useReveal<HTMLElement>()
  const num = String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')

  return (
    <section id={id} ref={ref} className={`section ${className}`.trim()}>
      {title && (
        <div className="section-head reveal">
          <span className="num">{num}</span>
          <h2 className="kicker">{title}</h2>
          <span className="rule" aria-hidden="true" />
        </div>
      )}
      {children}
    </section>
  )
}

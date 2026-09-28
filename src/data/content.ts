export type Project = {
  index: string
  title: string
  blurb: string
  tags: string[]
  year: string
  href?: string
}

export const SITE = {
  name: 'Sabari VS',
  initials: 'SVS',
  status: 'open to work — 2k26',
  /** Said in the intro and at the contact panel, so it is the same everywhere. */
  availability: 'Open to software developer roles — front end and full-stack.',
  email: 'sabarivs@gmail.com',
  location: 'Melbourne, Australia',
}

/**
 * Each section has one job, and a fact lives in one place: the pitch says who
 * and why, work and experience hold the evidence. Resist restating a fact in
 * a second section's prose. Nothing here quotes Quantifi metrics — keep it so.
 */
export const SECTIONS = [
  { id: 'intro', label: 'intro' },
  { id: 'pitch', label: 'about' },
  { id: 'work', label: 'selected work' },
  { id: 'experience', label: 'experience' },
  { id: 'research', label: 'research' },
  { id: 'contact', label: "let's talk" },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const PITCH = {
  lead: "I build software people don't give up on.",
  body: 'I started underneath the abstraction — networks, then a research lab — and worked my way up the stack to the interface. Enterprise Java taught me what shipping really costs. Sitting next to the people using the software taught me that most problems are design problems first. Most recently I built front ends on financial risk systems at Quantifi, where being wrong is expensive and being slow is almost as bad.',
  motto: 'Understand the problem until the solution is boring.',
}

export type Role = {
  date: string
  role: string
  company: string
  detail: string
}

export const EXPERIENCE: Role[] = [
  {
    date: 'May 2025 — Sep 2026',
    role: 'Software Developer',
    company: 'Quantifi',
    detail:
      'Worked across financial risk systems — how risk results are stored and served, and the React and TypeScript front ends built on top of them.',
  },
  {
    date: 'Jul 2022 — Jun 2024',
    role: 'IT Support Analyst',
    company: 'Allied Pickfords',
    detail:
      'Owned the company website redesign — +20% conversion, +15% organic traffic — alongside infrastructure rollouts for major clients.',
  },
  {
    date: 'Feb 2021 — Feb 2022',
    role: 'Java Technical Engineer',
    company: 'Cognizant',
    detail:
      'Full-stack Java on Spring with React front ends. Cut bugs by 15% and tightened the CI/CD pipeline.',
  },
  {
    date: '2019 — 2020',
    role: 'Earlier',
    company: 'MIT Manipal · BSNL',
    detail:
      'Research assistant on software-defined networks, and an internship in national-scale traffic management and server administration.',
  },
]

export const EDUCATION = [
  { title: 'Monash University', detail: 'Business Information Systems' },
  { title: 'Manipal Institute of Technology', detail: 'Computer & Communication Engineering' },
]

/**
 * The best few, not everything. Client work leads because it is real software
 * with real users; the rest lives on GitHub.
 */
export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'Aevum Nexus',
    blurb:
      'Client marketing site built around motion — a custom CMS so the team edits content themselves, with animation held to a performance budget on every device.',
    tags: ['Client', 'CMS', 'Motion'],
    year: '2024',
    href: 'https://avmnexus.com/',
  },
  {
    index: '02',
    title: 'The Farm Yarra Valley',
    blurb:
      'Wedding venue site — an immersive gallery, a shorter path from browsing to booking, and SEO work that moved its rankings.',
    tags: ['Client', 'SEO', 'Bookings'],
    year: '2024',
    href: 'https://www.thefarmyarravalley.com.au/',
  },
  {
    index: '03',
    title: 'GoalMaster',
    blurb:
      'Breaks big goals into tasks small enough to actually start. Full-stack, with auth and a progress dashboard.',
    tags: ['Astro', 'Supabase', 'AI'],
    year: '2025',
    href: 'https://goalmaster1.netlify.app/',
  },
  {
    index: '04',
    title: 'AImagine',
    blurb:
      'Complex image edits as single actions — background removal, generative fill, restoration and recolouring.',
    tags: ['Next.js', 'Cloudinary AI', 'SaaS'],
    year: '2024',
    href: 'https://aimagine-five.vercel.app/',
  },
]

export const MORE_WORK = { label: 'More on GitHub', href: 'https://github.com/OneTwoSz' }

export const RESEARCH = {
  kicker: 'Co-authored — ACM Digital Library',
  title: 'Inflated Exertion: Designing a Bodily Extension that Embodies Physical Activity',
  body: 'A pneumatic bodily extension that inflates in response to the intensity and duration of a wearer’s exertion — turning effort into something visible and physical. The work explores how a dynamic embodiment of activity can help people re-engage with their own bodies rather than with a number on a screen.',
  href: 'https://dl.acm.org/doi/10.1145/3689050.3706069',
  doi: '10.1145/3689050.3706069',
}

/**
 * The flight path. Each entry is one Z-plane the camera passes through, in
 * order. `section` is what the jump menu and the header label report while
 * you are on that panel — several panels can share one section.
 */
export type Panel = {
  kind: 'intro' | 'pitch' | 'work' | 'experience' | 'research' | 'contact'
  section: SectionId
}

export const PANELS: Panel[] = [
  { kind: 'intro', section: 'intro' },
  { kind: 'pitch', section: 'pitch' },
  { kind: 'work', section: 'work' },
  { kind: 'experience', section: 'experience' },
  { kind: 'research', section: 'research' },
  { kind: 'contact', section: 'contact' },
]

/** First panel index for each section, for the jump menu. */
export const SECTION_ENTRY: Record<SectionId, number> = SECTIONS.reduce(
  (acc, s) => {
    acc[s.id] = Math.max(0, PANELS.findIndex((p) => p.section === s.id))
    return acc
  },
  {} as Record<SectionId, number>,
)

// NOTE: the old site shipped a placeholder LinkedIn URL, so there is no verified
// profile to link. Add it here once confirmed rather than guessing at the slug.
export const LINKS = [
  { label: 'Email', value: 'sabarivs@gmail.com', href: 'mailto:sabarivs@gmail.com' },
  { label: 'GitHub', value: 'OneTwoSz', href: 'https://github.com/OneTwoSz' },
]

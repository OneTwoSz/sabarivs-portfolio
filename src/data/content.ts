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
  status: 'portfolio — 2k26',
  email: 'sabarivs@gmail.com',
  location: 'Melbourne, Australia',
}

export const SECTIONS = [
  { id: 'intro', label: 'intro' },
  { id: 'pitch', label: 'pitch' },
  { id: 'experience', label: 'experience' },
  { id: 'story', label: 'short story' },
  { id: 'numbers', label: 'numbers' },
  { id: 'work', label: 'case studies' },
  { id: 'research', label: 'research' },
  { id: 'manifesto', label: 'manifesto' },
  { id: 'contact', label: "let's talk" },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export const PITCH = {
  lead: 'I build software that people actually finish using.',
  body: 'Five years across a research lab, an enterprise Java floor, an IT team, and now a product engineering team — currently re-architecting how risk results are stored and shipping front ends on top of them at Quantifi. The through-line is the interface: the layer where a system either earns trust or loses it.',
}

export type Role = {
  date: string
  role: string
  company: string
  detail: string
}

export const EXPERIENCE: Role[] = [
  {
    date: 'May 2025 — Present',
    role: 'Software Developer',
    company: 'Quantifi',
    detail:
      'Re-architected risk result storage into a two-tier model — metadata in SQL, payloads in blob storage — halving report load times. Shipped SweepToCash, a React and TypeScript app on .NET services.',
  },
  {
    date: 'Jul 2022 — Jun 2024',
    role: 'IT Support Analyst',
    company: 'Allied Pickfords',
    detail:
      'Led IT infrastructure rollouts for major clients, and redesigned the company website for a 20% lift in conversion and 15% growth in organic traffic.',
  },
  {
    date: 'Feb 2021 — Feb 2022',
    role: 'Java Technical Engineer',
    company: 'Cognizant',
    detail:
      'Full-stack Java on Spring with React front ends. Cut bugs by 15%, tightened the CI/CD pipeline, and held 95% functional accuracy before deployment.',
  },
  {
    date: 'Nov 2019 — Apr 2020',
    role: 'Research Assistant — Software Defined Networks',
    company: 'MIT, Manipal',
    detail:
      'Statistical, qualitative, and quantitative analysis in a working lab, managing the research data and presenting the findings it supported.',
  },
  {
    date: 'Jul 2019 — Jan 2020',
    role: 'Internship',
    company: 'BSNL',
    detail:
      'Traffic management and server administration at national scale — how connectivity infrastructure is actually run when the population is the load.',
  },
]

export const EDUCATION = [
  { title: 'Monash University', detail: 'Business Information Systems' },
  { title: 'Manipal Institute of Technology', detail: 'Computer & Communication Engineering' },
]

export const STORY = [
  'I started underneath the abstraction — Computer and Communication Engineering, then a research lab working on software defined networks — before moving up the stack into Business Information Systems at Monash.',
  'That order matters. Cognizant taught me enterprise Java and what a real deployment pipeline costs. Allied Pickfords put me in front of the people using the thing, which is where I learned that a 20% lift in conversion is a design problem before it is a code problem.',
  'Now at Quantifi I work on financial risk systems — the kind of software where being wrong is expensive and being slow is almost as bad. Splitting risk results across SQL and blob storage halved report load times, which is the sort of unglamorous win I have come to like most.',
  'Alongside that: AI tooling, commercial sites, and one ACM paper about a pneumatic sleeve that inflates when you exercise. I like the work that sits between disciplines.',
]

/**
 * Scattered through the corridor rather than sitting in a grid. `depth` is
 * 0 (far, small, slow) to 1 (close, huge, fast) and drives size, stroke
 * weight, dimming and parallax rate together. `x`/`y` are percentages of the
 * panel, positioning each numeral's own anchor point.
 */
export type Stat = {
  value: string
  label: string
  depth: number
  x: number
  y: number
}

export const NUMBERS: Stat[] = [
  { value: '5', label: 'years in industry', depth: 0.95, x: 2, y: 54 },
  { value: '9+', label: 'shipped projects', depth: 0.62, x: 41, y: 14 },
  { value: '1', label: 'ACM publication', depth: 0.3, x: 38, y: 84 },
  { value: '∞', label: 'refactors', depth: 0.14, x: 74, y: 40 },
]

export const PROJECTS: Project[] = [
  {
    index: '01',
    title: 'GoalMaster',
    blurb:
      'An AI-powered goal-setting app that breaks large ambitions into tasks small enough to actually start. Full-stack, with authentication, authorization, and a progress dashboard.',
    tags: ['Astro', 'Node.js', 'Supabase', 'AI'],
    year: '2025',
    href: 'https://goalmaster1.netlify.app/',
  },
  {
    index: '02',
    title: 'AImagine',
    blurb:
      'A SaaS platform that turns complex image editing into single actions — background removal, generative fill, restoration, and object recoloring for designers and photographers.',
    tags: ['Next.js', 'Cloudinary AI', 'SaaS'],
    year: '2024',
    href: 'https://aimagine-five.vercel.app/',
  },
  {
    index: '03',
    title: 'Aevum Nexus',
    blurb:
      'A modern marketing site built for speed and motion: interactive UI, advanced animation, a custom CMS for content, and performance budgets held across devices.',
    tags: ['Web', 'CMS', 'Motion', 'Performance'],
    year: '2024',
    href: 'https://avmnexus.com/',
  },
  {
    index: '04',
    title: 'The Farm Yarra Valley',
    blurb:
      'An elegant, user-centric site for a premium wedding venue — immersive gallery, streamlined booking, SEO work that moved rankings, and integrations with wedding planning tools.',
    tags: ['Web', 'SEO', 'Bookings'],
    year: '2024',
    href: 'https://www.thefarmyarravalley.com.au/',
  },
  {
    index: '05',
    title: 'TeamUp',
    blurb:
      'A platform helping international students in Melbourne find and join local sports communities. Led development end to end — the problem was social, the solution happened to be software.',
    tags: ['Full-stack', 'Community'],
    year: '2023',
    href: 'https://github.com/OneTwoSz/TeamUp.git',
  },
  {
    index: '06',
    title: 'Blockchain Traffic Fine Management',
    blurb:
      'A blockchain-backed fine management system for law enforcement contexts — transparent by construction, resistant to quiet edits, and faster to process than the paper trail it replaces.',
    tags: ['Blockchain', 'Smart contracts', 'GovTech'],
    year: '2023',
    href: 'https://drive.google.com/file/d/13fddEqbMRur2JLSXsm_w08Gq1pr6T_Qm/view?usp=sharing',
  },
  {
    index: '07',
    title: 'AI Summarizer',
    blurb:
      'Long text and articles in, a short honest summary out. A small tool built to find where language models are genuinely useful and where they are just confident.',
    tags: ['AI', 'React'],
    year: '2023',
    href: 'https://shimmering-otter-f61c0a.netlify.app/',
  },
  {
    index: '08',
    title: 'Hotel Management System',
    blurb:
      'An operations system for daily hotel workflow — bookings, rooms, and staff coordination in one place, designed around the people who use it every shift.',
    tags: ['Systems', 'Ops'],
    year: '2022',
    href: 'https://charming-empanada-0210ce.netlify.app/',
  },
]

export const RESEARCH = {
  kicker: 'Co-authored — ACM Digital Library',
  title: 'Inflated Exertion: Designing a Bodily Extension that Embodies Physical Activity',
  body: 'A pneumatic bodily extension that inflates in response to the intensity and duration of a wearer’s exertion — turning effort into something visible and physical. The work explores how a dynamic embodiment of activity can help people re-engage with their own bodies rather than with a number on a screen.',
  href: 'https://dl.acm.org/doi/10.1145/3689050.3706069',
  doi: '10.1145/3689050.3706069',
}

export const MANIFESTO = [
  'The interface is the product. Everything behind it is an implementation detail the user never agreed to care about.',
  'Fast is a feature. So is quiet. Most software is too loud.',
  'If it needs a tooltip to be understood, it needs a redesign.',
  'Understand the problem until the solution is boring.',
  'Ship it. A shipped B beats an unshipped A every single time.',
]

/**
 * The flight path. Each entry is one Z-plane the camera passes through, in
 * order. `section` is what the jump menu and the header label report while
 * you are on that panel — several panels can share one section.
 */
export type Panel = {
  kind:
    | 'intro'
    | 'pitch'
    | 'experience'
    | 'story'
    | 'numbers'
    | 'work'
    | 'research'
    | 'manifesto'
    | 'contact'
  section: SectionId
}

export const PANELS: Panel[] = [
  { kind: 'intro', section: 'intro' },
  { kind: 'pitch', section: 'pitch' },
  { kind: 'experience', section: 'experience' },
  { kind: 'story', section: 'story' },
  { kind: 'numbers', section: 'numbers' },
  { kind: 'work', section: 'work' },
  { kind: 'research', section: 'research' },
  { kind: 'manifesto', section: 'manifesto' },
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

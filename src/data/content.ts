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
  { id: 'path', label: 'the path' },
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
  body: 'Full-stack engineering with a bias for the interface — the layer where a system either earns trust or loses it. Business Information Systems out of Monash, sitting on top of a Computer & Communication Engineering foundation. That mix is the whole point: I can read the architecture and still argue about the kerning.',
}

export const PATH: { year: string; title: string; detail: string }[] = [
  {
    year: '2019',
    title: 'Computer & Communication Engineering',
    detail:
      'Started underneath the abstraction — networks, signals, and systems. The part of the stack most web developers never have to think about.',
  },
  {
    year: '2022',
    title: 'Monash University — Business Information Systems',
    detail:
      'Moved up the stack, toward the place where technology has to justify itself to a business. Learned to translate in both directions.',
  },
  {
    year: '2023',
    title: 'Technical engineering & IT internships',
    detail:
      'Real constraints, real deadlines, real legacy code. Learned how to be useful in a codebase I did not write, quickly.',
  },
  {
    year: '2024',
    title: 'Research — ACM published',
    detail:
      'Co-authored "Inflated Exertion" with the Exertion Games Lab: a pneumatic bodily extension that inflates in response to physical activity.',
  },
  {
    year: '2026',
    title: 'Building, shipping, freelancing',
    detail:
      'Client work and products in parallel — AI tooling, commercial sites, and platforms that put people in the same room.',
  },
]

export const STORY = [
  "I'm a recent Monash University graduate in Business Information Systems, with a foundational background in Computer and Communication Engineering.",
  'My practical experience spans technical engineering and IT internships — enough time in fast-moving environments to know that the hard part is rarely the syntax. It is understanding the problem well enough that the solution looks obvious afterwards.',
  'I like the work that sits between disciplines: an AI tool that has to feel calm, a blockchain system that has to be legible to a non-technical clerk, a wedding venue site that has to load in two seconds on regional mobile data.',
  'Adaptable and driven, and looking for the kind of team that treats craft as a requirement rather than a bonus.',
]

export const NUMBERS = [
  { value: '9+', label: 'shipped projects', note: 'products, client sites, and platforms' },
  { value: '1', label: 'ACM publication', note: 'CHI / TEI-adjacent HCI research' },
  { value: '2', label: 'degrees', note: 'engineering foundation, BIS on top' },
  { value: '∞', label: 'refactors', note: 'the honest number' },
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

export const LINKS = [
  { label: 'Email', value: 'sabarivs@gmail.com', href: 'mailto:sabarivs@gmail.com' },
  { label: 'GitHub', value: 'OneTwoSz', href: 'https://github.com/OneTwoSz' },
  { label: 'LinkedIn', value: 'sabari-vs', href: 'https://www.linkedin.com/in/sabari-vs/' },
]

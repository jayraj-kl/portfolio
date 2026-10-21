export type Profile = "sde" | "research";

export type Link = { label: string; href: string };

// The main sections a content set can order. Skills, education and the GitHub graph
// are placed by each design, not by the content set.
export type SectionId =
  | "interests"
  | "news"
  | "experience"
  | "work"
  | "publications"
  | "contact";

export type Experience = {
  org: string;
  place: string;
  title: string;
  // "MM/YYYY", or null while the role is ongoing.
  start: string;
  end: string | null;
  // One sentence on what the work is, one on how it is built.
  what: string;
  how: string;
  advisor?: string;
  // Shown only in the role's detail view; every field is optional and left out until written.
  details?: ExperienceDetails;
};

export type ExperienceDetails = {
  // Further points about the work, one sentence each.
  highlights?: string[];
  // Tools used in the role.
  stack?: string[];
  links?: Link[];
  // A picture of the work, path under public/.
  image?: { src: string; alt: string };
};

// Paths under public/. A file that doesn't exist yet falls back to the design's own placeholder.
export type ProjectMedia = {
  // The still shown at rest.
  poster?: string;
  // A short demo clip.
  video?: string;
  gallery?: string[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  year: string;
  what: string;
  how: string;
  stack: string[];
  links: Link[];
  // Image slot names, filled later per design.
  images: string[];
  media?: ProjectMedia;
};

export type Author = { name: string; self?: boolean };

export type Publication = {
  id: string;
  title: string;
  authors: Author[];
  venue: string;
  venueShort: string;
  year: string;
  status: string;
  // One plain sentence. Paraphrases the title only; replace with your own summary.
  summary: string;
  links: Link[];
  bibtex?: string;
  image: string;
  // A figure from the paper, path under public/.
  figure?: string;
};

export type NewsItem = { date: string; text: string; href?: string };

export type ContentSet = {
  profile: Profile;
  meta: { title: string; description: string };
  positioning: string;
  bio: string;
  // Names only: employers and venues. Never metrics.
  proofStrip: string[];
  sectionOrder: SectionId[];
  experience: Experience[];
  projects: Project[];
  publications: Publication[];
  researchInterests?: string[];
  news?: NewsItem[];
  cv: Link;
  closing: { heading: string; body: string };
};

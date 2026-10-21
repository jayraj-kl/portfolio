import { TECH_STACK } from "@/lib/constants";
import type { Link, Project, Publication } from "./types";

export const SHARED = {
  name: "Jayraj Ladkat",
  fullName: "Jayraj Kiran Ladkat",
  wordmark: "JAYRAJ",
  email: "jayrajkladkat@gmail.com",
  location: "Gurugram / Pune, India",
  timeZone: "Asia/Kolkata",
  githubUsername: "jayraj-kl",
  // Set this to a Cal.com or Calendly link to show the "Schedule a meeting" action.
  calendarUrl: "",
  socials: [
    { label: "GitHub", href: "https://github.com/jayraj-kl" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/jayraj-ladkat-25534626b/",
    },
    { label: "X", href: "https://x.com/JayrajKLadkat" },
  ] satisfies Link[],
  education: {
    degree: "B.Tech. in Computer Science and Engineering",
    school: "MIT World Peace University",
    place: "Pune, Maharashtra, India",
    start: "10/2022",
    end: "10/2026",
  },
  techStack: TECH_STACK,
  // Affiliation and venue logos under public/logos/, matched by the start of a display name
  // (an org, a school, a venue or a proof-strip entry); the longest match wins, so a venue can
  // have its own logo and fall back to its publisher's. A missing file shows the design's fallback.
  logos: {
    // The University of Waterloo's logo stands in for TIGER-Lab.
    "TIGER-Lab": "/logos/uwaterloo.png",
    "Publicis Sapient": "/logos/publicis-sapient.svg",
    // From the company's LinkedIn page.
    "Elixir AI": "/logos/elixir-ai.jpg",
    "Centre for Development of Advanced Computing": "/logos/cdac.svg",
    "MIT World Peace University": "/logos/mit-wpu.jpg",
    "IEEE HiPC": "/logos/hipc.png",
    // ICBDS has no logo of its own, so it takes IEEE's.
    IEEE: "/logos/ieee.svg",
  } as Record<string, string>,
};

export function logoFor(name: string): string | undefined {
  const key = Object.keys(SHARED.logos)
    .filter((prefix) => name.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];
  return key ? SHARED.logos[key] : undefined;
}

// Projects and papers appear in both content sets, so their wording lives here once.
export const PROJECTS = {
  dexterio: {
    slug: "dexterio",
    name: "Dexterio",
    tagline: "Autonomous educational animation engine",
    year: "2026",
    what: "Turns a topic into a narrated Manim animation that explains it.",
    how: "A LangGraph planner with retrieval writes the storyboard and the scene code, and a Kafka-fed worker fleet renders that untrusted code in isolated Daytona and Docker sandboxes, with PostgreSQL checkpoints so a run can resume.",
    stack: ["Python", "TypeScript", "LangGraph", "Apache Kafka", "Docker", "Daytona", "PostgreSQL"],
    links: [{ label: "Code", href: "https://github.com/jayraj-kl/dexterio" }],
    images: ["dexterio-1", "dexterio-2", "dexterio-3"],
    media: { poster: "/work/dexterio/poster.jpg", video: "/work/dexterio/demo.mp4" },
  },
  oneStopDeployment: {
    slug: "one-stop-deployment",
    name: "One Stop Deployment",
    tagline: "One-click CI/CD for GitHub repositories",
    year: "2024",
    what: "Deploys a GitHub repository in one click and hands back a live preview URL.",
    how: "Containerised build workers run on AWS ECS and S3, build logs stream over Kafka, and a reverse proxy routes each wildcard subdomain to its deployment.",
    stack: ["TypeScript", "Node.js", "Docker", "AWS ECS", "AWS S3", "Apache Kafka"],
    links: [{ label: "Code", href: "https://github.com/jayraj-kl" }],
    images: ["one-stop-deployment"],
    media: { poster: "/work/one-stop-deployment/poster.jpg", video: "/work/one-stop-deployment/demo.mp4" },
  },
  demex: {
    slug: "demex",
    name: "Demex",
    tagline: "A search engine with its own crawler",
    year: "2024",
    what: "Crawls the web, indexes what it finds and answers search queries over it.",
    how: "A robots.txt-compliant TypeScript crawler stores the link graph in PostgreSQL, and results are ranked by TF-IDF and PageRank in a Next.js interface with query completion.",
    stack: ["TypeScript", "Node.js", "PostgreSQL", "Next.js"],
    links: [{ label: "Code", href: "https://github.com/jayraj-kl/demex-engine" }],
    images: ["demex"],
    media: { poster: "/work/demex/poster.jpg", video: "/work/demex/demo.mp4" },
  },
  studex: {
    slug: "studex",
    name: "StudEx",
    tagline: "Tutors for core computer science subjects",
    year: "2024–2025",
    what: "Subject-specific tutors for Theory of Computation, ML, Blockchain and Cloud, answering from the course PDFs.",
    how: "OpenAI embeddings in Pinecone with LangChain retrieval sit behind a Next.js dashboard, with Prisma for persistence and React Email for mail.",
    stack: ["TypeScript", "Next.js", "LangChain", "Pinecone", "Prisma"],
    links: [{ label: "Code", href: "https://github.com/jayraj-kl/stud-ex" }],
    images: ["studex"],
    media: { poster: "/work/studex/poster.jpg", video: "/work/studex/demo.mp4" },
  },
  websiteBuilder: {
    slug: "website-builder",
    name: "Website Builder",
    tagline: "Full-stack app generation in the browser",
    year: "2024",
    what: "Builds a working multi-file web app from a plain-language prompt, entirely in the browser.",
    how: "React and the WebContainer API run the generated code client-side, with an editor, a file explorer and a live preview.",
    stack: ["TypeScript", "React", "WebContainer API"],
    links: [{ label: "Code", href: "https://github.com/jayraj-kl/website-builder" }],
    images: ["website-builder"],
    media: { poster: "/work/website-builder/poster.jpg", video: "/work/website-builder/demo.mp4" },
  },
} satisfies Record<string, Project>;

export const PUBLICATIONS = {
  hipc2026: {
    id: "hipc2026",
    title: "Co-Adaptation over Allocation: KL-Guided Mixed-Precision Quantization-Aware Training",
    authors: [
      { name: "Shreya Mandekar" },
      { name: "Jayraj Kiran Ladkat", self: true },
      { name: "Madhura Phatak" },
      { name: "Bhavana Tiple" },
    ],
    venue: "IEEE International Conference on High Performance Computing, Data, and Analytics (HiPC)",
    venueShort: "IEEE HiPC",
    year: "2026",
    status: "Accepted poster",
    summary: "Mixed-precision quantization-aware training guided by KL divergence, favouring co-adaptation over a fixed bit allocation.",
    links: [
      {
        label: "Acceptance proof",
        href: "https://drive.google.com/file/d/1wYned37BXW-kTc7B7jNQFcwUzh66sxkG/view?usp=sharing",
      },
    ],
    image: "pub-hipc2026",
    figure: "/papers/hipc2026.jpg",
  },
  icbds2025: {
    id: "icbds2025",
    title: "Real-World Scalability of PostgreSQL: Practical Techniques Use Case Study",
    authors: [
      { name: "Jayraj Kiran Ladkat", self: true },
      { name: "Pranati Waghodekar" },
    ],
    venue: "IEEE International Conference on Blockchain and Distributed Systems Security (ICBDS)",
    venueShort: "IEEE ICBDS",
    year: "2025",
    status: "Published",
    summary: "A use-case study of practical techniques for scaling PostgreSQL in real-world systems.",
    links: [
      {
        label: "IEEE Xplore 11377486",
        href: "https://ieeexplore.ieee.org/document/11377486/",
      },
    ],
    bibtex: `@inproceedings{ladkat2025postgresql,
  author    = {Ladkat, Jayraj Kiran and Waghodekar, Pranati},
  title     = {Real-World Scalability of {PostgreSQL}: Practical Techniques Use Case Study},
  booktitle = {IEEE International Conference on Blockchain and Distributed Systems Security (ICBDS)},
  year      = {2025},
  url       = {https://ieeexplore.ieee.org/document/11377486/}
}`,
    image: "pub-icbds2025",
    figure: "/papers/icbds2025.jpg",
  },
} satisfies Record<string, Publication>;

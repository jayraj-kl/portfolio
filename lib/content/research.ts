import { PROJECTS, PUBLICATIONS } from "./shared";
import type { ContentSet } from "./types";

// Built from cv/research-focused/jayraj-ladkat-cv.tex.
export const RESEARCH: ContentSet = {
  profile: "research",
  meta: {
    title: "Jayraj Ladkat · Research",
    description:
      "Research intern at TIGER-Lab, University of Waterloo, working on AI for education and model evaluation.",
  },
  positioning:
    "I work on AI for education and on evaluating the models behind it.",
  bio: "I'm a final-year B.Tech. student in Computer Science and Engineering at MIT World Peace University, Pune, and a research intern at TIGER-Lab, University of Waterloo, advised by Max Ku. I'm building a pipeline that turns lessons into explanatory videos and tuning its prompts with evolutionary search.",
  proofStrip: ["TIGER-Lab, University of Waterloo", "IEEE HiPC 2026", "IEEE ICBDS 2025"],
  sectionOrder: ["interests", "news", "publications", "experience", "work", "contact"],
  researchInterests: [
    "AI for Education",
    "LLM/VLM Evaluation",
    "Evolutionary Prompt Optimisation",
    "ML Systems",
  ],
  news: [
    {
      date: "07/2026",
      text: "Joined TIGER-Lab at the University of Waterloo as a research intern.",
    },
    {
      date: "2026",
      text: "“Co-Adaptation over Allocation” accepted as a poster at IEEE HiPC 2026.",
    },
    {
      date: "2025",
      text: "“Real-World Scalability of PostgreSQL” published at IEEE ICBDS 2025.",
      href: "https://ieeexplore.ieee.org/document/11377486/",
    },
  ],
  experience: [
    {
      org: "TIGER-Lab, University of Waterloo",
      place: "Waterloo, Canada (Remote)",
      title: "Research Intern",
      start: "07/2026",
      end: null,
      advisor: "Max Ku",
      what: "Developing a multi-step pipeline that generates explanatory educational videos, from script to code to render to narration.",
      how: "Evolutionary prompt optimisation encodes a learner's preferences into the system prompts, from step-by-step intuition to mathematical depth. Work in progress.",
    },
    {
      org: "Publicis Sapient",
      place: "Gurugram, India",
      title: "Engineering Intern",
      start: "08/2025",
      end: "12/2025",
      what: "Worked on an AI agent pipeline that generates synthetic data, and extended an AI recruitment screening tool.",
      how: "Reduced the pipeline's token use and improved its datasets, and added request prefetching, a responsive frontend and structured assessment logic to the tool.",
    },
    {
      org: "Elixir AI",
      place: "Pune, India",
      title: "Software Engineering Intern",
      start: "06/2025",
      end: "08/2025",
      what: "Built features for the Climate Smart Public Health Platform, a collaboration between Harvard University and Madagascar's Ministry of Public Health.",
      how: "A Flask and PostgreSQL/PostGIS backend with a React map dashboard, developed in Docker and demonstrated to Harvard and Ministry stakeholders.",
    },
    {
      org: "Centre for Development of Advanced Computing (C-DAC)",
      place: "Pune, India",
      title: "Cloud & Full-Stack Intern",
      start: "01/2025",
      end: "02/2025",
      what: "Introduced asynchronous messaging into the service architecture.",
      how: "NATS publish/subscribe between services, so requests stop waiting on each other under load.",
    },
  ],
  projects: [
    PROJECTS.dexterio,
    PROJECTS.studex,
    PROJECTS.websiteBuilder,
    PROJECTS.demex,
    PROJECTS.oneStopDeployment,
  ],
  publications: [PUBLICATIONS.hipc2026, PUBLICATIONS.icbds2025],
  cv: { label: "Research CV", href: "/cv/jayraj-ladkat-cv.pdf" },
  closing: {
    heading: "Get in touch",
    body: "If you work on AI for education or on model evaluation, I'd be glad to talk.",
  },
};

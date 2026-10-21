import { PROJECTS, PUBLICATIONS } from "./shared";
import type { ContentSet } from "./types";

// Built from cv/sde-focused/jayraj-ladkat-resume.tex.
export const SDE: ContentSet = {
  profile: "sde",
  meta: {
    title: "Jayraj Ladkat · Software engineer",
    description:
      "Software engineer building AI systems end to end: agent pipelines and the infrastructure that runs them.",
  },
  positioning:
    "I build AI systems end to end: the agent pipelines, and the infrastructure they run on.",
  bio: "Final-year computer science student at MIT World Peace University, Pune. I'm interning at TIGER-Lab, University of Waterloo, on a pipeline that turns lessons into explanatory videos. Before that I worked on AI pipelines at Publicis Sapient, geospatial health software at Elixir AI and service messaging at C-DAC.",
  proofStrip: ["TIGER-Lab, University of Waterloo", "Publicis Sapient", "IEEE HiPC 2026"],
  sectionOrder: ["experience", "work", "publications", "contact"],
  experience: [
    {
      org: "TIGER-Lab, University of Waterloo",
      place: "Waterloo, Canada (Remote)",
      title: "Software Engineering Intern (Research)",
      start: "07/2026",
      end: null,
      what: "Building a pipeline that turns a lesson into an explanatory video, from script to code to render to narration.",
      how: "An evolutionary search tunes the prompts of the agents behind each stage, so the teaching style can be steered.",
    },
    {
      org: "Publicis Sapient",
      place: "Gurugram, India",
      title: "Software Engineering Intern",
      start: "08/2025",
      end: "12/2025",
      what: "Worked on an AI agent pipeline that generates synthetic data, and on an AI platform recruiters use to evaluate candidates.",
      how: "Compressed and cached the pipeline's prompts behind enforced schemas, and added request prefetching and background assessment workers to the platform.",
    },
    {
      org: "Elixir AI",
      place: "Pune, India",
      title: "Software Engineering Intern",
      start: "06/2025",
      end: "08/2025",
      what: "Built features for the Climate Smart Public Health Platform, a collaboration between Harvard University and Madagascar's Ministry of Public Health.",
      how: "Flask and PostgreSQL/PostGIS behind a React map dashboard, with spatial queries over large raster and vector datasets, run in Docker.",
    },
    {
      org: "Centre for Development of Advanced Computing (C-DAC)",
      place: "Pune, India",
      title: "Cloud & Full-Stack Intern",
      start: "01/2025",
      end: "02/2025",
      what: "Moved blocking calls between microservices onto asynchronous messaging.",
      how: "NATS publish/subscribe in place of synchronous HTTP between services.",
    },
  ],
  projects: [PROJECTS.dexterio, PROJECTS.oneStopDeployment, PROJECTS.demex],
  publications: [PUBLICATIONS.hipc2026, PUBLICATIONS.icbds2025],
  cv: { label: "Résumé", href: "/cv/jayraj-ladkat-resume.pdf" },
  closing: {
    heading: "Write to me",
    body: "If you're hiring engineers to build AI systems, I'd like to hear what you're working on.",
  },
};

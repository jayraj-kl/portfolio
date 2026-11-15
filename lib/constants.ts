// Plain values only. The layout and other server code read these, so nothing here may import a
// component: the dock's links, which carry icons and buttons, live in dock-links.tsx.
export const METADATA = {
  title: "Jayraj Ladkat",
};

export const WEBSITE_URL = "https://jayrajladkat.com";

export const DEFAULT_THEME = "light";
export const ANIMATION_THEME_TOGGLER_DURATION = 0.7 * 1000;

export const GITHUB_GRAPH_CONSTANTS = {
  username: "jayraj-kl",
  blockSize: 10,
  blockMargin: 4,
  fontSize: 12,
};

export const TECH_STACK = [
  {
    name: "Languages",
    skills: [
      // { name: "Go", slug: "go" },
      { name: "Python", slug: "python" },
      { name: "TypeScript", slug: "typescript" },
      { name: "JavaScript", slug: "javascript" },
      // { name: "Java", slug: "java" }, //No equivalent icon in simpleicons
      { name: "C", slug: "c" },
      { name: "C++", slug: "cplusplus" },
    ],
  },
  {
    name: "Frontend",
    skills: [
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextdotjs" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
      { name: "Shadcn UI", slug: "shadcnui" },
      { name: "Framer Motion", slug: "framer" },
    ],
  },
  {
    name: "Backend & DB",
    skills: [
      { name: "FastAPI", slug: "fastapi" },
      { name: "Django", slug: "django" },
      { name: "Flask", slug: "flask" },
      { name: "Node.js", slug: "nodedotjs" },
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "MongoDB", slug: "mongodb" },
      { name: "Redis", slug: "redis" },
      { name: "FireBase", slug: "firebase" },
    ],
  },
  {
    name: "Infra & Tools",
    skills: [
      { name: "Docker", slug: "docker" },
      { name: "Kubernetes", slug: "kubernetes" },
      { name: "Prometheus", slug: "prometheus" },
      { name: "Grafana", slug: "grafana" },
      // { name: "AWS", slug: "aws" },
      { name: "Vercel", slug: "vercel" },
      { name: "Git", slug: "git" },
      { name: "GitHub", slug: "github" },
      { name: "Linux", slug: "linux" },
      { name: "Nginx", slug: "nginx" },
      // { name: "LangChain", slug: "langchain" },
      // { name: "LangGraph", slug: "langgraph" },
    ],
  },
  {
    name: "AI & ML",
    skills: [
      { name: "Hugging Face", slug: "huggingface" },
      { name: "TensorFlow", slug: "tensorflow" },
      { name: "PyTorch", slug: "pytorch" },
      { name: "Scikit-learn", slug: "scikitlearn" },
      { name: "NumPy", slug: "numpy" },
      { name: "Polars", slug: "polars" },
      { name: "Pandas", slug: "pandas" },
    ],
  },
];

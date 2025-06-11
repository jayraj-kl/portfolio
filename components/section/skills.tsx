import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Code2,
  Zap,
  Palette,
  Figma,
  TestTube,
  Component,
  Database,
  Server,
  Shield,
  Container,
  Cloud,
  GitBranch,
  Globe,
  Layers,
  Settings,
  Workflow,
  Users,
  BarChart3,
  Cpu,
  FileCode,
} from "lucide-react";

const getSkillIcon = (skill: string) => {
  const iconMap: { [key: string]: React.ElementType } = {
    React: Component,
    "Next.js": Zap,
    "Tailwind CSS": Palette,
    "Framer Motion": Workflow,
    "Three.js": Cpu,
    "Storybook.js": Layers,
    Jest: TestTube,
    Figma: Figma,
    C: Code2,
    "C++": Code2,
    Python: Code2,
    JavaScript: FileCode,
    TypeScript: FileCode,
    SQL: Database,
    NoSQL: Database,
    "Express.js": Server,
    Django: Server,
    Flask: Server,
    Prisma: Database,
    Drizzle: Database,
    "Hono.js": Server,
    MySQL: Database,
    PostgreSQL: Database,
    MongoDB: Database,
    Clerk: Shield,
    "Auth.js/NextAuth": Shield,
    ".NET": Code2,
    HTTP: Globe,
    "RESTful API": Globe,
    GraphQL: Globe,
    WebSockets: Globe,
    MonoRepos: GitBranch,
    Docker: Container,
    Kubernetes: Container,
    "Git & GitHub": GitBranch,
    Redis: Database,
    Kafka: Workflow,
    AWS: Cloud,
    GCP: Cloud,
    Nginx: Server,
    "Object-oriented programming": Settings,
    "Functional Programming": Settings,
    Agile: Users,
    "Full-stack web development": Layers,
    "Big Data": BarChart3,
    DevOps: Settings,
  };

  return iconMap[skill] || Code2;
};

const skillsData = {
  frontend: {
    title: "Frontend Development",
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "Three.js",
      "Storybook.js",
      "Jest",
      "Figma",
    ],
  },
  backend: {
    title: "Backend Development",
    skills: [
      "C",
      "C++",
      "Python",
      "JavaScript",
      "TypeScript",
      "SQL",
      "NoSQL",
      "Express.js",
      "Django",
      "Flask",
      "Prisma",
      "Drizzle",
      "Hono.js",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Clerk",
      "Auth.js/NextAuth",
    ],
  },
  devops: {
    title: "DevOps & Technologies",
    skills: [
      ".NET",
      "HTTP",
      "RESTful API",
      "GraphQL",
      "WebSockets",
      "MonoRepos",
      "Docker",
      "Kubernetes",
      "Git & GitHub",
      "Redis",
      "Kafka",
      "AWS",
      "GCP",
      "Nginx",
      "Object-oriented programming",
      "Functional Programming",
      "Agile",
      "Full-stack web development",
      "Big Data",
      "DevOps",
    ],
  },
};

export default function SkillsSection() {
  return (
    <div className="p-6">
      <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-6 pt-8">
          <CardTitle className="text-3xl font-bold text-gray-800 text-center group-hover:scale-105 transition-transform duration-300">
            Technical Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8 space-y-8">
          {Object.entries(skillsData).map(([key, category]) => (
            <div key={key} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, index) => {
                  const IconComponent = getSkillIcon(skill);
                  return (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-2 border border-gray-200 flex items-center gap-2"
                    >
                      <IconComponent className="w-4 h-4" />
                      {skill}
                    </Badge>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { WEBSITE_URL } from "@/lib/constants";
import { ACTIVE_PROFILE, PROFILES, getContent } from "@/lib/content";
import type { ContentSet, Experience, Link, Project, Publication } from "@/lib/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// "MM/YYYY" -> "Jul 2026"; a bare year stays as written. (The site's own "Jul’26" is too terse here.)
const month = (d: string) =>
  d.replace(/^(\d{1,2})\/(\d{4})$/, (_, m: string, y: string) => `${MONTHS[Number(m) - 1]} ${y}`);

// /llms.txt (https://llmstxt.org): the site's content as Markdown, for agents and crawlers.
// Built from lib/content so it never drifts from the pages. Private routes (/gre, /learn, /lab)
// are left out on purpose.

const abs = (href: string) => (href.startsWith("/") ? `${WEBSITE_URL}${href}` : href);
const link = (l: Link) => `[${l.label}](${abs(l.href)})`;
const pageUrl = (p: ContentSet["profile"]) => (p === ACTIVE_PROFILE ? `${WEBSITE_URL}/` : `${WEBSITE_URL}/${p}`);
const LABELS: Record<ContentSet["profile"], string> = { sde: "Software engineering", research: "Research" };
const span = (start: string, end: string | null) => `${month(start)} – ${end ? month(end) : "present"}`;

function experience(e: Experience) {
  const lines = [
    `### ${e.title}, ${e.org}`,
    `${e.place} · ${span(e.start, e.end)}${e.advisor ? ` · Advisor: ${e.advisor}` : ""}`,
    "",
    `${e.what} ${e.how}`,
  ];
  if (e.details?.highlights?.length) lines.push("", ...e.details.highlights.map((h) => `- ${h}`));
  if (e.details?.stack?.length) lines.push("", `Stack: ${e.details.stack.join(", ")}`);
  if (e.details?.links?.length) lines.push("", e.details.links.map(link).join(" · "));
  return lines.join("\n");
}

function project(p: Project) {
  return [
    `### ${p.name} (${p.year})`,
    `${p.tagline}.`,
    "",
    `${p.what} ${p.how}`,
    "",
    `Stack: ${p.stack.join(", ")}`,
    `Links: ${p.links.map(link).join(" · ")}`,
  ].join("\n");
}

function publication(p: Publication) {
  const authors = p.authors.map((a) => (a.self ? `**${a.name}**` : a.name)).join(", ");
  return [
    `### ${p.title}`,
    `${authors}. *${p.venue}*, ${p.year}. ${p.status}.`,
    "",
    p.summary,
    "",
    `Links: ${p.links.map(link).join(" · ")}`,
  ].join("\n");
}

export function buildLlmsTxt() {
  const { content: main, shared } = getContent(ACTIVE_PROFILE);
  const others = PROFILES.filter((p) => p !== ACTIVE_PROFILE).map((p) => getContent(p).content);

  // Every project from every profile, once, in the order they first appear.
  const projects = [main, ...others]
    .flatMap((c) => c.projects)
    .filter((p, i, all) => all.findIndex((q) => q.slug === p.slug) === i);

  const interests = [main, ...others].flatMap((c) => c.researchInterests ?? []);
  const news = [main, ...others].flatMap((c) => c.news ?? []);
  const { education: ed } = shared;

  const sections = [
    `# ${shared.name}`,
    `> ${main.meta.description}`,
    [
      main.bio,
      "",
      `Full name: ${shared.fullName}. Based in ${shared.location} (${shared.timeZone}).`,
      `Contact: [${shared.email}](mailto:${shared.email}) · ${shared.socials.map(link).join(" · ")}`,
    ].join("\n"),

    [
      "## Pages",
      ...[main, ...others].map((c) => `- [${LABELS[c.profile]} profile](${pageUrl(c.profile)}): ${c.positioning}`),
      ...[main, ...others].map((c) => `- [${c.cv.label} (PDF)](${abs(c.cv.href)})`),
    ].join("\n"),

    ["## Experience", ...main.experience.map(experience)].join("\n\n"),

    [
      "## Education",
      `### ${ed.degree}`,
      `${ed.school}, ${ed.place} · ${span(ed.start, ed.end)}`,
    ].join("\n"),

    ["## Projects", ...projects.map(project)].join("\n\n"),

    ["## Publications", ...main.publications.map(publication)].join("\n\n"),

    interests.length ? ["## Research interests", ...interests.map((i) => `- ${i}`)].join("\n") : "",

    news.length ? ["## News", ...news.map((n) => `- ${month(n.date)}: ${n.text}${n.href ? ` ([link](${n.href}))` : ""}`)].join("\n") : "",

    [
      "## Skills",
      ...shared.techStack.map((g) => `- ${g.name}: ${g.skills.map((s) => s.name).join(", ")}`),
    ].join("\n"),

    ["## Contact", main.closing.body, "", `Email [${shared.email}](mailto:${shared.email}).`].join("\n"),
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}

import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ACTIVE_PROFILE,
  getContent,
  logoFor,
  type ContentSet,
  type Profile,
  type Project,
  type SectionId,
} from "@/lib/content";
import {
  FIGURE_FIELD_DESCRIPTIONS,
  PROJECT_FIELD_DESCRIPTIONS,
} from "@/components/home/halftone";
import { HeroScreen } from "@/components/home/hero-screen";
import { Clock, CopyText, EmailButton } from "@/components/home/interactive";
import { Contributions, Dock, Expand, Logo, TechStack } from "@/components/home/parts";
import { LiquidMetalBorder } from "@/components/ui/liquid-metal-border";
import { month, range } from "@/components/home/dates";
import { Notch } from "@/components/home/notch";
import { PreviousRoles } from "@/components/home/previous-roles";
import { INTRO_ID, type NotchSection } from "@/components/home/notch-sections";
import { SiteFooter } from "@/components/home/footer";
import { HairlineFigure } from "@/components/home/hairline-figure";
import { Reveal } from "@/components/home/reveal";
import { Still } from "@/components/home/still";
import styles from "@/components/home/home.module.css";
import { WorkGrid, type WorkItem } from "@/components/home/work";

// The active profile lives at "/", so that is its canonical address; the other set keeps its own.
export function homeMetadata(profile: Profile): Metadata {
  const { content, shared } = getContent(profile);
  const url = profile === ACTIVE_PROFILE ? "/" : `/${profile}`;
  return {
    title: { absolute: content.meta.title },
    description: content.meta.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: shared.name,
      locale: "en_US",
      url,
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

// A slot's file is used only when it exists under public/; otherwise the generated field or monogram stands in.
function publicFile(rel: string | undefined | null) {
  if (!rel) return null;
  const clean = rel.replace(/^\//, "");
  return existsSync(path.join(process.cwd(), "public", clean))
    ? `/${clean}`
    : null;
}

const logoSrc = (name: string) => publicFile(logoFor(name));

// Selecta's two-tone headline: the first phrase in ink, the rest in grey.
function splitLine(s: string): [string, string] {
  const colon = s.indexOf(":");
  if (colon > 0) return [s.slice(0, colon + 1), s.slice(colon + 1).trim()];
  const and = s.indexOf(" and ");
  if (and > 0) return [s.slice(0, and), s.slice(and + 1)];
  return [s, ""];
}

// Filter categories derived from each project's stack (as in v2).
const CATEGORY_OF: Record<string, string> = {
  LangGraph: "LLM",
  LangChain: "LLM",
  Pinecone: "LLM",
  "Apache Kafka": "Infra",
  Docker: "Infra",
  Daytona: "Infra",
  "AWS ECS": "Infra",
  "AWS S3": "Infra",
  PostgreSQL: "Data",
  Prisma: "Data",
  "Next.js": "Web",
  React: "Web",
  "WebContainer API": "Web",
};
const CATEGORY_ORDER = ["LLM", "Infra", "Data", "Web"];

function categoriesOf(p: Project) {
  const set = new Set(p.stack.map((s) => CATEGORY_OF[s]).filter(Boolean));
  return CATEGORY_ORDER.filter((c) => set.has(c));
}

function Row({
  children,
  id,
  cellClass,
  rowClass,
  red,
  label,
}: {
  children: ReactNode;
  id?: string;
  cellClass?: string;
  rowClass?: string;
  red?: boolean;
  label?: string;
}) {
  const Tag = id ? "section" : "div";
  return (
    <Tag
      id={id}
      // Focusable, so the notch can move focus to a section after scrolling to it.
      tabIndex={id ? -1 : undefined}
      aria-labelledby={id && label ? `${id}-label` : undefined}
      className={`${styles.row} ${rowClass ?? ""}`}
    >
      <div className={styles.gutter} aria-hidden="true" />
      <div
        className={`${styles.cell} ${red ? styles.regRed : ""} ${cellClass ?? ""}`}
      >
        {children === null ? null : (
          <Reveal delay={id ? 0.05 : 0}>
            {id && label ? (
              <h2 id={`${id}-label`} className={styles.secLabel}>
                {label}
              </h2>
            ) : null}
            {children}
          </Reveal>
        )}
      </div>
      <div className={styles.gutter} aria-hidden="true" />
    </Tag>
  );
}

function Ext({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={`${styles.link} ${className ?? ""}`}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <ArrowUpRight
        size={14}
        strokeWidth={1.75}
        aria-hidden="true"
        className={styles.arrow}
      />
    </a>
  );
}

function Experience({ c }: { c: ContentSet }) {
  const [lead, ...earlier] = c.experience;
  if (!lead) return null;
  return (
    <Row id="experience" label="Experience">
      {/* The current role carries the liquid-metal rim, like the primary actions. */}
      <LiquidMetalBorder radius={14}>
        <article className={`${styles.box} ${styles.onMetal}`}>
          <header className={styles.leadHead}>
            <Logo name={lead.org} src={logoSrc(lead.org)} />
            <div className={styles.leadTitle}>
              <h3 className={styles.h3}>{lead.org}</h3>
              <p className={styles.small}>
                {lead.title}, {lead.place}
              </p>
            </div>
            <span className={styles.data}>{range(lead.start, lead.end)}</span>
          </header>
          <div className={styles.prose}>
            <p>{lead.what}</p>
            <p className={styles.grey}>{lead.how}</p>
            {lead.advisor ? (
              <p className={styles.small}>Advised by {lead.advisor}</p>
            ) : null}
          </div>
        </article>
      </LiquidMetalBorder>

      {earlier.length ? (
        <>
          <h3 className={styles.subLabel}>Previously</h3>
          <PreviousRoles roles={earlier.map((e) => ({ ...e, logo: logoSrc(e.org) }))} />
        </>
      ) : null}
    </Row>
  );
}

function Stack({
  techStack,
}: {
  techStack: { name: string; skills: { name: string; slug: string }[] }[];
}) {
  return (
    <Row id="stack" label="Tech stack">
      <TechStack groups={techStack} />
    </Row>
  );
}

function Work({ c }: { c: ContentSet }) {
  const items: WorkItem[] = c.projects.map((p) => {
    const poster = publicFile(p.media?.poster);
    const link = p.links[0] ?? null;
    return {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      year: p.year,
      what: p.what,
      how: p.how,
      stack: p.stack,
      link,
      categories: categoriesOf(p),
      poster,
      video: publicFile(p.media?.video),
      gallery: (p.media?.gallery ?? [])
        .map((g) => publicFile(g))
        .filter((g): g is string => Boolean(g)),
      label: poster
        ? `${p.name}: poster rendered as a diagonal line-screen halftone.`
        : `Placeholder poster for ${p.name}: ${PROJECT_FIELD_DESCRIPTIONS[p.slug] ?? "a shaded sphere"}, rendered as a diagonal line-screen halftone.`,
    };
  });
  const used = CATEGORY_ORDER.filter((cat) =>
    items.some((i) => i.categories.includes(cat)),
  );
  return (
    <Row id="work" label="Selected work">
      <WorkGrid items={items} categories={used} />
    </Row>
  );
}

function Publications({ c }: { c: ContentSet }) {
  return (
    <Row id="publications" label="Publications">
      <ul className={styles.stackList}>
        {c.publications.map((p) => {
          const fig = publicFile(p.figure);
          const primary = p.links[0];
          return (
            <li key={p.id}>
              <article className={styles.box}>
                <Still
                  source={{ kind: "figure", id: p.id }}
                  src={fig}
                  label={
                    fig
                      ? `Figure from “${p.title}”, rendered as a diagonal line-screen halftone.`
                      : `Placeholder figure for “${p.title}”: ${FIGURE_FIELD_DESCRIPTIONS[p.id] ?? "a shaded sphere"}, rendered as a diagonal line-screen halftone.`
                  }
                  className={styles.figure}
                />
                <header className={styles.pubHead}>
                  <div>
                    <h3 className={styles.pubTitle}>
                      {primary ? (
                        <a
                          className={styles.titleLink}
                          href={primary.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}
                    </h3>
                    <p className={styles.small}>
                      {p.year} {p.venue}
                    </p>
                  </div>
                  <Logo name={p.venueShort} src={logoSrc(p.venueShort)} />
                </header>
                <p className={styles.authors}>
                  {p.authors.map((a, i) => (
                    <span key={a.name}>
                      {a.self ? (
                        <strong className={styles.self}>{a.name}</strong>
                      ) : (
                        a.name
                      )}
                      {i < p.authors.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <p className={styles.pubMeta}>
                  <span className={styles.tag}>{p.status}</span>
                  <span className={styles.data}>
                    {p.venueShort} {p.year}
                  </span>
                </p>
                <Expand>
                  <p>{p.summary}</p>
                </Expand>
                <div className={styles.pubLinks}>
                  {p.links.map((l) => (
                    <Ext key={l.href} href={l.href}>
                      {l.label}
                    </Ext>
                  ))}
                  {p.bibtex ? (
                    <CopyText
                      value={p.bibtex}
                      label="Copy BibTeX"
                      done="BibTeX copied"
                    />
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Row>
  );
}

function Interests({ c }: { c: ContentSet }) {
  const list = c.researchInterests ?? [];
  if (!list.length) return null;
  return (
    <Row id="interests" label="Research interests">
      <ul className={styles.quiet}>
        {list.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </Row>
  );
}

function News({ c }: { c: ContentSet }) {
  const list = c.news ?? [];
  if (!list.length) return null;
  return (
    <Row id="news" label="News">
      <ul className={styles.quiet}>
        {list.map((n) => (
          <li key={n.date + n.text} className={styles.newsItem}>
            <span className={styles.data}>{month(n.date)}</span>
            <span>{n.href ? <Ext href={n.href}>{n.text}</Ext> : n.text}</span>
          </li>
        ))}
      </ul>
    </Row>
  );
}

// Placeholder art until the footer gets its own picture or ASCII recipe.
const FOOTER_SCENE_ALT =
  "Night City at golden hour, from Cyberpunk: Edgerunners";

type Block = Exclude<SectionId, "contact"> | "stack" | "education" | "github";

const SECTION_LABELS: Record<Block | "contact", string> = {
  experience: "Experience",
  stack: "Tech stack",
  work: "Selected work",
  publications: "Publications",
  interests: "Research interests",
  news: "News",
  education: "Education",
  github: "GitHub contributions",
  contact: "Get in touch",
};

export function HomePage({ profile }: { profile: Profile }) {
  const { content: c, shared } = getContent(profile);
  // A background-removed PNG is preferred; a JPEG works too.
  const portrait =
    publicFile("home/portrait.png") ?? publicFile("home/portrait.jpg");
  const footerScene = publicFile("home/footer-landscape.jpg");
  const [lead, follow] = splitLine(c.positioning);
  const portraitLabel = portrait
    ? `Portrait of ${shared.name}, rendered as a diagonal line-screen halftone.`
    : `Placeholder for ${shared.name}'s portrait: a head-and-shoulders form rendered as a diagonal line-screen halftone.`;

  // The set's own order, with the tech stack after experience and education and GitHub before the close.
  const order: Block[] = [];
  for (const s of c.sectionOrder) {
    if (s === "contact") continue;
    order.push(s);
    if (s === "experience") order.push("stack");
  }
  if (!order.includes("stack")) order.push("stack");
  order.push("education", "github");

  // The notch lists the page in reading order, with the same names as the section labels.
  const notchSections: NotchSection[] = [
    { id: INTRO_ID, label: "Intro" },
    ...order.map((b) => ({ id: b, label: SECTION_LABELS[b] })),
    { id: "contact", label: SECTION_LABELS.contact },
  ];

  const edu = shared.education;
  const blocks: Record<Block, ReactNode> = {
    experience: <Experience key="experience" c={c} />,
    stack: <Stack key="stack" techStack={shared.techStack} />,
    work: <Work key="work" c={c} />,
    publications: <Publications key="publications" c={c} />,
    interests: <Interests key="interests" c={c} />,
    news: <News key="news" c={c} />,
    education: (
      <Row key="education" id="education" label="Education">
        <div className={styles.edu}>
          <Logo name={edu.school} src={logoSrc(edu.school)} />
          <div>
            <h3 className={styles.h3}>{edu.school}</h3>
            <p className={styles.small}>{edu.place}</p>
          </div>
          <div className={styles.eduSide}>
            <p>{edu.degree}</p>
            <p className={styles.data}>{range(edu.start, edu.end)}</p>
          </div>
        </div>
      </Row>
    ),
    github: (
      <Row key="github" id="github" label="GitHub contributions">
        <Contributions username={shared.githubUsername} />
        <p className={styles.graphFoot}>
          <Ext href={`https://github.com/${shared.githubUsername}`}>
            github.com/{shared.githubUsername}
          </Ext>
        </p>
      </Row>
    ),
  };

  return (
    <div
      data-home-root
      className={styles.root}
    >
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>

      <main id="main" tabIndex={-1}>
        <Row
          rowClass={`${styles.bandRow} ${styles.topBand}`}
          cellClass={styles.band}
        >
          {null}
        </Row>

        <Row rowClass={styles.heroRow} cellClass={styles.hero} red>
          <div className={styles.heroHost} data-screen-host>
            {/* Photo, then name, pronunciation and time, then the line about the work. */}
            <HeroScreen src={portrait} label={portraitLabel} />
            <div className={styles.heroText}>
              <div className={styles.identity}>
                <p className={styles.identityName}>{shared.name}</p>
                <p className={styles.identityLine}>
                  <span lang="en-fonipa" className={styles.ipa}>
                    /dʒeɪˈrɑːdʒ ˈlɑːdkət/
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>noun</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    <Clock timeZone={shared.timeZone} /> IST
                  </span>
                </p>
              </div>
              <h1 className={styles.h1}>
                <span className={styles.h1Lead}>{lead}</span>
                {follow ? (
                  <span className={styles.h1Follow}>{follow}</span>
                ) : null}
              </h1>
            </div>
          </div>
        </Row>

        <Row rowClass={styles.bandRow} cellClass={styles.band}>
          {null}
        </Row>

        {order.map((b) => blocks[b])}

        <Row id="contact" label="Get in touch">
          {/* No card: the close sits straight on the frame, with a Pokéball beside it. */}
          <div className={styles.close}>
            <div className={styles.closeText}>
              <h3 className={styles.closeHead}>{c.closing.heading}</h3>
              <p className={styles.closeBody}>{c.closing.body}</p>
            </div>
            <HairlineFigure name="pokeball" />
            <div className={`${styles.actions} ${styles.actionsLeft} ${styles.closeActions}`}>
              <EmailButton email={shared.email} />
              <LiquidMetalBorder radius={10}>
                <a
                  className={`${styles.btnSecondary} ${styles.onMetal}`}
                  href={c.cv.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.cv.label}
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </a>
              </LiquidMetalBorder>
              {shared.calendarUrl ? (
                <a
                  className={styles.btnSecondary}
                  href={shared.calendarUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Schedule a meeting
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </a>
              ) : null}
            </div>
          </div>
        </Row>
      </main>

      <SiteFooter
        name={shared.name}
        fullName={shared.fullName}
        location={shared.location}
        timeZone={shared.timeZone}
        socials={shared.socials}
        scene={footerScene ? { src: footerScene, alt: FOOTER_SCENE_ALT } : null}
      />

      <Notch sections={notchSections} />
      <Dock />
    </div>
  );
}

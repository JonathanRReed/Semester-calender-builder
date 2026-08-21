import SchedulePage from "@/components/schedule/schedule-page"

const SITE_URL = "https://semesterbuild.jonathanrreed.com/"

// Project markup for the planner itself. The tool has no independent ratings or
// reviews, so it deliberately avoids the SoftwareApplication rich-result type.
const plannerSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": `${SITE_URL}#planner`,
  name: "Semester Calendar Builder",
  url: SITE_URL,
  inLanguage: "en-US",
  // A committed literal, not the build clock, so a rebuild of an unchanged
  // commit emits the same date. Keep it equal to <lastmod> for this URL in
  // public/sitemap.xml, and move both when this page's content changes.
  dateModified: "2026-08-21",
  isAccessibleForFree: true,
  description:
    "Browser-based semester planner for classes, study blocks, exams, and deadlines. Schedules are saved in the browser's local storage, with no account and no server copy, and can be exported as ICS, CSV, PNG, or a JSON backup.",
  keywords: "semester planner, class schedule, study planner, academic calendar",
  isPartOf: { "@id": "https://semesterbuild.jonathanrreed.com/#website" },
  creator: {
    "@type": "Person",
    name: "Jonathan Reed",
    url: "https://jonathanrreed.com",
  },
}

const fallbackSections = [
  {
    title: "What this planner is for",
    body: "Semester Calendar Builder helps students turn a loose list of classes, labs, study blocks, office hours, exams, and deadlines into a readable academic schedule. It is built for registration planning, weekly time blocking, advisor review, and exporting a clean plan to the calendar system a student already uses.",
  },
  {
    title: "How the workflow works",
    body: "Start by adding recurring classes and study sessions, then add important dates for exams, papers, breaks, and project milestones. The planner can show a typical week, track specific semester dates, flag conflicts, and export schedule data as ICS, CSV, PNG, or JSON for backup and sharing.",
  },
  {
    title: "Privacy model",
    body: "The app stores schedule data locally in the browser instead of requiring an account. That keeps the planner lightweight and private, but it also means students should export a backup before clearing browser storage, changing devices, or resetting a schedule.",
  },
]

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(plannerSchema).replace(/</g, "\\u003c") }}
      />
      <noscript>
        <section className="mx-auto max-w-5xl px-6 py-10 text-foreground">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Semester Calendar Builder
          </p>
          <h2 className="mb-4 text-3xl font-bold">Plan a semester schedule in your browser.</h2>
          <div className="grid gap-6 text-base leading-7 text-muted-foreground md:grid-cols-3">
            {fallbackSections.map((section) => (
              <article key={section.title}>
                <h2 className="mb-2 text-lg font-semibold text-foreground">{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </noscript>
      <SchedulePage />
    </>
  )
}

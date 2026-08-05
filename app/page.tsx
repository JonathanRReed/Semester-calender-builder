import SchedulePage from "@/components/schedule/schedule-page"

const SITE_URL = "https://semesterbuild.jonathanrreed.com/"

// WebApplication markup for the planner itself. Every claim below is stated in
// visible copy on this page (the "How it works" and "What gets stored" section,
// the view toggle, the export menu and the FAQ block).
const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}#webapp`,
  name: "Semester Calendar Builder",
  url: SITE_URL,
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Academic schedule planner",
  operatingSystem: "Any web browser",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Browser-based semester planner for classes, study blocks, exams, and deadlines. Schedules are saved in the browser's local storage, with no account and no server copy, and can be exported as ICS, CSV, PNG, or a JSON backup.",
  featureList: [
    "Weekly class schedule grid",
    "Full semester view once semester start and end dates are set",
    "Study blocks, office hours, exams, and important dates",
    "Automatic flagging of overlapping events",
    "Search and filter by event type",
    "Export to ICS for Google Calendar, Apple Calendar, and Outlook",
    "Export to CSV, PNG, and JSON backup",
    "Import from CSV, ICS, and JSON backup files",
    "Local browser storage with no account required",
  ],
  storageRequirements: "Uses browser local storage on the current device",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, "\\u003c") }}
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

import SchedulePage from "@/components/schedule/schedule-page"

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

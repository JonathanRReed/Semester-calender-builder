const STEPS = [
  {
    title: "Add your classes and study blocks",
    body: "Click an empty slot in the week grid to create an event at that time, or use Add Event for anything that repeats. Classes, labs, office hours, and study sessions all sit on the same grid, and anything that overlaps gets flagged so you catch it before you commit to the schedule.",
  },
  {
    title: "Track the dates that matter",
    body: "Exams, papers, breaks, and project milestones go in Important Dates. Set your semester start and end date and you can switch between one typical week and the whole semester. Search and the type filters narrow the grid down to just classes, study blocks, or exams.",
  },
  {
    title: "Export it and keep a copy",
    body: "Download an .ics file and import it into Google Calendar, Apple Calendar, or Outlook. You can also export CSV for a spreadsheet, a PNG image to share or print, or a full JSON backup. Import accepts CSV, ICS, and backup files.",
  },
] as const

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="max-w-7xl mx-auto px-3 sm:px-4 pb-8 print:hidden"
    >
      <div className="glass-card rounded-lg p-4 sm:p-6 space-y-6 shadow-[var(--shadow-xs)]">
        <div className="space-y-4">
          <h2 id="how-it-works-heading" className="text-lg sm:text-xl font-bold text-foreground">
            How it works
          </h2>
          <p className="text-sm leading-6 text-muted-foreground max-w-3xl">
            Semester Calendar Builder is a browser planner for laying out one semester of
            classes, study blocks, exams, and deadlines on a single grid.
          </p>
          <ul className="grid gap-1.5 text-sm leading-6 text-muted-foreground max-w-3xl list-disc pl-5">
            <li>The week grid covers all 7 days and 15 hourly slots, 8 AM through 10 PM.</li>
            <li>
              Four things sit on the grid: in-person classes, online classes, exams, and study
              blocks. Important Dates holds five more: events, deadlines, breaks, exams, and
              finals.
            </li>
            <li>Two views: one typical week, or the whole semester once you set start and end dates.</li>
            <li>Export to ICS, CSV, PNG, JSON backup, or a plain-text summary. Import reads CSV, ICS, and JSON backups.</li>
            <li>Everything lives in this browser&apos;s local storage. No account, no server copy, nothing to pay.</li>
          </ul>
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ title, body }) => (
              <article key={title} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">What gets stored, and where?</h2>
          <div className="space-y-3 text-sm leading-6 text-muted-foreground max-w-3xl">
            <p>
              Everything stays in this browser. The planner writes your schedule to local storage on the device you are
              using. No account, no sign-in, no server copy of your courses, and nothing to pay for.
            </p>
            <p>
              The tradeoff is worth knowing before you rely on it. Clear your site data, open a private window, or move
              to another browser or device, and the schedule doesn&apos;t follow you. Download the JSON backup first
              &amp; you can restore the whole thing in one import.
            </p>
            <p>
              The site itself is static files. The host keeps ordinary request logs such as IP address, requested URL,
              and timestamp, the way any web server does. Those are separate from the schedule you build here.
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm" aria-label="More about this planner">
            <a className="underline underline-offset-4 hover:text-foreground transition-colors" href="/privacy/">
              Read the privacy policy
            </a>
            <a className="underline underline-offset-4 hover:text-foreground transition-colors" href="/about/">
              More about the planner
            </a>
            <a className="underline underline-offset-4 hover:text-foreground transition-colors" href="/contact/">
              Report a problem
            </a>
          </nav>
        </div>
      </div>
    </section>
  )
}

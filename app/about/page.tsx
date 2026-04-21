import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'About Semester Calendar Builder',
  description: 'Learn who built Semester Calendar Builder and how the private browser-based planner helps students organize academic schedules.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</p>
        <h1 className="text-4xl font-bold tracking-tight">About Semester Calendar Builder</h1>
        <p className="text-sm text-muted-foreground">Updated April 21, 2026</p>
        <div className="space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            Semester Calendar Builder is a free academic planning app by Jonathan Reed. It gives students a fast way to
            build a weekly class schedule, add study blocks, track important dates, and export the plan for later use.
          </p>
          <p>
            The app is designed for practical semester planning, not account management. Schedule data stays in the
            browser unless the student chooses to export it as a file or calendar feed.
          </p>
          <p>
            The goal is simple: help students see where their time goes before the semester gets crowded. In-person
            classes, online courses, exams, assignments, and recurring study sessions can be arranged in one clean view.
          </p>
          <p>
            A typical semester has fixed course meetings, shifting assignment deadlines, exam weeks, office hours, lab
            sections, commute time, meals, work shifts, and recovery time. Many students try to hold that plan in a
            notes app or spreadsheet, but those tools make it hard to see overlap. Semester Calendar Builder turns that
            information into a visual weekly schedule so conflicts are easier to spot before they become a problem.
          </p>
          <p>
            The planner supports both quick starts and careful setup. Students can begin with a blank week, load an
            example semester, add recurring events, track important dates, and switch between a weekly schedule and a
            broader semester view. Exports are included so the plan can be saved, printed, shared with an advisor, or
            imported into a calendar app.
          </p>
          <p>
            This site is intentionally small and focused. It does not require an account, does not ask for payment, and
            does not store course details on a remote application server. That makes it useful for early planning,
            advising conversations, and personal schedule cleanup when students want a clear view without another
            dashboard to manage.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="/">Open the planner</a>
          <a className="underline underline-offset-4" href="/contact">Contact</a>
          <a className="underline underline-offset-4" href="/privacy">Privacy</a>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

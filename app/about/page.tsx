import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'About Semester Calendar Builder',
  description: 'Learn who built Semester Calendar Builder and how the private browser-based planner helps students organize academic schedules.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About</p>
        <h1 className="text-4xl font-bold tracking-tight">About Semester Calendar Builder</h1>
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
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="/">Open the planner</a>
          <a className="underline underline-offset-4" href="/contact/">Contact</a>
          <a className="underline underline-offset-4" href="/privacy/">Privacy</a>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

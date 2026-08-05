import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { LOGO_ASSETS } from '@/lib/assets'

export const metadata: Metadata = {
  title: 'Planner Details | Semester Calendar Builder',
  description: 'Learn who built Semester Calendar Builder and how the private browser-based planner helps students organize academic schedules.',
  alternates: {
    canonical: '/about/',
  },
  openGraph: {
    url: '/about/',
    title: 'Planner Details | Semester Calendar Builder',
    description: 'Learn who built Semester Calendar Builder and how the private browser-based planner helps students organize academic schedules.',
    images: [
      {
        url: LOGO_ASSETS.full,
        width: 1200,
        height: 630,
        alt: 'Semester Calendar Builder visual planner interface',
      },
    ],
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
            Semester Calendar Builder is a free academic planner by Jonathan Reed. Build a weekly class schedule, add
            study blocks and important dates, switch to a full semester view, and export the plan when it is done.
          </p>
          <p>
            Most students hold this in a notes app or a spreadsheet, and neither one shows overlap. Put in-person
            classes, online courses, labs, office hours, exams, and work shifts on one grid and the collisions are
            obvious before you commit to them. You can start from a blank week or load an example semester.
          </p>
          <p>
            Schedule data stays in the browser. No account, no payment, no course details on a remote server. Export as
            ICS, CSV, PNG, or a JSON backup when the plan needs to live somewhere else, in a calendar app or printed out
            in front of an advisor.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link className="underline underline-offset-4" href="/">Open the planner</Link>
          <Link className="underline underline-offset-4" href="/contact/">Contact</Link>
          <Link className="underline underline-offset-4" href="/privacy/">Privacy</Link>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

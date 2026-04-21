import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy for Semester Calendar Builder',
  description: 'Privacy policy for Semester Calendar Builder, a local-first academic schedule planner by Jonathan Reed.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Privacy</p>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <div className="space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            Semester Calendar Builder stores schedule details in your browser. Courses, study blocks, exams, deadlines,
            and exported files are controlled by you and are not sent to a server by the planner.
          </p>
          <p>
            The app may use standard hosting logs and browser storage needed to serve the site, remember interface
            preferences, and keep your schedule available on the same device. Clearing browser storage can remove saved
            schedule data.
          </p>
          <p>
            Do not enter sensitive personal data beyond what you need for schedule planning. Exported files should be
            stored carefully because they can contain class names, times, locations, and notes that you added.
          </p>
          <p>
            This policy is maintained by Jonathan Reed for the public Semester Calendar Builder website.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="/">Open the planner</a>
          <a className="underline underline-offset-4" href="/about/">About</a>
          <a className="underline underline-offset-4" href="/contact/">Contact</a>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

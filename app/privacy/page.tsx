import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { LOGO_ASSETS } from '@/lib/assets'

export const metadata: Metadata = {
  title: 'Privacy Policy for Semester Calendar Builder',
  description: 'Read the Semester Calendar Builder privacy policy covering local browser storage, exports, hosting logs, and student schedule data handling.',
  alternates: {
    canonical: '/privacy/',
  },
  openGraph: {
    url: '/privacy/',
    title: 'Privacy Policy for Semester Calendar Builder',
    description: 'Read the Semester Calendar Builder privacy policy covering local browser storage, exports, hosting logs, and student schedule data handling.',
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Privacy</p>
        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Updated April 21, 2026</p>
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
          <p>
            The planner is designed around local browser storage. That means your schedule can remain available on the
            same device and browser, but it also means the schedule is not automatically synced across devices. If you
            need a backup, use the export tools and store the resulting file somewhere you trust.
          </p>
          <p>
            Exported calendar, image, and JSON files may include class names, instructors, locations, notes, exam dates,
            and study plans that you typed into the app. Treat those exports like any other personal academic document.
            Do not upload or share them publicly unless you are comfortable with the information they contain.
          </p>
          <p>
            The hosting provider may process standard request data such as IP address, browser information, requested
            URLs, timestamps, and security events needed to deliver and protect the website. Those logs are separate from
            the schedule you create in the browser and are used for reliability, abuse prevention, and basic operations.
          </p>
          <p>
            The app does not need a login to work. It does not process payments, sell student schedule data, or provide a
            backend account where course details are stored for later retrieval. If that changes, the policy should be
            updated before those features are launched.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link className="underline underline-offset-4" href="/">Open the planner</Link>
          <Link className="underline underline-offset-4" href="/about/">About</Link>
          <Link className="underline underline-offset-4" href="/contact/">Contact</Link>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

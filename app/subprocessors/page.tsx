import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { LOGO_ASSETS } from '@/lib/assets'

export const metadata: Metadata = {
  title: 'Subprocessors | Semester Calendar Builder',
  description: 'Subprocessor disclosure for Semester Calendar Builder, including Cloudflare Pages hosting and browser-local schedule planning.',
  alternates: {
    canonical: '/subprocessors/',
  },
  openGraph: {
    url: '/subprocessors/',
    title: 'Subprocessors | Semester Calendar Builder',
    description: 'Subprocessor disclosure for Semester Calendar Builder, including Cloudflare Pages hosting and browser-local schedule planning.',
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

export default function SubprocessorsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subprocessors</p>
        <h1 className="text-4xl font-bold tracking-tight">Semester Calendar Builder keeps the public site stack small.</h1>
        <p className="text-sm text-muted-foreground">Updated June 19, 2026</p>
        <div className="space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            Semester Calendar Builder is hosted on Cloudflare Pages. Cloudflare may process routine request metadata,
            such as IP address, user agent, request time, requested URL, and security signals, to deliver and protect
            the site.
          </p>
          <p>
            The planner is account-free. Courses, study blocks, exams, deadlines, exports, and backup files are handled
            in the browser unless you choose to download or share them.
          </p>
          <p>
            The app does not run hosted user accounts, payments, cloud schedule sync, school-system integrations, or a
            remote course database for visitor schedules.
          </p>
          <p>
            Schedule details are sensitive in practical ways even when they are not formal school records. Class names,
            instructor names, room locations, work shifts, commute blocks, exam windows, and notes can reveal a student's
            routine. The product is built so those details stay in the browser-first planning workflow instead of being
            collected by a hosted planner account.
          </p>
          <p>
            Exports are controlled by the user. If you download an ICS, CSV, PNG, or JSON file, that file is handled by
            your device, browser downloads folder, calendar app, cloud drive, email client, or any person you share it
            with. Semester Calendar Builder cannot control those downstream tools after export.
          </p>
          <p>
            Cloudflare's role is infrastructure delivery and site protection. It is not used here as a hosted database
            for student schedules, advisor notes, registration choices, or calendar backups. The only expected production
            processing is the routine request handling needed to serve a public static site.
          </p>
          <p>
            If Semester Calendar Builder later adds accounts, analytics, hosted sync, collaboration, payments, or school
            integrations, this disclosure should be updated before those services receive production traffic.
          </p>
          <p>
            Questions about subprocessors, local storage, exports, or schedule privacy can be sent through the contact
            page. Include the page, browser, and workflow if the question is tied to a specific planning or export step.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link className="underline underline-offset-4" href="/">Open the planner</Link>
          <Link className="underline underline-offset-4" href="/about/">About</Link>
          <Link className="underline underline-offset-4" href="/contact/">Contact</Link>
          <Link className="underline underline-offset-4" href="/privacy/">Privacy</Link>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

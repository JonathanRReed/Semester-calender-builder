import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { LOGO_ASSETS } from '@/lib/assets'

export const metadata: Metadata = {
  title: 'Support | Semester Calendar Builder',
  description: 'Contact Jonathan Reed about Semester Calendar Builder, student schedule planning, academic calendar workflows, bug reports, and product feedback.',
  alternates: {
    canonical: '/contact/',
  },
  openGraph: {
    url: '/contact/',
    title: 'Support | Semester Calendar Builder',
    description: 'Contact Jonathan Reed about Semester Calendar Builder, student schedule planning, academic calendar workflows, bug reports, and product feedback.',
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

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-bold tracking-tight">Contact Semester Calendar Builder</h1>
        <p className="text-sm text-muted-foreground">Updated April 21, 2026</p>
        <div className="space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            Questions, bug reports, and feature requests go through Jonathan Reed's main website.
          </p>
          <p>
            For a bug, name the browser and device, the steps that led to it, whether the schedule was blank or already
            full, and whether it happened during import, editing, printing, or export. If a saved file is involved, say
            what format it came from and whether the problem repeats after a refresh. Accessibility reports should name
            the page, the input method, and the assistive technology.
          </p>
          <p>
            Feature requests land best when they are specific to academic planning: alternating lab weeks, compressed
            summer terms, study-hour targets, exam windows, cleaner exports for classmates and family.
          </p>
          <p>
            This is a small public tool, not a school system, gradebook, or student information product. Do not send
            student records, account passwords, payment data, or health information through it.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="https://jonathanrreed.com/contact/">Contact Jonathan Reed</a>
          <Link className="underline underline-offset-4" href="/">Open the planner</Link>
          <Link className="underline underline-offset-4" href="/privacy/">Privacy</Link>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Contact Semester Calendar Builder',
  description: 'Contact Jonathan Reed about Semester Calendar Builder, academic planning, or student schedule workflows.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-3xl px-6 py-16 space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-bold tracking-tight">Contact Semester Calendar Builder</h1>
        <div className="space-y-4 text-base leading-7 text-muted-foreground">
          <p>
            Questions, bug reports, and suggestions for Semester Calendar Builder can be sent through Jonathan Reed's
            main website. Include your browser, device, and the workflow you were trying to complete if you are reporting
            an issue.
          </p>
          <p>
            Feedback is most useful when it explains the type of semester schedule being planned, such as college
            classes, online courses, recurring labs, studio blocks, exams, or work-study commitments.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="https://jonathanrreed.com/contact/">Contact Jonathan Reed</a>
          <a className="underline underline-offset-4" href="/">Open the planner</a>
          <a className="underline underline-offset-4" href="/privacy/">Privacy</a>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

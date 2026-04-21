import type { Metadata } from 'next'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Contact Semester Calendar Builder',
  description: 'Contact Jonathan Reed about Semester Calendar Builder, student schedule planning, academic calendar workflows, bug reports, and product feedback.',
  alternates: {
    canonical: '/contact',
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
            Questions, bug reports, and suggestions for Semester Calendar Builder can be sent through Jonathan Reed's
            main website. Include your browser, device, and the workflow you were trying to complete if you are reporting
            an issue.
          </p>
          <p>
            Feedback is most useful when it explains the type of semester schedule being planned, such as college
            classes, online courses, recurring labs, studio blocks, exams, or work-study commitments.
          </p>
          <p>
            Useful bug reports include the steps that led to the issue, whether the schedule was blank or already had
            events, and whether the problem happened during import, editing, printing, or export. If a saved schedule
            file is involved, describe the source format and whether the issue repeats after refreshing the browser.
          </p>
          <p>
            Feature requests are welcome when they are specific to academic planning. Examples include better support
            for alternating lab weeks, compressed summer terms, study-hour targets, exam windows, advisor review, or
            cleaner exports for classmates and family. The strongest requests explain who needs the workflow and what
            decision the calendar should make easier.
          </p>
          <p>
            Semester Calendar Builder is maintained as a small public tool. It is not a school system, gradebook, or
            student information product. Please do not send private student records, account passwords, payment data, or
            sensitive health information through feedback messages.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a className="underline underline-offset-4" href="https://jonathanrreed.com/contact/">Contact Jonathan Reed</a>
          <a className="underline underline-offset-4" href="/">Open the planner</a>
          <a className="underline underline-offset-4" href="/privacy">Privacy</a>
        </nav>
      </section>
      <Footer />
    </main>
  )
}

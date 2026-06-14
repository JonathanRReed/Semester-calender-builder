import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Page not found | Semester Calendar Builder",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="glass-card max-w-md w-full rounded-2xl p-8 text-center shadow-[var(--shadow-lg)] scale-in">
        <div className="text-5xl font-bold text-primary mb-2">404</div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          That page doesn&apos;t exist. Your saved schedule is safe in this browser.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110 transition"
        >
          Back to your calendar
        </Link>
      </div>
    </main>
  )
}

import type { ImportantDate } from "@/types/schedule"

export interface SemesterWeek {
  weekNumber: number
  startDate: Date
  endDate: Date
}

function localDateKey(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function parseLocalDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isFinite(date.getTime()) && localDateKey(date) === value ? date : null
}

/** Include partial opening/closing weeks, bounded by the inclusive term dates. */
export function generateSemesterWeeks(start: string, end: string): SemesterWeek[] {
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end)
  if (!startDate || !endDate || startDate > endDate) return []

  const weeks: SemesterWeek[] = []
  let current = new Date(startDate)
  current.setDate(current.getDate() - (current.getDay() + 6) % 7)
  while (current <= endDate) {
    const weekEnd = new Date(current)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weeks.push({
      weekNumber: weeks.length + 1,
      startDate: current < startDate ? new Date(startDate) : new Date(current),
      endDate: weekEnd > endDate ? new Date(endDate) : weekEnd,
    })
    // Calendar-day arithmetic, not 7 * 24 hours: DST must not shift midnight.
    current = new Date(current)
    current.setDate(current.getDate() + 7)
  }
  return weeks
}

/** Week boundaries represent inclusive local dates, not midnight cutoffs. */
export function isDateInWeek(now: Date | null, week: SemesterWeek): boolean {
  if (!now) return false
  const today = localDateKey(now)
  return today >= localDateKey(week.startDate) && today <= localDateKey(week.endDate)
}

/** Date-only events stay upcoming through their entire local calendar day. */
export function getUpcomingImportantDates(dates: ImportantDate[], now: Date | null): ImportantDate[] {
  if (!now) return []
  const today = localDateKey(now)
  return dates
    .filter(date => parseLocalDate(date.date) !== null && date.date >= today && (date.type === "deadline" || date.type === "exam" || date.type === "finals"))
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
    .slice(0, 3)
}


/** Whether a weekday falls inside a clipped semester week. */
export function isWeekdayInWeek(day: string, week: SemesterWeek): boolean {
  const rank = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(day)
  const start = (week.startDate.getDay() + 6) % 7
  const end = (week.endDate.getDay() + 6) % 7
  return rank >= start && rank <= end
}

import type { ScheduleEvent, CourseEvent, StudyBlock, ImportantDate, SemesterDates, DayOfWeek, ScheduleBackup } from "@/types/schedule"
import { parseTime, SCHEDULE_VERSION } from "./schedule-utils"
import { toast } from "sonner"

// ==========================================
// iCalendar (RFC 5545) export
//
// Design notes:
// - Times are FLOATING (no Z, no TZID): "9:30" stays "9:30" in whatever calendar
//   opens the file, and never drifts across daylight-saving changes.
// - Recurring classes are emitted as ONE VEVENT per recurrence group with a
//   multi-day RRULE bounded by the semester end (UNTIL), anchored to the first
//   occurrence on/after the semester start.
// - Break/finals days are excluded from class recurrences via EXDATE.
// - Important dates (exams, deadlines, breaks, finals) are exported as all-day or
//   timed VEVENTs — previously they were dropped entirely.
// ==========================================

const PRODID = "-//Semester Calendar Builder//EN//v1"

const DAY_TO_RRULE: Record<DayOfWeek, string> = {
  Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR", Sat: "SA", Sun: "SU",
}
const GETDAY_TO_DAY: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_RANK: Record<DayOfWeek, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

const pad2 = (n: number) => n.toString().padStart(2, "0")

function isAsync(event: ScheduleEvent): boolean {
  return event.startCT === "00:00" && event.endCT === "00:00"
}

// --- RFC 5545 text helpers ---------------------------------------------------

/** Escape a text value per RFC 5545 §3.3.11 (backslash first). */
export function escapeICS(text: string): string {
  return String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\n|\r/g, "\\n")
}

/** Fold a content line to <=75 octets, continuation lines prefixed with a space. */
export function foldLine(line: string): string {
  const enc = new TextEncoder()
  if (enc.encode(line).length <= 75) return line

  const segments: string[] = []
  let current = ""
  let currentBytes = 0
  let limit = 75
  for (const ch of Array.from(line)) {
    const b = enc.encode(ch).length
    if (currentBytes + b > limit) {
      segments.push(current)
      current = ""
      currentBytes = 0
      limit = 74 // continuation lines carry a leading space (1 octet)
    }
    current += ch
    currentBytes += b
  }
  if (current) segments.push(current)
  return segments.join("\r\n ")
}

// --- date/time helpers -------------------------------------------------------

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const ymd = (date: Date) => `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`

/** Floating DATE-TIME (no Z): YYYYMMDDTHHMMSS */
function floating(date: Date, hhmm: string): string {
  const { hour, minute } = parseTime(hhmm)
  return `${ymd(date)}T${pad2(hour)}${pad2(minute)}00`
}

/** UTC timestamp for DTSTAMP: YYYYMMDDTHHMMSSZ */
function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

/** First date on/after `from` whose weekday is in `days`. */
function firstOccurrence(from: Date, days: Set<DayOfWeek>): Date {
  let d = new Date(from)
  for (let i = 0; i < 7; i++) {
    if (days.has(GETDAY_TO_DAY[d.getDay()] as DayOfWeek)) return d
    d = addDays(d, 1)
  }
  return new Date(from)
}

// --- grouping ----------------------------------------------------------------

function groupKey(event: ScheduleEvent): string {
  if (event.recurrenceGroupId) return `g:${event.recurrenceGroupId}`
  const code = "courseCode" in event ? event.courseCode : ""
  const section = "courseCode" in event ? event.section : ""
  return `s:${event.type}|${code}|${section}|${event.title}|${event.startCT}|${event.endCT}`
}

function descriptionFor(event: ScheduleEvent): string {
  if (event.type === "study" && "notes" in event && event.notes) return event.notes
  if ("instructor" in event && event.instructor) return `Instructor: ${event.instructor}`
  return ""
}

// --- summary (used by the review-before-export dialog) -----------------------

export interface IcsSummary {
  classGroups: number
  examEvents: number
  importantDatesExported: number
  breakExclusions: number
  asyncSkipped: number
  hasSemester: boolean
  semester: SemesterDates | null
}

function buildIcs(
  events: ScheduleEvent[],
  importantDates: ImportantDate[],
  semester: SemesterDates | null,
): { content: string; summary: IcsSummary } {
  const now = new Date()
  const stamp = utcStamp(now)
  const semStart = semester?.startDate ? parseYMD(semester.startDate) : firstOccurrence(now, new Set(GETDAY_TO_DAY))
  const semEnd = semester?.endDate ? parseYMD(semester.endDate) : null
  const untilFloating = semester?.endDate ? `${semester.endDate.replace(/-/g, "")}T235959` : null

  // Precompute break/finals days as a set of "YYYYMMDD" for EXDATE checks.
  const breakDays = new Map<string, Date>()
  for (const d of importantDates) {
    if (d.type !== "break" && d.type !== "finals") continue
    const start = parseYMD(d.date)
    const end = d.endDate ? parseYMD(d.endDate) : start
    for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
      breakDays.set(ymd(cur), new Date(cur))
    }
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:My Semester",
  ]

  const summary: IcsSummary = {
    classGroups: 0,
    examEvents: 0,
    importantDatesExported: 0,
    breakExclusions: 0,
    asyncSkipped: 0,
    hasSemester: !!(semester?.startDate && semester?.endDate),
    semester: semester ?? null,
  }

  // --- recurring classes / study blocks (grouped) ---
  const groups = new Map<string, ScheduleEvent[]>()
  for (const event of events) {
    if (isAsync(event)) {
      summary.asyncSkipped++
      continue
    }
    const key = groupKey(event)
    const arr = groups.get(key) ?? []
    arr.push(event)
    groups.set(key, arr)
  }

  for (const [key, members] of groups) {
    const rep = members[0] as ScheduleEvent
    const days = new Set<DayOfWeek>()
    for (const m of members) {
      const day = m.day as DayOfWeek
      if (DAY_RANK[day] !== undefined) days.add(day)
    }
    if (days.size === 0) continue

    const sortedDays = Array.from(days).sort((a, b) => DAY_RANK[a] - DAY_RANK[b])
    const start = firstOccurrence(semStart, days)
    const uid = (rep.recurrenceGroupId ?? `evt-${key.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40)}`) + "@semester-calendar-builder"
    const isExam = rep.type === "exam"

    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART:${floating(start, rep.startCT)}`)
    lines.push(`DTEND:${floating(start, rep.endCT)}`)
    lines.push(`SUMMARY:${escapeICS(rep.title)}`)
    const desc = descriptionFor(rep)
    if (desc) lines.push(`DESCRIPTION:${escapeICS(desc)}`)
    if ("location" in rep && rep.location) lines.push(`LOCATION:${escapeICS(rep.location)}`)

    // Hidden round-trip metadata (ignored by calendar apps).
    lines.push(`X-SCB-TYPE:${rep.type}`)
    if ("courseCode" in rep && rep.courseCode) lines.push(`X-SCB-CODE:${escapeICS(rep.courseCode)}`)
    if ("section" in rep && rep.section) lines.push(`X-SCB-SECTION:${escapeICS(rep.section)}`)
    if ("credits" in rep && rep.credits) lines.push(`X-SCB-CREDITS:${rep.credits}`)

    if (!isExam) {
      // Weekly recurrence across the semester.
      const byday = sortedDays.map((d) => DAY_TO_RRULE[d]).join(",")
      let rrule = `RRULE:FREQ=WEEKLY;BYDAY=${byday}`
      if (untilFloating) rrule += `;UNTIL=${untilFloating}`
      lines.push(rrule)

      // Exclude break/finals days that land on a class weekday within the range.
      const exdates: string[] = []
      for (const [ymdKey, breakDate] of breakDays) {
        const day = GETDAY_TO_DAY[breakDate.getDay()] as DayOfWeek
        if (!days.has(day)) continue
        if (breakDate < start) continue
        if (semEnd && breakDate > semEnd) continue
        exdates.push(`${ymdKey}T${rep.startCT.replace(":", "")}00`)
      }
      if (exdates.length > 0) {
        lines.push(`EXDATE:${exdates.join(",")}`)
        summary.breakExclusions += exdates.length
      }
      summary.classGroups++
    } else {
      // Exams have no weekly pattern — single timed occurrence.
      summary.examEvents++
    }

    lines.push("END:VEVENT")
  }

  // --- important dates (all-day or timed) ---
  for (const d of importantDates) {
    const start = parseYMD(d.date)
    const uid = `${d.id}@semester-calendar-builder`

    lines.push("BEGIN:VEVENT")
    lines.push(`UID:${uid}`)
    lines.push(`DTSTAMP:${stamp}`)

    if (d.startTime) {
      const endTime = d.endTime ?? d.startTime
      lines.push(`DTSTART:${floating(start, d.startTime)}`)
      lines.push(`DTEND:${floating(start, endTime)}`)
    } else {
      const end = d.endDate ? parseYMD(d.endDate) : start
      lines.push(`DTSTART;VALUE=DATE:${ymd(start)}`)
      lines.push(`DTEND;VALUE=DATE:${ymd(addDays(end, 1))}`)
    }

    lines.push(`SUMMARY:${escapeICS(d.title)}`)
    if (d.description) lines.push(`DESCRIPTION:${escapeICS(d.description)}`)
    if (d.location) lines.push(`LOCATION:${escapeICS(d.location)}`)
    lines.push(`CATEGORIES:${d.type.toUpperCase()}`)
    lines.push("END:VEVENT")
    summary.importantDatesExported++
  }

  lines.push("END:VCALENDAR")

  const content = lines.map(foldLine).join("\r\n")
  return { content, summary }
}

/** Generate a complete iCalendar file string. */
export function generateICSFile(
  events: ScheduleEvent[],
  importantDates: ImportantDate[] = [],
  semester: SemesterDates | null = null,
): string {
  return buildIcs(events, importantDates, semester).content
}

/** Summarize what an ICS export would contain (for the review dialog). */
export function summarizeIcsExport(
  events: ScheduleEvent[],
  importantDates: ImportantDate[] = [],
  semester: SemesterDates | null = null,
): IcsSummary {
  return buildIcs(events, importantDates, semester).summary
}

export function downloadICSFile(
  events: ScheduleEvent[],
  importantDates: ImportantDate[] = [],
  semester: SemesterDates | null = null,
) {
  const icsContent = generateICSFile(events, importantDates, semester)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "semester-schedule.ics"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success("Calendar exported successfully!")
}

// ==========================================
// JSON backup (full, lossless — pairs with parseJSONBackup in import-utils)
// ==========================================
export function generateJSONBackup(
  events: ScheduleEvent[],
  importantDates: ImportantDate[] = [],
  semester: SemesterDates | null = null,
): string {
  const backup: ScheduleBackup = {
    version: SCHEDULE_VERSION,
    courses: events.filter((e) => e.type !== "study") as CourseEvent[],
    studyBlocks: events.filter((e) => e.type === "study") as StudyBlock[],
    importantDates,
    semesterDates: semester,
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(backup, null, 2)
}

export function downloadJSONBackup(
  events: ScheduleEvent[],
  importantDates: ImportantDate[] = [],
  semester: SemesterDates | null = null,
) {
  const blob = new Blob([generateJSONBackup(events, importantDates, semester)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "semester-schedule-backup.json"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success("Backup downloaded", { description: "Re-import it any time from Manage Data" })
}

// ==========================================
// PNG export
// ==========================================
export async function exportToPNG(elementId: string) {
  try {
    const html2canvas = (await import("html2canvas")).default

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = "course-schedule.png"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          toast.success("Schedule exported as PNG!")
        }
      },
      "image/png",
      1.0,
    )
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to export PNG:", error)
    }
    toast.error("Failed to export PNG. Please try again.")
  }
}

// ==========================================
// Text summary export
// ==========================================
const DAY_LABELS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function generateTextSummary(events: ScheduleEvent[], importantDates: ImportantDate[] = []): string {
  let summary = "COURSE SCHEDULE SUMMARY\n"
  summary += "========================\n\n"

  DAY_LABELS.forEach((day) => {
    const dayEvents = events
      .filter((event) => event.day === day)
      .sort((a, b) => {
        if (isAsync(a)) return 1
        if (isAsync(b)) return -1
        return a.startCT.localeCompare(b.startCT)
      })

    if (dayEvents.length > 0) {
      summary += `${day.toUpperCase()}\n`
      summary += "─────\n"

      dayEvents.forEach((event) => {
        if (isAsync(event)) {
          summary += `• ${event.title} (Async)\n`
        } else {
          summary += `• ${event.startCT} - ${event.endCT}: ${event.title}\n`
        }
        if ("location" in event && event.location) summary += `  📍 ${event.location}\n`
        if ("instructor" in event && event.instructor) summary += `  👨‍🏫 ${event.instructor}\n`
        if (event.type === "study" && "notes" in event && event.notes) summary += `  📝 ${event.notes}\n`
        summary += "\n"
      })
      summary += "\n"
    }
  })

  if (importantDates.length > 0) {
    summary += "IMPORTANT DATES\n"
    summary += "───────────────\n"
    const sorted = [...importantDates].sort((a, b) => a.date.localeCompare(b.date))
    sorted.forEach((d) => {
      const range = d.endDate && d.endDate !== d.date ? `${d.date} – ${d.endDate}` : d.date
      summary += `• ${range} — ${d.title} [${d.type}]\n`
    })
    summary += "\n"
  }

  const courseEvents = events.filter((e) => e.type !== "study")
  const studyEvents = events.filter((e) => e.type === "study")

  summary += "STATISTICS\n"
  summary += "──────────\n"
  summary += `Total Courses: ${courseEvents.length}\n`
  summary += `Study Blocks: ${studyEvents.length}\n`
  summary += `In-person Classes: ${events.filter((e) => e.type === "inperson").length}\n`
  summary += `Online Classes: ${events.filter((e) => e.type === "online").length}\n`

  return summary
}

export function copyTextSummary(events: ScheduleEvent[], importantDates: ImportantDate[] = []) {
  const summary = generateTextSummary(events, importantDates)

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast.success("Schedule summary copied to clipboard!")
      })
      .catch(() => {
        fallbackCopyTextToClipboard(summary)
      })
  } else {
    fallbackCopyTextToClipboard(summary)
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-999999px"
  textArea.style.top = "-999999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand("copy")
    toast.success("Schedule summary copied to clipboard!")
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to copy text: ", err)
    }
    toast.error("Failed to copy to clipboard. Please copy manually.")
  }

  document.body.removeChild(textArea)
}

// ==========================================
// CSV export (lossless round-trip with lib/import-utils.ts)
// ==========================================
const CSV_HEADERS = [
  "Type",
  "Title",
  "Course Code",
  "Section",
  "Day",
  "Start Time",
  "End Time",
  "Location",
  "Instructor",
  "Credits",
  "Notes",
  "Date",
  "End Date",
  "Recurrence Group",
] as const

function csvCell(value: string | number | undefined | null): string {
  const s = value == null ? "" : String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function generateCSV(events: ScheduleEvent[], importantDates: ImportantDate[] = []): string {
  const rows: string[] = [CSV_HEADERS.join(",")]

  for (const event of events) {
    const isCourse = event.type !== "study"
    rows.push(
      [
        event.type,
        event.title,
        isCourse && "courseCode" in event ? event.courseCode : "",
        isCourse && "section" in event ? event.section : "",
        event.day,
        isAsync(event) ? "Async" : event.startCT,
        isAsync(event) ? "Async" : event.endCT,
        "location" in event && event.location ? event.location : "",
        "instructor" in event && event.instructor ? event.instructor : "",
        "credits" in event && event.credits ? event.credits : "",
        event.type === "study" && "notes" in event && event.notes ? event.notes : "",
        "",
        "",
        event.recurrenceGroupId ?? "",
      ]
        .map(csvCell)
        .join(","),
    )
  }

  for (const d of importantDates) {
    rows.push(
      [
        d.type,
        d.title,
        "",
        "",
        "",
        d.startTime ?? "",
        d.endTime ?? "",
        d.location ?? "",
        "",
        "",
        d.description ?? "",
        d.date,
        d.endDate ?? "",
        "",
      ]
        .map(csvCell)
        .join(","),
    )
  }

  return rows.join("\n")
}

export function downloadCSV(events: ScheduleEvent[], importantDates: ImportantDate[] = []) {
  const csvContent = generateCSV(events, importantDates)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "course-schedule.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  toast.success("Schedule exported as CSV!")
}

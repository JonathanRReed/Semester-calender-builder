import type { DayOfWeek } from "@/types/schedule"

// ==========================================
// Shared, pure parsing + validation helpers.
// Used by every input path (bulk text, quick-add, CSV/ICS import, smart paste)
// so day/time normalization and validation behave identically everywhere.
// ==========================================

export const DAY_ORDER: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Single-token day aliases (full names, abbreviations, single letters, registrar shorthand).
const DAY_ALIASES: Record<string, DayOfWeek> = {
  m: "Mon", mo: "Mon", mon: "Mon", monday: "Mon",
  t: "Tue", tu: "Tue", tue: "Tue", tues: "Tue", tuesday: "Tue",
  w: "Wed", we: "Wed", wed: "Wed", weds: "Wed", wednesday: "Wed",
  r: "Thu", h: "Thu", th: "Thu", thu: "Thu", thur: "Thu", thurs: "Thu", thursday: "Thu",
  f: "Fri", fr: "Fri", fri: "Fri", friday: "Fri",
  s: "Sat", sa: "Sat", sat: "Sat", saturday: "Sat",
  u: "Sun", su: "Sun", sun: "Sun", sunday: "Sun",
}

// Maps for scanning compact strings like "MWF", "TR", "TTh", "MoWeFr".
const COMPACT_TWO: Record<string, DayOfWeek> = {
  mo: "Mon", tu: "Tue", we: "Wed", th: "Thu", fr: "Fri", sa: "Sat", su: "Sun",
}
const COMPACT_ONE: Record<string, DayOfWeek> = {
  m: "Mon", t: "Tue", w: "Wed", r: "Thu", h: "Thu", f: "Fri", s: "Sat", u: "Sun",
}

/** Normalize a single day token ("Monday", "Mon", "Mo", "M", "R") to a DayOfWeek, or null. */
export function normalizeDay(input: string): DayOfWeek | null {
  const key = (input || "").trim().toLowerCase().replace(/\./g, "")
  return DAY_ALIASES[key] ?? null
}

/** Scan a compact, separator-less string like "TTh" or "MWF" into days. */
function scanCompactDays(token: string): DayOfWeek[] {
  const days: DayOfWeek[] = []
  const s = token.toLowerCase()
  let i = 0
  while (i < s.length) {
    const two = s.slice(i, i + 2)
    if (COMPACT_TWO[two]) {
      days.push(COMPACT_TWO[two])
      i += 2
      continue
    }
    const one = COMPACT_ONE[s[i] ?? ""]
    if (one) days.push(one)
    i += 1
  }
  return days
}

/** Parse one whitespace-delimited token into one or more days. */
function parseDayToken(token: string): DayOfWeek[] {
  const single = normalizeDay(token)
  if (single) return [single]
  // Not a single recognizable day → try compact scan ("MWF", "TR", "TTh").
  return scanCompactDays(token)
}

/**
 * Parse a free-form day specification into a canonical, de-duplicated list.
 * Handles "Mon,Wed,Fri", "Mon Wed Fri", "M/W/F", "MWF", "TR", "TTh", "MoWeFr".
 */
export function parseDayList(input: string): DayOfWeek[] {
  if (!input) return []
  const tokens = input
    .trim()
    .split(/[\s,;/|+&]+/)
    .filter(Boolean)

  const found = new Set<DayOfWeek>()
  for (const token of tokens) {
    for (const day of parseDayToken(token)) found.add(day)
  }
  return DAY_ORDER.filter((d) => found.has(d))
}

const pad2 = (n: number) => n.toString().padStart(2, "0")

/**
 * Parse a single time into 24h "HH:MM".
 * Handles "9:30", "9:30 AM", "09:30", "0930", "930", "9 pm", "14:30". Returns null if invalid.
 */
export function parseTime(input: string): string | null {
  if (!input) return null
  let s = input.trim().toLowerCase()
  if (!s) return null

  let meridiem: "am" | "pm" | null = null
  const mer = s.match(/(a|p)\.?m\.?/)
  if (mer) {
    meridiem = (mer[1] === "p" ? "pm" : "am")
    s = s.replace(/(a|p)\.?m\.?/, "").trim()
  }
  s = s.replace(/\s+/g, "")

  let hour: number
  let minute: number

  const m = s.match(/^(\d{1,2}):(\d{2})$/)
  if (m) {
    hour = Number(m[1])
    minute = Number(m[2])
  } else if (/^\d{3,4}$/.test(s)) {
    // Military-style "930" / "0930" / "1430"
    minute = Number(s.slice(-2))
    hour = Number(s.slice(0, -2))
  } else if (/^\d{1,2}$/.test(s)) {
    hour = Number(s)
    minute = 0
  } else {
    return null
  }

  if (meridiem === "pm" && hour < 12) hour += 12
  if (meridiem === "am" && hour === 12) hour = 0

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return `${pad2(hour)}:${pad2(minute)}`
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export type TimeRangeResult =
  | { ok: true; start: string; end: string }
  | { ok: false; error: string }

/**
 * Parse a time range like "9:30-10:45", "9:30 AM – 10:45 AM", "0930-1045", "9 to 10".
 * Validates both ends parse and that end is after start.
 */
export function parseTimeRange(input: string): TimeRangeResult {
  if (!input || !input.trim()) return { ok: false, error: "missing time" }
  const parts = input
    .trim()
    .split(/\s*(?:-|–|—|\bto\b|\buntil\b)\s*/i)
    .filter(Boolean)

  if (parts.length < 2) return { ok: false, error: `missing end time in "${input.trim()}"` }

  const start = parseTime(parts[0] as string)
  const end = parseTime(parts[1] as string)
  if (!start) return { ok: false, error: `bad start time "${parts[0]}"` }
  if (!end) return { ok: false, error: `bad end time "${parts[1]}"` }
  if (toMinutes(end) <= toMinutes(start)) {
    return { ok: false, error: `end time "${end}" is not after start "${start}"` }
  }
  return { ok: true, start, end }
}

// ==========================================
// Pipe-delimited course line parsing (shared by bulk import)
// Format: Code | Title | Days | Time | Location? | Instructor?
// ==========================================

export interface CourseTemplate {
  title: string
  courseCode: string
  section: string
  type: "inperson" | "online" | "exam"
  startCT: string
  endCT: string
  location: string
  instructor: string
}

export type CourseLineResult =
  | { ok: true; template: CourseTemplate; days: DayOfWeek[] }
  | { ok: false; error: string }

/** Parse a single pipe-delimited course line into a reusable template + day list. */
export function parsePipeCourseLine(line: string): CourseLineResult {
  const parts = line.split("|").map((p) => p.trim())
  if (parts.length < 4) {
    return { ok: false, error: "expected at least: Code | Title | Days | Time" }
  }

  const [codeRaw = "", titleRaw = "", daysRaw = "", timeRaw = "", locationRaw = "", instructorRaw = ""] = parts

  const days = parseDayList(daysRaw)
  if (days.length === 0) {
    return { ok: false, error: `no valid days in "${daysRaw}"` }
  }

  const range = parseTimeRange(timeRaw)
  if (!range.ok) return { ok: false, error: range.error }

  const courseCode = codeRaw
  const title = titleRaw || courseCode
  const type: CourseTemplate["type"] = locationRaw.toLowerCase().includes("online") ? "online" : "inperson"

  return {
    ok: true,
    days,
    template: {
      title: courseCode ? `${courseCode} ${title}`.trim() : title,
      courseCode,
      section: "",
      type,
      startCT: range.start,
      endCT: range.end,
      location: locationRaw,
      instructor: instructorRaw,
    },
  }
}

// ==========================================
// Smart "paste anything" detection
// Best-effort extraction from messy registrar / syllabus text.
// Always surfaced in an editable preview before import — never silently applied.
// ==========================================

export interface DetectedCourse {
  raw: string
  courseCode: string
  title: string
  days: DayOfWeek[]
  startCT: string
  endCT: string
  location: string
  instructor: string
  type: "inperson" | "online" | "exam"
  confidence: "high" | "medium" | "low"
}

const TIME_RANGE_RE =
  /(\d{1,2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?::\d{2})?\s*(?:[ap]\.?m\.?)?)/i
const CODE_RE = /\b([A-Za-z]{2,4})\s*-?\s*(\d{3,4}[A-Za-z]?)\b/
const INSTRUCTOR_RE = /\b(?:Dr|Prof|Professor|Mr|Ms|Mrs)\.?\s+[A-Z][a-zA-Z.'-]+(?:\s+[A-Z][a-zA-Z.'-]+)?/
const DAY_TOKEN_RE =
  /^(?:mon|tue|tues|wed|weds|thu|thur|thurs|fri|sat|sun|monday|tuesday|wednesday|thursday|friday|saturday|sunday|[mtwrf]{1,5}|tth|tuth|mowefr)$/i

/** Parse free-form pasted text into best-effort course rows for an editable preview. */
export function parseSmartText(text: string): DetectedCourse[] {
  const out: DetectedCourse[] = []

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim()
    if (!line) continue

    // Time range
    const timeMatch = line.match(TIME_RANGE_RE)
    let startCT = ""
    let endCT = ""
    if (timeMatch) {
      const range = parseTimeRange(timeMatch[0])
      if (range.ok) {
        startCT = range.start
        endCT = range.end
      }
    }

    // Days (only whitespace-delimited day-ish tokens, so words like "Intro" aren't misread)
    const dayTokens = line.split(/[\s,]+/).filter((t) => DAY_TOKEN_RE.test(t))
    const days = parseDayList(dayTokens.join(" "))

    // Course code
    const codeMatch = line.match(CODE_RE)
    const courseCode = codeMatch ? `${(codeMatch[1] ?? "").toUpperCase()} ${codeMatch[2] ?? ""}`.trim() : ""

    // Need at least a time, or a code + days, to consider this a course line.
    if (!timeMatch && !(courseCode && days.length > 0)) continue

    const type: DetectedCourse["type"] = /\bonline\b/i.test(line) ? "online" : "inperson"
    const instructor = line.match(INSTRUCTOR_RE)?.[0] ?? ""

    // Build a residual string with the structured bits removed, then mine it for
    // location + title (avoids matching day clusters like "MWF" or time digits as a room).
    let residual = line
    if (codeMatch) residual = residual.replace(codeMatch[0], " ")
    if (timeMatch) residual = residual.replace(timeMatch[0], " ")
    if (instructor) residual = residual.replace(instructor, " ")
    for (const t of dayTokens) residual = residual.replace(new RegExp(`(^|\\s)${t}(\\s|$)`, "g"), " ")
    residual = residual.replace(/\b[ap]\.?m\.?\b/gi, " ").replace(/\s+/g, " ").trim()

    let location = ""
    if (type === "online") {
      location = "Online"
      residual = residual.replace(/\bonline\b/gi, " ").replace(/\s+/g, " ").trim()
    } else {
      // A building word/abbrev followed by a room number, e.g. "Hall 201", "SCI 120", "ENG 3.201".
      const roomMatch = residual.match(/\b([A-Z][A-Za-z]+\s?\d{1,4}[A-Za-z]?|[A-Z]{2,4}\s?\d{1,4}[A-Za-z]?(?:\.\d+)?)\b/)
      if (roomMatch) {
        location = roomMatch[0].trim()
        residual = residual.replace(roomMatch[0], " ").replace(/\s+/g, " ").trim()
      }
    }

    let title = residual
      .replace(/\b(in[- ]person|lecture|lab|section|sec)\b/gi, " ")
      .replace(/[|,;–—-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (!title) title = courseCode || "Course"

    const hasTime = !!startCT && !!endCT
    const confidence: DetectedCourse["confidence"] =
      courseCode && days.length > 0 && hasTime
        ? "high"
        : (days.length > 0 && hasTime) || (courseCode && hasTime)
          ? "medium"
          : "low"

    out.push({
      raw: line,
      courseCode,
      title,
      days,
      startCT: startCT || "09:00",
      endCT: endCT || "10:00",
      location,
      instructor,
      type,
      confidence,
    })
  }

  return out
}

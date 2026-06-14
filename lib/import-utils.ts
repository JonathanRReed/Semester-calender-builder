import type { CourseEvent, StudyBlock, ImportantDate, DayOfWeek, SemesterDates } from "@/types/schedule"
import { normalizeDay, parseTime, DAY_ORDER } from "./schedule-parse"
import { validateSchedule } from "./schedule-schema"

export interface ImportResult {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
  errors: string[]
  semesterDates?: SemesterDates | null
}

function emptyResult(): ImportResult {
  return { courses: [], studyBlocks: [], importantDates: [], errors: [] }
}

function normalizeImportantType(input: string): ImportantDate["type"] {
  const v = (input || "").toLowerCase().trim()
  if (v === "deadline") return "deadline"
  if (v === "break") return "break"
  if (v === "exam") return "exam"
  if (v === "finals") return "finals"
  return "event"
}

function normalizeCourseType(input: string): CourseEvent["type"] {
  const v = (input || "").toLowerCase()
  if (v.includes("online")) return "online"
  if (v === "exam") return "exam"
  return "inperson"
}

// ==========================================
// CSV
// ==========================================

/** RFC-4180-ish CSV parser: handles quoted fields, escaped quotes, embedded commas/newlines. */
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += c
      i++
      continue
    }
    if (c === '"') {
      inQuotes = true
      i++
      continue
    }
    if (c === ",") {
      row.push(field)
      field = ""
      i++
      continue
    }
    if (c === "\r") {
      i++
      continue
    }
    if (c === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      i++
      continue
    }
    field += c
    i++
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""))
}

// Map a raw header cell to a canonical field name.
const HEADER_ALIASES: Record<string, string> = {
  type: "type",
  title: "title", name: "title",
  "course code": "courseCode", coursecode: "courseCode", code: "courseCode",
  section: "section", sec: "section",
  day: "day", days: "day",
  "start time": "startTime", startct: "startTime", starttime: "startTime", start: "startTime",
  "end time": "endTime", endct: "endTime", endtime: "endTime", end: "endTime",
  location: "location", room: "location",
  instructor: "instructor", professor: "instructor",
  credits: "credits", "credit hours": "credits",
  notes: "notes", description: "notes",
  date: "date", "start date": "date",
  "end date": "endDate", enddate: "endDate",
  "recurrence group": "recurrenceGroupId", recurrencegroupid: "recurrenceGroupId",
  "recurrence group id": "recurrenceGroupId",
  difficulty: "difficulty", sentiment: "sentiment",
}

const CANONICAL_ORDER = [
  "type", "title", "courseCode", "section", "day", "startTime", "endTime",
  "location", "instructor", "credits", "notes", "date", "endDate", "recurrenceGroupId",
]

function looksLikeHeader(cells: string[]): boolean {
  return cells.some((c) => HEADER_ALIASES[c.trim().toLowerCase()] !== undefined)
}

export function parseCSVToSchedule(csvContent: string): ImportResult {
  const result = emptyResult()
  const rows = parseCSVRows(csvContent)
  if (rows.length === 0) return result

  const firstRow = rows[0] ?? []
  const hasHeader = looksLikeHeader(firstRow)
  const headers = hasHeader
    ? firstRow.map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase())
    : CANONICAL_ORDER

  const dataRows = hasHeader ? rows.slice(1) : rows
  // Track synthetic recurrence groups for course rows that lack an explicit group id.
  const syntheticGroups = new Map<string, string>()

  dataRows.forEach((cells, idx) => {
    const rowNum = idx + (hasHeader ? 2 : 1)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim()
    })

    const hasDate = !!row.date
    const typeRaw = (row.type ?? "").toLowerCase()

    // Important date: anything with a concrete calendar date.
    if (hasDate) {
      const date: ImportantDate = {
        id: crypto.randomUUID(),
        title: row.title || "Important Date",
        date: row.date as string,
        type: normalizeImportantType(typeRaw),
      }
      if (row.endDate) date.endDate = row.endDate
      if (row.notes) date.description = row.notes
      if (row.location) date.location = row.location
      if (row.startTime && row.startTime.toLowerCase() !== "async") {
        const st = parseTime(row.startTime)
        if (st) date.startTime = st
        const et = row.endTime ? parseTime(row.endTime) : null
        if (et) date.endTime = et
      }
      result.importantDates.push(date)
      return
    }

    // Study block / course: needs a day + valid times.
    const day = normalizeDay(row.day ?? "")
    if (!day) {
      result.errors.push(`Row ${rowNum}: unrecognized day "${row.day ?? ""}"`)
      return
    }
    const isAsync = (row.startTime ?? "").toLowerCase() === "async"
    let startCT = "00:00"
    let endCT = "00:00"
    if (!isAsync) {
      const st = parseTime(row.startTime ?? "")
      const et = parseTime(row.endTime ?? "")
      if (!st || !et) {
        result.errors.push(`Row ${rowNum}: bad time "${row.startTime ?? ""}–${row.endTime ?? ""}"`)
        return
      }
      startCT = st
      endCT = et
    }

    if (typeRaw === "study") {
      const block: StudyBlock = {
        id: crypto.randomUUID(),
        title: row.title || "Study Block",
        type: "study",
        day,
        startCT,
        endCT,
        notes: row.notes || "",
      }
      if (row.recurrenceGroupId) block.recurrenceGroupId = row.recurrenceGroupId
      result.studyBlocks.push(block)
      return
    }

    const course: CourseEvent = {
      id: crypto.randomUUID(),
      title: row.title || row.courseCode || "Course",
      courseCode: row.courseCode || "",
      section: row.section || "",
      type: normalizeCourseType(typeRaw),
      day,
      startCT,
      endCT,
      location: row.location || "",
      instructor: row.instructor || "",
    }
    if (row.credits) {
      const credits = Number.parseInt(row.credits, 10)
      if (Number.isFinite(credits)) course.credits = credits
    }
    if (row.difficulty) {
      const difficulty = Number.parseInt(row.difficulty, 10)
      if (Number.isFinite(difficulty)) course.difficulty = difficulty
    }
    if (row.sentiment) course.sentiment = row.sentiment

    // Preserve explicit groups; otherwise link rows that describe the same meeting on different days.
    if (row.recurrenceGroupId) {
      course.recurrenceGroupId = row.recurrenceGroupId
    } else {
      const key = `${course.type}|${course.courseCode}|${course.section}|${course.title}|${startCT}|${endCT}`
      if (!syntheticGroups.has(key)) syntheticGroups.set(key, crypto.randomUUID())
      course.recurrenceGroupId = syntheticGroups.get(key)
    }
    result.courses.push(course)
  })

  return result
}

// ==========================================
// ICS (iCalendar)
// ==========================================

function unfoldICS(content: string): string {
  return content.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "")
}

function unescapeICS(text: string): string {
  return text
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
}

function getProp(block: string, name: string): { value: string; params: string } | null {
  const re = new RegExp(`(?:^|\\n)${name}((?:;[^:\\n]*)?):(.*)`, "i")
  const m = block.match(re)
  if (!m) return null
  return { params: m[1] ?? "", value: (m[2] ?? "").trim() }
}

const RRULE_DAY_TO_DAY: Record<string, DayOfWeek> = {
  MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat", SU: "Sun",
}
const JS_DAY: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function parseDtValue(value: string): { date: string; time: string | null; allDay: boolean } | null {
  // Floating/UTC datetime: 20250825T090000(Z)
  const dt = value.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/)
  if (dt) {
    return {
      date: `${dt[1]}-${dt[2]}-${dt[3]}`,
      time: `${dt[4]}:${dt[5]}`,
      allDay: false,
    }
  }
  // Date only: 20250825
  const d = value.match(/^(\d{4})(\d{2})(\d{2})$/)
  if (d) {
    return { date: `${d[1]}-${d[2]}-${d[3]}`, time: null, allDay: true }
  }
  return null
}

/** All-day DTEND is exclusive (the day after). Convert it back to an inclusive end date. */
function exclusiveEndToInclusive(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
  date.setDate(date.getDate() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function parseICSToSchedule(icsContent: string): ImportResult {
  const result = emptyResult()
  const content = unfoldICS(icsContent)
  const blocks = content.split("BEGIN:VEVENT").slice(1)

  blocks.forEach((raw, i) => {
    const block = raw.split("END:VEVENT")[0] ?? raw

    const summary = unescapeICS(getProp(block, "SUMMARY")?.value ?? "").trim() || "Imported Event"
    const location = unescapeICS(getProp(block, "LOCATION")?.value ?? "").trim()
    const description = unescapeICS(getProp(block, "DESCRIPTION")?.value ?? "").trim()
    const dtstart = getProp(block, "DTSTART")
    const dtend = getProp(block, "DTEND")
    const rrule = getProp(block, "RRULE")?.value ?? ""
    const categories = (getProp(block, "CATEGORIES")?.value ?? "").toLowerCase()
    const scbType = (getProp(block, "X-SCB-TYPE")?.value ?? "").toLowerCase()
    const scbCode = getProp(block, "X-SCB-CODE")?.value ?? ""
    const scbSection = getProp(block, "X-SCB-SECTION")?.value ?? ""
    const scbCredits = getProp(block, "X-SCB-CREDITS")?.value ?? ""

    if (!dtstart) {
      result.errors.push(`Event ${i + 1}: missing start date`)
      return
    }
    const start = parseDtValue(dtstart.value)
    if (!start) {
      result.errors.push(`Event ${i + 1}: unparseable start date "${dtstart.value}"`)
      return
    }
    const end = dtend ? parseDtValue(dtend.value) : null

    // No RRULE → a one-off / all-day entry → ImportantDate.
    if (!rrule) {
      const type = normalizeImportantType(categories || scbType)
      const date: ImportantDate = {
        id: `ics-${i}-${crypto.randomUUID().slice(0, 8)}`,
        title: summary,
        date: start.date,
        type,
      }
      if (description) date.description = description
      if (location) date.location = location
      if (start.allDay) {
        // All-day DTEND is exclusive (next day); store inclusive end if multi-day.
        if (end?.allDay && end.date !== start.date) {
          const inclusiveEnd = exclusiveEndToInclusive(end.date)
          if (inclusiveEnd !== start.date) date.endDate = inclusiveEnd
        }
      } else if (start.time) {
        date.startTime = start.time
        if (end?.time) date.endTime = end.time
      }
      result.importantDates.push(date)
      return
    }

    // RRULE present → recurring class/study block.
    const days: DayOfWeek[] = []
    const byday = rrule.match(/BYDAY=([^;]+)/i)?.[1]
    if (byday) {
      for (const code of byday.split(",")) {
        const day = RRULE_DAY_TO_DAY[code.trim().toUpperCase().replace(/^[+-]?\d/, "")]
        if (day) days.push(day)
      }
    }
    if (days.length === 0) {
      // Fall back to the weekday of DTSTART.
      const [y, m, d] = start.date.split("-").map(Number)
      const wd = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1).getDay()
      const day = JS_DAY[wd]
      if (day) days.push(day)
    }
    const orderedDays = DAY_ORDER.filter((d) => days.includes(d))

    const startCT = start.time ?? "09:00"
    const endCT = end?.time ?? "10:00"
    const groupId = orderedDays.length > 1 ? crypto.randomUUID() : undefined

    const isStudy =
      scbType === "study" || (!scbType && (summary.toLowerCase().includes("study") || summary.toLowerCase().includes("work")))

    for (const day of orderedDays) {
      if (isStudy) {
        const block: StudyBlock = {
          id: `ics-${i}-${day}-${crypto.randomUUID().slice(0, 6)}`,
          title: summary,
          type: "study",
          day,
          startCT,
          endCT,
          notes: description,
        }
        if (groupId) block.recurrenceGroupId = groupId
        result.studyBlocks.push(block)
      } else {
        const courseType: CourseEvent["type"] =
          scbType === "online" || scbType === "exam" || scbType === "inperson"
            ? (scbType as CourseEvent["type"])
            : normalizeCourseType(location)
        const course: CourseEvent = {
          id: `ics-${i}-${day}-${crypto.randomUUID().slice(0, 6)}`,
          title: summary,
          courseCode: scbCode || summary.split(" ").slice(0, 2).join(" "),
          section: scbSection,
          type: courseType,
          day,
          startCT,
          endCT,
          location,
          instructor: description.startsWith("Instructor:") ? description.replace(/^Instructor:\s*/, "") : "",
        }
        if (scbCredits) {
          const c = Number.parseInt(scbCredits, 10)
          if (Number.isFinite(c)) course.credits = c
        }
        if (groupId) course.recurrenceGroupId = groupId
        result.courses.push(course)
      }
    }
  })

  return result
}

// ==========================================
// JSON backup
// ==========================================

export function parseJSONBackup(jsonContent: string): ImportResult | null {
  try {
    const data = JSON.parse(jsonContent)
    if (!data || typeof data !== "object") return null
    // Must look like a schedule backup, not arbitrary JSON.
    if (!("courses" in data) && !("studyBlocks" in data) && !("importantDates" in data)) {
      return null
    }
    // Validate every item; keep the valid ones, report the rest.
    const v = validateSchedule(data)
    return {
      courses: v.courses,
      studyBlocks: v.studyBlocks,
      importantDates: v.importantDates,
      errors: v.dropped > 0 ? [`${v.dropped} invalid item(s) skipped`] : [],
      semesterDates: v.semesterDates,
    }
  } catch {
    return null
  }
}

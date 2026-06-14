/**
 * Pure-function checks for the ICS / CSV export. Run with: bun scripts/verify-export.ts
 */
import {
  generateICSFile,
  summarizeIcsExport,
  generateCSV,
  foldLine,
  escapeICS,
} from "@/lib/export-utils"
import type { CourseEvent, StudyBlock, ImportantDate, SemesterDates } from "@/types/schedule"

let passed = 0
let failed = 0
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++
  } else {
    failed++
    console.error("  ✗ FAIL:", msg)
  }
}

// --- fixtures ---
const groupId = "grp-cs101"
const mwf: CourseEvent[] = (["Mon", "Wed", "Fri"] as const).map((day, i) => ({
  id: `cs-${i}`,
  title: "CS 101, Intro", // comma → must be escaped
  courseCode: "CS 101",
  section: "001",
  type: "inperson",
  day,
  startCT: "09:00",
  endCT: "09:50",
  location: "Hall A",
  instructor: "Dr. Smith",
  recurrenceGroupId: groupId,
}))

const asyncCourse: CourseEvent = {
  id: "a1", title: "HIST async", courseCode: "HIST 1301", section: "",
  type: "online", day: "Mon", startCT: "00:00", endCT: "00:00", location: "",
}

const longStudy: StudyBlock = {
  id: "s1", title: "Study", type: "study", day: "Tue",
  startCT: "18:00", endCT: "20:00", notes: "x".repeat(120),
}

const importantDates: ImportantDate[] = [
  { id: "d1", title: "Paper Due, final", date: "2025-09-15", type: "deadline" },
  { id: "d2", title: "Labor Day", date: "2025-09-01", type: "break" }, // Monday → class EXDATE
  { id: "d3", title: "Midterm", date: "2025-10-08", type: "exam", startTime: "14:00", endTime: "16:00", location: "Gym" },
]

const semester: SemesterDates = { startDate: "2025-08-25", endDate: "2025-12-12" }

const ics = generateICSFile([...mwf, asyncCourse, longStudy], importantDates, semester)

console.log("ICS export checks:")

// Structural
assert(ics.startsWith("BEGIN:VCALENDAR"), "starts with BEGIN:VCALENDAR")
assert(ics.trimEnd().endsWith("END:VCALENDAR"), "ends with END:VCALENDAR")
const vevents = (ics.match(/BEGIN:VEVENT/g) || []).length
assert(vevents === 5, `5 VEVENTs (1 class + 1 study + 3 dates), got ${vevents}`)

// Recurrence consolidation
assert(ics.includes("RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"), "MWF consolidated into one BYDAY rule")
assert(ics.includes(";UNTIL=20251212T235959"), "RRULE bounded by semester end (floating UNTIL)")

// Anchoring: 2025-08-25 is a Monday → DTSTART that date at 09:00, floating (no Z)
assert(new Date(2025, 7, 25).getDay() === 1, "(assumption) 2025-08-25 is a Monday")
assert(ics.includes("DTSTART:20250825T090000"), "class anchored to first Mon >= semester start")
assert(!/DTSTART:\d{8}T\d{6}Z/.test(ics), "DTSTART times are floating (no Z)")

// EXDATE for a break that lands on a class day (Labor Day Mon 09-01)
assert(ics.includes("EXDATE:") && ics.includes("20250901T090000"), "break day excluded via EXDATE")

// Escaping
assert(ics.includes("SUMMARY:CS 101\\, Intro"), "comma in SUMMARY escaped as \\,")

// All-day important date (deadline): DTEND is next day
assert(ics.includes("DTSTART;VALUE=DATE:20250915"), "all-day deadline DTSTART;VALUE=DATE")
assert(ics.includes("DTEND;VALUE=DATE:20250916"), "all-day deadline DTEND = next day")

// Timed exam important date
assert(ics.includes("DTSTART:20251008T140000"), "timed exam DTSTART")
assert(ics.includes("DTEND:20251008T160000"), "timed exam DTEND")

// Line folding: no physical line exceeds 75 octets
const enc = new TextEncoder()
const tooLong = ics.split("\r\n").filter((l) => enc.encode(l).length > 75)
assert(tooLong.length === 0, `all lines <=75 octets (offenders: ${tooLong.length})`)
assert(ics.includes("\r\n "), "long line was folded (continuation with leading space)")

// CRLF line endings
assert(ics.includes("\r\n"), "uses CRLF line endings")

// Summary
const summary = summarizeIcsExport([...mwf, asyncCourse, longStudy], importantDates, semester)
assert(summary.classGroups === 2, `classGroups=2 (CS + study), got ${summary.classGroups}`)
assert(summary.asyncSkipped === 1, `asyncSkipped=1, got ${summary.asyncSkipped}`)
assert(summary.importantDatesExported === 3, `importantDatesExported=3, got ${summary.importantDatesExported}`)
assert(summary.breakExclusions >= 1, `breakExclusions>=1, got ${summary.breakExclusions}`)
assert(summary.hasSemester === true, "hasSemester true")

// No-semester fallback: still produces a file, no UNTIL
const icsNoSem = generateICSFile(mwf, [], null)
assert(icsNoSem.includes("BYDAY=MO,WE,FR"), "no-semester: still consolidates days")
assert(!icsNoSem.includes("UNTIL="), "no-semester: omits UNTIL")

// --- CSV ---
console.log("CSV export checks:")
const csv = generateCSV([...mwf], importantDates)
assert(csv.split("\n")[0]?.includes("Recurrence Group") ?? false, "CSV header has Recurrence Group")
assert(csv.includes('"Paper Due, final"'), "CSV quotes a field containing a comma")
assert(csv.includes(groupId), "CSV includes recurrenceGroupId for round-trip")

// --- helpers ---
console.log("helper checks:")
assert(escapeICS("a,b;c\\d\ne") === "a\\,b\\;c\\\\d\\ne", "escapeICS handles , ; \\ and newline")
assert(enc.encode(foldLine("A".repeat(200)).split("\r\n ")[0] ?? "").length <= 75, "foldLine first segment <=75 octets")

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)

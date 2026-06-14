/**
 * Pure-function checks for parsing + import (round-trips included).
 * Run with: bun scripts/verify-parse.ts
 */
import {
  normalizeDay,
  parseDayList,
  parseTime,
  parseTimeRange,
  parsePipeCourseLine,
  parseSmartText,
} from "@/lib/schedule-parse"
import { parseCSVToSchedule, parseICSToSchedule, parseJSONBackup } from "@/lib/import-utils"
import { validateSchedule } from "@/lib/schedule-schema"
import { generateICSFile, generateCSV } from "@/lib/export-utils"
import type { CourseEvent, StudyBlock, ImportantDate, SemesterDates } from "@/types/schedule"

let passed = 0
let failed = 0
function assert(cond: boolean, msg: string) {
  if (cond) passed++
  else {
    failed++
    console.error("  ✗ FAIL:", msg)
  }
}
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

console.log("day parsing:")
assert(normalizeDay("Monday") === "Mon", "normalizeDay Monday")
assert(normalizeDay("R") === "Thu", "normalizeDay R = Thu")
assert(normalizeDay("th") === "Thu", "normalizeDay th = Thu")
assert(normalizeDay("xyz") === null, "normalizeDay invalid → null")
assert(eq(parseDayList("MWF"), ["Mon", "Wed", "Fri"]), "parseDayList MWF")
assert(eq(parseDayList("TTh"), ["Tue", "Thu"]), "parseDayList TTh")
assert(eq(parseDayList("TR"), ["Tue", "Thu"]), "parseDayList TR")
assert(eq(parseDayList("Mon,Wed,Fri"), ["Mon", "Wed", "Fri"]), "parseDayList comma")
assert(eq(parseDayList("MoWeFr"), ["Mon", "Wed", "Fri"]), "parseDayList MoWeFr")
assert(eq(parseDayList("M/W/F"), ["Mon", "Wed", "Fri"]), "parseDayList slashes")
assert(eq(parseDayList("Monday Wednesday"), ["Mon", "Wed"]), "parseDayList full names spaced")
assert(eq(parseDayList("MTWRF"), ["Mon", "Tue", "Wed", "Thu", "Fri"]), "parseDayList MTWRF")

console.log("time parsing:")
assert(parseTime("9:30 AM") === "09:30", "parseTime 9:30 AM")
assert(parseTime("0930") === "09:30", "parseTime 0930")
assert(parseTime("930") === "09:30", "parseTime 930")
assert(parseTime("2:30 pm") === "14:30", "parseTime 2:30 pm")
assert(parseTime("14:30") === "14:30", "parseTime 14:30")
assert(parseTime("12 am") === "00:00", "parseTime 12 am = 00:00")
assert(parseTime("12 pm") === "12:00", "parseTime 12 pm = 12:00")
assert(parseTime("25:00") === null, "parseTime 25:00 → null")
assert(parseTime("abc") === null, "parseTime abc → null")

console.log("time range parsing:")
assert(eq(parseTimeRange("9:30-10:45"), { ok: true, start: "09:30", end: "10:45" }), "range basic")
assert(eq(parseTimeRange("9:30 AM – 10:45 AM"), { ok: true, start: "09:30", end: "10:45" }), "range en-dash + AM")
assert(eq(parseTimeRange("0930-1045"), { ok: true, start: "09:30", end: "10:45" }), "range military")
assert(eq(parseTimeRange("9 to 10"), { ok: true, start: "09:00", end: "10:00" }), "range 'to'")
assert(parseTimeRange("10:00-9:00").ok === false, "range end<start → error")
assert(parseTimeRange("9:30").ok === false, "range missing end → error")

console.log("pipe course line:")
const line = parsePipeCourseLine("CS 101 | Intro | MWF | 9:30-10:45 | Hall A | Dr. Smith")
assert(line.ok === true, "pipe line parses")
if (line.ok) {
  assert(eq(line.days, ["Mon", "Wed", "Fri"]), "pipe days MWF")
  assert(line.template.startCT === "09:30" && line.template.endCT === "10:45", "pipe times")
  assert(line.template.instructor === "Dr. Smith", "pipe instructor")
}
assert(parsePipeCourseLine("CS 101 | Intro | XYZ | 9:30-10:45").ok === false, "pipe bad days → error")
assert(parsePipeCourseLine("just a title").ok === false, "pipe too few parts → error")

// --- fixtures for round-trips ---
const groupId = "grp-cs101"
const mwf: CourseEvent[] = (["Mon", "Wed", "Fri"] as const).map((day, i) => ({
  id: `cs-${i}`, title: "CS 101, Intro", courseCode: "CS 101", section: "001",
  type: "inperson", day, startCT: "09:00", endCT: "09:50", location: "Hall A",
  instructor: "Dr. Smith", credits: 3, recurrenceGroupId: groupId,
}))
const trGroup = "grp-math"
const tr: CourseEvent[] = (["Tue", "Thu"] as const).map((day, i) => ({
  id: `m-${i}`, title: "MATH 200 Calc", courseCode: "MATH 200", section: "002",
  type: "online", day, startCT: "13:00", endCT: "14:15", location: "Online",
  instructor: "", recurrenceGroupId: trGroup,
}))
const longStudy: StudyBlock = {
  id: "s1", title: "Study", type: "study", day: "Tue", startCT: "18:00", endCT: "20:00",
  notes: "y".repeat(120),
}
const importantDates: ImportantDate[] = [
  { id: "d1", title: "Paper Due, final", date: "2025-09-15", type: "deadline" },
  { id: "d2", title: "Labor Day", date: "2025-09-01", type: "break" },
  { id: "d3", title: "Midterm", date: "2025-10-08", type: "exam", startTime: "14:00", endTime: "16:00", location: "Gym" },
]
const semester: SemesterDates = { startDate: "2025-08-25", endDate: "2025-12-12" }

console.log("ICS round-trip:")
const ics = generateICSFile([...mwf, ...tr, longStudy], importantDates, semester)
const fromIcs = parseICSToSchedule(ics)
assert(fromIcs.courses.length === 5, `5 course events (MWF + TR), got ${fromIcs.courses.length}`)
const cs = fromIcs.courses.filter((c) => c.courseCode === "CS 101")
assert(cs.length === 3, "CS 101 reimported as 3 days")
assert(new Set(cs.map((c) => c.recurrenceGroupId)).size === 1, "CS 101 days share one recurrence group")
assert(eq(cs.map((c) => c.day).sort(), ["Fri", "Mon", "Wed"]), "CS 101 days preserved")
assert(cs[0]?.startCT === "09:00" && cs[0]?.endCT === "09:50", "CS 101 times preserved")
assert(cs[0]?.credits === 3, "CS 101 credits preserved via X-SCB-CREDITS")
const math = fromIcs.courses.filter((c) => c.courseCode === "MATH 200")
assert(math.length === 2 && math.every((c) => c.type === "online"), "MATH 200 reimported as 2 online days")
assert(fromIcs.studyBlocks.length === 1, "study block reimported")
assert(fromIcs.studyBlocks[0]?.notes?.length === 120, "folded long notes unfolded correctly")
assert(fromIcs.importantDates.length === 3, `3 important dates, got ${fromIcs.importantDates.length}`)
const exam = fromIcs.importantDates.find((d) => d.type === "exam")
assert(exam?.startTime === "14:00" && exam?.endTime === "16:00", "timed exam reimported with times")
const deadline = fromIcs.importantDates.find((d) => d.type === "deadline")
assert(!!deadline && !deadline.startTime, "all-day deadline reimported without time")

console.log("CSV round-trip:")
const csv = generateCSV([...mwf, longStudy], importantDates)
const fromCsv = parseCSVToSchedule(csv)
assert(fromCsv.courses.length === 3, `3 courses from CSV, got ${fromCsv.courses.length}`)
assert(fromCsv.courses.every((c) => c.recurrenceGroupId === groupId), "CSV preserves recurrence group id")
assert(fromCsv.courses[0]?.title === "CS 101, Intro", "CSV preserves comma in title")
assert(fromCsv.studyBlocks.length === 1, "CSV study block")
assert(fromCsv.importantDates.length === 3, "CSV important dates")
assert(fromCsv.errors.length === 0, `CSV no errors, got: ${fromCsv.errors.join("; ")}`)

console.log("CSV error reporting:")
const badCsv = "Type,Title,Day,Start Time,End Time\ncourse,Bad,Funday,9:00,10:00\ncourse,Ok,Mon,9:00,10:00"
const badResult = parseCSVToSchedule(badCsv)
assert(badResult.errors.length === 1, `1 error for bad day, got ${badResult.errors.length}`)
assert(badResult.courses.length === 1, "valid row still imported alongside bad row")

console.log("legacy CSV header compat:")
const legacy = "type,title,day,startCT,endCT,courseCode\ncourse,Old Course,Mon,09:00,10:00,OLD 1"
const legacyResult = parseCSVToSchedule(legacy)
assert(legacyResult.courses.length === 1 && legacyResult.courses[0]?.courseCode === "OLD 1", "legacy lowercase headers parse")

console.log("JSON backup:")
const backup = JSON.stringify({ version: 1, courses: mwf, studyBlocks: [longStudy], importantDates, semesterDates: semester })
const restored = parseJSONBackup(backup)
assert(!!restored && restored.courses.length === 3, "JSON restore courses")
assert(restored?.semesterDates?.startDate === "2025-08-25", "JSON restore semester dates")
assert(parseJSONBackup("{}") === null, "non-schedule JSON → null")
assert(parseJSONBackup("not json") === null, "invalid JSON → null")

console.log("smart paste:")
const smart = parseSmartText(
  [
    "CS 101 Intro to CS MWF 9:30-10:45 AM Hall 201 Dr. Smith",
    "MATH 200 - Calculus TR 1:00pm-2:15pm Online",
    "PSYC 2301 Tue Thu 11:00-12:15",
    "random notes line with nothing useful",
  ].join("\n"),
)
assert(smart.length === 3, `3 course-like lines detected, got ${smart.length}`)
const csSmart = smart.find((c) => c.courseCode === "CS 101")
assert(!!csSmart && eq(csSmart.days, ["Mon", "Wed", "Fri"]), "smart: CS 101 days MWF")
assert(csSmart?.startCT === "09:30" && csSmart?.endCT === "10:45", "smart: CS 101 time")
assert(csSmart?.confidence === "high", "smart: CS 101 high confidence")
assert(csSmart?.location === "Hall 201", `smart: CS 101 location Hall 201, got "${csSmart?.location}"`)
assert(csSmart?.title === "Intro to CS", `smart: CS 101 title clean, got "${csSmart?.title}"`)
const mathSmart = smart.find((c) => c.courseCode === "MATH 200")
assert(!!mathSmart && eq(mathSmart.days, ["Tue", "Thu"]), "smart: MATH 200 TR days")
assert(mathSmart?.type === "online", "smart: MATH 200 detected online")
assert(mathSmart?.location === "Online", "smart: MATH 200 location Online")
assert(mathSmart?.title === "Calculus", `smart: MATH 200 title, got "${mathSmart?.title}"`)
const psycSmart = smart.find((c) => c.courseCode === "PSYC 2301")
assert(!!psycSmart && eq(psycSmart.days, ["Tue", "Thu"]), "smart: PSYC full day names")

console.log("schema validation:")
const vr = validateSchedule({
  courses: [
    { id: "1", title: "Good", type: "inperson", day: "Mon", startCT: "09:00", endCT: "10:00" },
    { garbage: true },
    { id: "2", title: "BadType", type: "bogus", day: "Mon", startCT: "09:00", endCT: "10:00" },
  ],
  studyBlocks: "not an array",
  importantDates: [{ id: "d", title: "D", date: "2025-01-01", type: "deadline" }],
  semesterDates: { startDate: "2025-08-25", endDate: "2025-12-12" },
})
assert(vr.courses.length === 1, `validate keeps 1 valid course, got ${vr.courses.length}`)
assert(vr.courses[0]?.courseCode === "", "validate default-fills courseCode")
assert(vr.studyBlocks.length === 0, "validate handles non-array gracefully")
assert(vr.importantDates.length === 1, "validate keeps valid important date")
assert(vr.semesterDates?.startDate === "2025-08-25", "validate keeps semester dates")
assert(vr.dropped >= 2, `validate counts dropped items, got ${vr.dropped}`)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)

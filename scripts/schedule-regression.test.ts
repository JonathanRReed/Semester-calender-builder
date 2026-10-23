import assert from "node:assert/strict"
import { describe, test } from "node:test"
import { checkEventConflict, checkRecurringEventConflicts, detectAllConflicts } from "@/lib/conflict-utils"
import { generateICSFile, summarizeIcsExport, foldLine } from "@/lib/export-utils"
import { parseICSToSchedule } from "@/lib/import-utils"
import { generateRecurringEvents, deleteRecurrenceGroup } from "@/lib/schedule-utils"
import type { CourseEvent, ImportantDate, SemesterDates } from "@/types/schedule"

const course = (overrides: Partial<CourseEvent> = {}): CourseEvent => ({
  id: "course-1", title: "Biology", courseCode: "BIO 101", section: "001", type: "inperson",
  day: "Mon", startCT: "09:00", endCT: "10:00", location: "Lab", ...overrides,
})
const semester: SemesterDates = { startDate: "2026-08-24", endDate: "2026-12-11" }
const unfolded = (ics: string) => ics.replace(/\r\n /g, "")
const uids = (ics: string) => [...unfolded(ics).matchAll(/^UID:(.*)$/gm)].map(match => match[1]?.trim())

describe("calendar recurrence boundaries", () => {
  test("does not emit a recurrence when its first occurrence is beyond the term", () => {
    const shortTerm = { startDate: "2026-08-25", endDate: "2026-08-26" }
    const events = [course({ day: "Fri" })]
    assert.ok(!generateICSFile(events, [], shortTerm).includes("BEGIN:VEVENT"))
    assert.equal(summarizeIcsExport(events, [], shortTerm).classGroups, 0)
  })

  test("includes the last term day and clips overlapping break ranges to the term", () => {
    const term = { startDate: "2026-08-24", endDate: "2026-08-28" }
    const events = [course(), course({ id: "friday", day: "Fri" })]
    const dates: ImportantDate[] = [
      { id: "before", title: "Opening break", type: "break", date: "2026-08-20", endDate: "2026-08-24" },
      { id: "after", title: "Finals", type: "finals", date: "2026-08-28", endDate: "2026-09-01" },
    ]
    const ics = unfolded(generateICSFile(events, dates, term))
    assert.ok(ics.includes("DTSTART:20260824T090000"))
    assert.ok(ics.includes("EXDATE:20260824T090000,20260828T090000"))
    assert.ok(ics.includes("UNTIL=20260828T235959"))
    assert.equal(summarizeIcsExport(events, dates, term).breakExclusions, 2)
  })

  test("unchanged recurring courses retain existing calendar identity", () => {
    const events = [
      course({ recurrenceGroupId: "biology", id: "monday" }),
      course({ recurrenceGroupId: "biology", id: "wednesday", day: "Wed" }),
    ]
    assert.deepEqual(uids(generateICSFile(events, [], semester)), ["biology@semester-calendar-builder"])
    assert.deepEqual(uids(generateICSFile(events.toReversed(), [], semester)), ["biology@semester-calendar-builder"])
  })

  test("independently moved occurrences have distinct stable calendar identities", () => {
    const events = [
      course({ recurrenceGroupId: "biology", id: "monday" }),
      course({ recurrenceGroupId: "biology", id: "friday", day: "Fri", startCT: "11:00", endCT: "12:00" }),
    ]
    const ids = uids(generateICSFile(events, [], semester))
    assert.equal(ids.length, 2)
    assert.equal(new Set(ids).size, 2)
    assert.equal(ids.filter(id => id === "biology@semester-calendar-builder").length, 1)
    assert.deepEqual(uids(generateICSFile(events.toReversed(), [], semester)).sort(), [...ids].sort())
    assert.deepEqual(parseICSToSchedule(generateICSFile(events, [], semester)).courses.map(event => event.startCT).sort(), ["09:00", "11:00"])
  })

  test("split series cannot collide with arbitrary imported recurrence group IDs", () => {
    const events = [
      course({ recurrenceGroupId: "biology", id: "friday", day: "Fri" }),
      course({ recurrenceGroupId: "biology", id: "monday", startCT: "11:00", endCT: "12:00" }),
      course({ recurrenceGroupId: "biology-monday", id: "other", day: "Tue" }),
      course({ recurrenceGroupId: "biology-monday-split-1", id: "reserved", day: "Thu" }),
    ]
    const dates: ImportantDate[] = [{ id: "biology-monday-split-2", title: "Due", type: "deadline", date: "2026-09-01" }]
    const ids = uids(generateICSFile(events, dates, semester))
    assert.equal(new Set(ids).size, 5)
    assert.ok(ids.includes("biology@semester-calendar-builder"))
    assert.ok(ids.includes("biology-monday@semester-calendar-builder"))
    assert.ok(ids.includes("biology-monday-split-1@semester-calendar-builder"))
    assert.deepEqual(uids(generateICSFile(events.toReversed(), dates, semester)).sort(), [...ids].sort())
  })

  test("Unicode folding preserves complete characters within the 75-octet limit", () => {
    const text = `SUMMARY:${"生物学🧬".repeat(30)}`
    const folded = foldLine(text)
    assert.equal(folded.replace(/\r\n /g, ""), text)
    for (const line of folded.split("\r\n")) assert.ok(new TextEncoder().encode(line).length <= 75)
  })
})

describe("conflict and recurrence guards", () => {
  test("adjacent classes, other weekdays, and async courses do not conflict", () => {
    const existing = course()
    assert.equal(checkEventConflict({ day: "Mon", startCT: "10:00", endCT: "11:00" }, [existing]), null)
    assert.equal(checkEventConflict({ day: "Tue", startCT: "09:30", endCT: "10:30" }, [existing]), null)
    assert.equal(checkEventConflict({ day: "Mon", startCT: "00:00", endCT: "00:00" }, [existing]), null)
    assert.equal(checkEventConflict(existing, [existing], existing.id), null)
  })

  test("overlap reports exact shared minutes and checks every recurring weekday", () => {
    const existing = course()
    const overlap = course({ id: "overlap", startCT: "09:45", endCT: "10:30" })
    assert.deepEqual(detectAllConflicts([existing, overlap]), [{
      event1Id: "course-1", event2Id: "overlap", day: "Mon", overlapStart: "09:45", overlapEnd: "10:00",
    }])
    assert.deepEqual(checkRecurringEventConflicts(["Mon", "Wed", "Fri"], "09:45", "10:30", [existing]), [
      { day: "Mon", conflictingEvent: existing },
    ])
  })

  test("recurring events receive unique IDs, share a group, and delete only that group", () => {
    const events = generateRecurringEvents(course(), ["Mon", "Wed", "Fri"])
    assert.equal(new Set(events.map(event => event.id)).size, 3)
    assert.equal(new Set(events.map(event => event.recurrenceGroupId)).size, 1)
    assert.deepEqual(events.map(event => event.day), ["Mon", "Wed", "Fri"])
    assert.deepEqual(deleteRecurrenceGroup([...events, course()], events[0]!.recurrenceGroupId), [course()])
  })
})

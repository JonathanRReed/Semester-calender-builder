import assert from "node:assert/strict"
import { test } from "node:test"
import { generateSemesterWeeks, isDateInWeek, getUpcomingImportantDates, isWeekdayInWeek } from "@/lib/calendar-utils"
import type { ImportantDate } from "@/types/schedule"

const localKey = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")

test("the opening partial week is included and both term edges are clipped", () => {
  const weeks = generateSemesterWeeks("2026-08-25", "2026-09-02")
  assert.deepEqual(weeks.map(week => [week.weekNumber, localKey(week.startDate), localKey(week.endDate)]), [
    [1, "2026-08-25", "2026-08-30"],
    [2, "2026-08-31", "2026-09-02"],
  ])
  assert.equal(generateSemesterWeeks("2026-08-30", "2026-08-30").length, 1)
  assert.deepEqual(generateSemesterWeeks("2026-09-02", "2026-08-25"), [])
  assert.deepEqual(generateSemesterWeeks("not-a-date", "2026-08-25"), [])
})

test("Sunday remains in its week through the final millisecond", () => {
  const week = generateSemesterWeeks("2026-03-02", "2026-03-15")[0]!
  assert.equal(isDateInWeek(new Date(2026, 2, 8, 23, 59, 59, 999), week), true)
  assert.equal(isDateInWeek(new Date(2026, 2, 9, 0, 0), week), false)
  assert.equal(isDateInWeek(null, week), false)
})

test("week arithmetic follows local calendar days across spring and fall DST", () => {
  for (const [start, end] of [["2026-03-02", "2026-03-15"], ["2026-10-26", "2026-11-08"]]) {
    const weeks = generateSemesterWeeks(start!, end!)
    assert.equal(weeks.length, 2)
    assert.equal(weeks[0]!.startDate.getHours(), 0)
    assert.equal(weeks[1]!.startDate.getHours(), 0)
    if (process.env.TZ === "America/Chicago") {
      const hours = (weeks[1]!.startDate.getTime() - weeks[0]!.startDate.getTime()) / 3_600_000
      assert.equal(hours, start === "2026-03-02" ? 167 : 169)
    }
  }
})

test("date-only deadlines remain upcoming throughout the same local day", () => {
  const dates: ImportantDate[] = [
    { id: "yesterday", title: "Yesterday", date: "2026-03-07", type: "deadline" },
    { id: "today", title: "Today", date: "2026-03-08", type: "deadline" },
    { id: "tomorrow", title: "Tomorrow", date: "2026-03-09", type: "exam" },
    { id: "later", title: "Later", date: "2026-03-10", type: "finals" },
    { id: "break", title: "Break", date: "2026-03-08", type: "break" },
  ]
  const now = new Date(2026, 2, 8, 23, 59)
  assert.deepEqual(getUpcomingImportantDates(dates.toReversed(), now).map(date => date.id), ["today", "tomorrow", "later"])
  assert.deepEqual(getUpcomingImportantDates(dates, null), [])
  assert.deepEqual(getUpcomingImportantDates(dates, new Date(2026, 2, 9)).map(date => date.id), ["tomorrow", "later"])
})


test("daily badges exclude weekdays before and after a clipped term", () => {
  const weeks = generateSemesterWeeks("2026-08-25", "2026-09-02")
  assert.equal(isWeekdayInWeek("Mon", weeks[0]!), false)
  for (const day of ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) assert.equal(isWeekdayInWeek(day, weeks[0]!), true)
  for (const day of ["Mon", "Tue", "Wed"]) assert.equal(isWeekdayInWeek(day, weeks[1]!), true)
  for (const day of ["Thu", "Fri", "Sat", "Sun"]) assert.equal(isWeekdayInWeek(day, weeks[1]!), false)
  assert.equal(isWeekdayInWeek("Funday", weeks[0]!), false)
})

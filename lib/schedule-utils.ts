import type { CourseEvent, StudyBlock, ScheduleEvent, TimeZone, ImportantDate } from "@/types/schedule"
import { TIMEZONES } from "./constants"

const MINUTES_PER_HOUR = 60
const STORAGE_KEYS = {
  courses: "schedule-courses",
  studyBlocks: "schedule-study-blocks",
  importantDates: "schedule-important-dates",
  snapshot: "schedule-json",
} as const

const isBrowser = () => typeof window !== "undefined"

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(":").map(Number)
  const hour = parts[0] ?? 0
  const minute = parts[1] ?? 0
  return { hour, minute }
}

export function formatTime(hour: number, minute: number, timeZone: TimeZone = "CT"): string {
  const offset = TIMEZONES[timeZone].offset
  const adjustedHour = Math.max(0, Math.min(23, hour + offset))
  const period = adjustedHour >= 12 ? "PM" : "AM"
  const displayHour = adjustedHour === 0 ? 12 : adjustedHour > 12 ? adjustedHour - 12 : adjustedHour
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
}

export function convertTimeToMinutes(timeStr: string): number {
  const { hour, minute } = parseTime(timeStr)
  return hour * MINUTES_PER_HOUR + minute
}

export function getEventDuration(event: ScheduleEvent): number {
  const start = convertTimeToMinutes(event.startCT)
  const end = convertTimeToMinutes(event.endCT)
  return end - start
}

export function getCampusStatus(events: ScheduleEvent[], day: string): "ON CAMPUS" | "campus optional" | "off campus" {
  const dayEvents = events.filter((event) => event.day === day)
  const inPersonCount = dayEvents.filter(
    (event) => "type" in event && (event.type === "inperson" || event.type === "exam"),
  ).length

  if (inPersonCount >= 2) return "ON CAMPUS"
  if (inPersonCount === 1) return "campus optional"
  return "off campus"
}

// getEventColor removed in favor of semantic tokens and per-component styling

export function getBlankSchedule(): {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
} {
  return {
    courses: [],
    studyBlocks: [],
    importantDates: [],
  }
}

export function saveScheduleData(
  courses: CourseEvent[],
  studyBlocks: StudyBlock[],
  importantDates: ImportantDate[] = [],
) {
  if (!isBrowser()) return

  try {
    const snapshot = { courses, studyBlocks, importantDates }
    localStorage.setItem(STORAGE_KEYS.courses, JSON.stringify(courses))
    localStorage.setItem(STORAGE_KEYS.studyBlocks, JSON.stringify(studyBlocks))
    localStorage.setItem(STORAGE_KEYS.importantDates, JSON.stringify(importantDates))
    localStorage.setItem(STORAGE_KEYS.snapshot, JSON.stringify(snapshot, null, 2))
  } catch (error) {
    console.warn("Failed to save schedule data to localStorage:", error)
  }
}

export function clearScheduleData() {
  if (!isBrowser()) return

  try {
    localStorage.removeItem(STORAGE_KEYS.courses)
    localStorage.removeItem(STORAGE_KEYS.studyBlocks)
    localStorage.removeItem(STORAGE_KEYS.importantDates)
    localStorage.removeItem(STORAGE_KEYS.snapshot)
  } catch (error) {
    console.warn("Failed to clear schedule data from localStorage:", error)
  }
}

export function ensureScheduleInitialized() {
  if (!isBrowser()) return

  try {
    const hasCourses = localStorage.getItem(STORAGE_KEYS.courses)
    const hasStudyBlocks = localStorage.getItem(STORAGE_KEYS.studyBlocks)
    const hasImportantDates = localStorage.getItem(STORAGE_KEYS.importantDates)

    if (!hasCourses && !hasStudyBlocks && !hasImportantDates) {
      const blank = getBlankSchedule()
      saveScheduleData(blank.courses, blank.studyBlocks, blank.importantDates)
    }
  } catch (error) {
    console.warn("Failed to initialize schedule storage:", error)
  }
}

export function resetScheduleData(): {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
} {
  const blank = getBlankSchedule()
  clearScheduleData()
  saveScheduleData(blank.courses, blank.studyBlocks, blank.importantDates)
  return blank
}

export function loadScheduleData(): {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
} {
  if (!isBrowser()) {
    return { courses: [], studyBlocks: [], importantDates: [] }
  }

  try {
    ensureScheduleInitialized()

    const savedCourses = localStorage.getItem(STORAGE_KEYS.courses)
    const savedStudyBlocks = localStorage.getItem(STORAGE_KEYS.studyBlocks)
    const savedImportantDates = localStorage.getItem(STORAGE_KEYS.importantDates)

    return {
      courses: savedCourses ? JSON.parse(savedCourses) : [],
      studyBlocks: savedStudyBlocks ? JSON.parse(savedStudyBlocks) : [],
      importantDates: savedImportantDates ? JSON.parse(savedImportantDates) : [],
    }
  } catch {
    return { courses: [], studyBlocks: [], importantDates: [] }
  }
}

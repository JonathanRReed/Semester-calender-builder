import type { CourseEvent, StudyBlock, ScheduleEvent, TimeZone, ImportantDate, DayOfWeek, ScheduleMetadata } from "@/types/schedule"
import { TIMEZONES } from "./constants"

const MINUTES_PER_HOUR = 60
const BACKUP_REMINDER_DAYS = 7
const STORAGE_KEYS = {
  courses: "schedule-courses",
  studyBlocks: "schedule-study-blocks",
  importantDates: "schedule-important-dates",
  snapshot: "schedule-json",
  metadata: "schedule-metadata",
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

// ==========================================
// Recurring Events Utilities
// ==========================================

/**
 * Generate multiple events from a recurring pattern
 */
export function generateRecurringEvents<T extends Omit<ScheduleEvent, "id" | "day">>(
  baseEvent: T,
  days: DayOfWeek[]
): (T & { id: string; day: string; recurrenceGroupId: string })[] {
  const recurrenceGroupId = crypto.randomUUID()

  return days.map((day) => ({
    ...baseEvent,
    id: crypto.randomUUID(),
    day,
    recurrenceGroupId,
  }))
}

/**
 * Delete all events in a recurrence group
 */
export function deleteRecurrenceGroup<T extends { id: string; recurrenceGroupId?: string }>(
  events: T[],
  recurrenceGroupId: string
): T[] {
  return events.filter((event) => event.recurrenceGroupId !== recurrenceGroupId)
}

/**
 * Check if an event is part of a recurrence group
 */
export function isRecurringEvent(event: ScheduleEvent): boolean {
  return !!event.recurrenceGroupId
}

/**
 * Get all events in the same recurrence group
 */
export function getRecurrenceGroupEvents(
  events: ScheduleEvent[],
  recurrenceGroupId: string
): ScheduleEvent[] {
  return events.filter((event) => event.recurrenceGroupId === recurrenceGroupId)
}

// ==========================================
// Backup Tracking Utilities
// ==========================================

/**
 * Save the timestamp of the last export
 */
export function saveLastExportTimestamp(): void {
  if (!isBrowser()) return

  try {
    const metadata = loadScheduleMetadata()
    metadata.lastExportedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(metadata))
  } catch (error) {
    console.warn("Failed to save export timestamp:", error)
  }
}

/**
 * Load schedule metadata
 */
export function loadScheduleMetadata(): ScheduleMetadata {
  if (!isBrowser()) {
    return { createdAt: new Date().toISOString() }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.metadata)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize metadata if not present
    const newMetadata: ScheduleMetadata = {
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(newMetadata))
    return newMetadata
  } catch {
    return { createdAt: new Date().toISOString() }
  }
}

/**
 * Check if backup reminder should be shown
 * Returns number of days since last export, or null if recently exported
 */
export function getBackupReminderDays(): number | null {
  const metadata = loadScheduleMetadata()

  if (!metadata.lastExportedAt) {
    // If never exported, calculate from creation date
    const createdDate = new Date(metadata.createdAt)
    const daysSinceCreation = Math.floor(
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceCreation >= BACKUP_REMINDER_DAYS ? daysSinceCreation : null
  }

  const lastExport = new Date(metadata.lastExportedAt)
  const daysSinceExport = Math.floor(
    (Date.now() - lastExport.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceExport >= BACKUP_REMINDER_DAYS ? daysSinceExport : null
}

/**
 * Format the last export date for display
 */
export function formatLastExportDate(): string | null {
  const metadata = loadScheduleMetadata()

  if (!metadata.lastExportedAt) {
    return null
  }

  const date = new Date(metadata.lastExportedAt)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ==========================================
// Credit Hour Utilities
// ==========================================

/**
 * Calculate total credit hours from courses
 */
export function calculateTotalCredits(courses: CourseEvent[]): number {
  // Only count unique courses by courseCode to avoid double-counting recurring events
  const uniqueCourses = new Map<string, CourseEvent>()

  for (const course of courses) {
    // Use courseCode + section as unique identifier
    const key = `${course.courseCode}-${course.section}`
    if (!uniqueCourses.has(key)) {
      uniqueCourses.set(key, course)
    }
  }

  return Array.from(uniqueCourses.values()).reduce(
    (total, course) => total + (course.credits ?? 0),
    0
  )
}

/**
 * Check if credit load is typical (15-18) or heavy (>18)
 */
export function getCreditLoadStatus(totalCredits: number): "light" | "normal" | "heavy" {
  if (totalCredits > 18) return "heavy"
  if (totalCredits >= 12) return "normal"
  return "light"
}

export { BACKUP_REMINDER_DAYS }

import type { CourseEvent, StudyBlock, ScheduleEvent, ImportantDate, DayOfWeek, ScheduleMetadata, SemesterDates } from "@/types/schedule"
import { validateSchedule } from "./schedule-schema"

const MINUTES_PER_HOUR = 60
const BACKUP_REMINDER_DAYS = 7

// Bump when the stored shape changes; the loader migrates older data forward.
export const SCHEDULE_VERSION = 1

// Everything the planner owns lives in ONE versioned key, written atomically.
const STORAGE_KEY = "schedule-data"
const HISTORY_KEY = "schedule-history"
const METADATA_KEY = "schedule-metadata"
const HISTORY_LIMIT = 5
const LEGACY_KEYS = [
  "schedule-courses",
  "schedule-study-blocks",
  "schedule-important-dates",
  "schedule-semester-dates",
  "schedule-json",
  "schedule-version",
]

const isBrowser = () => typeof window !== "undefined"

export interface StoredSchedule {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
  semesterDates: SemesterDates | null
}

export interface SaveResult {
  ok: boolean
  quotaExceeded?: boolean
}

const emptyStore = (): StoredSchedule => ({ courses: [], studyBlocks: [], importantDates: [], semesterDates: null })

// One-time fold of the old per-key storage into the unified document.
function migrateLegacy(): StoredSchedule | null {
  if (!isBrowser()) return null
  try {
    const c = localStorage.getItem("schedule-courses")
    const s = localStorage.getItem("schedule-study-blocks")
    const d = localStorage.getItem("schedule-important-dates")
    const sem = localStorage.getItem("schedule-semester-dates")
    if (!c && !s && !d && !sem) return null
    const v = validateSchedule({
      courses: c ? JSON.parse(c) : [],
      studyBlocks: s ? JSON.parse(s) : [],
      importantDates: d ? JSON.parse(d) : [],
      semesterDates: sem ? JSON.parse(sem) : null,
    })
    return { courses: v.courses, studyBlocks: v.studyBlocks, importantDates: v.importantDates, semesterDates: v.semesterDates }
  } catch {
    return null
  }
}

function writeDoc(doc: StoredSchedule): SaveResult {
  if (!isBrowser()) return { ok: false }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEDULE_VERSION, ...doc }))
    return { ok: true }
  } catch (error) {
    const quotaExceeded =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        error.name === "SecurityError")
    console.warn("Failed to save schedule data:", error)
    return { ok: false, quotaExceeded }
  }
}

// Read + validate the unified doc, migrating legacy keys on first run.
function readDoc(): StoredSchedule {
  if (!isBrowser()) return emptyStore()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const v = validateSchedule(JSON.parse(raw))
      return { courses: v.courses, studyBlocks: v.studyBlocks, importantDates: v.importantDates, semesterDates: v.semesterDates }
    }
    const migrated = migrateLegacy()
    if (migrated) {
      writeDoc(migrated)
      for (const k of LEGACY_KEYS) localStorage.removeItem(k)
      return migrated
    }
    return emptyStore()
  } catch {
    return emptyStore()
  }
}

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const parts = timeStr.split(":").map(Number)
  const hour = parts[0] ?? 0
  const minute = parts[1] ?? 0
  return { hour, minute }
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
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
  semesterDates?: SemesterDates | null,
): SaveResult {
  // Preserve stored semester dates unless explicitly overridden.
  const semester = semesterDates !== undefined ? semesterDates : readDoc().semesterDates
  return writeDoc({ courses, studyBlocks, importantDates, semesterDates: semester })
}

export function clearScheduleData() {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(STORAGE_KEY)
    for (const k of LEGACY_KEYS) localStorage.removeItem(k)
  } catch (error) {
    console.warn("Failed to clear schedule data:", error)
  }
}

export function ensureScheduleInitialized() {
  if (!isBrowser()) return
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const migrated = migrateLegacy()
      writeDoc(migrated ?? emptyStore())
      if (migrated) for (const k of LEGACY_KEYS) localStorage.removeItem(k)
    }
  } catch (error) {
    console.warn("Failed to initialize schedule storage:", error)
  }
}

export function resetScheduleData(): StoredSchedule {
  const blank = emptyStore()
  writeDoc(blank)
  if (isBrowser()) {
    for (const k of LEGACY_KEYS) localStorage.removeItem(k)
    localStorage.removeItem(HISTORY_KEY)
  }
  return blank
}

export function loadScheduleData(): StoredSchedule {
  return readDoc()
}

export function loadSemesterDates(): SemesterDates | null {
  return readDoc().semesterDates
}

export function saveSemesterDates(dates: SemesterDates | null): SaveResult {
  const current = readDoc()
  return writeDoc({ ...current, semesterDates: dates })
}

// ==========================================
// Undo history — a small ring buffer of recent snapshots
// ==========================================

export function pushHistorySnapshot(snapshot: StoredSchedule): void {
  if (!isBrowser()) return
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const stack: StoredSchedule[] = raw ? JSON.parse(raw) : []
    stack.push(snapshot)
    while (stack.length > HISTORY_LIMIT) stack.shift()
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stack))
  } catch (error) {
    console.warn("Failed to push history snapshot:", error)
  }
}

export function popHistorySnapshot(): StoredSchedule | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const stack: StoredSchedule[] = raw ? JSON.parse(raw) : []
    const prev = stack.pop() ?? null
    localStorage.setItem(HISTORY_KEY, JSON.stringify(stack))
    return prev
  } catch {
    return null
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
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
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
    const stored = localStorage.getItem(METADATA_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize metadata if not present
    const newMetadata: ScheduleMetadata = {
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(METADATA_KEY, JSON.stringify(newMetadata))
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

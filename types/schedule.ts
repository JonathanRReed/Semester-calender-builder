// Day of the week type
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

// Recurrence pattern for scheduling events across multiple days/weeks
export interface RecurrencePattern {
  days: DayOfWeek[]           // Which days the event repeats on
  startDate?: string          // Semester start date (YYYY-MM-DD)
  endDate?: string            // Semester end date (YYYY-MM-DD)
}

export interface CourseEvent {
  id: string
  title: string
  courseCode: string
  section: string
  type: "inperson" | "online" | "exam"
  day: string
  startCT: string
  endCT: string
  location: string
  instructor?: string
  difficulty?: number
  sentiment?: string
  credits?: number            // Credit hours for the course
  recurrenceGroupId?: string  // Links recurring events together
}

export interface StudyBlock {
  id: string
  title: string
  type: "study"
  day: string
  startCT: string
  endCT: string
  notes?: string
  recurrenceGroupId?: string  // Links recurring events together
}

export type ScheduleEvent = CourseEvent | StudyBlock

// For detecting schedule conflicts
export interface EventConflict {
  event1Id: string
  event2Id: string
  day: string
  overlapStart: string
  overlapEnd: string
}

export interface TimeSlot {
  hour: number
  minute: number
  label: string
}

export interface ImportantDate {
  id: string
  title: string
  date: string              // Start date (YYYY-MM-DD)
  endDate?: string          // Optional end date for multi-day events (YYYY-MM-DD)
  description?: string
  type: "event" | "deadline" | "break" | "exam" | "finals"
  startTime?: string        // Optional start time (HH:MM) — e.g. a timed exam
  endTime?: string          // Optional end time (HH:MM) — pairs with startTime
  location?: string         // Optional location — e.g. exam room
}

// Semester boundaries (YYYY-MM-DD). Used to anchor recurring calendar exports.
export interface SemesterDates {
  startDate: string
  endDate: string
}

// Backup tracking
export interface ScheduleMetadata {
  lastExportedAt?: string     // ISO timestamp of last export
  createdAt: string           // When the schedule was first created
}

// A complete, portable snapshot of everything the planner stores.
// Used for JSON backup/restore so a single file fully captures the schedule.
export interface ScheduleBackup {
  version: number
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
  semesterDates?: SemesterDates | null
  exportedAt?: string
}

export type FilterType = "all" | "inperson" | "online" | "study" | "exam"

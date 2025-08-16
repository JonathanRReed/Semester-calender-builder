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
}

export interface StudyBlock {
  id: string
  title: string
  type: "study"
  day: string
  startCT: string
  endCT: string
  notes?: string
}

export type ScheduleEvent = CourseEvent | StudyBlock

export interface TimeSlot {
  hour: number
  minute: number
  label: string
}

export interface ImportantDate {
  id: string
  title: string
  date: string
  description?: string
  type: "event" | "deadline" | "break" | "exam"
}

export type FilterType = "all" | "inperson" | "online" | "study" | "exam"
export type TimeZone = "PT" | "MT" | "CT" | "ET"

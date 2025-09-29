import type { CourseEvent, StudyBlock, ScheduleEvent, TimeZone } from "@/types/schedule"
import { TIMEZONES } from "./constants"

const MINUTES_PER_HOUR = 60

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

export function saveScheduleData(courses: CourseEvent[], studyBlocks: StudyBlock[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("schedule-courses", JSON.stringify(courses))
      localStorage.setItem("schedule-study-blocks", JSON.stringify(studyBlocks))
    } catch (error) {
      console.warn("Failed to save schedule data to localStorage:", error)
    }
  }
}

export function loadScheduleData(): { courses: CourseEvent[]; studyBlocks: StudyBlock[] } {
  if (typeof window === "undefined") {
    return { courses: [], studyBlocks: [] }
  }

  try {
    const savedCourses = localStorage.getItem("schedule-courses")
    const savedStudyBlocks = localStorage.getItem("schedule-study-blocks")

    return {
      courses: savedCourses ? JSON.parse(savedCourses) : [],
      studyBlocks: savedStudyBlocks ? JSON.parse(savedStudyBlocks) : [],
    }
  } catch {
    return { courses: [], studyBlocks: [] }
  }
}

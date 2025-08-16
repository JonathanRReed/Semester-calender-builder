import type { CourseEvent, StudyBlock, ScheduleEvent, TimeZone } from "@/types/schedule"
import { TIMEZONES, EVENT_COLORS } from "./constants"

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const [hour, minute] = timeStr.split(":").map(Number)
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
  return hour * 60 + minute
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

export function getEventColor(event: ScheduleEvent): string {
  if (event.type === "study") return EVENT_COLORS.study
  if ("type" in event) {
    return EVENT_COLORS[event.type] || EVENT_COLORS.default
  }
  return EVENT_COLORS.default
}

export function saveScheduleData(courses: CourseEvent[], studyBlocks: StudyBlock[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("schedule-courses", JSON.stringify(courses))
    localStorage.setItem("schedule-study-blocks", JSON.stringify(studyBlocks))
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

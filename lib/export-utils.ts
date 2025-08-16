import type { ScheduleEvent } from "@/types/schedule"
import { parseTime } from "./schedule-utils"

// ICS export functionality
export function generateICSFile(events: ScheduleEvent[]): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Course Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n")

  events.forEach((event) => {
    // Skip async events with 00:00 times
    if (event.startCT === "00:00" && event.endCT === "00:00") return

    const startTime = parseTime(event.startCT)
    const endTime = parseTime(event.endCT)

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayMap: { [key: string]: string } = {
      Sun: "SU",
      Mon: "MO",
      Tue: "TU",
      Wed: "WE",
      Thu: "TH",
      Fri: "FR",
      Sat: "SA",
    }

    const dayOfWeek = dayMap[event.day]

    // Create a start date (next occurrence of this day)
    const today = new Date()
    const targetDay = Object.keys(dayMap).indexOf(event.day)
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + daysUntilTarget)
    startDate.setHours(startTime.hour, startTime.minute, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(endTime.hour, endTime.minute, 0, 0)

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    let description = ""
    if (event.type === "study" && "notes" in event && event.notes) {
      description = event.notes
    } else if ("instructor" in event && event.instructor) {
      description = `Instructor: ${event.instructor}`
    }

    let location = ""
    if ("location" in event && event.location) {
      location = event.location
    }

    icsContent +=
      "\r\n" +
      [
        "BEGIN:VEVENT",
        `UID:${event.id}@courseschedule`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${formatDateTime(startDate)}`,
        `DTEND:${formatDateTime(endDate)}`,
        `SUMMARY:${event.title}`,
        description ? `DESCRIPTION:${description}` : "",
        location ? `LOCATION:${location}` : "",
        `RRULE:FREQ=WEEKLY;BYDAY=${dayOfWeek}`,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n")
  })

  icsContent += "\r\nEND:VCALENDAR"
  return icsContent
}

export function downloadICSFile(events: ScheduleEvent[]) {
  const icsContent = generateICSFile(events)
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "course-schedule.ics"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// PNG export functionality
export async function exportToPNG(elementId: string) {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default

    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    // Configure html2canvas for better quality
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })

    // Convert to blob and download
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = "course-schedule.png"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      },
      "image/png",
      1.0,
    )
  } catch (error) {
    console.error("Failed to export PNG:", error)
    alert("Failed to export PNG. Please try again.")
  }
}

// Text summary export
export function generateTextSummary(events: ScheduleEvent[]): string {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  let summary = "COURSE SCHEDULE SUMMARY\n"
  summary += "========================\n\n"

  days.forEach((day) => {
    const dayEvents = events
      .filter((event) => event.day === day)
      .sort((a, b) => {
        if (a.startCT === "00:00" && a.endCT === "00:00") return 1
        if (b.startCT === "00:00" && b.endCT === "00:00") return -1
        return a.startCT.localeCompare(b.startCT)
      })

    if (dayEvents.length > 0) {
      summary += `${day.toUpperCase()}\n`
      summary += "─────\n"

      dayEvents.forEach((event) => {
        if (event.startCT === "00:00" && event.endCT === "00:00") {
          summary += `• ${event.title} (Async)\n`
        } else {
          summary += `• ${event.startCT} - ${event.endCT}: ${event.title}\n`
        }

        if ("location" in event && event.location) {
          summary += `  📍 ${event.location}\n`
        }

        if ("instructor" in event && event.instructor) {
          summary += `  👨‍🏫 ${event.instructor}\n`
        }

        if (event.type === "study" && "notes" in event && event.notes) {
          summary += `  📝 ${event.notes}\n`
        }

        summary += "\n"
      })

      summary += "\n"
    }
  })

  // Add statistics
  const courseEvents = events.filter((e) => e.type !== "study")
  const studyEvents = events.filter((e) => e.type === "study")

  summary += "STATISTICS\n"
  summary += "──────────\n"
  summary += `Total Courses: ${courseEvents.length}\n`
  summary += `Study Blocks: ${studyEvents.length}\n`
  summary += `In-person Classes: ${events.filter((e) => "type" in e && e.type === "inperson").length}\n`
  summary += `Online Classes: ${events.filter((e) => "type" in e && e.type === "online").length}\n`

  return summary
}

export function copyTextSummary(events: ScheduleEvent[]) {
  const summary = generateTextSummary(events)

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(summary)
      .then(() => {
        alert("Schedule summary copied to clipboard!")
      })
      .catch(() => {
        fallbackCopyTextToClipboard(summary)
      })
  } else {
    fallbackCopyTextToClipboard(summary)
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.left = "-999999px"
  textArea.style.top = "-999999px"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand("copy")
    alert("Schedule summary copied to clipboard!")
  } catch (err) {
    console.error("Failed to copy text: ", err)
    alert("Failed to copy to clipboard. Please copy manually.")
  }

  document.body.removeChild(textArea)
}

// CSV export functionality
export function generateCSV(events: ScheduleEvent[]): string {
  const headers = [
    "Title",
    "Day",
    "Start Time",
    "End Time",
    "Type",
    "Location",
    "Instructor",
    "Course Code",
    "Credits",
    "Notes",
  ]

  let csvContent = headers.join(",") + "\n"

  events.forEach((event) => {
    const row = [
      `"${event.title}"`,
      event.day,
      event.startCT === "00:00" ? "Async" : event.startCT,
      event.endCT === "00:00" ? "Async" : event.endCT,
      event.type,
      "location" in event && event.location ? `"${event.location}"` : "",
      "instructor" in event && event.instructor ? `"${event.instructor}"` : "",
      "courseCode" in event && event.courseCode ? event.courseCode : "",
      "credits" in event && event.credits ? event.credits.toString() : "",
      event.type === "study" && "notes" in event && event.notes ? `"${event.notes}"` : "",
    ]
    csvContent += row.join(",") + "\n"
  })

  return csvContent
}

export function downloadCSV(events: ScheduleEvent[]) {
  const csvContent = generateCSV(events)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "course-schedule.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

import type { CourseEvent, StudyBlock, ImportantDate } from "@/types/schedule"

export function parseCSVToSchedule(csvContent: string): {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
} {
  const lines = csvContent.split("\n").filter((line) => line.trim())
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  const courses: CourseEvent[] = []
  const studyBlocks: StudyBlock[] = []
  const importantDates: ImportantDate[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    // Determine type and create appropriate object
    if (row.type === "study") {
      studyBlocks.push({
        id: `imported-${i}`,
        title: row.title || "Study Block",
        type: "study",
        day: row.day as any,
        startCT: row.startCT || row.startTime || "09:00",
        endCT: row.endCT || row.endTime || "10:00",
        notes: row.notes || row.description || "",
      })
    } else if (
      row.type === "date" ||
      row.type === "event" ||
      row.type === "deadline" ||
      row.type === "exam" ||
      row.type === "break"
    ) {
      importantDates.push({
        id: `imported-date-${i}`,
        title: row.title || "Important Date",
        date: row.date || new Date().toISOString().split("T")[0],
        type: row.type as any,
        description: row.description || row.notes,
      })
    } else {
      // Default to course
      courses.push({
        id: `imported-course-${i}`,
        title: row.title || "Course",
        courseCode: row.courseCode || row.code || "",
        section: row.section || "",
        type: (row.type as any) || "inperson",
        day: row.day as any,
        startCT: row.startCT || row.startTime || "09:00",
        endCT: row.endCT || row.endTime || "10:00",
        location: row.location || "",
        instructor: row.instructor || "",
        difficulty: Number.parseInt(row.difficulty) || undefined,
        sentiment: row.sentiment || row.notes || "",
      })
    }
  }

  return { courses, studyBlocks, importantDates }
}

export function parseICSToSchedule(icsContent: string): {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
} {
  const courses: CourseEvent[] = []
  const studyBlocks: StudyBlock[] = []
  const importantDates: ImportantDate[] = []

  const events = icsContent.split("BEGIN:VEVENT")

  for (let i = 1; i < events.length; i++) {
    const event = events[i]
    const summary = event.match(/SUMMARY:(.*)/)?.[1]?.trim() || "Imported Event"
    const location = event.match(/LOCATION:(.*)/)?.[1]?.trim() || ""
    const description = event.match(/DESCRIPTION:(.*)/)?.[1]?.trim() || ""

    // Parse DTSTART and DTEND
    const dtstart = event.match(/DTSTART[^:]*:(.*)/)?.[1]?.trim()
    const dtend = event.match(/DTEND[^:]*:(.*)/)?.[1]?.trim()

    if (dtstart && dtend) {
      const startDate = new Date(dtstart.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"))
      const endDate = new Date(dtend.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, "$1-$2-$3T$4:$5:$6"))

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const day = dayNames[startDate.getDay()]

      const startTime = startDate.toTimeString().slice(0, 5)
      const endTime = endDate.toTimeString().slice(0, 5)

      // Determine if it's a course or study block based on content
      if (summary.toLowerCase().includes("study") || summary.toLowerCase().includes("work")) {
        studyBlocks.push({
          id: `imported-ics-${i}`,
          title: summary,
          type: "study",
          day: day as any,
          startCT: startTime,
          endCT: endTime,
          notes: description,
        })
      } else {
        courses.push({
          id: `imported-ics-${i}`,
          title: summary,
          courseCode: summary.split(" ")[0] || "",
          section: "",
          type: location.toLowerCase().includes("online") ? "online" : "inperson",
          day: day as any,
          startCT: startTime,
          endCT: endTime,
          location: location,
          instructor: "",
          sentiment: description,
        })
      }
    }
  }

  return { courses, studyBlocks, importantDates }
}

import { z } from "zod"
import type { CourseEvent, StudyBlock, ImportantDate, SemesterDates } from "@/types/schedule"

// ==========================================
// Runtime validation for the storage trust boundary (localStorage + JSON import).
// Anything that comes from disk is untrusted: validate per-item and drop what's
// malformed instead of letting bad data crash the grid/export later.
// ==========================================

const dayString = z.string().min(1)
const time = z.string() // "HH:MM" or "00:00" async sentinel; lenient on purpose

export const courseEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  courseCode: z.string().default(""),
  section: z.string().default(""),
  type: z.enum(["inperson", "online", "exam"]),
  day: dayString,
  startCT: time,
  endCT: time,
  location: z.string().default(""),
  instructor: z.string().optional(),
  difficulty: z.number().optional(),
  sentiment: z.string().optional(),
  credits: z.number().optional(),
  recurrenceGroupId: z.string().optional(),
})

export const studyBlockSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.literal("study"),
  day: dayString,
  startCT: time,
  endCT: time,
  notes: z.string().optional(),
  recurrenceGroupId: z.string().optional(),
})

export const importantDateSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["event", "deadline", "break", "exam", "finals"]),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
})

export const semesterDatesSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
})

/** Validate an array, keeping valid items and counting the rest. */
function filterValid<T>(schema: z.ZodType<T>, input: unknown): { items: T[]; dropped: number } {
  if (!Array.isArray(input)) return { items: [], dropped: 0 }
  const items: T[] = []
  let dropped = 0
  for (const raw of input) {
    const parsed = schema.safeParse(raw)
    if (parsed.success) items.push(parsed.data as T)
    else dropped++
  }
  return { items, dropped }
}

export interface ValidatedSchedule {
  courses: CourseEvent[]
  studyBlocks: StudyBlock[]
  importantDates: ImportantDate[]
  semesterDates: SemesterDates | null
  dropped: number
}

/** Validate a loosely-typed schedule object from storage or a backup file. */
export function validateSchedule(input: {
  courses?: unknown
  studyBlocks?: unknown
  importantDates?: unknown
  semesterDates?: unknown
}): ValidatedSchedule {
  const c = filterValid(courseEventSchema, input.courses)
  const s = filterValid(studyBlockSchema, input.studyBlocks)
  const d = filterValid(importantDateSchema, input.importantDates)
  const sem = semesterDatesSchema.safeParse(input.semesterDates)
  return {
    courses: c.items as CourseEvent[],
    studyBlocks: s.items as StudyBlock[],
    importantDates: d.items as ImportantDate[],
    semesterDates: sem.success ? sem.data : null,
    dropped: c.dropped + s.dropped + d.dropped,
  }
}

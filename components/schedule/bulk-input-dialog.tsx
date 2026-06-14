"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Sparkles, AlertTriangle, CheckCircle2, Wand2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseEvent, StudyBlock, ImportantDate, ScheduleEvent, DayOfWeek } from "@/types/schedule"
import { generateRecurringEvents } from "@/lib/schedule-utils"
import { detectAllConflicts } from "@/lib/conflict-utils"
import { parsePipeCourseLine, parseDayList, parseSmartText, type DetectedCourse } from "@/lib/schedule-parse"

interface BulkInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: {
    courses: CourseEvent[]
    studyBlocks: StudyBlock[]
    importantDates: ImportantDate[]
    mode?: "append" | "replace"
  }) => void
  existingEvents?: ScheduleEvent[]
}

interface LineError {
  line: number
  text: string
  msg: string
}

interface TextResult {
  courses: number
  studyBlocks: number
  errors: LineError[]
  conflicts: number
}

interface EditableRow {
  include: boolean
  courseCode: string
  title: string
  daysText: string
  startCT: string
  endCT: string
  location: string
  type: "inperson" | "online" | "exam"
  confidence: DetectedCourse["confidence"]
}

const DAY_BUTTONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// How many NEW overlaps a set of added events introduces against the existing schedule.
function countNewConflicts(existing: ScheduleEvent[], added: ScheduleEvent[]): number {
  if (existing.length === 0) return 0
  const before = detectAllConflicts(existing).length
  const after = detectAllConflicts([...existing, ...added]).length
  return Math.max(0, after - before)
}

export function BulkInputDialog({ open, onOpenChange, onImport, existingEvents = [] }: BulkInputDialogProps) {
  const [textInput, setTextInput] = useState("")
  const [textResult, setTextResult] = useState<TextResult | null>(null)

  const [quickCourse, setQuickCourse] = useState({
    title: "",
    courseCode: "",
    section: "",
    type: "inperson" as "inperson" | "online" | "exam",
    days: [] as string[],
    startTime: "",
    endTime: "",
    location: "",
    instructor: "",
    credits: "",
  })

  const [smartInput, setSmartInput] = useState("")
  const [smartRows, setSmartRows] = useState<EditableRow[] | null>(null)

  // ---- Bulk text ----
  const handleTextImport = () => {
    const courses: CourseEvent[] = []
    const studyBlocks: StudyBlock[] = []
    const errors: LineError[] = []

    textInput.split("\n").forEach((rawLine, idx) => {
      const line = rawLine.trim()
      if (!line) return
      const lineNo = idx + 1

      if (!line.includes("|")) {
        errors.push({ line: lineNo, text: line, msg: "use: Code | Title | Days | Time | Location | Instructor" })
        return
      }

      const parsed = parsePipeCourseLine(line)
      if (!parsed.ok) {
        errors.push({ line: lineNo, text: line, msg: parsed.error })
        return
      }

      const isStudy = /^(study|work)\b/i.test(line)
      if (isStudy) {
        const base: Omit<StudyBlock, "id" | "day"> = {
          title: parsed.template.title.replace(/^(study|work)\s+/i, "").trim() || "Study Block",
          type: "study",
          startCT: parsed.template.startCT,
          endCT: parsed.template.endCT,
          notes: "",
        }
        studyBlocks.push(...generateRecurringEvents(base, parsed.days))
      } else {
        const { title, courseCode, section, type, startCT, endCT, location, instructor } = parsed.template
        const base: Omit<CourseEvent, "id" | "day"> = {
          title, courseCode, section, type, startCT, endCT, location, instructor,
        }
        courses.push(...generateRecurringEvents(base, parsed.days))
      }
    })

    const conflicts = countNewConflicts(existingEvents, [...courses, ...studyBlocks])
    setTextResult({ courses: courses.length, studyBlocks: studyBlocks.length, errors, conflicts })

    if (courses.length === 0 && studyBlocks.length === 0) {
      toast.error("Nothing imported — check the lines below")
      return
    }

    onImport({ courses, studyBlocks, importantDates: [] })

    if (errors.length === 0) {
      toast.success(`Added ${courses.length} course event(s) and ${studyBlocks.length} study block(s)`)
      setTextInput("")
      setTextResult(null)
      onOpenChange(false)
    } else {
      toast.warning(`Added ${courses.length + studyBlocks.length} item(s), ${errors.length} line(s) need attention`)
    }
  }

  // ---- Quick add ----
  const handleQuickCourseAdd = () => {
    const base: Omit<CourseEvent, "id" | "day"> = {
      title: quickCourse.title || quickCourse.courseCode,
      courseCode: quickCourse.courseCode,
      section: quickCourse.section,
      type: quickCourse.type,
      startCT: quickCourse.startTime,
      endCT: quickCourse.endTime,
      location: quickCourse.location,
      instructor: quickCourse.instructor,
    }
    const credits = Number.parseInt(quickCourse.credits, 10)
    if (Number.isFinite(credits)) base.credits = credits

    const courses = generateRecurringEvents(base, quickCourse.days as DayOfWeek[])
    const conflicts = countNewConflicts(existingEvents, courses)

    onImport({ courses, studyBlocks: [], importantDates: [] })
    toast.success(`Added ${courses.length} course event(s)`, {
      description: conflicts > 0 ? `⚠ Introduces ${conflicts} time conflict(s) with your schedule` : undefined,
    })
    setQuickCourse({
      title: "", courseCode: "", section: "", type: "inperson", days: [],
      startTime: "", endTime: "", location: "", instructor: "", credits: "",
    })
    onOpenChange(false)
  }

  // ---- Smart paste ----
  const handleSmartDetect = () => {
    const detected = parseSmartText(smartInput)
    if (detected.length === 0) {
      toast.error("Couldn't detect any courses — try the Bulk or Quick tabs")
      setSmartRows([])
      return
    }
    setSmartRows(
      detected.map((d) => ({
        include: true,
        courseCode: d.courseCode,
        title: d.title,
        daysText: d.days.join(", "),
        startCT: d.startCT,
        endCT: d.endCT,
        location: d.location,
        type: d.type,
        confidence: d.confidence,
      })),
    )
  }

  const updateRow = (i: number, patch: Partial<EditableRow>) => {
    setSmartRows((rows) => rows?.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) ?? null)
  }

  const handleSmartImport = () => {
    if (!smartRows) return
    const courses: CourseEvent[] = []
    let skipped = 0

    for (const row of smartRows) {
      if (!row.include) continue
      const days = parseDayList(row.daysText)
      if (days.length === 0) {
        skipped++
        continue
      }
      const base: Omit<CourseEvent, "id" | "day"> = {
        title: row.courseCode ? `${row.courseCode} ${row.title}`.trim() : row.title,
        courseCode: row.courseCode,
        section: "",
        type: row.type,
        startCT: row.startCT,
        endCT: row.endCT,
        location: row.location,
        instructor: "",
      }
      courses.push(...generateRecurringEvents(base, days))
    }

    if (courses.length === 0) {
      toast.error("No rows ready to import — set days for each course")
      return
    }

    const conflicts = countNewConflicts(existingEvents, courses)
    onImport({ courses, studyBlocks: [], importantDates: [] })
    toast.success(`Added ${courses.length} course event(s)`, {
      description: [
        skipped > 0 ? `${skipped} row(s) skipped (no days)` : "",
        conflicts > 0 ? `⚠ ${conflicts} new conflict(s)` : "",
      ]
        .filter(Boolean)
        .join(" · ") || undefined,
    })
    setSmartInput("")
    setSmartRows(null)
    onOpenChange(false)
  }

  const confidenceColor: Record<DetectedCourse["confidence"], string> = {
    high: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    low: "bg-destructive/15 text-destructive border-destructive/30",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Semester Information</DialogTitle>
          <DialogDescription>
            Add several classes at once. Multi-day classes are linked as one recurring course.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="smart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="smart">
              <Wand2 className="w-3.5 h-3.5 mr-1.5" />
              Smart Paste
            </TabsTrigger>
            <TabsTrigger value="text">Bulk Format</TabsTrigger>
            <TabsTrigger value="quick">Quick Add</TabsTrigger>
          </TabsList>

          {/* ---- Smart paste ---- */}
          <TabsContent value="smart" className="space-y-4">
            <div>
              <Label htmlFor="smart-text">Paste your schedule from anywhere</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Copy rows from your registrar / Banner / Workday / a syllabus. We&apos;ll detect what we can — you review
                before anything is added.
              </p>
              <Textarea
                id="smart-text"
                placeholder={
                  "CS 101 Intro to Computing  MWF  9:30-10:45 AM  Hall 201  Dr. Smith\n" +
                  "MATH 200 Calculus II  TR  1:00pm-2:15pm  Online"
                }
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSmartDetect} disabled={!smartInput.trim()}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Detect courses
              </Button>
            </div>

            {smartRows && smartRows.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Review and fix anything, then import. Rows with a red badge need attention.
                </p>
                {smartRows.map((row, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 space-y-2 ${row.include ? "border-border" : "border-border/40 opacity-50"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) => updateRow(i, { include: e.target.checked })}
                          className="accent-primary"
                        />
                        Include
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${confidenceColor[row.confidence]}`}>
                          {row.confidence} confidence
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSmartRows((rows) => rows?.filter((_, idx) => idx !== i) ?? null)}
                          aria-label="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Input
                        value={row.courseCode}
                        onChange={(e) => updateRow(i, { courseCode: e.target.value })}
                        placeholder="Code"
                        className="text-sm"
                      />
                      <Input
                        value={row.title}
                        onChange={(e) => updateRow(i, { title: e.target.value })}
                        placeholder="Title"
                        className="text-sm col-span-1 sm:col-span-2"
                      />
                      <Input
                        value={row.daysText}
                        onChange={(e) => updateRow(i, { daysText: e.target.value })}
                        placeholder="Days (MWF)"
                        className="text-sm"
                      />
                      <Input
                        value={row.startCT}
                        onChange={(e) => updateRow(i, { startCT: e.target.value })}
                        placeholder="Start"
                        type="time"
                        className="text-sm"
                      />
                      <Input
                        value={row.endCT}
                        onChange={(e) => updateRow(i, { endCT: e.target.value })}
                        placeholder="End"
                        type="time"
                        className="text-sm"
                      />
                      <Input
                        value={row.location}
                        onChange={(e) => updateRow(i, { location: e.target.value })}
                        placeholder="Location"
                        className="text-sm col-span-2 sm:col-span-3"
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={handleSmartImport}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Import {smartRows.filter((r) => r.include).length} course(s)
                </Button>
              </div>
            )}
            {smartRows && smartRows.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses detected. Try Bulk Format or Quick Add.</p>
            )}
          </TabsContent>

          {/* ---- Bulk format ---- */}
          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="bulk-text">One course per line</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Format: <code>Code | Title | Days | Time | Location | Instructor</code>. Days like{" "}
                <code>MWF</code>, <code>TR</code>, or <code>Mon,Wed</code>.
              </p>
              <Textarea
                id="bulk-text"
                placeholder={
                  "CS 101 | Intro to Programming | MWF | 09:30-10:45 | Hall 201 | Dr. Smith\n" +
                  "MATH 151 | Calculus I | Mon,Wed,Fri | 11:00-11:50 | SCI 120\n" +
                  "Study | Library focus | Tue,Thu | 18:00-20:00"
                }
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={7}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleTextImport} disabled={!textInput.trim()}>
              Import
            </Button>

            {textResult && (
              <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Added {textResult.courses} course event(s) and {textResult.studyBlocks} study block(s)
                </div>
                {textResult.conflicts > 0 && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    {textResult.conflicts} new time conflict(s) — check the grid
                  </div>
                )}
                {textResult.errors.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      {textResult.errors.length} line(s) skipped:
                    </div>
                    <ul className="ml-6 list-disc text-muted-foreground space-y-0.5">
                      {textResult.errors.slice(0, 6).map((e) => (
                        <li key={e.line}>
                          Line {e.line}: {e.msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ---- Quick add ---- */}
          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  placeholder="MATH 2413"
                  value={quickCourse.courseCode}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, courseCode: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  placeholder="004"
                  value={quickCourse.section}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, section: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="Calculus I"
                  value={quickCourse.title}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min={0}
                  max={12}
                  placeholder="3"
                  value={quickCourse.credits}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, credits: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={quickCourse.startTime}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={quickCourse.endTime}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="SCI 3.230"
                  value={quickCourse.location}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  placeholder="Dr. Smith"
                  value={quickCourse.instructor}
                  onChange={(e) => setQuickCourse((prev) => ({ ...prev, instructor: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={quickCourse.type}
                onValueChange={(value: "inperson" | "online" | "exam") =>
                  setQuickCourse((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inperson">In Person</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAY_BUTTONS.map((day) => (
                  <Button
                    key={day}
                    variant={quickCourse.days.includes(day) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setQuickCourse((prev) => ({
                        ...prev,
                        days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
                      }))
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleQuickCourseAdd}
              disabled={
                !quickCourse.courseCode ||
                !quickCourse.startTime ||
                !quickCourse.endTime ||
                quickCourse.days.length === 0
              }
            >
              Add Course
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseEvent, StudyBlock, ImportantDate } from "@/types/schedule"

interface BulkInputDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: { courses: CourseEvent[]; studyBlocks: StudyBlock[]; importantDates: ImportantDate[]; mode?: "append" | "replace" }) => void
}

export function BulkInputDialog({ open, onOpenChange, onImport }: BulkInputDialogProps) {
  const [textInput, setTextInput] = useState("")

  type QuickCourse = {
    title: string
    courseCode: string
    section: string
    type: "inperson" | "online" | "exam"
    days: string[]
    startTime: string
    endTime: string
    location: string
    instructor: string
  }

  const [quickCourse, setQuickCourse] = useState<QuickCourse>({
    title: "",
    courseCode: "",
    section: "",
    type: "inperson",
    days: [],
    startTime: "",
    endTime: "",
    location: "",
    instructor: "",
  })

  const handleTextImport = () => {
    const lines = textInput.split("\n").filter((line) => line.trim())
    const courses: CourseEvent[] = []
    const studyBlocks: StudyBlock[] = []
    const importantDates: ImportantDate[] = []

    lines.forEach((line) => {
      const trimmed = line.trim()

      // Parse different formats
      if (trimmed.includes("|")) {
        // Format: Course Code | Title | Days | Time | Location
        const parts = trimmed.split("|").map((p) => p.trim())
        if (parts.length >= 4) {
          const courseCode = parts[0] ?? ""
          const title = parts[1] ?? ""
          const days = parts[2] ?? ""
          const time = parts[3] ?? ""
          const location = parts[4] ?? ""
          const timeParts = time.split("-").map((t) => t.trim())
          const startTime = timeParts[0] ?? "09:00"
          const endTime = timeParts[1] ?? "10:00"

          days.split(",").forEach((day) => {
            courses.push({
              id: crypto.randomUUID(),
              title: `${courseCode} ${title}`,
              courseCode,
              section: "",
              type: location.toLowerCase().includes("online") ? "online" : "inperson",
              day: day.trim(),
              startCT: startTime,
              endCT: endTime,
              location,
              instructor: "",
            })
          })
        }
      } else if (trimmed.toLowerCase().includes("study") || trimmed.toLowerCase().includes("work")) {
        // Study block
        studyBlocks.push({
          id: crypto.randomUUID(),
          title: trimmed,
          type: "study",
          day: "Mon",
          startCT: "09:00",
          endCT: "10:00",
          notes: "Added via bulk input",
        })
      } else {
        // Simple course format
        courses.push({
          id: crypto.randomUUID(),
          title: trimmed,
          courseCode: trimmed.split(" ")[0] || "",
          section: "",
          type: "inperson",
          day: "Mon",
          startCT: "09:00",
          endCT: "10:00",
          location: "",
          instructor: "",
        })
      }
    })

    onImport({ courses, studyBlocks, importantDates })
    toast.success(`Added ${courses.length} courses and ${studyBlocks.length} study blocks`)
    setTextInput("")
    onOpenChange(false)
  }

  const handleQuickCourseAdd = () => {
    const courses: CourseEvent[] = []

    quickCourse.days.forEach((day) => {
      courses.push({
        id: crypto.randomUUID(),
        title: quickCourse.title || `${quickCourse.courseCode}`,
        courseCode: quickCourse.courseCode,
        section: quickCourse.section,
        type: quickCourse.type,
        day: day,
        startCT: quickCourse.startTime,
        endCT: quickCourse.endTime,
        location: quickCourse.location,
        instructor: quickCourse.instructor,
      })
    })

    onImport({ courses, studyBlocks: [], importantDates: [] })
    toast.success(`Added ${courses.length} course events`)
    setQuickCourse({
      title: "",
      courseCode: "",
      section: "",
      type: "inperson",
      days: [],
      startTime: "",
      endTime: "",
      location: "",
      instructor: "",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Semester Information</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Bulk Text Input</TabsTrigger>
            <TabsTrigger value="quick">Quick Course Add</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="bulk-text">Paste your course information</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Supports formats like: &ldquo;MATH 2413 | Calculus I | Mon,Wed,Fri | 10:00-10:50 | SCI 3.230&rdquo;
              </p>
              <Textarea
                id="bulk-text"
                placeholder="MATH 2413 | Calculus I | Mon,Wed,Fri | 10:00-10:50 | SCI 3.230
NSC 4359 | Cognitive Neuroscience | Mon,Wed | 17:30-18:45 | CRA 12.110
Study - Math homework
EPPS 4337 | Internship | Tue,Thu | 19:00-20:30 | Online"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleTextImport} disabled={!textInput.trim()}>
              Import Text
            </Button>
          </TabsContent>

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

            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="Calculus I"
                value={quickCourse.title}
                onChange={(e) => setQuickCourse((prev) => ({ ...prev, title: e.target.value }))}
              />
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
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
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

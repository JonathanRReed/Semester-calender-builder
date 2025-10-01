"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { ScheduleEvent, CourseEvent, StudyBlock } from "@/types/schedule"
import { DAYS } from "@/lib/schedule-data"

interface AddEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<ScheduleEvent, "id">) => void
}

type EventTypeOption = "study" | "course"

type FormData = {
  title: string
  day: string
  startCT: string
  endCT: string
  courseType: "inperson" | "online" | "exam"
  location: string
  instructor: string
  courseCode: string
  section: string
  notes: string
}

const INITIAL_FORM: FormData = {
  title: "",
  day: "",
  startCT: "",
  endCT: "",
  courseType: "inperson",
  location: "",
  instructor: "",
  courseCode: "",
  section: "",
  notes: "",
}

const toMinutes = (value: string) => {
  if (!value) return null
  const [hoursStr, minutesStr] = value.split(":")
  if (hoursStr == null || minutesStr == null) return null
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

export function AddEventDialog({ isOpen, onClose, onAdd }: AddEventDialogProps) {
  const [eventType, setEventType] = useState<EventTypeOption>("study")
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)

  const trimmedTitle = formData.title.trim()
  const trimmedNotes = formData.notes.trim()
  const trimmedLocation = formData.location.trim()
  const trimmedCourseCode = formData.courseCode.trim()
  const trimmedSection = formData.section.trim()
  const trimmedInstructor = formData.instructor.trim()

  const canAttemptSubmit = trimmedTitle.length > 0 && formData.day !== ""

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setEventType("study")
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.startCT === "" || formData.endCT === "") {
      toast.error("Please complete the title, day, and start/end times before adding an event.")
      return
    }

    const startMinutes = toMinutes(formData.startCT)
    const endMinutes = toMinutes(formData.endCT)

    if (startMinutes == null || endMinutes == null) {
      toast.error("Please enter valid start and end times.")
      return
    }

    if (endMinutes <= startMinutes) {
      toast.error("End time must be after the start time.")
      return
    }

    if (eventType === "study") {
      const payload: Omit<StudyBlock, "id"> = {
        title: trimmedTitle,
        type: "study",
        day: formData.day,
        startCT: formData.startCT,
        endCT: formData.endCT,
        notes: trimmedNotes || undefined,
      }
      onAdd(payload)
    } else {
      const payload: Omit<CourseEvent, "id"> = {
        title: trimmedTitle,
        courseCode: trimmedCourseCode,
        section: trimmedSection,
        type: formData.courseType,
        day: formData.day,
        startCT: formData.startCT,
        endCT: formData.endCT,
        location: trimmedLocation,
        instructor: trimmedInstructor || undefined,
      }
      onAdd(payload)
    }

    toast.success("Event added to your schedule.")
    resetForm()
    onClose()
  }

  const closeDialog = () => {
    resetForm()
    onClose()
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Capture class details or schedule a focused study block.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label id="event-type-label">Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(value: EventTypeOption) => {
                setEventType(value)
                setFormData((prev) => ({ ...prev, courseType: prev.courseType }))
              }}
            >
              <SelectTrigger aria-labelledby="event-type-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="study">Study Block</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder={eventType === "study" ? "Study session name" : "Course title"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label id="day-label">Day</Label>
              <Select
                value={formData.day}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, day: value }))}
              >
                <SelectTrigger aria-labelledby="day-label">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {eventType === "course" && (
              <div>
                <Label htmlFor="course-type">Course Type</Label>
                <Select
                  value={formData.courseType}
                  onValueChange={(value: "inperson" | "online" | "exam") =>
                    setFormData((prev) => ({ ...prev, courseType: value }))
                  }
                >
                  <SelectTrigger id="course-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inperson">In-person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.startCT}
                onChange={(e) => setFormData((prev) => ({ ...prev, startCT: e.target.value }))}
                step="900"
              />
            </div>

            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.endCT}
                onChange={(e) => setFormData((prev) => ({ ...prev, endCT: e.target.value }))}
                step="900"
              />
            </div>
          </div>

          {eventType === "course" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    value={formData.courseCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, courseCode: e.target.value }))}
                    placeholder="e.g., MATH 2413"
                  />
                </div>
                <div>
                  <Label htmlFor="course-section">Section</Label>
                  <Input
                    id="course-section"
                    value={formData.section}
                    onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                    placeholder="e.g., 004"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="course-location">Location</Label>
                <Input
                  id="course-location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Room/building"
                />
              </div>

              <div>
                <Label htmlFor="course-instructor">Instructor</Label>
                <Input
                  id="course-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
                  placeholder="Instructor name"
                />
              </div>
            </>
          )}

          {eventType === "study" && (
            <div>
              <Label htmlFor="study-notes">Notes</Label>
              <Textarea
                id="study-notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Study notes or description"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canAttemptSubmit} aria-disabled={!canAttemptSubmit}>
              Add Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

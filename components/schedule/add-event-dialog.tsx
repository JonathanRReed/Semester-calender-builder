"use client"

import { useState, useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { ScheduleEvent, CourseEvent, StudyBlock, DayOfWeek } from "@/types/schedule"
import { DAYS } from "@/lib/constants"
import { generateRecurringEvents } from "@/lib/schedule-utils"
import { checkRecurringEventConflicts } from "@/lib/conflict-utils"

interface AddEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<ScheduleEvent, "id">) => void
  onAddMultiple?: (events: Omit<ScheduleEvent, "id">[]) => void
  existingEvents?: ScheduleEvent[]
}

type EventTypeOption = "study" | "course"

type FormData = {
  title: string
  selectedDays: DayOfWeek[]
  startCT: string
  endCT: string
  courseType: "inperson" | "online" | "exam"
  location: string
  instructor: string
  courseCode: string
  section: string
  notes: string
  credits: string
}

const INITIAL_FORM: FormData = {
  title: "",
  selectedDays: [],
  startCT: "",
  endCT: "",
  courseType: "inperson",
  location: "",
  instructor: "",
  courseCode: "",
  section: "",
  notes: "",
  credits: "",
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

// Day button component for multi-select
function DayButton({
  day,
  isSelected,
  onClick,
  hasConflict
}: {
  day: string
  isSelected: boolean
  onClick: () => void
  hasConflict?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative
        ${isSelected
          ? hasConflict
            ? "bg-destructive/20 text-destructive border-2 border-destructive"
            : "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
        }
      `}
      aria-pressed={isSelected}
    >
      {day}
      {hasConflict && isSelected && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
      )}
    </button>
  )
}

export function AddEventDialog({ isOpen, onClose, onAdd, onAddMultiple, existingEvents = [] }: AddEventDialogProps) {
  const [eventType, setEventType] = useState<EventTypeOption>("study")
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)

  const trimmedTitle = formData.title.trim()
  const trimmedNotes = formData.notes.trim()
  const trimmedLocation = formData.location.trim()
  const trimmedCourseCode = formData.courseCode.trim()
  const trimmedSection = formData.section.trim()
  const trimmedInstructor = formData.instructor.trim()
  const parsedCredits = formData.credits ? parseInt(formData.credits, 10) : undefined

  const canAttemptSubmit = trimmedTitle.length > 0 && formData.selectedDays.length > 0

  // Check for conflicts with existing events
  const conflicts = useMemo(() => {
    if (!formData.startCT || !formData.endCT || formData.selectedDays.length === 0) {
      return []
    }
    return checkRecurringEventConflicts(
      formData.selectedDays,
      formData.startCT,
      formData.endCT,
      existingEvents
    )
  }, [formData.selectedDays, formData.startCT, formData.endCT, existingEvents])

  const conflictDays = new Set(conflicts.map(c => c.day))

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setEventType("study")
  }

  const toggleDay = (day: DayOfWeek) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.startCT === "" || formData.endCT === "") {
      toast.error("Please complete the title, days, and start/end times before adding an event.")
      return
    }

    if (formData.selectedDays.length === 0) {
      toast.error("Please select at least one day.")
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

    // Warn about conflicts but allow the user to proceed
    if (conflicts.length > 0) {
      const conflictDaysList = conflicts.map(c => c.day).join(", ")
      toast.warning(`Note: This event overlaps with existing events on ${conflictDaysList}`)
    }

    // Single day - use the original onAdd
    if (formData.selectedDays.length === 1) {
      const day = formData.selectedDays[0]!

      if (eventType === "study") {
        const payload: Omit<StudyBlock, "id"> = {
          title: trimmedTitle,
          type: "study",
          day,
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
          day,
          startCT: formData.startCT,
          endCT: formData.endCT,
          location: trimmedLocation,
          instructor: trimmedInstructor || undefined,
          credits: !Number.isNaN(parsedCredits) ? parsedCredits : undefined,
        }
        onAdd(payload)
      }

      toast.success("Event added to your schedule.")
    } else {
      // Multiple days - generate recurring events
      if (eventType === "study") {
        const baseEvent = {
          title: trimmedTitle,
          type: "study" as const,
          startCT: formData.startCT,
          endCT: formData.endCT,
          notes: trimmedNotes || undefined,
        }

        if (onAddMultiple) {
          const events = generateRecurringEvents(baseEvent, formData.selectedDays)
          onAddMultiple(events)
        } else {
          // Fallback: add each event individually
          for (const day of formData.selectedDays) {
            onAdd({ ...baseEvent, day })
          }
        }
      } else {
        const baseEvent = {
          title: trimmedTitle,
          courseCode: trimmedCourseCode,
          section: trimmedSection,
          type: formData.courseType,
          startCT: formData.startCT,
          endCT: formData.endCT,
          location: trimmedLocation,
          instructor: trimmedInstructor || undefined,
          credits: !Number.isNaN(parsedCredits) ? parsedCredits : undefined,
        }

        if (onAddMultiple) {
          const events = generateRecurringEvents(baseEvent, formData.selectedDays)
          onAddMultiple(events)
        } else {
          // Fallback: add each event individually
          for (const day of formData.selectedDays) {
            onAdd({ ...baseEvent, day })
          }
        }
      }

      toast.success(`Event added to ${formData.selectedDays.length} days: ${formData.selectedDays.join(", ")}`)
    }

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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Select multiple days to create recurring events (e.g., Mon/Wed/Fri class).
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label id="event-type-label">Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(value: EventTypeOption) => {
                setEventType(value)
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

          {/* Multi-day selection */}
          <div>
            <Label className="mb-2 block">
              Days
              {formData.selectedDays.length > 1 && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({formData.selectedDays.length} days selected — will create recurring events)
                </span>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <DayButton
                  key={day}
                  day={day}
                  isSelected={formData.selectedDays.includes(day as DayOfWeek)}
                  hasConflict={conflictDays.has(day)}
                  onClick={() => toggleDay(day as DayOfWeek)}
                />
              ))}
            </div>
          </div>

          {/* Conflict warning */}
          {conflicts.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Schedule Conflict Detected</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {conflicts.map((c, i) => (
                    <span key={i}>
                      {c.day}: overlaps with "{c.conflictingEvent.title}"
                      {i < conflicts.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}

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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="course-code">Course Code</Label>
                  <Input
                    id="course-code"
                    value={formData.courseCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, courseCode: e.target.value }))}
                    placeholder="MATH 2413"
                  />
                </div>
                <div>
                  <Label htmlFor="course-section">Section</Label>
                  <Input
                    id="course-section"
                    value={formData.section}
                    onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                    placeholder="004"
                  />
                </div>
                <div>
                  <Label htmlFor="course-credits">Credits</Label>
                  <Input
                    id="course-credits"
                    type="number"
                    min="0"
                    max="12"
                    value={formData.credits}
                    onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                    placeholder="3"
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
              {formData.selectedDays.length > 1
                ? `Add to ${formData.selectedDays.length} Days`
                : "Add Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

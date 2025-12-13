"use client"

import { useEffect, useState } from "react"
import { Repeat, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScheduleEvent, CourseEvent, StudyBlock } from "@/types/schedule"
import { DAYS } from "@/lib/constants"
import { isRecurringEvent, getRecurrenceGroupEvents } from "@/lib/schedule-utils"

interface EditEventDialogProps {
  event: ScheduleEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: ScheduleEvent) => void
  onSaveAll?: (events: ScheduleEvent[], recurrenceGroupId: string) => void
  onDelete: (eventId: string) => void
  onDeleteAll?: (recurrenceGroupId: string) => void
  allEvents?: ScheduleEvent[]
}

type EditMode = "single" | "all" | null

export function EditEventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onSaveAll,
  onDelete,
  onDeleteAll,
  allEvents = []
}: EditEventDialogProps) {
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({})
  const [editMode, setEditMode] = useState<EditMode>(null)
  const [showModeDialog, setShowModeDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(null)

  // Check if this event is part of a recurrence group
  const isRecurring = event ? isRecurringEvent(event) : false
  const recurrenceGroupId = event?.recurrenceGroupId
  const siblingEvents = recurrenceGroupId
    ? getRecurrenceGroupEvents(allEvents, recurrenceGroupId)
    : []
  const siblingCount = siblingEvents.length

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({ ...event })
      setEditMode(null)
    }
  }, [event])

  const handleSave = () => {
    if (!event || !formData.title || !formData.day || !formData.startCT || !formData.endCT) return

    // If recurring and we haven't chosen a mode yet, show the mode dialog
    if (isRecurring && editMode === null && siblingCount > 1) {
      setPendingAction("save")
      setShowModeDialog(true)
      return
    }

    if (editMode === "all" && recurrenceGroupId && onSaveAll) {
      // Apply changes to all events in the group
      const updatedEvents = siblingEvents.map(siblingEvent => ({
        ...siblingEvent,
        title: formData.title!,
        type: formData.type!,
        startCT: formData.startCT!,
        endCT: formData.endCT!,
        // Keep original day for each event
        ...(formData.type !== "study" ? {
          location: (formData as Partial<CourseEvent>).location,
          instructor: (formData as Partial<CourseEvent>).instructor,
          courseCode: (formData as Partial<CourseEvent>).courseCode,
          section: (formData as Partial<CourseEvent>).section,
          credits: (formData as Partial<CourseEvent>).credits,
        } : {
          notes: (formData as Partial<StudyBlock>).notes,
        }),
      })) as ScheduleEvent[]

      onSaveAll(updatedEvents, recurrenceGroupId)
    } else {
      // Save single event
      onSave({ ...event, ...formData } as ScheduleEvent)
    }

    onClose()
    setEditMode(null)
  }

  const handleDelete = () => {
    if (!event) return

    // If recurring and we haven't chosen a mode yet, show the mode dialog
    if (isRecurring && editMode === null && siblingCount > 1) {
      setPendingAction("delete")
      setShowModeDialog(true)
      return
    }

    if (editMode === "all" && recurrenceGroupId && onDeleteAll) {
      onDeleteAll(recurrenceGroupId)
    } else {
      onDelete(event.id)
    }

    onClose()
    setEditMode(null)
  }

  const handleModeSelect = (mode: EditMode) => {
    setEditMode(mode)
    setShowModeDialog(false)

    // Execute the pending action
    if (pendingAction === "save") {
      // Re-trigger save with mode set
      setTimeout(() => {
        if (event && formData.title && formData.day && formData.startCT && formData.endCT) {
          if (mode === "all" && recurrenceGroupId && onSaveAll) {
            const updatedEvents = siblingEvents.map(siblingEvent => ({
              ...siblingEvent,
              title: formData.title!,
              type: formData.type!,
              startCT: formData.startCT!,
              endCT: formData.endCT!,
              ...(formData.type !== "study" ? {
                location: (formData as Partial<CourseEvent>).location,
                instructor: (formData as Partial<CourseEvent>).instructor,
                courseCode: (formData as Partial<CourseEvent>).courseCode,
                section: (formData as Partial<CourseEvent>).section,
                credits: (formData as Partial<CourseEvent>).credits,
              } : {
                notes: (formData as Partial<StudyBlock>).notes,
              }),
            })) as ScheduleEvent[]
            onSaveAll(updatedEvents, recurrenceGroupId)
          } else {
            onSave({ ...event, ...formData } as ScheduleEvent)
          }
          onClose()
        }
      }, 0)
    } else if (pendingAction === "delete") {
      setTimeout(() => {
        if (mode === "all" && recurrenceGroupId && onDeleteAll) {
          onDeleteAll(recurrenceGroupId)
        } else if (event) {
          onDelete(event.id)
        }
        onClose()
      }, 0)
    }

    setPendingAction(null)
  }

  const handleClose = () => {
    setEditMode(null)
    setShowModeDialog(false)
    setPendingAction(null)
    onClose()
  }

  if (!event) return null

  const isStudyBlock = event.type === "study"

  // Mode selection dialog for recurring events
  if (showModeDialog) {
    return (
      <Dialog open={true} onOpenChange={() => { setShowModeDialog(false); setPendingAction(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              {pendingAction === "delete" ? "Delete Recurring Event" : "Edit Recurring Event"}
            </DialogTitle>
            <DialogDescription>
              This event is part of a series ({siblingCount} occurrences on {siblingEvents.map(e => e.day).join(", ")}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => handleModeSelect("single")}
            >
              <div className="text-left">
                <div className="font-medium">
                  {pendingAction === "delete" ? "Delete this event only" : "Edit this event only"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Only {event.day}'s occurrence will be {pendingAction === "delete" ? "removed" : "changed"}
                </div>
              </div>
            </Button>

            <Button
              variant={pendingAction === "delete" ? "destructive" : "default"}
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => handleModeSelect("all")}
            >
              <div className="text-left">
                <div className="font-medium">
                  {pendingAction === "delete" ? "Delete all in series" : "Edit all in series"}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  All {siblingCount} occurrences will be {pendingAction === "delete" ? "removed" : "updated"}
                </div>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowModeDialog(false); setPendingAction(null) }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit {isStudyBlock ? "Study Block" : "Course"}
            {isRecurring && siblingCount > 1 && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                <Repeat className="w-3 h-3" />
                {siblingCount} days
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day">Day</Label>
              <Select value={formData.day || ""} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type || ""}
                onValueChange={(value: ScheduleEvent["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="inperson">In-person</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startCT || ""}
                onChange={(e) => setFormData({ ...formData, startCT: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endCT || ""}
                onChange={(e) => setFormData({ ...formData, endCT: e.target.value })}
              />
            </div>
          </div>

          {!isStudyBlock && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={(formData as Partial<CourseEvent>).courseCode || ""}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="MATH 101"
                  />
                </div>
                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={(formData as Partial<CourseEvent>).section || ""}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="001"
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    max="12"
                    value={(formData as Partial<CourseEvent>).credits ?? ""}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={(formData as Partial<CourseEvent>).location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room/building"
                />
              </div>

              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={(formData as Partial<CourseEvent>).instructor || ""}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor name"
                />
              </div>
            </>
          )}

          {isStudyBlock && (
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={(formData as Partial<StudyBlock>).notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Study notes or description"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="destructive" onClick={handleDelete} className="gap-1">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

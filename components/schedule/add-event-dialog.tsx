"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScheduleEvent, CourseEvent, StudyBlock } from "@/types/schedule"
import { DAYS } from "@/lib/schedule-data"

interface AddEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<ScheduleEvent, "id">) => void
}

export function AddEventDialog({ isOpen, onClose, onAdd }: AddEventDialogProps) {
  const [eventType, setEventType] = useState<"study" | "course">("study")

  type FormData = {
    title: string
    day: string
    startCT: string
    endCT: string
    // union across study & course variants
    type: "study" | "inperson" | "online" | "exam"
    location: string
    instructor: string
    courseCode: string
    section: string
    notes: string
  }

  const [formData, setFormData] = useState<FormData>({
    title: "",
    day: "",
    startCT: "",
    endCT: "",
    type: "study",
    location: "",
    instructor: "",
    courseCode: "",
    section: "",
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      day: "",
      startCT: "",
      endCT: "",
      type: "study",
      location: "",
      instructor: "",
      courseCode: "",
      section: "",
      notes: "",
    })
    setEventType("study")
  }

  const handleAdd = () => {
    if (!formData.title || !formData.day || !formData.startCT || !formData.endCT) {
      return
    }

    if (eventType === "study") {
      const payload: Omit<StudyBlock, "id"> = {
        title: formData.title,
        type: "study",
        day: formData.day,
        startCT: formData.startCT,
        endCT: formData.endCT,
        notes: formData.notes,
      }
      onAdd(payload)
    } else {
      const payload: Omit<CourseEvent, "id"> = {
        title: formData.title,
        courseCode: formData.courseCode,
        section: formData.section,
        type: (formData.type as "inperson" | "online" | "exam"),
        day: formData.day,
        startCT: formData.startCT,
        endCT: formData.endCT,
        location: formData.location,
        instructor: formData.instructor,
      }
      onAdd(payload)
    }

    resetForm()
    onClose()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Event Type</Label>
            <Select
              value={eventType}
              onValueChange={(value: "study" | "course") => {
                setEventType(value)
                setFormData({ ...formData, type: value === "study" ? "study" : "inperson" })
              }}
            >
              <SelectTrigger>
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={eventType === "study" ? "Study session name" : "Course title"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day">Day</Label>
              <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
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

            {eventType === "course" && (
              <div>
                <Label htmlFor="courseType">Course Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "inperson" | "online" | "exam") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startCT}
                onChange={(e) => setFormData({ ...formData, startCT: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endCT}
                onChange={(e) => setFormData({ ...formData, endCT: e.target.value })}
              />
            </div>
          </div>

          {eventType === "course" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="e.g., MATH 2413"
                  />
                </div>

                <div>
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g., 004"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room/building"
                />
              </div>

              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor name"
                />
              </div>
            </>
          )}

          {eventType === "study" && (
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Study notes or description"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

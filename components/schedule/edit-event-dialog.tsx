"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ScheduleEvent, CourseEvent, StudyBlock } from "@/types/schedule"
import { DAYS } from "@/lib/schedule-data"

interface EditEventDialogProps {
  event: ScheduleEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: ScheduleEvent) => void
  onDelete: (eventId: string) => void
}

export function EditEventDialog({ event, isOpen, onClose, onSave, onDelete }: EditEventDialogProps) {
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>({})

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({ ...event })
    }
  }, [event])

  const handleSave = () => {
    if (event && formData.title && formData.day && formData.startCT && formData.endCT) {
      onSave({ ...event, ...formData } as ScheduleEvent)
      onClose()
    }
  }

  const handleDelete = () => {
    if (event) {
      onDelete(event.id)
      onClose()
    }
  }

  if (!event) return null

  const isStudyBlock = event.type === "study"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {isStudyBlock ? "Study Block" : "Course"}</DialogTitle>
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

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

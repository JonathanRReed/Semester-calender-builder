"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Coffee, Clock, GraduationCap, Calendar, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { ImportantDate } from "@/types/schedule"

interface AddDateDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (date: Omit<ImportantDate, "id">) => void
  presetType?: ImportantDate["type"] | null
}

const getTypeInfo = (type: ImportantDate["type"]) => {
  switch (type) {
    case "break":
      return {
        icon: <Coffee className="w-4 h-4" />,
        title: "Add Break/Holiday",
        description: "Mark days when there are no classes (e.g., Thanksgiving, Spring Break)",
        placeholder: "e.g., Thanksgiving Break",
        supportsRange: true,
      }
    case "finals":
      return {
        icon: <BookOpen className="w-4 h-4" />,
        title: "Add Finals/Testing Period",
        description: "Mark exam weeks or testing periods",
        placeholder: "e.g., Finals Week",
        supportsRange: true,
      }
    case "exam":
      return {
        icon: <GraduationCap className="w-4 h-4" />,
        title: "Add Exam",
        description: "Schedule a specific exam date",
        placeholder: "e.g., MATH 2413 Midterm",
        supportsRange: false,
      }
    case "deadline":
      return {
        icon: <Clock className="w-4 h-4" />,
        title: "Add Deadline",
        description: "Track assignment due dates and project submissions",
        placeholder: "e.g., Research Paper Due",
        supportsRange: false,
      }
    default:
      return {
        icon: <Calendar className="w-4 h-4" />,
        title: "Add Important Date",
        description: "Add any important date to your semester",
        placeholder: "e.g., Office Hours, Study Group",
        supportsRange: false,
      }
  }
}

// Calculate number of days between two dates
function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start + "T00:00:00")
  const endDate = new Date(end + "T00:00:00")
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export function AddDateDialog({ isOpen, onClose, onAdd, presetType }: AddDateDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    description: "",
    type: (presetType || "event") as ImportantDate["type"],
  })
  const [isMultiDay, setIsMultiDay] = useState(false)

  // Update type when presetType changes
  useEffect(() => {
    if (isOpen && presetType) {
      setFormData(prev => ({ ...prev, type: presetType }))
      // Auto-enable multi-day for break and finals types
      if (presetType === "break" || presetType === "finals") {
        setIsMultiDay(true)
      }
    }
  }, [isOpen, presetType])

  const typeInfo = getTypeInfo(formData.type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return

    const newDate: Omit<ImportantDate, "id"> = {
      title: formData.title,
      date: formData.date,
      type: formData.type,
    }

    if (isMultiDay && formData.endDate) {
      newDate.endDate = formData.endDate
    }

    if (formData.description) {
      newDate.description = formData.description
    }

    onAdd(newDate)

    setFormData({ title: "", date: "", endDate: "", description: "", type: "event" })
    setIsMultiDay(false)
    onClose()
  }

  const handleClose = () => {
    setFormData({ title: "", date: "", endDate: "", description: "", type: "event" })
    setIsMultiDay(false)
    onClose()
  }

  const handleTypeChange = (value: ImportantDate["type"]) => {
    setFormData(prev => ({ ...prev, type: value }))
    // Auto-enable multi-day for break and finals types
    if (value === "break" || value === "finals") {
      setIsMultiDay(true)
    }
  }

  const dayCount = isMultiDay && formData.date && formData.endDate
    ? getDaysBetween(formData.date, formData.endDate)
    : 1

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeInfo.icon}
            {typeInfo.title}
          </DialogTitle>
          <DialogDescription>
            {typeInfo.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="bg-background border-input text-foreground"
              placeholder={typeInfo.placeholder}
              required
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-foreground">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="event">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Event
                  </span>
                </SelectItem>
                <SelectItem value="deadline">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline
                  </span>
                </SelectItem>
                <SelectItem value="break">
                  <span className="flex items-center gap-2">
                    <Coffee className="w-3.5 h-3.5" />
                    Break/Holiday
                  </span>
                </SelectItem>
                <SelectItem value="finals">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Finals/Testing Period
                  </span>
                </SelectItem>
                <SelectItem value="exam">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Single Exam
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Multi-day toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
            <div>
              <Label htmlFor="multi-day" className="text-foreground font-medium">
                Multi-day period
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable for holidays, breaks, or finals week
              </p>
            </div>
            <Switch
              id="multi-day"
              checked={isMultiDay}
              onCheckedChange={setIsMultiDay}
            />
          </div>

          <div className={`grid gap-4 ${isMultiDay ? "grid-cols-2" : "grid-cols-1"}`}>
            <div>
              <Label htmlFor="date" className="text-foreground">
                {isMultiDay ? "Start Date" : "Date"}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="bg-background border-input text-foreground"
                required
              />
            </div>

            {isMultiDay && (
              <div>
                <Label htmlFor="endDate" className="text-foreground">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  min={formData.date || undefined}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="bg-background border-input text-foreground"
                  required={isMultiDay}
                />
              </div>
            )}
          </div>

          {/* Day count indicator */}
          {isMultiDay && formData.date && formData.endDate && dayCount > 0 && (
            <div className="text-xs text-muted-foreground text-center py-1">
              📅 {dayCount} day{dayCount !== 1 ? "s" : ""} total
            </div>
          )}

          <div>
            <Label htmlFor="description" className="text-foreground">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="bg-background border-input text-foreground"
              rows={2}
              placeholder="Add any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="text-muted-foreground bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:brightness-110">
              Add {formData.type === "break" ? "Break" : formData.type === "finals" ? "Finals Period" : formData.type === "exam" ? "Exam" : formData.type === "deadline" ? "Deadline" : "Date"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

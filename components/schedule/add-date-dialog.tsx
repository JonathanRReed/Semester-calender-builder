"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ImportantDate } from "@/types/schedule"

interface AddDateDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (date: Omit<ImportantDate, "id">) => void
}

export function AddDateDialog({ isOpen, onClose, onAdd }: AddDateDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    type: "event" as ImportantDate["type"],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return

    onAdd({
      title: formData.title,
      date: formData.date,
      description: formData.description || undefined,
      type: formData.type,
    })

    setFormData({ title: "", date: "", description: "", type: "event" })
    onClose()
  }

  const handleClose = () => {
    setFormData({ title: "", date: "", description: "", type: "event" })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-popover border-border text-popover-foreground">
        <DialogHeader>
          <DialogTitle>Add Important Date</DialogTitle>
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
              required
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-foreground">
              Date
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

          <div>
            <Label htmlFor="type" className="text-foreground">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: ImportantDate["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              Add Date
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

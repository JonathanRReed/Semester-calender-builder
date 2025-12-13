"use client"

import { useState } from "react"
import { Plus, Calendar, Clock, GraduationCap, Coffee, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ImportantDate } from "@/types/schedule"
import { AddDateDialog } from "./add-date-dialog"

interface OverviewSectionProps {
  dates: ImportantDate[]
  onAddDate: (date: Omit<ImportantDate, "id">) => void
  onDeleteDate: (id: string) => void
  className?: string
}

export function OverviewSection({ dates, onAddDate, onDeleteDate, className }: OverviewSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [presetType, setPresetType] = useState<ImportantDate["type"] | null>(null)

  const getDateIcon = (type: ImportantDate["type"]) => {
    switch (type) {
      case "deadline":
        return <Clock className="w-4 h-4" />
      case "break":
        return <Coffee className="w-4 h-4" />
      case "exam":
        return <GraduationCap className="w-4 h-4" />
      case "finals":
        return <BookOpen className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getDateColor = (type: ImportantDate["type"]) => {
    switch (type) {
      case "deadline":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
      case "break":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
      case "exam":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
      case "finals":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
      default:
        return "bg-secondary/30 text-muted-foreground border-border/40"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!endDate) {
      return formatDate(startDate)
    }
    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")

    // If same month, combine nicely
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.getDate()}`
    }

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  const getDaysCount = (startDate: string, endDate?: string) => {
    if (!endDate) return 1
    const start = new Date(startDate + "T00:00:00")
    const end = new Date(endDate + "T00:00:00")
    const diffTime = end.getTime() - start.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const sortedDates = [...dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Count by type for quick stats
  const breakCount = dates.filter(d => d.type === "break").length
  const examCount = dates.filter(d => d.type === "exam").length
  const finalsCount = dates.filter(d => d.type === "finals").length
  const deadlineCount = dates.filter(d => d.type === "deadline").length

  const handleQuickAdd = (type: ImportantDate["type"]) => {
    setPresetType(type)
    setIsAddDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false)
    setPresetType(null)
  }

  return (
    <>
      <Card className={className} data-slot="overview">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <CardTitle className="text-base sm:text-lg leading-tight">Important Dates</CardTitle>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Info text explaining this section */}
          <p className="text-xs text-muted-foreground mt-2">
            Track specific dates, multi-day breaks, and testing periods.
          </p>

          {/* Quick add buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => handleQuickAdd("break")}
            >
              <Coffee className="w-3 h-3" />
              Break/Holiday
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => handleQuickAdd("finals")}
            >
              <BookOpen className="w-3 h-3" />
              Finals Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => handleQuickAdd("exam")}
            >
              <GraduationCap className="w-3 h-3" />
              Exam
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => handleQuickAdd("deadline")}
            >
              <Clock className="w-3 h-3" />
              Deadline
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {/* Stats summary if there are dates */}
          {dates.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2 border-b border-border/30 mb-3">
              {finalsCount > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-purple-500/5 border-purple-500/30">
                  <BookOpen className="w-3 h-3" />
                  {finalsCount} finals
                </Badge>
              )}
              {examCount > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-red-500/5 border-red-500/30">
                  <GraduationCap className="w-3 h-3" />
                  {examCount} exam{examCount > 1 ? "s" : ""}
                </Badge>
              )}
              {deadlineCount > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/5 border-amber-500/30">
                  <Clock className="w-3 h-3" />
                  {deadlineCount} deadline{deadlineCount > 1 ? "s" : ""}
                </Badge>
              )}
              {breakCount > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1 bg-emerald-500/5 border-emerald-500/30">
                  <Coffee className="w-3 h-3" />
                  {breakCount} break{breakCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}

          {/* Empty state */}
          {dates.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No dates added yet</p>
              <p className="text-xs mt-1">Add exams, deadlines, breaks & finals above</p>
            </div>
          )}

          {/* Date list */}
          {sortedDates.map((date, index) => {
            const isMultiDay = !!date.endDate
            const daysCount = getDaysCount(date.date, date.endDate)

            return (
              <div
                key={date.id}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 p-2.5 transition-all duration-300 group hover:bg-card/55 hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-1.5 rounded-lg border ${getDateColor(date.type)} group-hover:scale-110 transition-transform`}>
                  {getDateIcon(date.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm text-foreground leading-tight">{date.title}</h3>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {formatDateRange(date.date, date.endDate)}
                        {isMultiDay && (
                          <span className="ml-1 opacity-70">({daysCount} days)</span>
                        )}
                      </p>
                      {date.description && <p className="text-muted-foreground text-[11px] mt-0.5">{date.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] capitalize px-2 py-0.5 ${getDateColor(date.type)}`}>
                        {date.type === "finals" ? "finals" : date.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteDate(date.id)}
                        aria-label={`Delete ${date.title}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <AddDateDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        onAdd={onAddDate}
        presetType={presetType}
      />
    </>
  )
}

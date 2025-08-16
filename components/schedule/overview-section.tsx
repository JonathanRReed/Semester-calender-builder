"use client"

import { useState } from "react"
import { Plus, Calendar, Clock, GraduationCap, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ImportantDate } from "@/types/schedule"
import { AddDateDialog } from "./add-date-dialog"

interface OverviewSectionProps {
  dates: ImportantDate[]
  onAddDate: (date: Omit<ImportantDate, "id">) => void
  onDeleteDate: (id: string) => void
}

export function OverviewSection({ dates, onAddDate }: OverviewSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getDateIcon = (type: ImportantDate["type"]) => {
    switch (type) {
      case "deadline":
        return <Clock className="w-4 h-4" />
      case "break":
        return <Coffee className="w-4 h-4" />
      case "exam":
        return <GraduationCap className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getDateColor = () => {
    // Use neutral semantic tokens for consistency with the palette
    return "bg-secondary/30 text-muted-foreground border-border/40"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const sortedDates = [...dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <>
      <div className="glass-card rounded-lg scale-in">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-foreground font-semibold text-lg">Important Dates</h2>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="btn-primary text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Date
            </Button>
          </div>
          <div className="space-y-3">
            {sortedDates.map((date, index) => (
              <div
                key={date.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:bg-card/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-2 rounded-lg ${getDateColor()} group-hover:scale-110 transition-transform`}>
                  {getDateIcon(date.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-foreground text-sm leading-tight group-hover:text-foreground transition-colors">
                        {date.title}
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1 group-hover:text-foreground/80 transition-colors">
                        {formatDate(date.date)}
                      </p>
                      {date.description && (
                        <p className="text-muted-foreground text-xs mt-1 group-hover:text-foreground/70 transition-colors">
                          {date.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getDateColor()} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105`}
                    >
                      {date.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddDateDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={onAddDate} />
    </>
  )
}

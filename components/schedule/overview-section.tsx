"use client"

import { useState } from "react"
import { Plus, Calendar, Clock, GraduationCap, Coffee } from "lucide-react"
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

export function OverviewSection({ dates, onAddDate, className }: OverviewSectionProps) {
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
      <Card className={className} data-slot="overview">
        <CardHeader className="pb-3 sm:pb-4 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <CardTitle className="text-base sm:text-lg leading-tight">Important Dates</CardTitle>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Date
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {sortedDates.map((date, index) => (
            <div
              key={date.id}
              className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 p-2.5 transition-all duration-300 group hover:bg-card/55 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`p-1.5 rounded-lg ${getDateColor()} group-hover:scale-110 transition-transform`}>
                {getDateIcon(date.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm text-foreground leading-tight">{date.title}</h3>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{formatDate(date.date)}</p>
                    {date.description && <p className="text-muted-foreground text-[11px] mt-0.5">{date.description}</p>}
                  </div>
                  <Badge variant="outline" className="text-[11px] capitalize px-2 py-0.5">
                    {date.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddDateDialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} onAdd={onAddDate} />
    </>
  )
}

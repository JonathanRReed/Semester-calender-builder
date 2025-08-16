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

export function OverviewSection({ dates, onAddDate, onDeleteDate }: OverviewSectionProps) {
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

  const getDateColor = (type: ImportantDate["type"]) => {
    switch (type) {
      case "deadline":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "break":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "exam":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }
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
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="text-slate-100 font-semibold text-lg">Important Dates</h2>
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
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`p-2 rounded-lg ${getDateColor(date.type)} group-hover:scale-110 transition-transform`}>
                  {getDateIcon(date.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-slate-100 text-sm leading-tight group-hover:text-white transition-colors">
                        {date.title}
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 group-hover:text-slate-300 transition-colors">
                        {formatDate(date.date)}
                      </p>
                      {date.description && (
                        <p className="text-slate-500 text-xs mt-1 group-hover:text-slate-400 transition-colors">
                          {date.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getDateColor(date.type)} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105`}
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

"use client"

import { Calendar, CalendarClock, CalendarOff, CalendarX2, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { IcsSummary } from "@/lib/export-utils"

interface ExportReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: IcsSummary | null
  onConfirm: () => void
  onSetupSemester: () => void
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ExportReviewDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  onSetupSemester,
}: ExportReviewDialogProps) {
  if (!summary) return null

  const range =
    summary.semester?.startDate && summary.semester?.endDate
      ? `${formatDate(summary.semester.startDate)} – ${formatDate(summary.semester.endDate)}`
      : null

  const rows: { icon: React.ReactNode; label: string }[] = [
    {
      icon: <Calendar className="w-4 h-4 text-primary" />,
      label: `${summary.classGroups} ${summary.classGroups === 1 ? "class" : "classes"} as recurring events${range ? ` (${range})` : ""}`,
    },
  ]
  if (summary.examEvents > 0) {
    rows.push({
      icon: <CalendarClock className="w-4 h-4 text-primary" />,
      label: `${summary.examEvents} exam ${summary.examEvents === 1 ? "event" : "events"}`,
    })
  }
  if (summary.importantDatesExported > 0) {
    rows.push({
      icon: <CalendarClock className="w-4 h-4 text-primary" />,
      label: `${summary.importantDatesExported} important ${summary.importantDatesExported === 1 ? "date" : "dates"} (exams, deadlines, breaks)`,
    })
  }
  if (summary.breakExclusions > 0) {
    rows.push({
      icon: <CalendarOff className="w-4 h-4 text-muted-foreground" />,
      label: `${summary.breakExclusions} class ${summary.breakExclusions === 1 ? "day" : "days"} skipped for breaks/finals`,
    })
  }
  if (summary.asyncSkipped > 0) {
    rows.push({
      icon: <CalendarX2 className="w-4 h-4 text-muted-foreground" />,
      label: `${summary.asyncSkipped} async ${summary.asyncSkipped === 1 ? "course" : "courses"} not added (no fixed time)`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Add to your calendar
          </DialogTitle>
          <DialogDescription>
            Here&apos;s what will be in the <code>.ics</code> file you import into Google, Apple, or Outlook Calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <span className="shrink-0">{row.icon}</span>
              <span>{row.label}</span>
            </div>
          ))}
        </div>

        {!summary.hasSemester && (
          <div className="flex gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-foreground">
                No semester dates set. Classes will start this week and repeat without an end date.
              </p>
              <Button variant="outline" size="sm" onClick={onSetupSemester}>
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Set semester dates
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <Check className="w-4 h-4 mr-1.5" />
            Download .ics
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"
import { Download, FileText, ImageIcon, Calendar, Table, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import type { ScheduleEvent, ImportantDate, SemesterDates } from "@/types/schedule"
import {
  downloadICSFile,
  exportToPNG,
  copyTextSummary,
  downloadCSV,
  downloadJSONBackup,
  summarizeIcsExport,
  type IcsSummary,
} from "@/lib/export-utils"
import { saveLastExportTimestamp } from "@/lib/schedule-utils"
import { ExportReviewDialog } from "./export-review-dialog"
import { toast } from "sonner"

interface ExportMenuProps {
  events: ScheduleEvent[]
  importantDates?: ImportantDate[]
  semester?: SemesterDates | null
  onSetupSemester?: () => void
}

export const ExportMenu = React.forwardRef<HTMLButtonElement, ExportMenuProps>(function ExportMenu(
  { events, importantDates = [], semester = null, onSetupSemester }: ExportMenuProps,
  ref,
) {
  const [isExporting, setIsExporting] = React.useState(false)
  const [reviewOpen, setReviewOpen] = React.useState(false)
  const [summary, setSummary] = React.useState<IcsSummary | null>(null)

  const trackExport = () => {
    saveLastExportTimestamp()
  }

  const handleExportPNG = async () => {
    setIsExporting(true)
    try {
      await exportToPNG("schedule-grid")
      trackExport()
      toast.success("Schedule exported as PNG", {
        description: "Image saved to your downloads",
      })
    } catch {
      toast.error("Failed to export PNG")
    } finally {
      setIsExporting(false)
    }
  }

  // Open a review step before generating the calendar file.
  const handleExportICS = () => {
    setSummary(summarizeIcsExport(events, importantDates, semester))
    setReviewOpen(true)
  }

  const handleConfirmICS = () => {
    downloadICSFile(events, importantDates, semester)
    trackExport()
    setReviewOpen(false)
    toast.success("Calendar exported as .ics", {
      description: "Import this file into Google Calendar, Outlook, or Apple Calendar",
    })
  }

  const handleCopyText = async () => {
    await copyTextSummary(events, importantDates)
    trackExport()
  }

  const handleExportCSV = () => {
    downloadCSV(events, importantDates)
    trackExport()
    toast.success("Schedule exported as CSV", {
      description: "Open in Excel, Google Sheets, or any spreadsheet app",
    })
  }

  const handleBackup = () => {
    downloadJSONBackup(events, importantDates, semester)
    trackExport()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={ref} variant="outline" size="sm" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Export your schedule
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleExportICS}>
            <Calendar className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div>Add to Calendar (.ics)</div>
              <div className="text-[10px] text-muted-foreground">For Google/Apple/Outlook Calendar</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
            <ImageIcon className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div>Export PNG Image</div>
              <div className="text-[10px] text-muted-foreground">Great for sharing or printing</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExportCSV}>
            <Table className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div>Export CSV</div>
              <div className="text-[10px] text-muted-foreground">For spreadsheets (re-importable)</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleBackup}>
            <Save className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div>Download Backup (.json)</div>
              <div className="text-[10px] text-muted-foreground">Full restore-able backup</div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleCopyText}>
            <FileText className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div>Copy Text Summary</div>
              <div className="text-[10px] text-muted-foreground">Plain text to clipboard</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        summary={summary}
        onConfirm={handleConfirmICS}
        onSetupSemester={() => {
          setReviewOpen(false)
          onSetupSemester?.()
        }}
      />
    </>
  )
})

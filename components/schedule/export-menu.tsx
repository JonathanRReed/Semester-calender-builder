"use client"

import { useState } from "react"
import { Download, FileText, ImageIcon, Calendar, Table } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import type { ScheduleEvent } from "@/types/schedule"
import { downloadICSFile, exportToPNG, copyTextSummary, downloadCSV } from "@/lib/export-utils"

interface ExportMenuProps {
  events: ScheduleEvent[]
}

export function ExportMenu({ events }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPNG = async () => {
    setIsExporting(true)
    try {
      await exportToPNG("schedule-grid")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportICS = () => {
    downloadICSFile(events)
  }

  const handleCopyText = () => {
    copyTextSummary(events)
  }

  const handleExportCSV = () => {
    downloadCSV(events)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Export PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportICS}>
          <Calendar className="w-4 h-4 mr-2" />
          Export .ics Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="w-4 h-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyText}>
          <FileText className="w-4 h-4 mr-2" />
          Copy Summary Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

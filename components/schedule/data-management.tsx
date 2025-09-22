"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Database, Upload, RotateCcw, Plus } from "lucide-react"
import { BulkInputDialog } from "./bulk-input-dialog"
import { parseCSVToSchedule, parseICSToSchedule } from "@/lib/import-utils"
import { SEED_COURSES, SEED_STUDY_BLOCKS, IMPORTANT_DATES } from "@/lib/schedule-data"
import type { CourseEvent, StudyBlock, ImportantDate } from "@/types/schedule"

interface DataManagementProps {
  onDataUpdate: (data: { courses: CourseEvent[]; studyBlocks: StudyBlock[]; importantDates: ImportantDate[]; mode?: "append" | "replace" }) => void
}

export const DataManagement = React.forwardRef<HTMLButtonElement, DataManagementProps>(function DataManagement(
  { onDataUpdate }: DataManagementProps,
  ref,
) {
  const [bulkInputOpen, setBulkInputOpen] = React.useState(false)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      let parsedData

      if (file.name.endsWith(".csv")) {
        parsedData = parseCSVToSchedule(content)
      } else if (file.name.endsWith(".ics")) {
        parsedData = parseICSToSchedule(content)
      } else {
        alert("Please upload a CSV or ICS file")
        return
      }

      onDataUpdate(parsedData)
    }
    reader.readAsText(file)

    // Reset input
    event.target.value = ""
  }

  const handleResetToExample = () => {
    if (confirm("This will replace all current data with the example semester. Continue?")) {
      onDataUpdate({
        courses: SEED_COURSES,
        studyBlocks: SEED_STUDY_BLOCKS,
        importantDates: IMPORTANT_DATES,
        mode: "replace",
      })
    }
  }

  const handleClearAll = () => {
    if (confirm("This will clear all schedule data. Continue?")) {
      onDataUpdate({
        courses: [],
        studyBlocks: [],
        importantDates: [],
        mode: "replace",
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button ref={ref} variant="outline" size="sm">
            <Database className="w-4 h-4 mr-2" />
            Manage Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setBulkInputOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Semester Info
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => document.getElementById("file-import")?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/ICS File
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleResetToExample}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Example
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleClearAll} className="text-destructive">
            Clear All Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input id="file-import" type="file" accept=".csv,.ics" onChange={handleFileImport} className="hidden" />

      <BulkInputDialog open={bulkInputOpen} onOpenChange={setBulkInputOpen} onImport={onDataUpdate} />
    </>
  )
})

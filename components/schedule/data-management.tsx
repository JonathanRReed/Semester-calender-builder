"use client"

import * as React from "react"
import { toast } from "sonner"
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

export type DataManagementHandle = {
  openMenu: () => void
  openBulkInput: () => void
  triggerFileImport: () => void
  resetToExample: () => void
  clearAll: () => void
}

export const DataManagement = React.forwardRef<DataManagementHandle, DataManagementProps>(function DataManagement(
  { onDataUpdate }: DataManagementProps,
  ref,
) {
  const [bulkInputOpen, setBulkInputOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const importInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    if (!input) return

    const file = input.files?.[0]
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
        toast.error("Please upload a CSV or ICS file")
        return
      }

      onDataUpdate(parsedData)
      toast.success(`Successfully imported ${parsedData.courses.length + parsedData.studyBlocks.length} events from ${file.name}`)
    }
    reader.readAsText(file)

    // Reset input
    input.value = ""
  }

  const handleResetToExample = React.useCallback(() => {
    toast.warning("This will replace all current data with the example semester.", {
      action: {
        label: "Continue",
        onClick: () => {
          onDataUpdate({
            courses: SEED_COURSES,
            studyBlocks: SEED_STUDY_BLOCKS,
            importantDates: IMPORTANT_DATES,
            mode: "replace",
          })
          toast.success("Data reset to example semester")
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }, [onDataUpdate])

  const handleClearAll = React.useCallback(() => {
    toast.warning("This will clear all schedule data. This action cannot be undone.", {
      action: {
        label: "Clear All",
        onClick: () => {
          onDataUpdate({
            courses: [],
            studyBlocks: [],
            importantDates: [],
            mode: "replace",
          })
          toast.success("All schedule data cleared")
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    })
  }, [onDataUpdate])

  React.useImperativeHandle(
    ref,
    () => ({
      openMenu: () => {
        setMenuOpen(true)
        requestAnimationFrame(() => {
          triggerRef.current?.focus()
        })
      },
      openBulkInput: () => {
        setMenuOpen(false)
        setBulkInputOpen(true)
      },
      triggerFileImport: () => {
        setMenuOpen(false)
        importInputRef.current?.click()
      },
      resetToExample: () => {
        setMenuOpen(false)
        handleResetToExample()
      },
      clearAll: () => {
        setMenuOpen(false)
        handleClearAll()
      },
    }),
    [handleResetToExample, handleClearAll],
  )

  const handleOpenBulkInput = React.useCallback(() => {
    setMenuOpen(false)
    setBulkInputOpen(true)
  }, [])

  const handleTriggerImport = React.useCallback(() => {
    setMenuOpen(false)
    importInputRef.current?.click()
  }, [])

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button ref={triggerRef} variant="outline" size="sm" aria-expanded={menuOpen}>
            <Database className="w-4 h-4 mr-2" />
            Manage Data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleOpenBulkInput}>
            <Plus className="w-4 h-4 mr-2" />
            Add Semester Info
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleTriggerImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV/ICS File
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false)
              handleResetToExample()
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Example
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false)
              handleClearAll()
            }}
            className="text-destructive"
          >
            Clear All Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input ref={importInputRef} type="file" accept=".csv,.ics" onChange={handleFileImport} className="hidden" />

      <BulkInputDialog open={bulkInputOpen} onOpenChange={setBulkInputOpen} onImport={onDataUpdate} />
    </>
  )
})

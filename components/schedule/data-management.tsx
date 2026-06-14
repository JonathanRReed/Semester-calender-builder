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
import { parseCSVToSchedule, parseICSToSchedule, parseJSONBackup } from "@/lib/import-utils"
import { SEED_COURSES, SEED_STUDY_BLOCKS, IMPORTANT_DATES } from "@/lib/schedule-data"
import type { CourseEvent, StudyBlock, ImportantDate, SemesterDates, ScheduleEvent } from "@/types/schedule"

interface DataManagementProps {
  onDataUpdate: (data: { courses: CourseEvent[]; studyBlocks: StudyBlock[]; importantDates: ImportantDate[]; mode?: "append" | "replace" }) => void
  onSemesterRestore?: (dates: SemesterDates | null) => void
  existingEvents?: ScheduleEvent[]
}

export type DataManagementHandle = {
  openMenu: () => void
  openBulkInput: () => void
  triggerFileImport: () => void
  resetToExample: () => void
  clearAll: () => void
}

export const DataManagement = React.forwardRef<DataManagementHandle, DataManagementProps>(function DataManagement(
  { onDataUpdate, onSemesterRestore, existingEvents = [] }: DataManagementProps,
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
      const name = file.name.toLowerCase()

      // JSON backup → full restore (replace everything, incl. semester dates).
      if (name.endsWith(".json")) {
        const backup = parseJSONBackup(content)
        if (!backup) {
          toast.error("That JSON file isn't a recognizable schedule backup")
          return
        }
        onDataUpdate({
          courses: backup.courses,
          studyBlocks: backup.studyBlocks,
          importantDates: backup.importantDates,
          mode: "replace",
        })
        // Always apply the backup's semester dates (including null) so a no-semester
        // backup clears any previously stored term instead of leaving it attached.
        if (onSemesterRestore) onSemesterRestore(backup.semesterDates ?? null)
        const total = backup.courses.length + backup.studyBlocks.length + backup.importantDates.length
        toast.success(`Restored backup: ${total} item${total === 1 ? "" : "s"} from ${file.name}`)
        return
      }

      let result
      if (name.endsWith(".csv")) {
        result = parseCSVToSchedule(content)
      } else if (name.endsWith(".ics")) {
        result = parseICSToSchedule(content)
      } else {
        toast.error("Please upload a CSV, ICS, or JSON file")
        return
      }

      onDataUpdate({
        courses: result.courses,
        studyBlocks: result.studyBlocks,
        importantDates: result.importantDates,
      })

      const total = result.courses.length + result.studyBlocks.length + result.importantDates.length
      if (result.errors.length > 0) {
        toast.warning(`Imported ${total} item${total === 1 ? "" : "s"} from ${file.name}`, {
          description: `${result.errors.length} row(s) skipped: ${result.errors.slice(0, 3).join(" • ")}${result.errors.length > 3 ? " …" : ""}`,
        })
      } else {
        toast.success(`Imported ${total} item${total === 1 ? "" : "s"} from ${file.name}`)
      }
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
            Import CSV / ICS / Backup
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

      <input ref={importInputRef} type="file" accept=".csv,.ics,.json" onChange={handleFileImport} className="hidden" />

      <BulkInputDialog
        open={bulkInputOpen}
        onOpenChange={setBulkInputOpen}
        onImport={onDataUpdate}
        existingEvents={existingEvents}
      />
    </>
  )
})

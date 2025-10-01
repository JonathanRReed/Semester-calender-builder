"use client"

import { Plus, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  onAddEvent: () => void
  onExport: () => void
  onImport: () => void
}

export function QuickActions({ onAddEvent, onExport, onImport }: QuickActionsProps) {
  return (
    <div className="flex flex-col xs:flex-row xs:flex-wrap xs:items-center gap-2 p-3 bg-card/30 border border-border/50 rounded-lg backdrop-blur-sm">
      <span className="text-sm text-muted-foreground font-medium">Quick Actions:</span>
      <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto">
        <Button onClick={onAddEvent} size="sm" variant="outline" className="text-xs bg-transparent w-full xs:w-auto">
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
        <Button onClick={onImport} size="sm" variant="outline" className="text-xs bg-transparent w-full xs:w-auto">
          <Upload className="w-3 h-3 mr-1" />
          Import
        </Button>
        <Button onClick={onExport} size="sm" variant="outline" className="text-xs bg-transparent w-full xs:w-auto">
          <Download className="w-3 h-3 mr-1" />
          Export
        </Button>
      </div>
    </div>
  )
}

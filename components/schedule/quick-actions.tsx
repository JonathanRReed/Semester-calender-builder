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
    <div className="flex items-center gap-2 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg backdrop-blur-sm">
      <span className="text-sm text-slate-300 font-medium">Quick Actions:</span>
      <Button onClick={onAddEvent} size="sm" variant="outline" className="text-xs bg-transparent">
        <Plus className="w-3 h-3 mr-1" />
        Add
      </Button>
      <Button onClick={onImport} size="sm" variant="outline" className="text-xs bg-transparent">
        <Upload className="w-3 h-3 mr-1" />
        Import
      </Button>
      <Button onClick={onExport} size="sm" variant="outline" className="text-xs bg-transparent">
        <Download className="w-3 h-3 mr-1" />
        Export
      </Button>
    </div>
  )
}

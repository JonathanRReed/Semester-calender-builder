"use client"

import { Plus, Download, Upload, Sparkles, BookOpen, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuickActionsProps {
  onAddEvent: () => void
  onExport: () => void
  onImport: () => void
  onLoadExample?: () => void
  onShowGuide?: () => void
  onStartNewSchedule?: () => void
  className?: string
}

export function QuickActions({
  onAddEvent,
  onExport,
  onImport,
  onLoadExample,
  onShowGuide,
  onStartNewSchedule,
  className,
}: QuickActionsProps) {
  return (
    <Card className={className} data-slot="quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {onShowGuide && (
            <Button onClick={onShowGuide} size="sm" variant="outline" className="w-full">
              <BookOpen className="w-3 h-3 mr-1" />
              Guide
            </Button>
          )}
          {onLoadExample && (
            <Button onClick={onLoadExample} size="sm" className="w-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Load Example
            </Button>
          )}
          {onStartNewSchedule && (
            <Button onClick={onStartNewSchedule} size="sm" variant="outline" className="w-full">
              <RotateCcw className="w-3 h-3 mr-1" />
              New Schedule
            </Button>
          )}
          <Button onClick={onAddEvent} size="sm" className="w-full">
            <Plus className="w-3 h-3 mr-1" />
            Add Event
          </Button>
          <Button onClick={onImport} size="sm" variant="outline" className="w-full">
            <Upload className="w-3 h-3 mr-1" />
            Import
          </Button>
          <Button onClick={onExport} size="sm" variant="outline" className="w-full">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

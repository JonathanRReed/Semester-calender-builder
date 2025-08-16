"use client"

import { useState } from "react"
import { X, Calendar, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface OnboardingBannerProps {
  hasEvents: boolean
  onAddEvent: () => void
  onManageData: () => void
}

export function OnboardingBanner({ hasEvents, onAddEvent, onManageData }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || hasEvents) return null

  return (
    <Card className="bg-card border border-border backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Welcome to Semester Calendar Builder</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Get started by adding your courses and study blocks, or import your existing schedule data.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onAddEvent} size="sm" className="bg-primary text-primary-foreground hover:brightness-110">
                <Plus className="w-4 h-4 mr-1" />
                Add First Event
              </Button>
              <Button onClick={onManageData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Import Data
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

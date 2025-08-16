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
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-slate-100">Welcome to Semester Calendar Builder</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Get started by adding your courses and study blocks, or import your existing schedule data.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onAddEvent} size="sm" className="bg-blue-600 hover:bg-blue-700">
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
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

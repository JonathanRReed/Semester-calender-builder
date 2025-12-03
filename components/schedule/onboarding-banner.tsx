"use client"

import { useState } from "react"
import { X, Calendar, Plus, Download, Upload, ListTodo, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface OnboardingBannerProps {
  hasEvents: boolean
  onAddEvent: () => void
  onManageData: () => void
  onLoadExample: () => void
}

export const ONBOARDING_STEPS = [
  {
    icon: <ListTodo className="w-4 h-4 text-primary" />,
    title: "Add your classes",
    description: "Capture lectures, labs, and recitations with the Add Event button.",
  },
  {
    icon: <Upload className="w-4 h-4 text-primary" />,
    title: "Paste a schedule",
    description: "Use Manage Data → Bulk Input to paste text or upload CSV/ICS files.",
  },
  {
    icon: <Download className="w-4 h-4 text-primary" />,
    title: "Share it instantly",
    description: "Export to PNG, ICS, or CSV once everything looks right.",
  },
]

export function OnboardingBanner({ hasEvents, onAddEvent, onManageData, onLoadExample }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || hasEvents) return null

  return (
    <Card className="bg-card border border-border backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Welcome! Let&apos;s build your first semester plan.</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Start with the example semester or jump right in. Your data is stored locally in your browser so you can experiment safely.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground p-1"
              aria-label="Dismiss onboarding tips"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-card/40">
                <div className="mt-0.5" aria-hidden>
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col xs:flex-row flex-wrap gap-2">
            <Button
              onClick={onLoadExample}
              size="sm"
              className="w-full xs:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Load Example Semester
            </Button>
            <Button onClick={onAddEvent} size="sm" variant="outline" className="w-full xs:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              Add a Class or Block
            </Button>
            <Button onClick={onManageData} variant="outline" size="sm" className="w-full xs:w-auto">
              <Upload className="w-4 h-4 mr-1" />
              Import Your Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ONBOARDING_STEPS } from "./onboarding-banner"
import { Sparkles, Plus, Upload } from "lucide-react"
import type { ReactNode } from "react"

interface OnboardingGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadExample: () => void
  onAddEvent: () => void
  onManageData: () => void
}

export function OnboardingGuideDialog({ open, onOpenChange, onLoadExample, onAddEvent, onManageData }: OnboardingGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="w-5 h-5 text-primary" />
            Getting started
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Follow these quick steps to tailor the Semester Calendar Builder to your classes. You can revisit this guide anytime.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {ONBOARDING_STEPS.map((step) => (
              <div key={step.title} className="flex items-start gap-3 rounded-md border border-border/60 p-3 bg-background/60">
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

          <div className="h-px bg-border/60" />

          <div className="grid gap-3 sm:grid-cols-3">
            <GuideAction
              label="Load example semester"
              description="Populate the sample first-year schedule so you can explore features."
              icon={<Sparkles className="w-4 h-4 text-primary" />}
              onClick={() => {
                onLoadExample()
                onOpenChange(false)
              }}
            />
            <GuideAction
              label="Add your first event"
              description="Open the event dialog to add a class, study block, or exam."
              icon={<Plus className="w-4 h-4 text-primary" />}
              onClick={() => {
                onAddEvent()
                onOpenChange(false)
              }}
            />
            <GuideAction
              label="Import from CSV/ICS"
              description="Use Bulk Input or file upload to bring in an existing schedule."
              icon={<Upload className="w-4 h-4 text-primary" />}
              onClick={() => {
                onManageData()
                onOpenChange(false)
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface GuideActionProps {
  label: string
  description: string
  icon: ReactNode
  onClick: () => void
}

function GuideAction({ label, description, icon, onClick }: GuideActionProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 p-3 bg-card/50 shadow-[var(--shadow-xs)]">
      <div className="flex items-center gap-2">
        <div aria-hidden>{icon}</div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-snug flex-1">{description}</p>
      <Button size="sm" onClick={onClick} className="self-start">
        Continue
      </Button>
    </div>
  )
}

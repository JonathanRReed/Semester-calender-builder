"use client"

import { Plus, Calendar, Clock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

// Example ghost events to show in empty state
const GHOST_EVENTS = [
    { day: "Mon", title: "Morning Class", time: "9:00 AM", type: "inperson" as const },
    { day: "Mon", title: "Study Session", time: "2:00 PM", type: "study" as const },
    { day: "Tue", title: "Online Lecture", time: "10:00 AM", type: "online" as const },
    { day: "Wed", title: "Morning Class", time: "9:00 AM", type: "inperson" as const },
    { day: "Wed", title: "Lab", time: "1:00 PM", type: "inperson" as const },
    { day: "Thu", title: "Online Lecture", time: "10:00 AM", type: "online" as const },
    { day: "Fri", title: "Morning Class", time: "9:00 AM", type: "inperson" as const },
]

interface EmptyStateProps {
    onAddEvent: () => void
    onLoadExample: () => void
}

function GhostEvent({ title, time, type }: { title: string; time: string; type: "inperson" | "online" | "study" }) {
    const getColor = () => {
        switch (type) {
            case "inperson": return "bg-primary/5 border-primary/20"
            case "online": return "bg-blue-500/5 border-blue-500/20"
            case "study": return "bg-emerald-500/5 border-emerald-500/20"
        }
    }

    return (
        <div className={`p-2 rounded-lg border ${getColor()} opacity-60`}>
            <div className="text-xs font-medium text-muted-foreground truncate">{title}</div>
            <div className="text-[10px] text-muted-foreground/60">{time}</div>
        </div>
    )
}

export function EmptyState({ onAddEvent, onLoadExample }: EmptyStateProps) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

    return (
        <div className="relative">
            {/* Ghost calendar preview */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="grid grid-cols-5 gap-3">
                    {days.map((day) => (
                        <div key={day} className="space-y-2">
                            <div className="text-center text-xs font-medium text-muted-foreground/50 pb-2">
                                {day}
                            </div>
                            {GHOST_EVENTS
                                .filter((e) => e.day === day)
                                .map((event, idx) => (
                                    <GhostEvent key={idx} {...event} />
                                ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main CTA overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <div className="glass-card p-8 rounded-2xl max-w-md mx-auto shadow-lg">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary" />
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Build Your Semester Schedule
                    </h2>

                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        Add your classes, study blocks, and important dates to create a visual semester plan.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={onAddEvent} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add First Event
                        </Button>
                        <Button variant="outline" onClick={onLoadExample} className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            Load Example
                        </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Takes less than 5 minutes to set up
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

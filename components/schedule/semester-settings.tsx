"use client"

import { useState, useEffect } from "react"
import { Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SemesterDates {
    startDate: string  // YYYY-MM-DD
    endDate: string    // YYYY-MM-DD
}

const STORAGE_KEY = "schedule-semester-dates"

// Load semester dates from localStorage
export function loadSemesterDates(): SemesterDates | null {
    if (typeof window === "undefined") return null

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch {
        // Ignore errors
    }
    return null
}

// Save semester dates to localStorage
export function saveSemesterDates(dates: SemesterDates): void {
    if (typeof window === "undefined") return

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dates))
    } catch {
        // Ignore errors
    }
}

// Calculate current week of semester
export function getCurrentSemesterWeek(dates: SemesterDates | null): number | null {
    if (!dates?.startDate) return null

    const start = new Date(dates.startDate)
    const now = new Date()
    const end = dates.endDate ? new Date(dates.endDate) : null

    // If before semester or after semester
    if (now < start || (end && now > end)) return null

    const diffTime = now.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(diffDays / 7) + 1

    return weekNumber
}

// Calculate total weeks in semester
export function getTotalSemesterWeeks(dates: SemesterDates | null): number | null {
    if (!dates?.startDate || !dates?.endDate) return null

    const start = new Date(dates.startDate)
    const end = new Date(dates.endDate)

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.ceil(diffDays / 7)

    return totalWeeks
}

// Format date for display
function formatDate(dateStr: string): string {
    if (!dateStr) return ""
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

interface SemesterSettingsDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (dates: SemesterDates) => void
    currentDates: SemesterDates | null
}

export function SemesterSettingsDialog({
    isOpen,
    onClose,
    onSave,
    currentDates,
}: SemesterSettingsDialogProps) {
    const [startDate, setStartDate] = useState(currentDates?.startDate || "")
    const [endDate, setEndDate] = useState(currentDates?.endDate || "")

    useEffect(() => {
        if (isOpen) {
            setStartDate(currentDates?.startDate || "")
            setEndDate(currentDates?.endDate || "")
        }
    }, [isOpen, currentDates])

    const handleSave = () => {
        if (startDate && endDate) {
            const dates = { startDate, endDate }
            saveSemesterDates(dates)
            onSave(dates)
            onClose()
        }
    }

    const totalWeeks = startDate && endDate
        ? getTotalSemesterWeeks({ startDate, endDate })
        : null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Semester Dates
                    </DialogTitle>
                    <DialogDescription>
                        Set your semester start and end dates to track which week you're in.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="start-date">Semester Start</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="end-date">Semester End</Label>
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {totalWeeks !== null && (
                        <div className="p-3 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
                            <Info className="w-4 h-4 inline mr-2" />
                            That's approximately {totalWeeks} weeks
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!startDate || !endDate}>
                        Save Dates
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface SemesterWeekIndicatorProps {
    onOpenSettings: () => void
}

export function SemesterWeekIndicator({ onOpenSettings }: SemesterWeekIndicatorProps) {
    const [dates, setDates] = useState<SemesterDates | null>(null)
    const [currentWeek, setCurrentWeek] = useState<number | null>(null)
    const [totalWeeks, setTotalWeeks] = useState<number | null>(null)

    useEffect(() => {
        const loadedDates = loadSemesterDates()
        setDates(loadedDates)
        if (loadedDates) {
            setCurrentWeek(getCurrentSemesterWeek(loadedDates))
            setTotalWeeks(getTotalSemesterWeeks(loadedDates))
        }
    }, [])

    // If no dates set, show setup button
    if (!dates?.startDate) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettings}
                className="text-xs h-7 gap-1.5"
            >
                <Calendar className="w-3.5 h-3.5" />
                Set Semester Dates
            </Button>
        )
    }

    // Show current week indicator
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 gap-1.5"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    {currentWeek !== null ? (
                        <span>Week {currentWeek}{totalWeeks ? ` of ${totalWeeks}` : ""}</span>
                    ) : (
                        <span>{formatDate(dates.startDate)} - {formatDate(dates.endDate)}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
                <div className="space-y-3">
                    <div className="text-sm font-medium">Semester Dates</div>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div>Start: {formatDate(dates.startDate)}</div>
                        <div>End: {formatDate(dates.endDate)}</div>
                        {currentWeek !== null && totalWeeks !== null && (
                            <>
                                <div className="pt-2 border-t mt-2">
                                    <div className="font-medium text-foreground">
                                        Currently: Week {currentWeek} of {totalWeeks}
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2 mt-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (currentWeek / totalWeeks) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={onOpenSettings}
                    >
                        Edit Dates
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

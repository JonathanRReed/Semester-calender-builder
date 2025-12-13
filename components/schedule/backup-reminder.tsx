"use client"

import { useState, useEffect } from "react"
import { Download, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getBackupReminderDays, formatLastExportDate } from "@/lib/schedule-utils"

interface BackupReminderProps {
    onExport: () => void
    className?: string
}

export function BackupReminder({ onExport, className }: BackupReminderProps) {
    const [daysSinceExport, setDaysSinceExport] = useState<number | null>(null)
    const [lastExportDate, setLastExportDate] = useState<string | null>(null)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check on mount and avoid hydration mismatch
        const days = getBackupReminderDays()
        const exportDate = formatLastExportDate()
        setDaysSinceExport(days)
        setLastExportDate(exportDate)
    }, [])

    // Don't show if recently exported or dismissed
    if (daysSinceExport === null || isDismissed) {
        return null
    }

    return (
        <div className={`relative flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg ${className}`}>
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                    Backup Reminder
                </p>
                <p className="text-xs text-muted-foreground">
                    {lastExportDate
                        ? `Last exported ${daysSinceExport} days ago (${lastExportDate}). Export your schedule to keep a backup.`
                        : `You haven't exported your schedule yet. Export it to create a backup.`
                    }
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onExport}
                    className="border-amber-500/50 hover:bg-amber-500/10"
                >
                    <Download className="w-4 h-4 mr-1" />
                    Export Now
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsDismissed(true)}
                    aria-label="Dismiss reminder"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

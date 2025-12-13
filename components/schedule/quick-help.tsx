"use client"

import { useState } from "react"
import { Info, Calendar, Clock, AlertCircle, BookOpen, Keyboard, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface QuickHelpProps {
    className?: string
}

export function QuickHelp({ className }: QuickHelpProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className={`text-xs h-7 gap-1.5 text-muted-foreground hover:text-foreground ${className}`}
            >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How it works</span>
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            How to Use Semester Calendar Builder
                        </DialogTitle>
                        <DialogDescription>
                            A quick guide to building your perfect semester schedule
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Weekly Schedule Section */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                Weekly Schedule View
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                The main grid shows your <strong>typical week</strong>. Add classes, study blocks, and exams that repeat weekly.
                                Events you add will appear on the same day/time each week of your semester.
                            </p>
                        </div>

                        {/* Important Dates Section */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-primary" />
                                Important Dates Panel
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Use the "Important Dates" section on the right to track <strong>specific dates</strong> like:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside pl-2 space-y-1">
                                <li><strong>Deadlines</strong> — Assignment due dates, project submissions</li>
                                <li><strong>Exams</strong> — Midterms, finals, quizzes</li>
                                <li><strong>Breaks</strong> — Spring break, holidays, no-class days</li>
                                <li><strong>Events</strong> — Office hours, study groups, special events</li>
                            </ul>
                        </div>

                        {/* Holiday/Break Section */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Marking Holidays & Breaks
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                To block out holidays or break periods:
                            </p>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside pl-2 space-y-1">
                                <li>Click the <strong>+ Add Date</strong> button in Important Dates</li>
                                <li>Select <strong>"Break"</strong> as the type</li>
                                <li>Enter the date and title (e.g., "Thanksgiving Break")</li>
                            </ol>
                            <p className="text-xs text-muted-foreground/80 mt-1">
                                💡 Tip: When exporting to ICS, breaks will be included as all-day events in your calendar.
                            </p>
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Keyboard className="w-4 h-4 text-primary" />
                                Keyboard Shortcuts
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-secondary/50 border border-border/50 rounded text-xs font-mono">A</kbd>
                                    <span className="text-muted-foreground">Add event</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-secondary/50 border border-border/50 rounded text-xs font-mono">E</kbd>
                                    <span className="text-muted-foreground">Export</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <kbd className="px-1.5 py-0.5 bg-secondary/50 border border-border/50 rounded text-xs font-mono">?</kbd>
                                    <span className="text-muted-foreground">Guide</span>
                                </div>
                            </div>
                        </div>

                        {/* Multi-Day Events */}
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <h3 className="font-semibold text-sm flex items-center gap-2 mb-1">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Pro Tip: Recurring Classes
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                When adding a class that meets Mon/Wed/Fri, select <strong>all three days</strong> in the Add Event dialog.
                                This creates linked events that you can edit or delete together!
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

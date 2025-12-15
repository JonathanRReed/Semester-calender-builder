"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ScheduleEvent } from "@/types/schedule"

interface SearchFilterProps {
    events: ScheduleEvent[]
    onFilteredEvents?: (events: ScheduleEvent[]) => void
    searchTerm: string
    onSearchChange: (term: string) => void
    className?: string
}

export function SearchFilter({
    events,
    searchTerm,
    onSearchChange,
    className
}: SearchFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const matchCount = useMemo(() => {
        if (!searchTerm.trim()) return events.length
        const term = searchTerm.toLowerCase()
        return events.filter(e =>
            e.title.toLowerCase().includes(term) ||
            ("location" in e && e.location?.toLowerCase().includes(term)) ||
            ("notes" in e && e.notes?.toLowerCase().includes(term))
        ).length
    }, [events, searchTerm])

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {isExpanded ? (
                <div className="relative flex-1 max-w-xs animate-fade-in">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-8 h-8 text-sm"
                        autoFocus
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                    className="h-8 px-2"
                >
                    <Search className="w-4 h-4" />
                </Button>
            )}

            {isExpanded && searchTerm && (
                <Badge variant="secondary" className="text-[10px] h-5">
                    {matchCount} result{matchCount !== 1 ? "s" : ""}
                </Badge>
            )}

            {isExpanded && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setIsExpanded(false)
                        onSearchChange("")
                    }}
                    className="h-8 px-2 text-muted-foreground"
                >
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>
    )
}

import type { ScheduleEvent, EventConflict } from "@/types/schedule"
import { convertTimeToMinutes } from "./schedule-utils"

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): boolean {
    return start1 < end2 && start2 < end1
}

/**
 * Calculate the overlap between two time ranges
 */
function getOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
): { start: number; end: number } | null {
    if (!timeRangesOverlap(start1, end1, start2, end2)) {
        return null
    }
    return {
        start: Math.max(start1, start2),
        end: Math.min(end1, end2),
    }
}

/**
 * Convert minutes back to time string (HH:MM)
 */
function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

/**
 * Check if a new event conflicts with existing events
 * Returns the first conflicting event, or null if no conflicts
 */
export function checkEventConflict(
    newEvent: { day: string; startCT: string; endCT: string },
    existingEvents: ScheduleEvent[],
    excludeEventId?: string
): ScheduleEvent | null {
    // Skip async events
    if (newEvent.startCT === "00:00" && newEvent.endCT === "00:00") {
        return null
    }

    const newStart = convertTimeToMinutes(newEvent.startCT)
    const newEnd = convertTimeToMinutes(newEvent.endCT)

    for (const existing of existingEvents) {
        // Skip the same event when editing
        if (excludeEventId && existing.id === excludeEventId) {
            continue
        }

        // Skip if different days
        if (existing.day !== newEvent.day) {
            continue
        }

        // Skip async events
        if (existing.startCT === "00:00" && existing.endCT === "00:00") {
            continue
        }

        const existingStart = convertTimeToMinutes(existing.startCT)
        const existingEnd = convertTimeToMinutes(existing.endCT)

        if (timeRangesOverlap(newStart, newEnd, existingStart, existingEnd)) {
            return existing
        }
    }

    return null
}

/**
 * Check for conflicts across multiple days (for recurring events)
 * Returns array of conflicts for each day
 */
export function checkRecurringEventConflicts(
    days: string[],
    startCT: string,
    endCT: string,
    existingEvents: ScheduleEvent[]
): { day: string; conflictingEvent: ScheduleEvent }[] {
    const conflicts: { day: string; conflictingEvent: ScheduleEvent }[] = []

    for (const day of days) {
        const conflict = checkEventConflict(
            { day, startCT, endCT },
            existingEvents
        )
        if (conflict) {
            conflicts.push({ day, conflictingEvent: conflict })
        }
    }

    return conflicts
}

/**
 * Detect all conflicts in a schedule
 * Returns list of all event pairs that conflict
 */
export function detectAllConflicts(events: ScheduleEvent[]): EventConflict[] {
    const conflicts: EventConflict[] = []
    const seenPairs = new Set<string>()

    for (let i = 0; i < events.length; i++) {
        const event1 = events[i]
        if (!event1 || (event1.startCT === "00:00" && event1.endCT === "00:00")) {
            continue
        }

        for (let j = i + 1; j < events.length; j++) {
            const event2 = events[j]
            if (!event2 || (event2.startCT === "00:00" && event2.endCT === "00:00")) {
                continue
            }

            // Skip if different days
            if (event1.day !== event2.day) {
                continue
            }

            const start1 = convertTimeToMinutes(event1.startCT)
            const end1 = convertTimeToMinutes(event1.endCT)
            const start2 = convertTimeToMinutes(event2.startCT)
            const end2 = convertTimeToMinutes(event2.endCT)

            const overlap = getOverlap(start1, end1, start2, end2)
            if (overlap) {
                // Create a consistent pair key to avoid duplicates
                const pairKey = [event1.id, event2.id].sort().join("-")
                if (!seenPairs.has(pairKey)) {
                    seenPairs.add(pairKey)
                    conflicts.push({
                        event1Id: event1.id,
                        event2Id: event2.id,
                        day: event1.day,
                        overlapStart: minutesToTime(overlap.start),
                        overlapEnd: minutesToTime(overlap.end),
                    })
                }
            }
        }
    }

    return conflicts
}

/**
 * Get set of event IDs that have conflicts
 */
export function getConflictingEventIds(events: ScheduleEvent[]): Set<string> {
    const conflicts = detectAllConflicts(events)
    const conflictingIds = new Set<string>()

    for (const conflict of conflicts) {
        conflictingIds.add(conflict.event1Id)
        conflictingIds.add(conflict.event2Id)
    }

    return conflictingIds
}

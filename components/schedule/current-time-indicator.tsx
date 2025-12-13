"use client"

import { useEffect, useState } from "react"

interface CurrentTimeIndicatorProps {
    startHour?: number  // Grid start hour (e.g., 7AM = 7)
    endHour?: number    // Grid end hour (e.g., 10PM = 22)
}

export function CurrentTimeIndicator({ startHour = 7, endHour = 22 }: CurrentTimeIndicatorProps) {
    const [position, setPosition] = useState<number | null>(null)
    const [currentTime, setCurrentTime] = useState<string>("")

    useEffect(() => {
        const updatePosition = () => {
            const now = new Date()
            const hours = now.getHours()
            const minutes = now.getMinutes()
            const currentTimeInMinutes = hours * 60 + minutes

            const startMinutes = startHour * 60
            const endMinutes = endHour * 60
            const totalMinutes = endMinutes - startMinutes

            // Only show if current time is within grid hours
            if (currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes) {
                const percentage = ((currentTimeInMinutes - startMinutes) / totalMinutes) * 100
                setPosition(percentage)

                // Format time
                const period = hours >= 12 ? "PM" : "AM"
                const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
                setCurrentTime(`${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`)
            } else {
                setPosition(null)
            }
        }

        updatePosition()
        const interval = setInterval(updatePosition, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [startHour, endHour])

    if (position === null) return null

    return (
        <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${position}%` }}
        >
            {/* Time label */}
            <div className="absolute -left-1 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-bold text-red-500 bg-background/90 px-1.5 py-0.5 rounded-full shadow-sm border border-red-500/30">
                    {currentTime}
                </span>
            </div>

            {/* Line */}
            <div className="absolute left-12 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                {/* Dot at the start */}
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse" />
            </div>
        </div>
    )
}

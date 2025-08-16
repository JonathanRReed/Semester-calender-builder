import { formatTime } from "@/lib/schedule-utils"
import type { TimeZone } from "@/types/schedule"

interface TimeAxisProps {
  timeZone: TimeZone
}

export function TimeAxis({ timeZone }: TimeAxisProps) {
  // Generate time slots from 8 AM to 10 PM
  const timeSlots = []
  for (let hour = 8; hour <= 22; hour++) {
    timeSlots.push({ hour, minute: 0 })
    if (hour < 22) {
      timeSlots.push({ hour, minute: 30 })
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header spacer */}
      <div className="h-16 border-b border-border" />

      {/* Time labels */}
      {timeSlots.map(({ hour, minute }) => (
        <div
          key={`${hour}-${minute}`}
          className="h-8 flex items-center justify-end pr-1 text-[10px] sm:text-xs text-muted-foreground border-b border-border/50"
        >
          {minute === 0 && <span className="leading-tight">{formatTime(hour, minute, timeZone)}</span>}
        </div>
      ))}
    </div>
  )
}

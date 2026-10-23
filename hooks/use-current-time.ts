"use client"

import { useEffect, useState } from "react"
import { subscribeCurrentTime } from "@/lib/current-time"

/** Keep time-dependent views fresh without reading an impure clock in render. */
export function useCurrentTime(): Date | null {
  // The server and first client render agree; the real clock starts after mount.
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => subscribeCurrentTime(setNow), [])

  return now
}

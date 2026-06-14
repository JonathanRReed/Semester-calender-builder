import type { CSSProperties } from "react"
import type { ImportantDate } from "@/types/schedule"

// ==========================================
// Single source of truth for event/date colors.
// Everything maps onto the Rose Pine CSS variables (defined in app/globals.css),
// so the calendar grid, sidebar, stats, and legend all stay in sync and flip
// correctly between the Dawn (light) and Night (dark) palettes.
// ==========================================

export type EventVisualKey = "inperson" | "online" | "exam" | "study"

const EVENT_TOKEN: Record<EventVisualKey, string> = {
  inperson: "--event-inperson", // gold
  online: "--event-online", // iris
  exam: "--event-exam", // love
  study: "--event-study", // rose
}

const DATE_TOKEN: Record<ImportantDate["type"], string> = {
  event: "--rp-pine",
  deadline: "--rp-gold",
  break: "--rp-foam",
  exam: "--rp-love",
  finals: "--rp-iris",
}

const mix = (token: string, pct: number) => `color-mix(in srgb, var(${token}) ${pct}%, transparent)`

export interface EventVisual {
  bg: string
  border: string
  accent: string
  glow: string
}

/** Inline styles for an event card, driven by the themed CSS variables. */
export function eventVisual(type: string): EventVisual {
  const token = EVENT_TOKEN[(type as EventVisualKey)] ?? EVENT_TOKEN.inperson
  return {
    bg: `linear-gradient(135deg, ${mix(token, 14)} 0%, ${mix(token, 7)} 100%)`,
    border: mix(token, 30),
    accent: `var(${token})`,
    glow: mix(token, 32),
  }
}

/** Token (CSS var reference) for an important-date type — use for icons/accents. */
export function dateAccent(type: ImportantDate["type"]): string {
  return `var(${DATE_TOKEN[type] ?? "--rp-pine"})`
}

/** Inline styles for an important-date chip/badge: themed tint + readable text. */
export function dateChipStyle(type: ImportantDate["type"]): CSSProperties {
  const token = DATE_TOKEN[type] ?? "--rp-pine"
  return {
    backgroundColor: mix(token, 12),
    borderColor: mix(token, 35),
    color: "var(--foreground)",
  }
}

/** Subtle tinted surface for an important-date icon badge. */
export function dateIconStyle(type: ImportantDate["type"]): CSSProperties {
  const token = DATE_TOKEN[type] ?? "--rp-pine"
  return {
    backgroundColor: mix(token, 14),
    borderColor: mix(token, 35),
    color: `var(${token})`,
  }
}

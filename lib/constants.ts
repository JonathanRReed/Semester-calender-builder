export const COLORS = {
  love: "#eb6f92",
  rose: "#ebbcba",
  gold: "#f6c177",
  iris: "#c4a7e7",
  subtle: "#908caa",
  text: "#e0def4",
  base: "#191724",
} as const

export const TIMEZONES = {
  PT: { name: "Pacific Time", offset: -3 },
  MT: { name: "Mountain Time", offset: -1 },
  CT: { name: "Central Time", offset: 0 },
  ET: { name: "Eastern Time", offset: 1 },
} as const

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM

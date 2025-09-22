export const COLORS = {
  pine: "#31748f",
  foam: "#9ccfd8",
  iris: "#c4a7e7",
  love: "#eb6f92",
  gold: "#f6c177",
  rose: "#ebbcba",
  base: "#191724",
  dawnBase: "#faf4ed",
} as const

export const TIMEZONES = {
  PT: { name: "Pacific Time", offset: -3 },
  MT: { name: "Mountain Time", offset: -1 },
  CT: { name: "Central Time", offset: 0 },
  ET: { name: "Eastern Time", offset: 1 },
} as const

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM

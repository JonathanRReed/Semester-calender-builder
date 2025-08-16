export const COLORS = {
  steelBlue: "#4f7cac",
  mintGreen: "#c0e0de",
  gunmetal: "#162521",
  outerSpace: "#3c474b",
  iceBlue: "#9eefe5",
} as const

export const TIMEZONES = {
  PT: { name: "Pacific Time", offset: -3 },
  MT: { name: "Mountain Time", offset: -1 },
  CT: { name: "Central Time", offset: 0 },
  ET: { name: "Eastern Time", offset: 1 },
} as const

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM

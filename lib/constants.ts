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

export const EVENT_COLORS = {
  study: "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200",
  inperson:
    "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-200",
  online: "bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/30 dark:border-sky-600 dark:text-sky-200",
  exam: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-200",
  default: "bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200",
} as const

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const

export const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + 8) // 8 AM to 10 PM

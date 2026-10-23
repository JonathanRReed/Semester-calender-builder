import assert from "node:assert/strict"
import { afterEach, beforeEach, test } from "node:test"
import { ensureScheduleInitialized, loadScheduleData, saveScheduleData, saveSemesterDates } from "@/lib/schedule-utils"

class MemoryStorage implements Storage {
  readonly entries = new Map<string, string>()
  failWrites = false
  get length() { return this.entries.size }
  clear() { this.entries.clear() }
  getItem(key: string) { return this.entries.get(key) ?? null }
  key(index: number) { return [...this.entries.keys()][index] ?? null }
  removeItem(key: string) { this.entries.delete(key) }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new DOMException("Storage full", "QuotaExceededError")
    this.entries.set(key, value)
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage")
const originalWarn = console.warn
let storage: MemoryStorage
let warnings: unknown[][]

beforeEach(() => {
  storage = new MemoryStorage()
  warnings = []
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} })
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage })
  console.warn = (...args: unknown[]) => { warnings.push(args) }
})

afterEach(() => {
  for (const [key, descriptor] of [["window", originalWindow], ["localStorage", originalStorage]] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
  console.warn = originalWarn
})

const dates = { startDate: "2026-08-24", endDate: "2026-12-11" }
const legacyDates = () => storage.setItem("schedule-semester-dates", JSON.stringify(dates))

test("ordinary saves preserve term dates unless explicitly cleared", () => {
  assert.deepEqual(saveSemesterDates(dates), { ok: true })
  assert.deepEqual(saveScheduleData([], [], []), { ok: true })
  assert.deepEqual(loadScheduleData().semesterDates, dates)
  assert.deepEqual(saveScheduleData([], [], [], null), { ok: true })
  assert.equal(loadScheduleData().semesterDates, null)
})

test("legacy data is removed only after the unified document is safely stored", () => {
  legacyDates()
  assert.deepEqual(loadScheduleData().semesterDates, dates)
  assert.equal(storage.getItem("schedule-semester-dates"), null)
  assert.ok(storage.getItem("schedule-data"))
})

for (const initialize of [loadScheduleData, ensureScheduleInitialized]) {
  test(`${initialize.name} preserves legacy data when migration cannot be saved`, () => {
    legacyDates()
    storage.failWrites = true
    initialize()
    assert.equal(storage.getItem("schedule-semester-dates"), JSON.stringify(dates))
    assert.equal(storage.getItem("schedule-data"), null)
    assert.equal(warnings.length, 1)
    initialize()
    assert.equal(storage.getItem("schedule-semester-dates"), JSON.stringify(dates))
    storage.failWrites = false
    initialize()
    assert.equal(storage.getItem("schedule-semester-dates"), null)
    assert.ok(storage.getItem("schedule-data"))
    assert.deepEqual(loadScheduleData().semesterDates, dates)
  })
}

test("failed ordinary saves report quota errors and leave the previous document intact", () => {
  saveSemesterDates(dates)
  const saved = storage.getItem("schedule-data")
  storage.failWrites = true
  assert.deepEqual(saveScheduleData([], [], [], null), { ok: false, quotaExceeded: true })
  assert.equal(storage.getItem("schedule-data"), saved)
  assert.equal(warnings.length, 1)
})

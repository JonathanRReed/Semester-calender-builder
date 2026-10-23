import assert from "node:assert/strict"
import { test } from "node:test"
import { renderToStaticMarkup } from "react-dom/server"
import { subscribeCurrentTime } from "@/lib/current-time"
import { useCurrentTime } from "@/hooks/use-current-time"

function Clock() {
  const now = useCurrentTime()
  return <span>{now === null ? "pending" : now.toISOString()}</span>
}

test("the live clock starts with a deterministic server snapshot for hydration", () => {
  assert.equal(renderToStaticMarkup(<Clock />), "<span>pending</span>")
})


test("the clock refreshes immediately, schedules minute updates, and cleans up on remount", () => {
  const originalInterval = globalThis.setInterval
  const originalClear = globalThis.clearInterval
  const active = new Map<ReturnType<typeof setInterval>, () => void>()
  let nextId = 0
  globalThis.setInterval = ((callback: () => void, delay: number) => {
    assert.equal(delay, 60_000)
    const id = ++nextId as unknown as ReturnType<typeof setInterval>
    active.set(id, callback)
    return id
  }) as typeof setInterval
  globalThis.clearInterval = ((id: ReturnType<typeof setInterval>) => { active.delete(id) }) as typeof clearInterval
  try {
    const values: Date[] = []
    const refresh = (now: Date) => { values.push(now) }
    const stopFirst = subscribeCurrentTime(refresh)
    assert.equal(values.length, 1)
    assert.ok(Number.isFinite(values[0]!.getTime()))
    assert.equal(active.size, 1)
    active.values().next().value!()
    assert.equal(values.length, 2)
    stopFirst()
    assert.equal(active.size, 0)
    const stopSecond = subscribeCurrentTime(refresh)
    assert.equal(values.length, 3)
    assert.equal(active.size, 1)
    stopSecond()
    assert.equal(active.size, 0)
  } finally {
    globalThis.setInterval = originalInterval
    globalThis.clearInterval = originalClear
  }
})

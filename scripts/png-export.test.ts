import assert from "node:assert/strict"
import { test } from "node:test"
import { canvasToPngBlob, PNG_RENDER_OPTIONS, pngCaptureWidth } from "../lib/png-export"

test("PNG encoding awaits the browser callback", async () => {
  let complete: BlobCallback | undefined
  const canvas: Pick<HTMLCanvasElement, "toBlob"> = { toBlob(callback, type) { assert.equal(type, "image/png"); complete = callback } }
  let settled = false
  const result = canvasToPngBlob(canvas).then(blob => { settled = true; return blob })
  await Promise.resolve()
  assert.equal(settled, false)
  const image = new Blob(["synthetic PNG"], { type: "image/png" })
  assert.ok(complete)
  complete(image)
  assert.equal(await result, image)
  assert.equal(settled, true)
})
test("null blobs reject instead of claiming success", async () => {
  await assert.rejects(canvasToPngBlob({ toBlob(callback) { callback(null) } }), /could not create the PNG.*Print.*JSON backup/)
})
test("tainted canvas errors propagate to the UI", async () => {
  const failure = new DOMException("Canvas is not origin-clean", "SecurityError")
  await assert.rejects(canvasToPngBlob({ toBlob() { throw failure } }), error => error === failure)
})
test("PNG capture does not allow tainted canvases", () => {
  assert.equal(PNG_RENDER_OPTIONS.allowTaint, false)
  assert.equal(PNG_RENDER_OPTIONS.useCORS, true)
})

test("PNG capture includes horizontally scrolled weekend columns", () => {
  assert.equal(pngCaptureWidth(613, [{ clientWidth: 611, scrollWidth: 800 }]), 802)
  assert.equal(pngCaptureWidth(1200, [{ clientWidth: 1198, scrollWidth: 1198 }]), 1200)
  assert.equal(pngCaptureWidth(500, []), 500)
})

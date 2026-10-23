// Render locally with modern CSS color support; never permit a tainted canvas.
export const PNG_RENDER_OPTIONS = {
  backgroundColor: "#ffffff", scale: 2, useCORS: true, allowTaint: false, logging: false,
} as const

export function canvasToPngBlob(canvas: Pick<HTMLCanvasElement, "toBlob">): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("The browser could not create the PNG image. Try Print or download a JSON backup instead."))
    }, "image/png", 1)
  })
}

export function pngCaptureWidth(width: number, scrollRegions: readonly { clientWidth: number; scrollWidth: number }[]): number {
  return Math.ceil(width + Math.max(0, ...scrollRegions.map(region => region.scrollWidth - region.clientWidth)))
}

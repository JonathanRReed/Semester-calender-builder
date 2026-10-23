/** Subscribe to the local clock; the returned function stops future updates. */
export function subscribeCurrentTime(onChange: (now: Date) => void): () => void {
  const refresh = () => onChange(new Date())
  refresh()
  const interval = setInterval(refresh, 60_000)
  return () => clearInterval(interval)
}

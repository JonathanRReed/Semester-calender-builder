"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to Dawn (light) theme" : "Switch to Night (dark) theme"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-rp-gold transition-transform hover:rotate-12" />
      ) : (
        <Moon className="h-4 w-4 text-rp-iris transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">
        {isDark ? "Switch to Rose Pine Dawn" : "Switch to Rose Pine Night"}
      </span>
    </Button>
  )
}

"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcutsOptions {
    onAddEvent?: () => void
    onExport?: () => void
    onShowGuide?: () => void
    onPrint?: () => void
    onUndo?: () => void
    enabled?: boolean
}

/**
 * Hook for handling keyboard shortcuts
 * - A: Add new event
 * - E: Export menu
 * - ?: Show help/guide
 * - P: Print
 * - Ctrl/Cmd + Z: Undo (placeholder)
 */
export function useKeyboardShortcuts({
    onAddEvent,
    onExport,
    onShowGuide,
    onPrint,
    onUndo,
    enabled = true,
}: KeyboardShortcutsOptions) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return

            // Don't trigger shortcuts when typing in inputs
            const target = event.target as HTMLElement
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.isContentEditable
            ) {
                return
            }

            const key = event.key.toLowerCase()

            // Handle Ctrl/Cmd shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (key) {
                    case "p":
                        event.preventDefault()
                        onPrint?.()
                        break
                    case "z":
                        event.preventDefault()
                        onUndo?.()
                        break
                }
                return
            }

            // Don't trigger other shortcuts when modifiers are pressed
            if (event.altKey) {
                return
            }

            switch (key) {
                case "a":
                    event.preventDefault()
                    onAddEvent?.()
                    break
                case "e":
                    event.preventDefault()
                    onExport?.()
                    break
                case "?":
                    event.preventDefault()
                    onShowGuide?.()
                    break
                case "p":
                    event.preventDefault()
                    onPrint?.()
                    break
            }
        },
        [enabled, onAddEvent, onExport, onShowGuide, onPrint, onUndo]
    )

    useEffect(() => {
        if (!enabled) return

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [enabled, handleKeyDown])
}

/**
 * A small keyboard hint component to show next to buttons
 */
export function KeyboardHint({ shortcut }: { shortcut: string }) {
    return (
        <kbd className="hidden sm:inline-flex ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-secondary/50 border border-border/50 rounded text-muted-foreground">
            {shortcut}
        </kbd>
    )
}

/**
 * Help text showing all available shortcuts
 */
export function KeyboardShortcutsHelp() {
    const shortcuts = [
        { key: "A", description: "Add new event" },
        { key: "E", description: "Export menu" },
        { key: "P", description: "Print schedule" },
        { key: "?", description: "Show help" },
    ]

    return (
        <div className="p-3 text-xs">
            <p className="font-semibold text-foreground mb-2">Keyboard Shortcuts</p>
            <ul className="space-y-1">
                {shortcuts.map(({ key, description }) => (
                    <li key={key} className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 font-mono bg-secondary/50 border border-border/50 rounded text-muted-foreground min-w-[24px] text-center">
                            {key}
                        </kbd>
                        <span className="text-muted-foreground">{description}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

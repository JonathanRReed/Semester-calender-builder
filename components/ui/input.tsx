import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-border/60 h-9 w-full min-w-0 rounded-lg border bg-card/60 px-3 py-1 text-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-border/80 hover:bg-card/80",
        "focus-visible:border-ring/60 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "dark:bg-card/40 dark:hover:bg-card/60 dark:focus-visible:bg-card/70",
        className
      )}
      {...props}
    />
  )
}

export { Input }

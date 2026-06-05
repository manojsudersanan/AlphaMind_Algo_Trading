"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function SystemThemeSync() {
  const { theme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (theme === "system" && resolvedTheme) {
      if (resolvedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme, resolvedTheme])

  return null
}

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <SystemThemeSync />
      {children}
    </NextThemesProvider>
  )
}

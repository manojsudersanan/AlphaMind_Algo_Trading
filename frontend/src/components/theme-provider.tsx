"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function SystemThemeSync() {
  const { theme } = useTheme()

  React.useEffect(() => {
    const applySystemTheme = () => {
      const currentTheme = theme || "system"
      if (currentTheme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (isDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    }

    applySystemTheme()

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleMediaChange = () => {
      applySystemTheme()
    }

    mediaQuery.addEventListener("change", handleMediaChange)
    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [theme])

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

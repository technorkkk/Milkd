'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useDairyStore } from '@/lib/store'

/**
 * Syncs the theme with the database settings on app load.
 * This component should be placed in the root layout.
 * It fetches settings on mount and applies the dark mode preference
 * from the database if no local storage preference exists.
 */
export function ThemeSync() {
  const { theme, setTheme } = useTheme()
  const { settings, fetchSettings } = useDairyStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (!mounted || !settings) return

    // Only apply DB theme if there's no localStorage preference
    try {
      const stored = localStorage.getItem('milk-dairy-theme')
      if (!stored) {
        const dbTheme = settings.darkMode ? 'dark' : 'light'
        if (theme !== dbTheme) {
          setTheme(dbTheme)
        }
      }
    } catch {
      // localStorage may not be available
      const dbTheme = settings.darkMode ? 'dark' : 'light'
      if (theme !== dbTheme) {
        setTheme(dbTheme)
      }
    }
  }, [mounted, settings, theme, setTheme])

  return null
}

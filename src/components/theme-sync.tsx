'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (settings && typeof window !== 'undefined') {
      // Check if user has a stored preference in localStorage
      const stored = localStorage.getItem('milk-dairy-theme')
      if (!stored) {
        // No local preference, use database setting
        const dbTheme = settings.darkMode ? 'dark' : 'light'
        if (theme !== dbTheme) {
          setTheme(dbTheme)
        }
      }
    }
  }, [settings, theme, setTheme])

  return null
}

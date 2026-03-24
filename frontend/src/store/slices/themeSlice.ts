import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ThemePreference = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemePreference
}

export function applyThemeToDocument(preference: ThemePreference) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  if (preference === 'system') {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(dark ? 'dark' : 'light')
  } else {
    root.classList.add(preference === 'dark' ? 'dark' : 'light')
  }
}

const getInitialTheme = (): ThemePreference => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      applyThemeToDocument(saved)
      return saved
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = prefersDark ? 'dark' : 'light'
    applyThemeToDocument(theme)
    return theme
  } catch {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add('dark')
    return 'dark'
  }
}

const initialState: ThemeState = {
  theme: getInitialTheme()
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemePreference>) => {
      state.theme = action.payload
      try {
        localStorage.setItem('theme', action.payload)
        applyThemeToDocument(action.payload)
      } catch {
        // Ignore localStorage errors
      }
    },
    toggleTheme: (state) => {
      const prefersDark =
        document.documentElement.classList.contains('dark')
      const newTheme = prefersDark ? 'light' : 'dark'
      state.theme = newTheme
      try {
        localStorage.setItem('theme', newTheme)
        applyThemeToDocument(newTheme)
      } catch {
        // Ignore localStorage errors
      }
    }
  }
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer

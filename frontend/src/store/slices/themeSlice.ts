import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface ThemeState {
  theme: 'light' | 'dark'
}

const getInitialTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      const root = document.documentElement
      root.classList.toggle('dark', saved === 'dark')
      return saved
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = prefersDark ? 'dark' : 'light'
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    return theme
  } catch {
    const root = document.documentElement
    root.classList.add('dark')
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
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      try {
        localStorage.setItem('theme', action.payload)
        const root = document.documentElement
        root.classList.toggle('dark', action.payload === 'dark')
      } catch {
        // Ignore localStorage errors
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      state.theme = newTheme
      try {
        localStorage.setItem('theme', newTheme)
        const root = document.documentElement
        root.classList.toggle('dark', newTheme === 'dark')
      } catch {
        // Ignore localStorage errors
      }
    }
  }
})

export const { setTheme, toggleTheme } = themeSlice.actions
export default themeSlice.reducer

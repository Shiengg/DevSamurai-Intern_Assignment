import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { setTheme } from '@/store/slices/themeSlice'

interface ThemeProviderProps {
    children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const dispatch = useDispatch()
    const theme = useSelector((state: RootState) => state.theme.theme)

    // Initialize theme on mount 
    useEffect(() => {
        const initializeTheme = () => {
            try {
                const saved = localStorage.getItem('theme')
                if (saved === 'light' || saved === 'dark') {
                    dispatch(setTheme(saved))
                } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                    dispatch(setTheme(prefersDark ? 'dark' : 'light'))
                }
            } catch {
                dispatch(setTheme('dark'))
            }
        }

        initializeTheme()
    }, [dispatch])

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
    }, [theme])

    return <>{children}</>
}

export default ThemeProvider

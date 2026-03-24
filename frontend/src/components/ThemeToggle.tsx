"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '@/store/slices/themeSlice'
import type { RootState } from '@/store/store'

export function ThemeToggle() {
    const dispatch = useDispatch()
    const theme = useSelector((state: RootState) => state.theme.theme)
    const resolvedDark =
        theme === "dark" ||
        (theme === "system" &&
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)

    const handleToggleTheme = () => {
        dispatch(toggleTheme())
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleTheme}
            className="h-9 w-9 border rounded-full border-zinc-300/80 dark:border-zinc-700/80 cursor-pointer disabled:cursor-pointer"
            data-testid="theme-toggle-btn"
        >
            {!resolvedDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export default ThemeToggle



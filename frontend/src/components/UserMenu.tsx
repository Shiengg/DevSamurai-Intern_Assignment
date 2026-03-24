import {
    ChevronRight,
    ExternalLink,
    Laptop,
    Moon,
    Sun,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useRef, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { RootState } from '@/store/store'
import { setTheme } from '@/store/slices/themeSlice'
import type { ThemePreference } from '@/store/slices/themeSlice'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface UserMenuProps {
    width: number | undefined
    leftOffset?: number
    userDisplayName: string
    userEmail?: string
    onRename: () => void
    onSignOut: () => void
    onClose?: () => void
    triggerRef?: React.RefObject<HTMLElement | null>
}

export function UserMenu({
    width,
    leftOffset = 0,
    onRename,
    onSignOut,
    userDisplayName,
    userEmail,
    onClose,
    triggerRef,
}: UserMenuProps) {
    const dispatch = useDispatch()
    const theme = useSelector((state: RootState) => state.theme.theme)
    const menuRef = useRef<HTMLDivElement>(null)
    const [themeSubOpen, setThemeSubOpen] = useState(false)
    const style: CSSProperties = { width, left: leftOffset }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (menuRef.current && !menuRef.current.contains(target)) {
                if (triggerRef?.current && triggerRef.current.contains(target)) {
                    return
                }
                onClose?.()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose, triggerRef])

    const itemRow =
        'flex w-full items-center px-3 py-2 text-left text-sm text-gray-900 transition-colors dark:text-white rounded-md'
    const itemHover = 'hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A]'
    const themeOptionActive = (t: ThemePreference) =>
        theme === t
            ? 'bg-[#F3F4F6] dark:bg-[#262626]'
            : ''

    return (
        <div
            ref={menuRef}
            className="absolute z-[200] bottom-full mb-2 max-h-[calc(100vh-2rem)] overflow-visible rounded-lg border border-[#E5E7EB] bg-white shadow-lg box-border dark:border-[#2A2A2A] dark:bg-[#181818] dark:shadow-xl dark:shadow-black/40"
            style={style}
            role="menu"
        >
            {(userDisplayName || userEmail) && (
                <div className="px-3 py-2.5">
                    {userDisplayName && (
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {userDisplayName}
                        </div>
                    )}
                    {userEmail && (
                        <div className="mt-0.5 truncate text-xs font-normal text-gray-500 dark:text-[#A1A1AA]">
                            {userEmail}
                        </div>
                    )}
                </div>
            )}

            <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

            <div className="p-1">
                <button
                    type="button"
                    role="menuitem"
                    className={cn(itemRow, itemHover, 'gap-2')}
                    onClick={onRename}
                    data-testid="rename-user-btn"
                >
                    <span>Profile</span>
                </button>
                <button
                    type="button"
                    role="menuitem"
                    className={cn(itemRow, itemHover, 'gap-2')}
                    onClick={() => { }}
                >
                    <span>Command Menu</span>
                </button>
            </div>

            <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

            <div className="p-1">
                <div
                    className="relative"
                    onMouseEnter={() => setThemeSubOpen(true)}
                    onMouseLeave={() => setThemeSubOpen(false)}
                >
                    <div
                        className={cn(
                            itemRow,
                            itemHover,
                            'cursor-default justify-between gap-2',
                            themeSubOpen && 'bg-[#F3F4F6] dark:bg-[#2A2A2A]'
                        )}
                        role="menuitem"
                        aria-haspopup="menu"
                        aria-expanded={themeSubOpen}
                    >
                        <span>Theme</span>
                        <ChevronRight
                            className="size-4 shrink-0 text-gray-400 dark:text-neutral-500"
                            aria-hidden
                        />
                    </div>

                    <div
                        className={cn(
                            'absolute left-full top-0 z-[250] -ml-1 pl-2 pb-10 pt-0',
                            !themeSubOpen && 'pointer-events-none invisible'
                        )}
                        role="presentation"
                    >
                        <div
                            className="min-w-[11.5rem] rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg dark:border-[#2A2A2A] dark:bg-[#181818]"
                            role="menu"
                        >
                            <button
                                type="button"
                                role="menuitem"
                                className={cn(
                                    itemRow,
                                    itemHover,
                                    'gap-2.5',
                                    themeOptionActive('system')
                                )}
                                onClick={() => dispatch(setTheme('system'))}
                                data-testid="system-theme-btn"
                            >
                                <Laptop
                                    className="size-4 shrink-0 text-gray-600 dark:text-neutral-400"
                                    strokeWidth={1.75}
                                />
                                <span>System</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={cn(itemRow, itemHover, 'gap-2.5', themeOptionActive('light'))}
                                onClick={() => dispatch(setTheme('light'))}
                                data-testid="light-theme-btn"
                            >
                                <Sun
                                    className="size-4 shrink-0 text-gray-600 dark:text-neutral-400"
                                    strokeWidth={1.75}
                                />
                                <span>Light</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                className={cn(itemRow, itemHover, 'gap-2.5', themeOptionActive('dark'))}
                                onClick={() => dispatch(setTheme('dark'))}
                                data-testid="dark-theme-btn"
                            >
                                <Moon
                                    className="size-4 shrink-0 text-gray-600 dark:text-neutral-400"
                                    strokeWidth={1.75}
                                />
                                <span>Dark</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

            <div className="p-1">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        itemRow,
                        itemHover,
                        'justify-between gap-2 font-normal no-underline'
                    )}
                    role="menuitem"
                >
                    <span>Homepage</span>
                    <ExternalLink
                        className="size-4 shrink-0 text-gray-400 dark:text-neutral-500"
                        strokeWidth={1.75}
                        aria-hidden
                    />
                </a>
            </div>

            <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

            <div className="p-1">
                <button
                    type="button"
                    role="menuitem"
                    className={cn(itemRow, itemHover, 'gap-2')}
                    onClick={onSignOut}
                    data-testid="signout-btn"
                >
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    )
}

export default UserMenu

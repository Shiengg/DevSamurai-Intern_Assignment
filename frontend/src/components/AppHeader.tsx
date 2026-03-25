import { ChevronRight, PanelLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { useSidebar } from '@/components/ui/sidebar'
import type { RootState } from '@/store/store'

export default function AppHeader() {
    const { toggleSidebar } = useSidebar()
    const navigate = useNavigate()
    const orgName = useSelector((s: RootState) => s.organization.name)

    return (
        <header className="flex shrink-0 items-center gap-2 border-b border-[#E5E7EB] bg-white py-2 pr-[max(0.75rem,env(safe-area-inset-right,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] sm:gap-3 sm:px-4 dark:border-[#27272A] dark:bg-[#0a0a0a]">
            <button
                type="button"
                aria-label="Toggle sidebar"
                onClick={toggleSidebar}
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#9CA3AF] transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-300"
                data-testid="sidebar-toggle-btn"
            >
                <PanelLeft className="size-[18px]" strokeWidth={1.5} />
            </button>

            <div
                className="h-4 w-px shrink-0 bg-[#E5E7EB] dark:bg-[#3F3F46]"
                aria-hidden
            />

            <nav
                className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-[12px] leading-none [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1.5 sm:text-[13px] [&::-webkit-scrollbar]:hidden"
                aria-label="Breadcrumb"
            >
                <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="shrink-0 text-[#9CA3AF] transition-colors hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                    Home
                </button>
                <ChevronRight
                    className="size-3 shrink-0 text-[#9CA3AF] sm:size-3.5 dark:text-neutral-500"
                    strokeWidth={2}
                    aria-hidden
                />
                <span className="max-w-[min(42vw,9rem)] min-w-0 shrink truncate text-[#9CA3AF] sm:max-w-[11rem] md:max-w-none dark:text-neutral-500">
                    {orgName || 'Organization'}
                </span>
                <ChevronRight
                    className="size-3 shrink-0 text-[#9CA3AF] sm:size-3.5 dark:text-neutral-500"
                    strokeWidth={2}
                    aria-hidden
                />
                <span
                    className="shrink-0 truncate font-medium text-[#111827] dark:text-neutral-100"
                    aria-current="page"
                >
                    Dashboard
                </span>
            </nav>
        </header>
    )
}

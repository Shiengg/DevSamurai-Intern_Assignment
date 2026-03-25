import { useMemo, useState, useEffect, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
    Home,
    LayoutDashboard,
    Monitor,
    Search,
    Shield,
    Sparkles,
    User,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { postDashboardDemoSeed } from '@/services/dashboardService'

type CommandIcon = ComponentType<{ className?: string; strokeWidth?: number }>

type CommandItem = {
    id: string
    title: string
    keywords?: string
    icon: CommandIcon
    /** sync actions only; async handled in runItem */
    onSelect: () => void | Promise<void>
}

type CommandGroup = { label: string; items: CommandItem[] }

export interface CommandMenuDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CommandMenuDialog({ open, onOpenChange }: CommandMenuDialogProps) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [query, setQuery] = useState('')
    const [seedLoading, setSeedLoading] = useState(false)
    const [seedMessage, setSeedMessage] = useState<string | null>(null)
    const [seedError, setSeedError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) {
            setQuery('')
            setSeedMessage(null)
            setSeedError(null)
            setSeedLoading(false)
        }
    }, [open])

    const groups: CommandGroup[] = useMemo(
        () => [
            {
                label: 'Account',
                items: [
                    {
                        id: 'home',
                        title: 'Home',
                        icon: Home,
                        onSelect: () => {
                            navigate('/dashboard')
                            onOpenChange(false)
                        },
                    },
                    {
                        id: 'profile',
                        title: 'Profile',
                        keywords: 'user account',
                        icon: User,
                        onSelect: () => {
                            navigate('/dashboard')
                            onOpenChange(false)
                        },
                    },
                    {
                        id: 'security',
                        title: 'Security',
                        icon: Shield,
                        onSelect: () => {
                            navigate('/dashboard')
                            onOpenChange(false)
                        },
                    },
                    {
                        id: 'sessions',
                        title: 'Sessions',
                        keywords: 'devices',
                        icon: Monitor,
                        onSelect: () => {
                            navigate('/dashboard')
                            onOpenChange(false)
                        },
                    },
                ],
            },
            {
                label: 'Organization',
                items: [
                    {
                        id: 'dashboard',
                        title: 'Dashboard',
                        icon: LayoutDashboard,
                        onSelect: () => {
                            navigate('/dashboard')
                            onOpenChange(false)
                        },
                    },
                ],
            },
            {
                label: 'Data',
                items: [
                    {
                        id: 'generate-data',
                        title: 'Generate Data',
                        keywords: 'seed demo dummy sample',
                        icon: Sparkles,
                        onSelect: () => {},
                    },
                ],
            },
        ],
        [navigate, onOpenChange],
    )

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return groups
        return groups
            .map((g) => ({
                ...g,
                items: g.items.filter((item) => {
                    const hay = `${item.title} ${item.keywords ?? ''}`.toLowerCase()
                    return hay.includes(q)
                }),
            }))
            .filter((g) => g.items.length > 0)
    }, [groups, query])

    const runItem = async (item: CommandItem) => {
        if (item.id === 'generate-data') {
            setSeedError(null)
            setSeedMessage(null)
            setSeedLoading(true)
            try {
                const res = await postDashboardDemoSeed()
                setSeedMessage(`Regenerated ${res.daysSeeded} days of demo data.`)
                await queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] })
            } catch (e) {
                setSeedMessage(null)
                setSeedError(e instanceof Error ? e.message : 'Could not generate data.')
            } finally {
                setSeedLoading(false)
            }
            return
        }
        await Promise.resolve(item.onSelect())
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="max-h-[min(32rem,calc(100vh-2rem))] w-[min(28rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-none"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogTitle className="sr-only">Command menu</DialogTitle>
                <DialogDescription className="sr-only">
                    Search commands and navigate or regenerate demo dashboard data.
                </DialogDescription>

                <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                    <Search
                        className="size-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden
                    />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search…"
                        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                <div className="max-h-[min(22rem,50vh)] overflow-y-auto px-1 py-2">
                    {filtered.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No commands match your search.
                        </p>
                    ) : (
                        filtered.map((group) => (
                            <div key={group.label} className="mb-3 last:mb-0">
                                <div className="px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                                    {group.label}
                                </div>
                                <ul className="space-y-0.5" role="listbox">
                                    {group.items.map((item) => {
                                        const Icon = item.icon
                                        return (
                                            <li key={item.id} role="presentation">
                                                <button
                                                    type="button"
                                                    role="option"
                                                    disabled={item.id === 'generate-data' && seedLoading}
                                                    className={cn(
                                                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors',
                                                        'hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none',
                                                        'disabled:pointer-events-none disabled:opacity-60',
                                                        'dark:hover:bg-white/10',
                                                    )}
                                                    onClick={() => void runItem(item)}
                                                >
                                                    <Icon
                                                        className="size-4 shrink-0 text-muted-foreground"
                                                        strokeWidth={1.75}
                                                    />
                                                    <span className="min-w-0 flex-1 truncate">
                                                        {item.title}
                                                    </span>
                                                    {item.id === 'generate-data' && seedLoading ? (
                                                        <span className="text-xs text-muted-foreground">
                                                            Working…
                                                        </span>
                                                    ) : null}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

                {(seedMessage || seedError) && (
                    <div
                        className={cn(
                            'border-t px-3 py-2.5 text-xs',
                            seedError
                                ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                : 'border-border bg-muted/40 text-muted-foreground',
                        )}
                    >
                        {seedError ?? seedMessage}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

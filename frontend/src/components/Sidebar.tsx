import { Button } from '@/components/ui/button'
import {
    Bot,
    Building2,
    ChevronsDownUp,
    ChevronsUpDown,
    Coins,
    CreditCard,
    LayoutGrid,
    MoreHorizontal,
    Settings,
    UserSearch,
    Users,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import OrgMenu from '@/components/OrigiMenu'
import UserMenu from '@/components/UserMenu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar'
import type { RootState } from '@/store/store'
import { setOrganizationName } from '@/store/slices/organizationSlice'
import { setUserDisplay, setUser } from '@/feature/auth/authSlice'
import { createOrganizationSchema, renameUserSchema, type CreateOrganizationForm, type RenameUserForm } from '@/schemas/formSchemas'
import { cn } from '@/lib/utils'

const navIconClass =
    'size-[18px] shrink-0 text-[#1A1A1A] dark:text-neutral-200'

function NavRow({
    icon: Icon,
    label,
    active,
    isCollapsed,
    onClick,
}: {
    icon: ComponentType<{ className?: string; strokeWidth?: number }>
    label: string
    active: boolean
    isCollapsed: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full min-w-0 items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-zinc-600',
                active
                    ? 'bg-[#F0F0F0] font-semibold text-[#1A1A1A] dark:bg-[#262626] dark:text-white'
                    : 'font-normal text-[#1A1A1A] hover:bg-[#F0F0F0]/70 dark:text-neutral-200 dark:hover:bg-[#2A2A2A]',
                isCollapsed && 'justify-center px-0'
            )}
        >
            <Icon
                className={cn(
                    navIconClass,
                    active && 'text-[#1A1A1A] dark:text-white'
                )}
                strokeWidth={1.75}
            />
            {!isCollapsed && (
                <span className="min-w-0 flex-1 truncate">{label}</span>
            )}
        </button>
    )
}

export default function Sidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { state } = useSidebar()
    const isCollapsed = state === 'collapsed'

    const orgName = useSelector((state: RootState) => state.organization.name)
    const user = useSelector((state: RootState) => state.auth.user)

    const [menuOpen, setMenuOpen] = useState(false)
    const [createOrgOpen, setCreateOrgOpen] = useState(false)
    const orgBtnRef = useRef<HTMLButtonElement | null>(null)
    const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined)

    const createOrgForm = useForm<CreateOrganizationForm>({
        resolver: zodResolver(createOrganizationSchema),
        defaultValues: {
            name: orgName
        }
    })

    useLayoutEffect(() => {
        if (menuOpen && orgBtnRef.current) {
            const width = isCollapsed ? 200 : orgBtnRef.current.getBoundingClientRect().width
            setMenuWidth(width)
        }
    }, [menuOpen, orgName, isCollapsed])

    useEffect(() => {
        if (!menuOpen) return
        const onResize = () => {
            if (orgBtnRef.current) {
                const width = isCollapsed ? 200 : orgBtnRef.current.getBoundingClientRect().width
                setMenuWidth(width)
            }
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [menuOpen, isCollapsed])

    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const userBtnRef = useRef<HTMLButtonElement | null>(null)
    const [userMenuWidth, setUserMenuWidth] = useState<number | undefined>(undefined)
    const [userRenameOpen, setUserRenameOpen] = useState(false)

    const userForm = useForm<RenameUserForm>({
        resolver: zodResolver(renameUserSchema),
        defaultValues: {
            display: user?.displayName || ''
        }
    })

    useLayoutEffect(() => {
        if (userMenuOpen && userBtnRef.current) {

            const width = isCollapsed ? 200 : userBtnRef.current.getBoundingClientRect().width
            setUserMenuWidth(width)
        }
    }, [userMenuOpen, user?.displayName, isCollapsed])

    useEffect(() => {
        if (!userMenuOpen) return
        const onResize = () => {
            if (userBtnRef.current) {
                const width = isCollapsed ? 200 : userBtnRef.current.getBoundingClientRect().width
                setUserMenuWidth(width)
            }
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [userMenuOpen, isCollapsed])

    // Load cached user info from localStorage if Redux state is empty
    useEffect(() => {
        // Only try to load cached data if  don't have user data in Redux yet
        if (!user?.email) {
            try {
                const cachedUserStr = localStorage.getItem('user')
                if (cachedUserStr) {
                    const cached = JSON.parse(cachedUserStr)
                    // Only use cached data if it has the essential fields
                    if (cached?.email && cached?.name) {
                        dispatch(setUser({
                            id: cached.id,
                            name: cached.name,
                            email: cached.email
                        }))
                    }
                }
            } catch {
                // Ignore localStorage errors and let Dashboard handle the API call
            }
        }
    }, [dispatch, user?.email])

    // Auto-close menus when sidebar state changes
    useEffect(() => {
        setMenuOpen(false)
        setUserMenuOpen(false)
    }, [isCollapsed])

    // Form handlers
    const handleCreateOrganization = (data: CreateOrganizationForm) => {
        dispatch(setOrganizationName(data.name))
        setCreateOrgOpen(false)
        createOrgForm.reset({ name: data.name })
    }

    const handleUserRename = (data: RenameUserForm) => {
        dispatch(setUserDisplay(data.display))
        setUserRenameOpen(false)
        userForm.reset({ display: data.display })
    }

    // Update form default values when Redux state changes
    useEffect(() => {
        createOrgForm.reset({ name: orgName })
    }, [orgName, createOrgForm])

    useEffect(() => {
        if (user?.displayName) {
            userForm.reset({ display: user.displayName })
        }
    }, [user?.displayName, userForm])

    return (
        <ShadcnSidebar
            collapsible="icon"
            className="overflow-visible border-r border-[#EAEAEA] bg-[#F9F9F9] dark:border-sidebar-border dark:bg-sidebar [&_[data-slot=sidebar-inner]]:bg-[#F9F9F9] dark:[&_[data-slot=sidebar-inner]]:bg-sidebar"
        >
            <SidebarHeader className="px-4 pt-2 pb-4">
                <div className="relative">
                    <button
                        ref={orgBtnRef}
                        className={`w-full h-12 flex items-center rounded-md px-2 text-foreground hover:bg-secondary/40 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                        onClick={() => {
                            setMenuOpen((v) => !v)
                            if (userMenuOpen) setUserMenuOpen(false)
                        }}
                    >
                        {isCollapsed ? (
                            /* Collapsed mode - show only logo */
                            <Building2 size={20} className="text-foreground" />
                        ) : (
                            /* Expanded mode - show logo, name, and chevron */
                            <>
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Building2 size={20} className="text-foreground flex-shrink-0" />
                                    <span className="font-medium truncate">{orgName}</span>
                                </div>
                                <div className="flex-shrink-0">
                                    {menuOpen ? (
                                        <ChevronsDownUp size={16} className="text-gray-400" />
                                    ) : (
                                        <ChevronsUpDown size={16} className="text-gray-400" />
                                    )}
                                </div>
                            </>
                        )}
                    </button>
                    {menuOpen && (
                        <OrgMenu
                            width={menuWidth}
                            onCreate={() => {
                                createOrgForm.reset({ name: orgName })
                                setCreateOrgOpen(true)
                                setMenuOpen(false)
                            }}
                            onClose={() => setMenuOpen(false)}
                            triggerRef={orgBtnRef}
                        />
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="">
                <SidebarGroup className="gap-0">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 h-auto px-2 py-1 text-xs font-semibold tracking-normal text-[#888888] dark:text-neutral-500">
                            Application
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <div className="flex flex-col gap-0.5">
                            <NavRow
                                icon={LayoutGrid}
                                label="Dashboard"
                                active={pathname === '/dashboard'}
                                isCollapsed={isCollapsed}
                                onClick={() => navigate('/dashboard')}
                            />
                            <NavRow
                                icon={UserSearch}
                                label="Leads"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                            <NavRow
                                icon={Bot}
                                label="AI Chatbot"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-1 gap-0">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 h-auto px-2 py-1 text-xs font-semibold tracking-normal text-[#888888] dark:text-neutral-500">
                            Settings
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <div className="flex flex-col gap-0.5">
                            <NavRow
                                icon={Settings}
                                label="General"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                            <NavRow
                                icon={Users}
                                label="Members"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                            <NavRow
                                icon={CreditCard}
                                label="Subscription"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                            <NavRow
                                icon={Coins}
                                label="Credits"
                                active={false}
                                isCollapsed={isCollapsed}
                                onClick={() => {}}
                            />
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 space-y-2">


                {/* User control trigger */}
                <div className="relative">
                    <button
                        ref={userBtnRef}
                        className={`w-full flex items-center gap-2 rounded-md px-2 py-2 text-foreground hover:bg-secondary/40 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                        onClick={() => {
                            setUserMenuOpen(v => !v)
                            if (menuOpen) setMenuOpen(false)
                        }}
                    >
                        {isCollapsed ? (
                            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs">{user?.initials || 'US'}</div>
                        ) : (
                            <>
                                <span className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-xs">{user?.initials || 'US'}</div>
                                    <span className="text-sm font-medium truncate text-foreground">{user?.displayName || 'User'}</span>
                                </span>
                                <MoreHorizontal size={16} className="text-muted-foreground" />
                            </>
                        )}
                    </button>
                    {userMenuOpen && (
                        <UserMenu
                            width={userMenuWidth}
                            leftOffset={0}
                            userDisplayName={user?.displayName || 'User'}
                            userEmail={user?.email}
                            onRename={() => {
                                userForm.reset({ display: user?.displayName || 'User' })
                                setUserRenameOpen(true)
                                setUserMenuOpen(false)
                            }}
                            onSignOut={() => { try { localStorage.removeItem('token') } catch { /* ignore */ }; navigate('/auth/sign-in') }}
                            onClose={() => setUserMenuOpen(false)}
                            triggerRef={userBtnRef}
                        />
                    )}
                </div>
            </SidebarFooter>

            {/* Create Organization Dialog */}
            <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
                <DialogContent className="w-full max-w-[560px] gap-6 rounded-xl border border-gray-200 bg-white p-8 shadow-lg ring-black/5 sm:max-w-[560px] dark:border-[#3F3F46] dark:bg-[#121212] dark:text-white dark:shadow-2xl dark:shadow-black/60 dark:ring-white/10">
                    <DialogHeader className="gap-2 text-left">
                        <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create Organization</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 dark:text-[#A1A1AA]">
                            You can add members after creating the organization.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...createOrgForm}>
                        <form onSubmit={createOrgForm.handleSubmit(handleCreateOrganization)} className="space-y-4">
                            <FormField
                                control={createOrgForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="gap-2">
                                        <FormLabel className="text-sm font-semibold text-gray-900 dark:text-white">Organization Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Organization name"
                                                className="h-10 w-full rounded-lg border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-gray-300 dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-white dark:placeholder:text-neutral-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-600/40"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs text-gray-500 dark:text-[#A1A1AA]">
                                            Your organization name should be unique and descriptive
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-[#3F3F46] dark:bg-transparent dark:text-white dark:hover:bg-[#27272A]"
                                    onClick={() => setCreateOrgOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-neutral-950 font-semibold text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                >
                                    Create Organization
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* User rename dialog */}
            <Dialog open={userRenameOpen} onOpenChange={setUserRenameOpen}>
                <DialogContent className="bg-sidebar border-sidebar-border">
                    <DialogHeader>
                        <DialogTitle>Rename</DialogTitle>
                        <DialogDescription>Set a display name for your account on this device.</DialogDescription>
                    </DialogHeader>
                    <Form {...userForm}>
                        <form onSubmit={userForm.handleSubmit(handleUserRename)} className="space-y-3">
                            <FormField
                                control={userForm.control}
                                name="display"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Your display name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setUserRenameOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </ShadcnSidebar>
    )
}
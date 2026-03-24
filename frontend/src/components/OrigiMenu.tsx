import { Check, Plus, Search, User } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useSelector } from 'react-redux'

import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { RootState } from '@/store/store'

interface OrigiMenuProps {
  width: number | undefined
  onCreate: () => void
  leftOffset?: number
  onClose?: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
}

type ActiveSpace = 'personal' | 'organization'

export function OrigiMenu({
  width,
  onCreate,
  leftOffset = 0,
  onClose,
  triggerRef,
}: OrigiMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const orgName = useSelector((s: RootState) => s.organization.name)
  const [search, setSearch] = useState('')
  const [activeSpace, setActiveSpace] = useState<ActiveSpace>('organization')

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

  const orgInitial = (orgName?.trim()?.[0] ?? 'O').toUpperCase()
  const orgCount = 1

  const rowBase =
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-gray-900 transition-colors dark:text-white'
  const rowInactive = 'hover:bg-[#F3F4F6] dark:hover:bg-[#2A2A2A]'
  const rowActive = 'bg-[#F3F4F6] dark:bg-[#262626]'

  return (
    <div
      ref={menuRef}
      className="absolute z-10 mt-2 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-md border border-[#E5E7EB] bg-white shadow-lg box-border dark:border-[#2A2A2A] dark:bg-[#181818] dark:shadow-xl dark:shadow-black/40"
      style={style}
    >
      {/* Search */}
      <div className="px-1 pt-1">
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-2.5 size-[15px] text-gray-400 dark:text-neutral-400"
            strokeWidth={1.75}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-9 border-0 bg-transparent pl-9 pr-3 text-sm shadow-none placeholder:text-gray-400 focus-visible:ring-0 dark:placeholder:text-neutral-500 dark:text-white"
            aria-label="Search organizations"
          />
        </div>
      </div>

      <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

      {/* Personal */}
      <div className="px-1 py-1">
        <button
          type="button"
          className={`${rowBase} ${activeSpace === 'personal' ? rowActive : rowInactive}`}
          onClick={() => setActiveSpace('personal')}
        >
          <User className="size-[15px] shrink-0 text-gray-700 dark:text-neutral-200" strokeWidth={1.75} />
          <span>Personal</span>
        </button>
      </div>

      <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

      {/* Organizations */}
      <div className="px-1 pb-1">
        <p className="px-1 py-2 text-xs font-medium text-[#6B7280] dark:text-[#808080]">
          Your Organizations ({orgCount})
        </p>
        <button
          type="button"
          className={`${rowBase} w-full justify-between ${activeSpace === 'organization' ? rowActive : rowInactive}`}
          onClick={() => setActiveSpace('organization')}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs font-medium text-gray-700 dark:bg-neutral-700 dark:text-white">
              {orgInitial}
            </span>
            <span className="truncate">{orgName || 'Organization'}</span>
          </span>
          {activeSpace === 'organization' && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3B82F6]">
              <Check className="size-2.5 text-white" strokeWidth={3} />
            </span>
          )}
        </button>
      </div>

      <Separator className="bg-[#E5E7EB] dark:bg-[#2A2A2A]" />

      {/* Create */}
      <div className="p-1.5">
        <button
          type="button"
          className={`${rowBase} ${rowInactive}`}
          onClick={onCreate}
          data-testid="create-org-btn"
        >
          <Plus className="size-[15px] shrink-0 text-gray-900 dark:text-white" strokeWidth={2} />
          <span>Create an Organization</span>
        </button>
      </div>
    </div>
  )
}

export default OrigiMenu

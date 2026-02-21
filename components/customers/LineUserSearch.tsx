'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getRecentLineUsers, searchLineUsers, LineUser } from '@/actions/line'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LineUserSearchProps {
    onSelect: (user: LineUser) => void
    className?: string
}

export function LineUserSearch({ onSelect, className }: LineUserSearchProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [data, setData] = React.useState<LineUser[]>([])
    const [loading, setLoading] = React.useState(false)

    // Debounce query
    const debouncedQuery = useDebounce(query, 300)

    // Initial load for recent users
    React.useEffect(() => {
        if (!open) return

        async function fetchInitial() {
            setLoading(true)
            const recents = await getRecentLineUsers()
            setData(recents)
            setLoading(false)
        }

        if (!query) fetchInitial()
    }, [open, query])

    // Search effect
    React.useEffect(() => {
        if (!debouncedQuery) return

        async function fetchSearch() {
            setLoading(true)
            const results = await searchLineUsers(debouncedQuery)
            setData(results)
            setLoading(false)
        }

        fetchSearch()
    }, [debouncedQuery])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-between", className)}>
                    <span className="flex items-center gap-2 truncate">
                        <MessageCircle className="w-4 h-4 text-[#06C755]" />
                        {query || "เลือกจาก LINE..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search LINE users..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && data.length === 0 && (
                            <CommandEmpty>No LINE users found.</CommandEmpty>
                        )}
                        {!loading && data.length > 0 && (
                            <CommandGroup heading={query ? "Search Results" : "Recent Active Users"}>
                                {data.map((user) => (
                                    <CommandItem
                                        key={user.line_user_id}
                                        value={user.display_name}
                                        onSelect={() => {
                                            onSelect(user)
                                            setOpen(false)
                                            setQuery('')
                                        }}
                                        className="gap-3"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.picture_url || ''} />
                                            <AvatarFallback>{user.display_name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.display_name}</span>
                                            {user.status_message && (
                                                <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                                    {user.status_message}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

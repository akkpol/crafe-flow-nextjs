'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
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
import { searchCustomers, CustomerRow } from '@/actions/customers'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface CustomerSearchProps {
    onSelect: (customer: CustomerRow) => void
    className?: string
}

export function CustomerSearch({ onSelect, className }: CustomerSearchProps) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState('')
    const [data, setData] = React.useState<CustomerRow[]>([])
    const [loading, setLoading] = React.useState(false)

    // Debounce query to prevent too many requests
    const debouncedQuery = useDebounce(query, 300)

    React.useEffect(() => {
        async function fetchCustomers() {
            if (!debouncedQuery) {
                setData([])
                return
            }

            setLoading(true)
            try {
                const results = await searchCustomers(debouncedQuery)
                setData(results || [])
            } catch (error) {
                console.error('Failed to search customers', error)
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchCustomers()
    }, [debouncedQuery])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal text-muted-foreground", className)}
                >
                    {query ? query : "ค้นหาลูกค้าเก่า (ชื่อ / เบอร์ / ใบกำกับภาษี)..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="พิมพ์เพื่อค้นหา..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!loading && data.length === 0 && debouncedQuery && (
                            <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
                        )}
                        {!loading && data.length > 0 && (
                            <CommandGroup heading="ผลการค้นหา">
                                {data.map((customer) => (
                                    <CommandItem
                                        key={customer.id}
                                        value={customer.id}
                                        onSelect={() => {
                                            onSelect(customer)
                                            setOpen(false)
                                            setQuery('') // Clear search or keep name? ideally keep name but logic is complex
                                        }}
                                        className="flex flex-col items-start gap-1 py-3"
                                    >
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            {customer.phone && <span>📞 {customer.phone}</span>}
                                            {customer.taxId && <span>🆔 {customer.taxId}</span>}
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

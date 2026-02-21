'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Columns3, PlusCircle, Package, Receipt, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'หน้าแรก', icon: LayoutDashboard },
    { href: '/customers', label: 'ลูกค้า', icon: Users },
    { href: '/jobs/new', label: 'เพิ่ม', icon: PlusCircle },
    { href: '/kanban', label: 'งาน', icon: Columns3 },
    { href: '/stock', label: 'สต็อก', icon: Package },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
            <div className="flex items-center justify-around px-2 py-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    const isAdd = item.href === '/jobs/new'

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all touch-target',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                                isAdd && !isActive && 'text-primary'
                            )}
                        >
                            <div className={cn(
                                'flex items-center justify-center rounded-xl transition-all',
                                isAdd && 'bg-primary text-primary-foreground p-2.5 -mt-5 shadow-lg shadow-primary/30',
                                isActive && !isAdd && 'bg-primary/10 p-1.5 rounded-lg'
                            )}>
                                <Icon className={cn(isAdd ? 'w-6 h-6' : 'w-5 h-5')} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={cn(
                                'text-[11px] font-medium',
                                isAdd && 'mt-1'
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

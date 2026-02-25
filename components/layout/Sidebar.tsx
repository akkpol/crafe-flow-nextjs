'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Columns3, PlusCircle, Package, Receipt, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/kanban', label: 'Kanban Board', icon: Columns3 },
    { href: '/jobs/new', label: 'New Job', icon: PlusCircle },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/stock', label: 'Inventory', icon: Package },
    { href: '/billing', label: 'Finance', icon: Receipt },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex flex-col w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center px-6 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2 font-black tracking-tighter text-lg">
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Columns3 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-gradient-cmyk">CraftFlow</span>
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-6 px-4 space-y-1 relative">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Main Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    const isFocus = item.href === '/jobs/new'

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent',
                                isFocus && !isActive && 'text-primary'
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                            )}
                            <Icon className={cn(
                                'w-4 h-4 transition-transform group-hover:scale-110',
                                isActive ? 'text-primary' : (isFocus ? 'text-primary' : '')
                            )} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="font-semibold text-sm tracking-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-border/50">
                <Link
                    href="/settings/organization"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        pathname.startsWith('/settings')
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                    )}
                >
                    <Settings className="w-4 h-4" />
                    <span className="font-semibold text-sm tracking-tight">Settings</span>
                </Link>

                {/* User Profile Hooked to DB ideally, simulated here */}
                <div className="mt-4 flex items-center gap-3 px-2 py-2 rounded-xl bg-card border border-border/50 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                        AK
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">Akkapol K.</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

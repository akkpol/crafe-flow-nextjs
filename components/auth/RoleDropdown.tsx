'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateRole } from '@/actions/auth'
import { ChevronDown, Loader2 } from 'lucide-react'

const ROLES = [
    { name: 'admin', label: 'Admin', description: 'จัดการได้ทุกอย่าง' },
    { name: 'manager', label: 'Manager', description: 'จัดการออเดอร์ บิล สต็อก' },
    { name: 'staff', label: 'Staff', description: 'ดูและอัพเดทออเดอร์ สต็อก' },
    { name: 'viewer', label: 'Viewer', description: 'ดูได้อย่างเดียว' },
]

interface RoleDropdownProps {
    userId: string
    currentRole: string | null
}

export function RoleDropdown({ userId, currentRole }: RoleDropdownProps) {
    const [isPending, startTransition] = useTransition()

    const handleRoleChange = (roleName: string) => {
        startTransition(async () => {
            const result = await updateRole(userId, roleName)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(`เปลี่ยน Role เป็น "${roleName}" สำเร็จ`)
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 h-8 text-xs"
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <>เปลี่ยน Role <ChevronDown className="h-3 w-3" /></>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">เลือก Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLES.map((role) => (
                    <DropdownMenuItem
                        key={role.name}
                        onClick={() => handleRoleChange(role.name)}
                        className="flex flex-col items-start gap-0.5 cursor-pointer"
                        disabled={currentRole === role.name}
                    >
                        <span className="font-medium text-sm">{role.label}</span>
                        <span className="text-xs text-muted-foreground">{role.description}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

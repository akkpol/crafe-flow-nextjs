'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShieldX } from 'lucide-react'

export function AccessDeniedToast() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const denied = searchParams.get('access_denied')

    useEffect(() => {
        if (denied) {
            const messages: Record<string, string> = {
                admin: 'คุณไม่มีสิทธิ์เข้าถึงหน้าผู้ดูแลระบบ (Admin only)',
                manager: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Manager+ only)',
                '1': 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้',
            }
            toast.error(messages[denied] ?? 'ไม่มีสิทธิ์เข้าถึง', {
                icon: <ShieldX className="h-4 w-4" />,
                duration: 5000,
            })

            // Clean the URL
            const url = new URL(window.location.href)
            url.searchParams.delete('access_denied')
            router.replace(url.pathname + (url.search ? url.search : ''))
        }
    }, [denied])

    return null
}

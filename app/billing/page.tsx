'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
    FileText,
    Receipt,
    Search,
    Plus,
    ChevronRight,
    CheckCircle2,
    Clock,
    XCircle,
    Banknote,
    ArrowRight,
} from 'lucide-react'

type DocType = 'quotation' | 'invoice'
type DocStatus = 'draft' | 'sent' | 'approved' | 'paid' | 'cancelled'

interface BillingDoc {
    id: string
    docNumber: string
    type: DocType
    customer: string
    items: string
    total: number
    status: DocStatus
    createdAt: string
}

const statusConfig: Record<DocStatus, { label: string; icon: React.ReactNode; color: string }> = {
    draft: { label: 'ร่าง', icon: <FileText className="w-3 h-3" />, color: 'bg-muted text-muted-foreground' },
    sent: { label: 'ส่งแล้ว', icon: <ArrowRight className="w-3 h-3" />, color: 'bg-cyan-100 text-cyan-700' },
    approved: { label: 'อนุมัติ', icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-emerald-100 text-emerald-700' },
    paid: { label: 'จ่ายแล้ว', icon: <Banknote className="w-3 h-3" />, color: 'bg-fuchsia-100 text-fuchsia-700' },
    cancelled: { label: 'ยกเลิก', icon: <XCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-700' },
}

// Demo data
const demoDocs: BillingDoc[] = [
    { id: '1', docNumber: 'QT-2026-001', type: 'quotation', customer: 'คุณสมชาย', items: 'ป้ายหน้าร้าน ABC Cafe', total: 15000, status: 'approved', createdAt: '2026-02-15' },
    { id: '2', docNumber: 'QT-2026-002', type: 'quotation', customer: 'บ.XYZ', items: 'ป้ายไวนิลงานเปิดตัว', total: 8500, status: 'sent', createdAt: '2026-02-14' },
    { id: '3', docNumber: 'INV-2026-001', type: 'invoice', customer: 'คุณสมชาย', items: 'ป้ายหน้าร้าน ABC Cafe', total: 15000, status: 'paid', createdAt: '2026-02-16' },
    { id: '4', docNumber: 'QT-2026-003', type: 'quotation', customer: 'คุณมาลี', items: 'ตัวอักษรโลหะ LED', total: 25000, status: 'draft', createdAt: '2026-02-16' },
    { id: '5', docNumber: 'INV-2026-002', type: 'invoice', customer: 'บ.XYZ', items: 'ป้ายไวนิล 3x1.5 ม.', total: 8500, status: 'sent', createdAt: '2026-02-16' },
    { id: '6', docNumber: 'QT-2026-004', type: 'quotation', customer: 'คุณวิชัย', items: 'สติกเกอร์กระจกร้าน', total: 3200, status: 'cancelled', createdAt: '2026-02-13' },
]

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState<'all' | DocType>('all')
    const [search, setSearch] = useState('')

    const filtered = demoDocs.filter(doc => {
        const matchTab = activeTab === 'all' || doc.type === activeTab
        const matchSearch = doc.customer.includes(search) || doc.docNumber.includes(search) || doc.items.includes(search)
        return matchTab && matchSearch
    })

    const totalRevenue = demoDocs.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.total, 0)
    const pendingAmount = demoDocs.filter(d => d.status === 'sent' || d.status === 'approved').reduce((sum, d) => sum + d.total, 0)

    return (
        <div className="space-y-4">
            <PageHeader title="💰 บิล" subtitle="ใบเสนอราคา & ใบแจ้งหนี้">
                <Button size="sm" className="h-9 gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4" />
                    สร้างบิล
                </Button>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 px-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <Banknote className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">฿{totalRevenue.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground">รับแล้วเดือนนี้</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-yellow-500/10">
                                <Clock className="w-4 h-4 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">฿{pendingAmount.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground">รอรับเงิน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาเลขบิล, ชื่อลูกค้า..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-4">
                {[
                    { key: 'all' as const, label: '📋 ทั้งหมด' },
                    { key: 'quotation' as const, label: '📄 ใบเสนอราคา' },
                    { key: 'invoice' as const, label: '🧾 ใบแจ้งหนี้' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-target',
                            activeTab === tab.key
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Document List */}
            <div className="px-4 pb-8 space-y-2">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Receipt className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">ไม่พบเอกสาร</p>
                    </div>
                )}

                {filtered.map((doc) => {
                    const status = statusConfig[doc.status]
                    const isQuotation = doc.type === 'quotation'

                    return (
                        <Card key={doc.id} className="border-0 shadow-sm cursor-pointer active:scale-[0.98] transition-transform">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div className={cn(
                                            'p-2 rounded-lg mt-0.5',
                                            isQuotation ? 'bg-cyan-500/10' : 'bg-fuchsia-500/10'
                                        )}>
                                            {isQuotation
                                                ? <FileText className="w-4 h-4 text-cyan-500" />
                                                : <Receipt className="w-4 h-4 text-fuchsia-500" />
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0">
                                            <p className="text-xs font-mono text-muted-foreground">{doc.docNumber}</p>
                                            <p className="font-medium text-sm truncate mt-0.5">{doc.items}</p>
                                            <p className="text-xs text-muted-foreground">{doc.customer}</p>
                                        </div>
                                    </div>

                                    {/* Price + Status */}
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm">฿{doc.total.toLocaleString()}</p>
                                        <div className={cn(
                                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1',
                                            status.color
                                        )}>
                                            {status.icon}
                                            {status.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions for actionable items */}
                                {(doc.status === 'approved' && doc.type === 'quotation') && (
                                    <>
                                        <Separator className="my-2" />
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
                                                สร้าง Invoice
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                            <Button size="sm" className="flex-1 h-9 text-xs">
                                                เริ่มงาน (Kanban)
                                                <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {(doc.status === 'sent' && doc.type === 'invoice') && (
                                    <>
                                        <Separator className="my-2" />
                                        <Button size="sm" className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700">
                                            <Banknote className="w-3.5 h-3.5 mr-1" />
                                            บันทึกรับเงิน
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

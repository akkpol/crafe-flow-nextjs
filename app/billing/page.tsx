'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Plus,
    Search,
    MoreHorizontal,
    FileText,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { getBillingStats, getRecentDocuments } from '@/actions/billing'

// Define types for strict handling
interface BillingStats {
    toBeInvoiced: number;
    overdue: number;
    paidMonth: number;
}
interface BillingLineItem {
    id: string; // Order Number
    type: 'Quote' | 'Invoice';
    customer: string;
    date: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    amount: number;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    draft: { label: 'ร่าง (Draft)', variant: 'secondary' },
    sent: { label: 'ส่งแล้ว (Sent)', variant: 'default' },
    paid: { label: 'ชำระแล้ว (Paid)', variant: 'outline' },
    overdue: { label: 'เกินกำหนด (Overdue)', variant: 'destructive' },
}

export default function BillingPage() {
    const [stats, setStats] = useState<BillingStats>({ toBeInvoiced: 0, overdue: 0, paidMonth: 0 })
    const [documents, setDocuments] = useState<BillingLineItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const [statsData, docsData] = await Promise.all([
                    getBillingStats(),
                    getRecentDocuments()
                ])
                setStats(statsData)
                setDocuments(docsData)
            } catch (error) {
                console.error('Failed to load billing data', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="💰 บิล & ใบเสนอราคา"
                    subtitle="จัดการเอกสารการเงินและสถานะการชำระเงิน"
                />
                <Button asChild>
                    <Link href="/billing/new">
                        <Plus className="w-4 h-4 mr-2" />
                        สร้างใบเสนอราคา
                    </Link>
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">รอวางบิล / เก็บเงิน</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.toBeInvoiced} งาน</div>
                        <p className="text-xs text-muted-foreground">
                            งานที่ผลิตเสร็จแล้วแต่ยังไม่ได้เงิน
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เกินกำหนดชำระ</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{stats.overdue} รายการ</div>
                        <p className="text-xs text-muted-foreground">
                            กรุณาติดตามลูกค้าโดยด่วน
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ยอดรับเดือนนี้</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.paidMonth} งาน</div>
                        <p className="text-xs text-muted-foreground">
                            (คำนวณจากงานที่สถานะ Done)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>เอกสารล่าสุด</CardTitle>
                    <div className="flex items-center pt-2">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาตามชื่อลูกค้า หรือเลขที่เอกสาร..."
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">เลขที่</TableHead>
                                <TableHead>ประเภท</TableHead>
                                <TableHead>ลูกค้า</TableHead>
                                <TableHead className="hidden md:table-cell">วันที่</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead className="text-right">ยอดเงิน</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            กำลังโหลดข้อมูล...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        ยังไม่มีเอกสารในระบบ
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((doc) => {
                                    const statusConf = statusMap[doc.status] || statusMap.draft
                                    return (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">{doc.id}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{doc.type}</Badge>
                                            </TableCell>
                                            <TableCell>{doc.customer}</TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                                {doc.date}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={statusConf.variant}
                                                    className={doc.status === 'paid' ? 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100' : ''}
                                                >
                                                    {statusConf.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {doc.amount ? `${doc.amount.toLocaleString()} ฿` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <FileText className="mr-2 h-4 w-4" /> ดูรายละเอียด
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>แก้ไขข้อมูล</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive">
                                                            ลบเอกสาร
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Footer / Mobile space */}
            <div className="h-8 md:hidden" />
        </div>
    )
}

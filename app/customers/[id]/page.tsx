import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    FileText,
    MapPin,
    Phone,
    ReceiptText,
    ShoppingBag,
    User,
} from 'lucide-react'

import {
    getCustomerHistoryDetail,
    type CustomerHistoryDetail,
    type CustomerInvoiceHistory,
    type CustomerOrderHistory,
    type CustomerQuotationHistory,
    type CustomerReceiptHistory,
} from '@/actions/customers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { INVOICE_STATUS_CONFIG, QUOTATION_STATUS_CONFIG, STATUS_CONFIG } from '@/lib/types'

type PageProps = {
    params: Promise<{ id: string }> | { id: string }
}

const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

function formatCurrency(amount: number | null | undefined) {
    return currencyFormatter.format(amount ?? 0)
}

function formatDate(value: string | null | undefined) {
    if (!value) return '-'

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '-'

    return dateFormatter.format(parsed)
}

function HistorySection({
    title,
    description,
    emptyMessage,
    children,
}: {
    title: string
    description: string
    emptyMessage: string
    children: React.ReactNode
}) {
    const hasContent = Boolean(children)

    return (
        <Card className="border-white/10 bg-card/70 backdrop-blur">
            <CardHeader className="border-b border-white/10">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {hasContent ? children : <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
            </CardContent>
        </Card>
    )
}

function QuotationList({ quotations }: { quotations: CustomerQuotationHistory[] }) {
    if (quotations.length === 0) return null

    return (
        <div className="space-y-3">
            {quotations.map((quotation) => {
                const status = QUOTATION_STATUS_CONFIG[quotation.status as keyof typeof QUOTATION_STATUS_CONFIG]

                return (
                    <div key={quotation.id} className="rounded-xl border border-white/10 bg-background/40 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-medium">{quotation.quotationNumber}</p>
                                <p className="text-sm text-muted-foreground">สร้างเมื่อ {formatDate(quotation.createdAt)}</p>
                                <p className="text-sm text-muted-foreground">หมดอายุ {formatDate(quotation.expiresAt)}</p>
                            </div>
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <Badge variant="outline" className={status?.color ?? ''}>
                                    {status?.label ?? quotation.status}
                                </Badge>
                                <span className="text-sm font-medium">{formatCurrency(quotation.grandTotal || quotation.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function OrderList({ orders }: { orders: CustomerOrderHistory[] }) {
    if (orders.length === 0) return null

    return (
        <div className="space-y-3">
            {orders.map((order) => {
                const status = STATUS_CONFIG[order.status]

                return (
                    <div key={order.id} className="rounded-xl border border-white/10 bg-background/40 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-muted-foreground">สร้างเมื่อ {formatDate(order.createdAt)}</p>
                                <p className="text-sm text-muted-foreground">กำหนดส่ง {formatDate(order.deadline)}</p>
                            </div>
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <Badge variant="outline" className={status?.color ?? ''}>
                                    {status?.label ?? order.status}
                                </Badge>
                                {order.priority ? (
                                    <span className="text-xs uppercase tracking-wide text-muted-foreground">ลำดับความสำคัญ {order.priority}</span>
                                ) : null}
                                <span className="text-sm font-medium">{formatCurrency(order.grandTotal || order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function InvoiceList({ invoices }: { invoices: CustomerInvoiceHistory[] }) {
    if (invoices.length === 0) return null

    return (
        <div className="space-y-3">
            {invoices.map((invoice) => {
                const status = INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG]

                return (
                    <div key={invoice.id} className="rounded-xl border border-white/10 bg-background/40 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{invoice.invoiceNumber}</p>
                                    {invoice.isTaxInvoice ? <Badge variant="secondary">Tax Invoice</Badge> : null}
                                </div>
                                <p className="text-sm text-muted-foreground">สร้างเมื่อ {formatDate(invoice.createdAt)}</p>
                                <p className="text-sm text-muted-foreground">ครบกำหนด {formatDate(invoice.dueDate)}</p>
                            </div>
                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                <Badge variant="outline" className={status?.color ?? ''}>
                                    {status?.label ?? invoice.status}
                                </Badge>
                                <span className="text-sm font-medium">ยอดเอกสาร {formatCurrency(invoice.grandTotal || invoice.totalAmount)}</span>
                                <span className="text-xs text-muted-foreground">รับชำระแล้ว {formatCurrency(invoice.amountPaid)}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function ReceiptList({ receipts }: { receipts: CustomerReceiptHistory[] }) {
    if (receipts.length === 0) return null

    return (
        <div className="space-y-3">
            {receipts.map((receipt) => (
                <div key={receipt.id} className="rounded-xl border border-white/10 bg-background/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="font-medium">{receipt.receiptNumber}</p>
                            <p className="text-sm text-muted-foreground">วันที่รับชำระ {formatDate(receipt.paymentDate || receipt.createdAt)}</p>
                            <p className="text-sm text-muted-foreground">วิธีชำระ {receipt.paymentMethod || '-'}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                                รับชำระแล้ว
                            </Badge>
                            <span className="text-sm font-medium">{formatCurrency(receipt.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function getLastActivity(detail: CustomerHistoryDetail) {
    const dates = [
        ...detail.quotations.map((item) => item.createdAt),
        ...detail.orders.map((item) => item.createdAt),
        ...detail.invoices.map((item) => item.createdAt),
        ...detail.receipts.map((item) => item.paymentDate || item.createdAt || ''),
    ].filter(Boolean)

    if (dates.length === 0) return null

    return dates.sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0]
}

export default async function CustomerDetailPage({ params }: PageProps) {
    const resolvedParams = await Promise.resolve(params)
    const detail = await getCustomerHistoryDetail(resolvedParams.id)

    if (!detail) {
        notFound()
    }

    const { customer } = detail
    const lastActivity = getLastActivity(detail)

    return (
        <div className="space-y-6 pb-20 md:pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title={customer.name}
                    subtitle="ประวัติลูกค้าและเอกสารที่เกี่ยวข้องในระบบ"
                />
                <div className="px-4 md:px-0">
                    <Button asChild variant="outline">
                        <Link href="/customers">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            กลับหน้าลูกค้า
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 px-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
                <Card className="border-white/10 bg-card/70 backdrop-blur">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-cyan-400" />
                            ข้อมูลลูกค้า
                        </CardTitle>
                        <CardDescription>สรุปข้อมูลติดต่อและข้อมูลธุรกิจที่มีอยู่ในระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">อัปเดตล่าสุด</p>
                                <p className="mt-1 font-medium">{formatDate(customer.updatedAt)}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">กิจกรรมล่าสุด</p>
                                <p className="mt-1 font-medium">{formatDate(lastActivity)}</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Phone className="mt-0.5 h-4 w-4 text-cyan-400" />
                                <div>
                                    <p className="text-muted-foreground">โทรศัพท์</p>
                                    <p className="font-medium">{customer.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Building2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                                <div>
                                    <p className="text-muted-foreground">บริษัท / เลขผู้เสียภาษี</p>
                                    <p className="font-medium">{customer.companyname || '-'}</p>
                                    <p className="text-xs text-muted-foreground">{customer.taxId || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 text-amber-400" />
                                <div>
                                    <p className="text-muted-foreground">ที่อยู่</p>
                                    <p className="font-medium">{customer.address || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">ใบเสนอราคา</p>
                                <p className="mt-1 text-xl font-semibold">{detail.quotations.length}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">ใบสั่งงาน</p>
                                <p className="mt-1 text-xl font-semibold">{detail.orders.length}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">ใบแจ้งหนี้</p>
                                <p className="mt-1 text-xl font-semibold">{detail.invoices.length}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                                <p className="text-xs text-muted-foreground">ใบเสร็จ</p>
                                <p className="mt-1 text-xl font-semibold">{detail.receipts.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <HistorySection
                        title="ประวัติใบเสนอราคา"
                        description="แสดงใบเสนอราคาทั้งหมดของลูกค้ารายนี้"
                        emptyMessage="ยังไม่มีใบเสนอราคาในระบบ"
                    >
                        <QuotationList quotations={detail.quotations} />
                    </HistorySection>

                    <HistorySection
                        title="ประวัติใบสั่งงาน"
                        description="แสดงสถานะงานและยอดเอกสารของงานที่เกี่ยวข้อง"
                        emptyMessage="ยังไม่มีใบสั่งงานในระบบ"
                    >
                        <OrderList orders={detail.orders} />
                    </HistorySection>

                    <HistorySection
                        title="ประวัติใบแจ้งหนี้"
                        description="แสดงเอกสารการเงินที่เชื่อมกับลูกค้ารายนี้"
                        emptyMessage="ยังไม่มีใบแจ้งหนี้ในระบบ"
                    >
                        <InvoiceList invoices={detail.invoices} />
                    </HistorySection>

                    <HistorySection
                        title="ประวัติการรับชำระ"
                        description="แสดงใบเสร็จและการชำระเงินที่บันทึกไว้"
                        emptyMessage="ยังไม่มีใบเสร็จในระบบ"
                    >
                        <ReceiptList receipts={detail.receipts} />
                    </HistorySection>
                </div>
            </div>

            <div className="grid gap-4 px-4 md:grid-cols-4">
                <Card className="border-white/10 bg-card/70 backdrop-blur">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <FileText className="h-8 w-8 text-cyan-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">ยอดเสนอราคา</p>
                            <p className="font-semibold">{formatCurrency(detail.quotations.reduce((sum, item) => sum + (item.grandTotal || item.totalAmount || 0), 0))}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-card/70 backdrop-blur">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <ShoppingBag className="h-8 w-8 text-violet-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">ยอดใบสั่งงาน</p>
                            <p className="font-semibold">{formatCurrency(detail.orders.reduce((sum, item) => sum + (item.grandTotal || item.totalAmount || 0), 0))}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-card/70 backdrop-blur">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <CalendarDays className="h-8 w-8 text-amber-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">ยอดใบแจ้งหนี้</p>
                            <p className="font-semibold">{formatCurrency(detail.invoices.reduce((sum, item) => sum + (item.grandTotal || item.totalAmount || 0), 0))}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-white/10 bg-card/70 backdrop-blur">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <ReceiptText className="h-8 w-8 text-emerald-400" />
                        <div>
                            <p className="text-xs text-muted-foreground">ยอดรับชำระ</p>
                            <p className="font-semibold">{formatCurrency(detail.receipts.reduce((sum, item) => sum + (item.totalAmount || 0), 0))}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

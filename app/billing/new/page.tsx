'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Save,
    Printer,
    Loader2
} from 'lucide-react'
import { PricingCalculator, type CalcLineItem } from '@/components/pricing/PricingCalculator'
import type { QuotationResult } from '@/lib/pricing-engine'
import { createQuotation } from '@/actions/quotations'
import { getOrganization } from '@/actions/organization'
import { DocumentLayout, type DocumentData } from '@/components/documents/DocumentLayout'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

// Dummy customer data (replace with server action search later)
const customers = [
    { label: 'คุณสมชาย (ร้านกาแฟ)', value: 'cust_1', address: '123 ถ.สุขุมวิท', taxId: '1234567890123' },
    { label: 'บจก. เอ บี ซี', value: 'cust_2', address: '44/5 นิคมฯ บางปู', taxId: '0987654321098' },
    { label: 'โรงพยาบาลกรุงเทพ', value: 'cust_3', address: '2 ถ.เพชรบุรีตัดใหม่', taxId: '5555555555555' },
]

export default function NewQuotationPage() {
    const router = useRouter()
    const [date, setDate] = useState<Date>(new Date())
    const [validUntil, setValidUntil] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 30)))
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [notes, setNotes] = useState('')

    // Organization & Preview State
    const [organization, setOrganization] = useState<any>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // Customer State
    const [openCustomer, setOpenCustomer] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<string>('')
    const [customerDetails, setCustomerDetails] = useState({ address: '', taxId: '' })

    // Line Items State
    const [items, setItems] = useState<CalcLineItem[]>([
        { id: Math.random().toString(), description: '', materialId: null, width: null, height: null, quantity: 1, customUnitPrice: null, unitPrice: 0, totalPrice: 0 }
    ])
    const [calcResult, setCalcResult] = useState<QuotationResult | null>(null)

    // Summary State
    const [discount, setDiscount] = useState(0)

    // Calculations
    const subtotal = calcResult?.itemsSubtotal || items.reduce((sum, item) => sum + item.totalPrice, 0)
    const afterDiscount = subtotal - discount
    const vat = calcResult ? (afterDiscount * calcResult.vatRate) : (afterDiscount * 0.07)
    const grandTotal = afterDiscount + vat

    const handleCustomerSelect = (currentValue: string) => {
        setSelectedCustomer(currentValue === selectedCustomer ? '' : currentValue)
        setOpenCustomer(false)
        const cust = customers.find(c => c.value === currentValue)
        if (cust) {
            setCustomerDetails({ address: cust.address, taxId: cust.taxId })
        } else {
            setCustomerDetails({ address: '', taxId: '' })
        }
    }

    const prepareDocumentData = (): DocumentData => ({
        docNumber: 'DRAFT',
        date: date || new Date(),
        dueDate: validUntil,
        items: items.map((item, index) => ({
            index: index + 1,
            name: item.description || (calcResult?.lineItems[index]?.name) || 'Untitled',
            description: item.width && item.height ? `ขนาด ${item.width} x ${item.height} m` : undefined,
            width: item.width || undefined,
            height: item.height || undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
        })),
        subtotal,
        discount,
        vat,
        grandTotal,
        notes,
        status: 'DRAFT'
    })

    const handleSave = async () => {
        if (!selectedCustomer) {
            toast.error('กรุณาเลือกลูกค้า')
            return
        }

        setIsSubmitting(true)
        try {
            const quotationData = {
                customerId: selectedCustomer,
                totalAmount: subtotal,
                vatAmount: vat,
                grandTotal: grandTotal,
                expiresAt: validUntil.toISOString(),
                notes: notes,
            }
            const itemsData = items.map(item => ({
                name: item.description,
                width: item.width,
                height: item.height,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            }))

            const result = await createQuotation(quotationData, itemsData)
            if (result.success) {
                toast.success('บันทึกใบเสนอราคาสำเร็จ')
                router.push('/billing')
            } else {
                toast.error(result.error || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        } catch (error) {
            console.error('Save error:', error)
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 pb-20 md:pb-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">สร้างใบเสนอราคาใหม่</h1>
                        <p className="text-muted-foreground">กรอกข้อมูลเพื่อสร้างเอกสาร</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Printer className="mr-2 h-4 w-4" />
                                ตัวอย่าง PDF
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-gray-100 p-8">
                            <div className="transform scale-90 origin-top">
                                <DocumentLayout
                                    type="QUOTATION"
                                    org={organization || { name: 'Demo Org' }}
                                    customer={{ name: selectedCustomer, address: customerDetails.address, taxId: customerDetails.taxId }}
                                    data={prepareDocumentData()}
                                />
                            </div>
                            <Button className="fixed bottom-8 right-8 shadow-xl" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" /> สั่งพิมพ์ / PDF
                            </Button>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        บันทึกร่าง
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Customer Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ข้อมูลลูกค้า</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>ชื่อลูกค้า / บริษัท</Label>
                            <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCustomer}
                                        className="justify-between"
                                    >
                                        {selectedCustomer
                                            ? customers.find((customer) => customer.value === selectedCustomer)?.label
                                            : "เลือกลูกค้า..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                        <CommandInput placeholder="ค้นหาลูกค้า..." />
                                        <CommandList>
                                            <CommandEmpty>ไม่พบลูกค้า</CommandEmpty>
                                            <CommandGroup>
                                                {customers.map((customer) => (
                                                    <CommandItem
                                                        key={customer.value}
                                                        value={customer.value}
                                                        onSelect={(currentValue) => handleCustomerSelect(currentValue)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCustomer === customer.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {customer.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label>ที่อยู่</Label>
                            <Textarea
                                placeholder="ที่อยู่สำหรับออกใบกำกับภาษี"
                                value={customerDetails.address}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>เลขประจำตัวผู้เสียภาษี</Label>
                            <Input
                                placeholder="13 หลัก"
                                value={customerDetails.taxId}
                                onChange={(e) => setCustomerDetails({ ...customerDetails, taxId: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Document Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">รายละเอียดเอกสาร</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>เลขที่เอกสาร</Label>
                            <Input value="QT-2026-XXXX (Auto)" disabled className="bg-muted" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>วันที่เอกสาร</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(d) => d && setDate(d)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2">
                                <Label>ยืนราคาถึง</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !validUntil && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {validUntil ? format(validUntil, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={validUntil}
                                            onSelect={(d) => d && setValidUntil(d)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>อ้างอิง (Reference)</Label>
                            <Input placeholder="เช่น PO ลูกค้า, ชื่อโครงการ" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">รายการสินค้า / บริการ</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <PricingCalculator
                        items={items}
                        onChange={(newItems, res) => {
                            setItems(newItems)
                            if (res) setCalcResult(res)
                        }}
                    />
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="grid gap-2">
                        <Label>หมายเหตุ / เงื่อนไข</Label>
                        <Textarea
                            placeholder="เช่น ยืนยันสั่งผลิตมัดจำ 50%, ระยะเวลาผลิต 3-5 วัน"
                            className="min-h-[120px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="w-full md:w-1/3">
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">รวมเป็นเงิน</span>
                            <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">ส่วนลด</span>
                            <div className="flex items-center w-24">
                                <Input
                                    type="number"
                                    className="h-8 text-right pr-1"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                />
                                <span className="ml-1 text-xs">฿</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">หลังหักส่วนลด</span>
                            <span>{afterDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">ภาษีมูลค่าเพิ่ม 7%</span>
                            <span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>จำนวนเงินรวมทั้งสิ้น</span>
                            <span className="text-primary">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

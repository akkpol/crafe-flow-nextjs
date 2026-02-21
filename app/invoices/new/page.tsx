'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
    Plus,
    Trash2,
    Save,
    Printer,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import { getCustomers, createCustomer } from '@/actions/customers'
import { createInvoice } from '@/actions/invoices'
import { getOrganization } from '@/actions/organization'
import type { Customer } from '@/lib/types'
import { LineUserSearch } from '@/components/customers/LineUserSearch'
import { DocumentLayout, type DocumentData } from '@/components/documents/DocumentLayout'

import { PricingCalculator, type CalcLineItem } from '@/components/pricing/PricingCalculator'
import type { QuotationResult } from '@/lib/pricing-engine'

export default function NewInvoicePage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [date, setDate] = useState<Date>(new Date())
    const [dueDate, setDueDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 30)))
    const [organization, setOrganization] = useState<any>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isTaxInvoice, setIsTaxInvoice] = useState(false)

    // Customer State
    const [customers, setCustomers] = useState<Customer[]>([])
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
    const [notes, setNotes] = useState('')

    // Fetch Initial Data
    useEffect(() => {
        const initData = async () => {
            const [customersData, orgData] = await Promise.all([
                getCustomers(),
                getOrganization()
            ])
            setCustomers(customersData)
            setOrganization(orgData)
        }
        initData()
    }, [])

    // Calculations
    const subtotal = calcResult?.itemsSubtotal || items.reduce((sum, item) => sum + item.totalPrice, 0)
    const afterDiscount = subtotal - discount
    const vat = calcResult ? (afterDiscount * calcResult.vatRate) : (afterDiscount * 0.07)
    const grandTotal = afterDiscount + vat

    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomer(customerId === selectedCustomer ? '' : customerId)
        setOpenCustomer(false)
        const cust = customers.find(c => c.id === customerId)
        if (cust) {
            setCustomerDetails({ address: cust.address || '', taxId: cust.taxId || '' })
        } else {
            setCustomerDetails({ address: '', taxId: '' })
        }
    }



    const handleLineImport = async (user: any) => {
        const res = await createCustomer({ name: user.display_name, lineId: user.display_name })
        if (res.success && res.data) {
            const newCust = { ...res.data, createdAt: new Date(), updatedAt: new Date() } as any
            setCustomers(prev => [...prev, newCust])
            setSelectedCustomer(newCust.id)
            toast.success('นำเข้าลูกค้าจาก LINE แล้ว')
        }
    }

    const handleSave = async () => {
        if (!selectedCustomer) {
            toast.error('กรุณาเลือกลูกค้า')
            return
        }
        if (items.some(i => !i.description)) {
            toast.error('กรุณากรอกรายละเอียดสินค้าให้ครบถ้วน')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createInvoice({
                customerId: selectedCustomer,
                dueDate: dueDate.toISOString(),
                notes,
                isTaxInvoice,
                totalAmount: subtotal,
                vatAmount: vat,
                grandTotal: grandTotal,
            }, items.map(item => ({
                name: item.description || 'Untitled',
                description: item.description,
                width: item.width || undefined,
                height: item.height || undefined,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                discount: 0 // Default 0 for line item discount for now
            })))

            if (result.success) {
                toast.success('บันทึกใบแจ้งหนี้สำเร็จ')
                router.push('/invoices') // Redirect to invoices list (to be created) or billing
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown'))
            setIsSubmitting(false)
        }
    }

    const prepareDocumentData = (): DocumentData => ({
        docNumber: 'DRAFT',
        date: date || new Date(),
        dueDate: dueDate,
        reference: 'New Invoice',
        salesperson: 'Admin',
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
        status: 'UNPAID'
    })

    const customerData = {
        name: customers.find(c => c.id === selectedCustomer)?.name || 'ลูกค้าทั่วไป',
        address: customerDetails.address,
        taxId: customerDetails.taxId
    }

    return (
        <div className="space-y-6 pb-20 md:pb-6 max-w-5xl mx-auto print:hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/billing">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">สร้างใบแจ้งหนี้ใหม่</h1>
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
                            {organization && (
                                <div className="transform scale-90 origin-top">
                                    <DocumentLayout
                                        type={isTaxInvoice ? "TAX_INVOICE" : "INVOICE"}
                                        org={organization}
                                        customer={customerData}
                                        data={prepareDocumentData()}
                                    />
                                </div>
                            )}
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
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>ชื่อลูกค้า / บริษัท</Label>
                                <LineUserSearch onSelect={handleLineImport} className="h-6 w-auto px-2 text-xs" />
                            </div>
                            <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCustomer}
                                        className="justify-between w-full"
                                    >
                                        {selectedCustomer
                                            ? customers.find((customer) => customer.id === selectedCustomer)?.name
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
                                                        key={customer.id}
                                                        value={customer.name}
                                                        onSelect={() => handleCustomerSelect(customer.id)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {customer.name}
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
                    </CardContent >
                </Card >

                {/* Document Details */}
                < Card >
                    <CardHeader>
                        <CardTitle className="text-base">รายละเอียดเอกสาร</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between mb-4 border border-primary/20 bg-primary/5 p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base text-primary">ออกใบกำกับภาษี</Label>
                                <p className="text-sm text-muted-foreground">
                                    บันทึกเป็นใบแจ้งหนี้ / ใบกำกับภาษีเต็มรูป
                                </p>
                            </div>
                            <Switch checked={isTaxInvoice} onCheckedChange={setIsTaxInvoice} />
                        </div>

                        <div className="grid gap-2">
                            <Label>เลขที่เอกสาร</Label>
                            <Input value={isTaxInvoice ? "TX-2026-XXXX (Auto)" : "IV-2026-XXXX (Auto)"} disabled className="bg-muted" />
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
                                <Label>ครบกำหนด (Due Date)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !dueDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dueDate ? format(dueDate, "PPP", { locale: th }) : <span>เลือกวันที่</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={dueDate}
                                            onSelect={(d) => d && setDueDate(d)}
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
                </Card >
            </div >

            {/* Line Items */}
            < Card >
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">รายการสินค้า / บริการ</CardTitle>
                    <PricingCalculator
                        items={items}
                        onChange={(newItems, res) => {
                            setItems(newItems)
                            if (res) setCalcResult(res)
                        }}
                    />
                </CardContent>
            </Card >

            {/* Summary */}
            < div className="flex flex-col md:flex-row gap-6" >
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
            </div >

            {/* Hidden Print Layout */}
            {organization && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                    <DocumentLayout
                        type={isTaxInvoice ? "TAX_INVOICE" : "INVOICE"}
                        org={organization}
                        customer={customerData}
                        data={prepareDocumentData()}
                    />
                </div>
            )}
        </div >
    )
}

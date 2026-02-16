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
    Plus,
    Trash2,
    Save,
    Printer
} from 'lucide-react'

// Dummy customer data (replace with server action search later)
const customers = [
    { label: 'คุณสมชาย (ร้านกาแฟ)', value: 'cust_1', address: '123 ถ.สุขุมวิท', taxId: '1234567890123' },
    { label: 'บจก. เอ บี ซี', value: 'cust_2', address: '44/5 นิคมฯ บางปู', taxId: '0987654321098' },
    { label: 'โรงพยาบาลกรุงเทพ', value: 'cust_3', address: '2 ถ.เพชรบุรีตัดใหม่', taxId: '5555555555555' },
]

interface LineItem {
    id: string
    description: string
    width: number
    height: number
    quantity: number
    unitPrice: number
}

export default function NewQuotationPage() {
    const router = useRouter()
    const [date, setDate] = useState<Date>(new Date())
    const [validUntil, setValidUntil] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 30)))

    // Customer State
    const [openCustomer, setOpenCustomer] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<string>('')
    const [customerDetails, setCustomerDetails] = useState({ address: '', taxId: '' })

    // Line Items State
    const [items, setItems] = useState<LineItem[]>([
        { id: '1', description: '', width: 0, height: 0, quantity: 1, unitPrice: 0 }
    ])

    // Summary State
    const [discount, setDiscount] = useState(0)

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const afterDiscount = subtotal - discount
    const vat = afterDiscount * 0.07
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

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), description: '', width: 0, height: 0, quantity: 1, unitPrice: 0 }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value }
            }
            return item
        }))
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
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        ตัวอย่าง PDF
                    </Button>
                    <Button>
                        <Save className="mr-2 h-4 w-4" />
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

            {/* Line Items */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">รายการสินค้า / บริการ</CardTitle>
                    <Button variant="outline" size="sm" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการ
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">รายละเอียด</TableHead>
                                <TableHead className="w-[10%] text-center">กว้าง</TableHead>
                                <TableHead className="w-[10%] text-center">ยาว/สูง</TableHead>
                                <TableHead className="w-[10%] text-center">จำนวน</TableHead>
                                <TableHead className="w-[15%] text-right">ราคา/หน่วย</TableHead>
                                <TableHead className="w-[15%] text-right">รวม</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Input
                                            placeholder="ชื่อสินค้า / รายละเอียด"
                                            value={item.description}
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="text-center"
                                            placeholder="0"
                                            value={item.width || ''}
                                            onChange={(e) => updateItem(item.id, 'width', parseFloat(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="text-center"
                                            placeholder="0"
                                            value={item.height || ''}
                                            onChange={(e) => updateItem(item.id, 'height', parseFloat(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="text-center"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="text-right"
                                            placeholder="0.00"
                                            value={item.unitPrice || ''}
                                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive"
                                            onClick={() => removeItem(item.id)}
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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

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
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import { cn } from '@/lib/utils'
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    Check,
    ChevronsUpDown,
    Printer,
    Save,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import { getUnpaidInvoices, getInvoice } from '@/actions/invoices'
import { createReceipt } from '@/actions/receipts'
import { getOrganization } from '@/actions/organization'
import { DocumentLayout, type DocumentData } from '@/components/documents/DocumentLayout'

export default function NewReceiptPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [date, setDate] = useState<Date>(new Date())
    const [organization, setOrganization] = useState<any>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // Invoice Selection
    const [invoices, setInvoices] = useState<any[]>([])
    const [openInvoice, setOpenInvoice] = useState(false)
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('')
    const [invoiceDetails, setInvoiceDetails] = useState<any>(null)

    // Receipt Details
    const [paymentMethod, setPaymentMethod] = useState('CASH')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        const initData = async () => {
            const [invoicesData, orgData] = await Promise.all([
                getUnpaidInvoices(),
                getOrganization()
            ])
            setInvoices(invoicesData || [])
            setOrganization(orgData)
        }
        initData()
    }, [])

    useEffect(() => {
        if (selectedInvoiceId) {
            getInvoice(selectedInvoiceId).then(setInvoiceDetails)
        } else {
            setInvoiceDetails(null)
        }
    }, [selectedInvoiceId])

    const handleSave = async () => {
        if (!selectedInvoiceId || !invoiceDetails) {
            toast.error('กรุณาเลือกใบแจ้งหนี้')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createReceipt({
                invoiceId: selectedInvoiceId,
                customerId: invoiceDetails.customerId,
                paymentMethod,
                totalAmount: invoiceDetails.grandTotal,
                notes,
                paymentDate: date
            })

            if (result.success) {
                toast.success('บันทึกใบเสร็จรับเงินสำเร็จ')
                router.push('/receipts') // Or back to billing
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            console.error(error)
            toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown'))
            setIsSubmitting(false)
        }
    }

    const prepareDocumentData = (): DocumentData => {
        if (!invoiceDetails) return {
            docNumber: 'DRAFT',
            date: date,
            items: [],
            subtotal: 0,
            vat: 0,
            grandTotal: 0,
            status: 'PAID'
        }

        return {
            docNumber: 'DRAFT', // Will be generated on save
            date: date,
            reference: `REF: ${invoiceDetails.invoiceNumber}`,
            items: invoiceDetails.InvoiceItem?.map((item: any, index: number) => ({
                index: index + 1,
                name: item.name,
                description: item.description,
                width: item.width,
                height: item.height,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice
            })) || [],
            subtotal: invoiceDetails.totalAmount, // Assuming specific field names match
            vat: invoiceDetails.vatAmount,
            grandTotal: invoiceDetails.grandTotal,
            notes: notes || invoiceDetails.notes,
            status: 'PAID'
        }
    }

    const customerData = invoiceDetails ? {
        name: invoiceDetails.Customer?.name || 'ลูกค้า',
        address: invoiceDetails.Customer?.address, // Fetch if needed
        taxId: invoiceDetails.Customer?.taxId
    } : { name: '' }


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
                        <h1 className="text-2xl font-bold tracking-tight">สร้างใบเสร็จรับเงิน</h1>
                        <p className="text-muted-foreground">เลือกใบแจ้งหนี้ที่ต้องการชำระเงิน</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={!invoiceDetails}>
                                <Printer className="mr-2 h-4 w-4" />
                                ตัวอย่าง PDF
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto bg-gray-100 p-8">
                            {organization && invoiceDetails && (
                                <div className="transform scale-90 origin-top">
                                    <DocumentLayout
                                        type="RECEIPT"
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

                    <Button onClick={handleSave} disabled={isSubmitting || !invoiceDetails}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        บันทึกการรับเงิน
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">เลือกใบแจ้งหนี้</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Popover open={openInvoice} onOpenChange={setOpenInvoice}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openInvoice}
                                        className="justify-between w-full"
                                    >
                                        {selectedInvoiceId
                                            ? invoices.find((inv) => inv.id === selectedInvoiceId)?.invoiceNumber
                                            : "เลือกใบแจ้งหนี้..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0">
                                    <Command>
                                        <CommandInput placeholder="ค้นหาเลขที่..." />
                                        <CommandList>
                                            <CommandEmpty>ไม่พบใบแจ้งหนี้ค้างชำระ</CommandEmpty>
                                            <CommandGroup>
                                                {invoices.map((inv) => (
                                                    <CommandItem
                                                        key={inv.id}
                                                        value={inv.invoiceNumber}
                                                        onSelect={() => {
                                                            setSelectedInvoiceId(inv.id)
                                                            setOpenInvoice(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedInvoiceId === inv.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {inv.invoiceNumber} - {inv.Customer?.name} ({inv.grandTotal.toLocaleString()} บาท)
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {invoiceDetails && (
                            <div className="rounded-md bg-muted p-4 text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ลูกค้า:</span>
                                    <span className="font-medium">{invoiceDetails.Customer?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ยอดชำระ:</span>
                                    <span className="font-medium text-primary">{invoiceDetails.grandTotal.toLocaleString()} บาท</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">วันที่ครบกำหนด:</span>
                                    <span>{invoiceDetails.dueDate ? format(new Date(invoiceDetails.dueDate), 'dd/MM/yyyy') : '-'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">รายละเอียดการรับเงิน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>วันที่รับเงิน</Label>
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
                            <Label>ช่องทางการชำระเงิน</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">เงินสด (Cash)</SelectItem>
                                    <SelectItem value="TRANSFER">โอนเงิน (Bank Transfer)</SelectItem>
                                    <SelectItem value="CHEQUE">เช็ค (Cheque)</SelectItem>
                                    <SelectItem value="CREDIT_CARD">บัตรเครดิต (Credit Card)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>หมายเหตุ</Label>
                            <Textarea
                                placeholder="รายละเอียดเพิ่มเติม..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hidden Print Layout */}
            {organization && invoiceDetails && (
                <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                    <DocumentLayout
                        type="RECEIPT"
                        org={organization}
                        customer={customerData}
                        data={prepareDocumentData()}
                    />
                </div>
            )}
        </div>
    )
}

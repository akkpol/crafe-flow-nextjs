'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { createOrder } from '@/actions/orders'
import { searchCustomers, createCustomer, CustomerRow } from '@/actions/customers'
import { createQuotation } from '@/actions/quotations'
import { CustomerSearch } from '@/components/customers/CustomerSearch'
import { Checkbox } from '@/components/ui/checkbox'
import type { Priority } from '@/lib/types'

const signTypes = [
    'ป้ายอะคริลิค',
    'ป้ายไวนิล',
    'ตัวอักษรโลหะ',
    'ป้ายไฟ LED',
    'ป้ายไฟ Neon',
    'สติกเกอร์',
    'โรลอัพ / สแตนดี้',
    'ป้าย Lightbox',
    'ป้ายอลูมิเนียม',
    'อื่นๆ',
]

export default function NewJobPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Form State
    const [priority, setPriority] = useState<Priority>('medium')
    const [signType, setSignType] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [shouldCreateQuotation, setShouldCreateQuotation] = useState(false)

    const handleCustomerSelect = (customer: CustomerRow) => {
        setCustomerName(customer.name)
        setCustomerPhone(customer.phone || '')
        toast.info(`เลือกลูกค้า: ${customer.name}`)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const customerName = formData.get('customerName') as string
        const customerPhone = formData.get('customerPhone') as string
        const jobTitle = formData.get('jobTitle') as string
        const width = parseFloat(formData.get('width') as string) || 0
        const height = parseFloat(formData.get('height') as string) || 0
        const price = parseFloat(formData.get('price') as string) || 0
        const deadline = formData.get('deadline') as string
        const notes = formData.get('notes') as string

        try {
            // 1. Find or Create Customer
            let customerId = ''
            const existingCustomers = await searchCustomers(customerPhone)

            // Check for exact phone match
            const match = existingCustomers.find(c => c.phone === customerPhone)

            if (match) {
                customerId = match.id
            } else {
                // Create new customer
                const newCustomer = await createCustomer({
                    name: customerName,
                    phone: customerPhone,
                    lineId: '',
                    address: '',
                    taxId: ''
                })
                if (!newCustomer.success || !newCustomer.data) {
                    throw new Error(newCustomer.error || 'Failed to create customer')
                }
                customerId = newCustomer.data.id
            }

            // 2. Create Order & Item
            const result = await createOrder({
                customerId,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                priority,
                notes,
                totalAmount: price,
                grandTotal: price, // No VAT calc logic in this simple form yet
            }, [{
                name: jobTitle,
                details: signType ? `ประเภท: ${signType}` : undefined,
                width,
                height,
                quantity: 1,
                unitPrice: price,
                totalPrice: price
            }])

            if (!result.success) {
                throw new Error(result.error)
            }

            // 3. Optional: Create Quotation
            if (shouldCreateQuotation) {
                const qtResult = await createQuotation({
                    customerId,
                    expiresAt: deadline ? new Date(deadline).toISOString() : undefined,
                    notes: (notes || '') + (result.data ? `\nอ้างอิงงาน: ${result.data.orderNumber}` : ''),
                    totalAmount: price,
                    grandTotal: price,
                    vatAmount: 0,
                }, [{
                    name: jobTitle,
                    description: signType ? `ประเภท: ${signType}` : undefined,
                    width,
                    height,
                    quantity: 1,
                    unitPrice: price,
                    totalPrice: price
                }])

                if (qtResult.success) {
                    toast.success(`ออกใบเสนอราคา ${qtResult.data?.quotationNumber} เรียบร้อย`)
                }
            }

            setIsSubmitting(false)
            setIsSuccess(true)
            toast.success('บันทึกงานใหม่เรียบร้อยแล้ว')

            // Redirect after delay
            setTimeout(() => {
                router.push('/kanban')
            }, 1000)

        } catch (error) {
            console.error(error)
            toast.error('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'))
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <PageHeader title="➕ เพิ่มงานใหม่" subtitle="กรอกข้อมูลรับงาน" />

            <div className="px-4 pb-8">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* ข้อมูลลูกค้า */}
                            <div>
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">ข้อมูลลูกค้า</p>
                                <div className="space-y-4">
                                    <div className="bg-muted/50 p-3 rounded-lg border border-dashed border-primary/20 mb-4">
                                        <Label className="text-xs text-muted-foreground mb-1.5 block">เป็นลูกค้าเก่า?</Label>
                                        <CustomerSearch onSelect={handleCustomerSelect} />
                                    </div>

                                    <div>
                                        <Label htmlFor="customerName" className="text-sm font-medium">
                                            ชื่อลูกค้า <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            name="customerName"
                                            id="customerName"
                                            placeholder="เช่น คุณสมชาย / บ.ABC จำกัด"
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="customerPhone" className="text-sm font-medium">
                                            เบอร์โทร <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            name="customerPhone"
                                            id="customerPhone"
                                            type="tel"
                                            placeholder="08X-XXX-XXXX"
                                            required
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* ข้อมูลงาน */}
                            <div>
                                <p className="text-xs font-semibold text-fuchsia-500 uppercase tracking-wider mb-3">รายละเอียดงาน</p>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="jobTitle" className="text-sm font-medium">
                                            ชื่องาน <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            name="jobTitle"
                                            id="jobTitle"
                                            placeholder="เช่น ป้ายหน้าร้าน ABC Cafe"
                                            required
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">ประเภทป้าย</Label>
                                        <Select value={signType} onValueChange={setSignType}>
                                            <SelectTrigger className="mt-1.5 h-12 text-base">
                                                <SelectValue placeholder="เลือกประเภท" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {signTypes.map(type => (
                                                    <SelectItem key={type} value={type} className="text-base py-3">
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* Hidden input for formData */}
                                        <input type="hidden" name="itemType" value={signType} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="width" className="text-sm font-medium">กว้าง (ม.)</Label>
                                            <Input
                                                name="width"
                                                id="width"
                                                type="number"
                                                step="0.01"
                                                placeholder="เช่น 2.5"
                                                className="mt-1.5 h-12 text-base"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="height" className="text-sm font-medium">สูง (ม.)</Label>
                                            <Input
                                                name="height"
                                                id="height"
                                                type="number"
                                                step="0.01"
                                                placeholder="เช่น 1.2"
                                                className="mt-1.5 h-12 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="price" className="text-sm font-medium">ราคา (฿)</Label>
                                        <Input
                                            name="price"
                                            id="price"
                                            type="number"
                                            placeholder="เช่น 15000"
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* กำหนดการ */}
                            <div>
                                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider mb-3">กำหนดการ</p>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="deadline" className="text-sm font-medium">กำหนดส่ง</Label>
                                        <Input
                                            name="deadline"
                                            id="deadline"
                                            type="date"
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">ความเร่งด่วน</Label>
                                        <Select
                                            value={priority}
                                            onValueChange={(v) => setPriority(v as Priority)}
                                        >
                                            <SelectTrigger className="mt-1.5 h-12 text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low" className="text-base py-3">🟢 ต่ำ</SelectItem>
                                                <SelectItem value="medium" className="text-base py-3">🔵 ปกติ</SelectItem>
                                                <SelectItem value="high" className="text-base py-3">🟡 สูง</SelectItem>
                                                <SelectItem value="urgent" className="text-base py-3">🔴 ด่วน!</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="priority" value={priority} />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes" className="text-sm font-medium">หมายเหตุ</Label>
                                        <Textarea
                                            name="notes"
                                            id="notes"
                                            placeholder="รายละเอียดเพิ่มเติม..."
                                            rows={3}
                                            className="mt-1.5 text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                            <Separator />

                            {/* Options */}
                            <div className="flex items-center space-x-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <Checkbox
                                    id="createQuotation"
                                    checked={shouldCreateQuotation}
                                    onCheckedChange={(checked) => setShouldCreateQuotation(!!checked)}
                                    className="h-5 w-5 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="createQuotation"
                                        className="text-sm font-semibold text-primary cursor-pointer"
                                    >
                                        📄 ออกใบเสนอราคา (Quotation) ทันที
                                    </Label>
                                    <p className="text-[11px] text-muted-foreground">
                                        ระบบจะสร้างใบเสนอราคาฉบับร่างโดยใช้ข้อมูลงานนี้
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                                className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/25"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        กำลังบันทึก...
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        บันทึกสำเร็จ!
                                    </>
                                ) : (
                                    'บันทึกงาน'
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

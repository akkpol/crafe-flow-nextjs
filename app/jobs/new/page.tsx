'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Loader2 } from 'lucide-react'

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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call (จะเปลี่ยนเป็น Server Action จริงภายหลัง)
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubmitting(false)
        setIsSuccess(true)

        setTimeout(() => setIsSuccess(false), 3000)
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
                                    <div>
                                        <Label htmlFor="customerName" className="text-sm font-medium">
                                            ชื่อลูกค้า <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="customerName"
                                            placeholder="เช่น คุณสมชาย / บ.ABC จำกัด"
                                            required
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="customerPhone" className="text-sm font-medium">
                                            เบอร์โทร <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="customerPhone"
                                            type="tel"
                                            placeholder="08X-XXX-XXXX"
                                            required
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
                                            id="jobTitle"
                                            placeholder="เช่น ป้ายหน้าร้าน ABC Cafe"
                                            required
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">ประเภทป้าย</Label>
                                        <Select>
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor="width" className="text-sm font-medium">กว้าง (ม.)</Label>
                                            <Input
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
                                            id="deadline"
                                            type="date"
                                            className="mt-1.5 h-12 text-base"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">ความเร่งด่วน</Label>
                                        <Select defaultValue="medium">
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
                                    </div>

                                    <div>
                                        <Label htmlFor="notes" className="text-sm font-medium">หมายเหตุ</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="รายละเอียดเพิ่มเติม..."
                                            rows={3}
                                            className="mt-1.5 text-base"
                                        />
                                    </div>
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

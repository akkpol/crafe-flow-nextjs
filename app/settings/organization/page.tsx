'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getOrganization, updateOrganization } from '@/actions/organization'
import { Loader2, Building, Save } from 'lucide-react'

export default function OrganizationSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [org, setOrg] = useState({
        id: '',
        name: '',
        address: '',
        taxId: '',
        phone: '',
        email: '',
        website: '',
        logoUrl: '',
        signatureUrl: ''
    })

    useEffect(() => {
        const fetchOrg = async () => {
            const data = await getOrganization()
            if (data) {
                setOrg({
                    id: data.id,
                    name: data.name || '',
                    address: data.address || '',
                    taxId: data.taxId || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    website: data.website || '',
                    logoUrl: data.logoUrl || '',
                    signatureUrl: data.signatureUrl || ''
                })
            }
            setLoading(false)
        }
        fetchOrg()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateOrganization(org.id, {
                name: org.name,
                address: org.address,
                taxId: org.taxId,
                phone: org.phone,
                email: org.email,
                website: org.website,
                // logoUrl, signatureUrl handling later via upload
            })

            if (result.success) {
                toast.success('บันทึกข้อมูลเรียบร้อยแล้ว')
            } else {
                toast.error('เกิดข้อผิดพลาด: ' + result.error)
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">ตั้งค่าองค์กร</h3>
                <p className="text-muted-foreground">
                    จัดการข้อมูลบริษัทสำหรับแสดงในเอกสารต่างๆ (ใบเสนอราคา, ใบกำกับภาษี)
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        ข้อมูลทั่วไป
                    </CardTitle>
                    <CardDescription>
                        ข้อมูลจะปรากฏในส่วนหัวของเอกสาร
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>ชื่อบริษัท / กิจการ</Label>
                        <Input
                            value={org.name}
                            onChange={(e) => setOrg({ ...org, name: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>ที่อยู่ (สำหรับออกใบกำกับภาษี)</Label>
                        <Textarea
                            value={org.address}
                            onChange={(e) => setOrg({ ...org, address: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>เลขประจำตัวผู้เสียภาษี</Label>
                            <Input
                                value={org.taxId}
                                onChange={(e) => setOrg({ ...org, taxId: e.target.value })}
                                placeholder="13 หลัก"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เบอร์โทรศัพท์</Label>
                            <Input
                                value={org.phone}
                                onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>อีเมล</Label>
                            <Input
                                value={org.email}
                                onChange={(e) => setOrg({ ...org, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>เว็บไซต์ / Facebook</Label>
                            <Input
                                value={org.website}
                                onChange={(e) => setOrg({ ...org, website: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">โลโก้และลายเซ็น (Coming Soon)</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">ระบบอัปโหลดรูปภาพกำลังพัฒนา...</p>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    บันทึกการเปลี่ยนแปลง
                </Button>
            </div>
        </div>
    )
}

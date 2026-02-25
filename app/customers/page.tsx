'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
    Search,
    Plus,
    Phone,
    MapPin,
    FileText,
    MessageCircle,
    User,
    Edit3,
    Trash2,
    Loader2,
    Users,
    Building2,
    ShoppingBag,
    X,
} from 'lucide-react'
import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    type CustomerRow,
    type CustomerInput,
} from '@/actions/customers'
import { LineUserSearch } from '@/components/customers/LineUserSearch'
import { LineUser } from '@/actions/line'

// ============================================================
// MAIN PAGE
// ============================================================

export default function CustomersPage() {
    const [customers, setCustomers] = useState<CustomerRow[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingCustomer, setDeletingCustomer] = useState<CustomerRow | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [form, setForm] = useState<CustomerInput>({
        name: '', phone: '', lineId: '', address: '', taxId: ''
    })
    const [formError, setFormError] = useState('')

    // ---- Load customers ----
    const loadCustomers = useCallback(async () => {
        setLoading(true)
        const data = await getCustomers()
        setCustomers(data)
        setLoading(false)
    }, [])

    useEffect(() => { loadCustomers() }, [loadCustomers])

    // ---- Filter ----
    const filtered = customers.filter(c => {
        const q = search.toLowerCase()
        return c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q)) ||
            (c.taxId && c.taxId.includes(q)) ||
            (c.lineId && c.lineId.toLowerCase().includes(q))
    })

    // ---- Open Add ----
    const handleAdd = () => {
        setEditingCustomer(null)
        setForm({ name: '', phone: '', lineId: '', address: '', taxId: '' })
        setFormError('')
        setDialogOpen(true)
    }

    // ---- Open Edit ----
    const handleEdit = (customer: CustomerRow) => {
        setEditingCustomer(customer)
        setForm({
            name: customer.name,
            phone: customer.phone || '',
            lineId: customer.lineId || '',
            address: customer.address || '',
            taxId: customer.taxId || '',
        })
        setFormError('')
        setDialogOpen(true)
    }

    // ---- Save ----
    const handleSave = async () => {
        setSaving(true)
        setFormError('')

        let res
        if (editingCustomer) {
            res = await updateCustomer(editingCustomer.id, form)
        } else {
            res = await createCustomer(form)
        }

        setSaving(false)

        if (!res.success) {
            setFormError(res.error || 'เกิดข้อผิดพลาด')
            return
        }

        setDialogOpen(false)
        await loadCustomers()
    }

    // ---- Delete ----
    const handleDeleteConfirm = async () => {
        if (!deletingCustomer) return
        setSaving(true)
        const res = await deleteCustomer(deletingCustomer.id)
        setSaving(false)

        if (!res.success) {
            setFormError(res.error || 'ลบไม่สำเร็จ')
            return
        }

        setDeleteDialogOpen(false)
        setDeletingCustomer(null)
        await loadCustomers()
    }

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-background">
            {/* ── Header ── */}
            <div className="sticky top-0 z-40 glass border-b border-white/10">
                <div className="px-4 pt-6 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">ลูกค้า</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {loading ? '...' : `${customers.length} รายชื่อ`}
                            </p>
                        </div>
                        <Button
                            onClick={handleAdd}
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            เพิ่มลูกค้า
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาชื่อ, เบอร์, Tax ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            {!loading && (
                <div className="px-4 py-4 grid grid-cols-3 gap-3">
                    <div className="card-premium p-3 text-center">
                        <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-xl font-bold">{customers.length}</p>
                        <p className="text-[11px] text-muted-foreground">ทั้งหมด</p>
                    </div>
                    <div className="card-premium p-3 text-center">
                        <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <p className="text-xl font-bold">{customers.filter(c => c.taxId).length}</p>
                        <p className="text-[11px] text-muted-foreground">นิติบุคคล</p>
                    </div>
                    <div className="card-premium p-3 text-center">
                        <ShoppingBag className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-xl font-bold">{customers.filter(c => !c.taxId).length}</p>
                        <p className="text-[11px] text-muted-foreground">บุคคลธรรมดา</p>
                    </div>
                </div>
            )}

            {/* ── Customer List ── */}
            <div className="px-4 pb-24 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-cyan-500" />
                        <p className="text-sm">กำลังโหลดข้อมูลลูกค้า...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Users className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium">{search ? 'ไม่พบลูกค้า' : 'ยังไม่มีข้อมูลลูกค้า'}</p>
                        <p className="text-sm mt-1">
                            {search ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มเพิ่มลูกค้าคนแรกเลย!'}
                        </p>
                        {!search && (
                            <Button onClick={handleAdd} variant="outline" size="sm" className="mt-4">
                                <Plus className="w-4 h-4 mr-1" /> เพิ่มลูกค้า
                            </Button>
                        )}
                    </div>
                ) : (
                    filtered.map(customer => (
                        <div
                            key={customer.id}
                            className="card-premium p-4 space-y-3 group"
                        >
                            {/* Top Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{customer.name}</p>
                                        {customer.taxId && (
                                            <Badge variant="outline" className="mt-1 text-[10px] border-emerald-500/30 text-emerald-400">
                                                <Building2 className="w-3 h-3 mr-1" />
                                                {customer.taxId}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-cyan-400"
                                        onClick={() => handleEdit(customer)}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                                        onClick={() => {
                                            setDeletingCustomer(customer)
                                            setDeleteDialogOpen(true)
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {customer.phone && (
                                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                        <Phone className="w-3 h-3" /> {customer.phone}
                                    </a>
                                )}
                                {customer.lineId && (
                                    <span className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3 text-emerald-500" /> {customer.lineId}
                                    </span>
                                )}
                                {customer.address && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {customer.address.length > 40 ? customer.address.substring(0, 40) + '...' : customer.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── Add/Edit Dialog ── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-cyan-400" />
                            {editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'กรอกข้อมูลลูกค้าเพื่อเพิ่มเข้าระบบ'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium flex items-center gap-1">
                                <User className="w-3 h-3" /> ชื่อลูกค้า / ชื่อบริษัท <span className="text-rose-400">*</span>
                            </Label>
                            <Input
                                placeholder="เช่น คุณสมชาย หรือ บจก. เอ บี ซี"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                            />
                        </div>

                        {/* Phone + LINE */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> เบอร์โทรศัพท์
                                </Label>
                                <Input
                                    placeholder="0812345678"
                                    value={(editingCustomer ? editingCustomer.phone : form.phone) || ''}
                                    onChange={(e) => editingCustomer ? setEditingCustomer(prev => prev ? { ...prev, phone: e.target.value } : null) : setForm({ ...form, phone: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" /> LINE ID
                                </Label>
                                <div className="space-y-2">
                                    <LineUserSearch onSelect={(user) => {
                                        setForm(prev => ({
                                            ...prev,
                                            lineId: user.display_name,
                                            name: prev.name || user.display_name
                                        }))
                                    }} />
                                    <Input
                                        placeholder="@lineid or Display Name"
                                        value={form.lineId || ''}
                                        onChange={e => setForm({ ...form, lineId: e.target.value })}
                                        className="bg-white/5 border-white/10 focus:border-cyan-500/50 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium flex items-center gap-1">
                                <FileText className="w-3 h-3" /> เลขผู้เสียภาษี (13 หลัก)
                            </Label>
                            <Input
                                placeholder="1234567890123"
                                maxLength={13}
                                value={form.taxId || ''}
                                onChange={e => setForm({ ...form, taxId: e.target.value.replace(/\D/g, '') })}
                                className="bg-white/5 border-white/10 focus:border-cyan-500/50 font-mono"
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> ที่อยู่
                            </Label>
                            <Textarea
                                placeholder="ที่อยู่สำหรับออกใบเสนอราคา / ใบแจ้งหนี้"
                                value={(editingCustomer ? editingCustomer.address : form.address) || ''}
                                onChange={e => editingCustomer ? setEditingCustomer(prev => prev ? { ...prev, address: e.target.value } : null) : setForm({ ...form, address: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[80px]"
                            />
                        </div>

                        {/* Error */}
                        {formError && (
                            <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{formError}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm">ยกเลิก</Button>
                        </DialogClose>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !form.name.trim()}
                            size="sm"
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            {editingCustomer ? 'บันทึก' : 'เพิ่มลูกค้า'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ── */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-sm bg-card border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-rose-400">⚠️ ยืนยันการลบ</DialogTitle>
                        <DialogDescription>
                            ต้องการลบ <strong>{deletingCustomer?.name}</strong> จริงหรือไม่?
                            ข้อมูลที่ลบจะไม่สามารถกู้คืนได้
                        </DialogDescription>
                    </DialogHeader>
                    {formError && (
                        <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{formError}</p>
                    )}
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="ghost" size="sm">ยกเลิก</Button>
                        </DialogClose>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={saving}
                            size="sm"
                            variant="destructive"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
                            ลบลูกค้า
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

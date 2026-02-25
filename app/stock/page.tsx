'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Minus, Plus, AlertTriangle, Package, Loader2, ArrowUpRight, TrendingDown, Box } from 'lucide-react'
import { getStockItems, updateStockLevel, createMaterial } from '@/actions/stock'
import { Material } from '@/lib/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const categories = ['ทั้งหมด', 'VINYL', 'SUBSTRATE', 'INK', 'LAMINATE', 'OTHER']

const typeLabels: Record<string, string> = {
    VINYL: '🎞️ Vinyl Roll',
    SUBSTRATE: '📐 Rigid Board',
    INK: '🖨️ Premium Ink',
    LAMINATE: '✨ Finish Film',
    OTHER: '📦 Accessories',
}

function getStockLevel(current: number, min: number | null): { label: string; color: string; bgColor: string; glow: string } {
    if (!min) return { label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
    const ratio = current / min
    if (ratio <= 0.5) return { label: 'Critical', color: 'text-rose-400', bgColor: 'bg-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]' }
    if (ratio <= 1) return { label: 'Low Stock', color: 'text-amber-400', bgColor: 'bg-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' }
    return { label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
}

export default function StockPage() {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('ทั้งหมด')
    const [stock, setStock] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newMaterial, setNewMaterial] = useState({
        name: '',
        type: 'VINYL',
        inStock: 0,
        minStock: 5,
        costPrice: 0,
        sellingPrice: 0,
        unit: 'unit'
    })

    const loadStock = async () => {
        setLoading(true)
        const data = await getStockItems()
        setStock(data)
        setLoading(false)
    }

    useEffect(() => {
        loadStock()
    }, [])

    const handleCreate = async () => {
        try {
            if (!newMaterial.name) return toast.error("กรุณาระบุชื่อสินค้า")

            await createMaterial({ ...newMaterial, type: newMaterial.type as any })
            toast.success("เพิ่มสินค้าเรียบร้อยแล้ว")
            setIsAddOpen(false)
            setNewMaterial({
                name: '',
                type: 'VINYL',
                inStock: 0,
                minStock: 5,
                costPrice: 0,
                sellingPrice: 0,
                unit: 'unit'
            })
            // Wait a bit or optimistic update? Re-fetch ensures ID is correct
            loadStock()
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า")
        }
    }

    const filtered = stock.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const matchCategory = activeCategory === 'ทั้งหมด' || item.type === activeCategory
        return matchSearch && matchCategory
    })

    const lowStockItems = stock.filter(i => i.inStock <= (i.minStock || 0))
    const totalValue = stock.reduce((acc, item) => acc + (item.inStock * item.costPrice), 0)

    const handleAdjustStock = async (id: string, currentVal: number, delta: number) => {
        if (updating) return
        const newLevel = Math.max(0, currentVal + delta)

        setStock(prev => prev.map(item => item.id === id ? { ...item, inStock: newLevel } : item))

        setUpdating(id)
        const res = await updateStockLevel(id, newLevel, delta > 0 ? 'MANUAL_ADJUST' : 'MANUAL_ADJUST')
        setUpdating(null)

        if (!res.success) {
            setStock(prev => prev.map(item => item.id === id ? { ...item, inStock: currentVal } : item))
            toast.error("อัปเดตสินค้าล้มเหลว")
        }
    }

    return (
        <div className="min-h-screen pb-24 space-y-6">
            {/* Glassmorphism Sticky Header */}
            <div className="sticky top-0 z-50 px-4 py-4 glass border-b">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gradient-cmyk">Inventory</h1>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{loading ? 'Loading items...' : `${stock.length} Materials`}</p>
                    </div>

                    <div className="flex gap-2">
                        {!loading && lowStockItems.length > 0 && (
                            <div className="animate-pulse">
                                <Badge variant="destructive" className="rounded-full px-3 py-1 border-0 shadow-lg shadow-destructive/20 font-bold text-[10px]">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {lowStockItems.length} ACTION
                                </Badge>
                            </div>
                        )}

                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    <Plus className="w-4 h-4 mr-1" /> Add Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                                    <DialogDescription>
                                        เพิ่มรายการวัสดุใหม่เข้าสู่ระบบ Inventory
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">ชื่อสินค้า</Label>
                                        <Input
                                            id="name"
                                            value={newMaterial.name}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="type" className="text-right">ประเภท</Label>
                                        <Select
                                            value={newMaterial.type}
                                            onValueChange={(val) => setNewMaterial({ ...newMaterial, type: val })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="เลือกประเภท" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(typeLabels).map((key) => (
                                                    <SelectItem key={key} value={key}>{typeLabels[key]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="stock" className="text-right">จำนวนเริ่มต้น</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={newMaterial.inStock}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, inStock: Number(e.target.value) })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="minStock" className="text-right">จุดสั่งซื้อ (Min)</Label>
                                        <Input
                                            id="minStock"
                                            type="number"
                                            value={newMaterial.minStock}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, minStock: Number(e.target.value) })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="cost" className="text-right">ต้นทุน (บาท)</Label>
                                        <Input
                                            id="cost"
                                            type="number"
                                            value={newMaterial.costPrice}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, costPrice: Number(e.target.value) })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="unit" className="text-right">หน่วยนับ</Label>
                                        <Input
                                            id="unit"
                                            value={newMaterial.unit}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                                            className="col-span-3"
                                            placeholder="Ex: ม้วน, แผ่น, ขวด"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={handleCreate}>บันทึกรายการ</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search materials..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-2xl text-sm"
                    />
                </div>
            </div>

            {/* Quick Insights Grid */}
            <div className="px-4 grid grid-cols-2 gap-3">
                <div className="card-premium p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Box className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Stock Value</p>
                    <p className="text-xl font-black">฿{totalValue.toLocaleString()}</p>
                </div>
                <div className="card-premium p-4 border-destructive/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <AlertTriangle className="w-12 h-12 text-destructive" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Restock</p>
                    <p className="text-xl font-black text-destructive">{lowStockItems.length}</p>
                </div>
            </div>

            {/* Premium Category Filters */}
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-4 pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                'shrink-0 px-5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 border flex items-center gap-2',
                                activeCategory === cat
                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                    : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border hover:bg-muted'
                            )}
                        >
                            {cat === 'ทั้งหมด' ? 'All Items' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock List - Premium Cards */}
            <div className="px-4 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Syncing Cloud Inventory</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/20">
                        <Package className="w-12 h-12 mb-3 opacity-10" />
                        <p className="text-sm font-bold uppercase tracking-tighter">No materials found</p>
                    </div>
                ) : (
                    filtered.map((item) => {
                        const level = getStockLevel(item.inStock, item.minStock)
                        const maxDisplay = (item.minStock || 5) * 2
                        const stockPercent = Math.min(100, (item.inStock / maxDisplay) * 100)
                        const isUpdating = updating === item.id

                        return (
                            <div key={item.id} className="card-premium overflow-hidden group">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-tighter font-black bg-muted/50 border-0 py-0.5 px-2 rounded-lg">
                                                    {item.type}
                                                </Badge>
                                                <div className={cn('w-2 h-2 rounded-full', level.bgColor, level.glow)} />
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate tracking-tight">
                                                {item.name}
                                            </h3>
                                            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest opacity-60">
                                                {typeLabels[item.type] || item.type}
                                            </p>
                                        </div>

                                        {/* Stepper Control */}
                                        <div className="flex flex-col items-center bg-muted/50 p-1 rounded-[1.25rem] gap-1 border border-border/20">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-background hover:shadow-premium"
                                                onClick={() => handleAdjustStock(item.id, item.inStock, 1)}
                                                disabled={isUpdating}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>

                                            <div className="h-9 flex flex-col items-center justify-center min-w-[32px]">
                                                {isUpdating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                ) : (
                                                    <span className="text-xl font-black tracking-tighter">{item.inStock}</span>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-background hover:shadow-premium"
                                                onClick={() => handleAdjustStock(item.id, item.inStock, -1)}
                                                disabled={isUpdating}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Availability Bar */}
                                    <div className="mt-6 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                                            <span>Inventory Status</span>
                                            <span className={level.color}>{level.label}</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden p-0.5 border border-border/10">
                                            <div
                                                className={cn('h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r shadow-[0_0_10px_rgba(0,0,0,0.1)]',
                                                    item.inStock <= (item.minStock || 0) ? 'from-rose-500 to-magenta' : 'from-primary to-cyan'
                                                )}
                                                style={{ width: `${stockPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer Meta */}
                                    <div className="mt-6 pt-4 border-t border-border/20 flex justify-between items-center">
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest leading-none mb-1">Safety Stock</span>
                                                <span className="text-xs font-bold tracking-tight">{item.minStock || 0} {item.unit}</span>
                                            </div>
                                            <div className="w-[1px] h-7 bg-border/20" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase text-muted-foreground font-black tracking-widest leading-none mb-1">Market Cost</span>
                                                <span className="text-xs font-black tracking-tighter text-primary">฿{item.costPrice.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl px-3 border border-transparent hover:border-primary/20 transition-all">
                                            View Details <ArrowUpRight className="ml-1.5 w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

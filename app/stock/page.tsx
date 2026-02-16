'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Minus, Plus, AlertTriangle, Package, Filter } from 'lucide-react'

interface StockItem {
    id: string
    name: string
    type: string
    unit: string
    inStock: number
    minStock: number
    costPrice: number
}

const categories = ['ทั้งหมด', 'VINYL', 'SUBSTRATE', 'INK', 'LAMINATE', 'OTHER']

// Demo data
const demoStock: StockItem[] = [
    { id: '1', name: 'ไวนิลขาวเงา', type: 'VINYL', unit: 'ม้วน', inStock: 5, minStock: 10, costPrice: 1200 },
    { id: '2', name: 'ไวนิลขาวด้าน', type: 'VINYL', unit: 'ม้วน', inStock: 12, minStock: 10, costPrice: 1100 },
    { id: '3', name: 'อะคริลิค ใส 3มม.', type: 'SUBSTRATE', unit: 'แผ่น', inStock: 20, minStock: 5, costPrice: 850 },
    { id: '4', name: 'อะคริลิค ขาว 5มม.', type: 'SUBSTRATE', unit: 'แผ่น', inStock: 8, minStock: 5, costPrice: 1200 },
    { id: '5', name: 'หมึก Cyan', type: 'INK', unit: 'ลิตร', inStock: 2, minStock: 5, costPrice: 3500 },
    { id: '6', name: 'หมึก Magenta', type: 'INK', unit: 'ลิตร', inStock: 3, minStock: 5, costPrice: 3500 },
    { id: '7', name: 'หมึก Yellow', type: 'INK', unit: 'ลิตร', inStock: 4, minStock: 5, costPrice: 3200 },
    { id: '8', name: 'หมึก Black (Key)', type: 'INK', unit: 'ลิตร', inStock: 6, minStock: 5, costPrice: 2800 },
    { id: '9', name: 'แลมิเนตเงา', type: 'LAMINATE', unit: 'ม้วน', inStock: 7, minStock: 3, costPrice: 900 },
    { id: '10', name: 'สกรูสแตนเลส', type: 'OTHER', unit: 'กล่อง', inStock: 15, minStock: 5, costPrice: 250 },
]

function getStockLevel(current: number, min: number): { label: string; color: string; bgColor: string } {
    const ratio = current / min
    if (ratio <= 0.5) return { label: 'วิกฤต', color: 'text-red-500', bgColor: 'bg-red-500' }
    if (ratio <= 1) return { label: 'ต่ำ', color: 'text-yellow-500', bgColor: 'bg-yellow-500' }
    return { label: 'ปกติ', color: 'text-emerald-500', bgColor: 'bg-emerald-500' }
}

const typeLabels: Record<string, string> = {
    VINYL: '🎞️ ไวนิล',
    SUBSTRATE: '📐 วัสดุพื้น',
    INK: '🖨️ หมึก',
    LAMINATE: '✨ แลมิเนต',
    OTHER: '📦 อื่นๆ',
}

export default function StockPage() {
    const [search, setSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('ทั้งหมด')
    const [stock, setStock] = useState<StockItem[]>(demoStock)

    const filtered = stock.filter(item => {
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
        const matchCategory = activeCategory === 'ทั้งหมด' || item.type === activeCategory
        return matchSearch && matchCategory
    })

    const lowStockCount = stock.filter(i => i.inStock <= i.minStock).length

    const adjustStock = (id: string, delta: number) => {
        setStock(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, inStock: Math.max(0, item.inStock + delta) }
                    : item
            )
        )
    }

    return (
        <div className="space-y-4">
            <PageHeader title="📦 สต็อกวัสดุ" subtitle={`${stock.length} รายการ`}>
                {lowStockCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {lowStockCount} ต่ำ
                    </Badge>
                )}
            </PageHeader>

            {/* Search */}
            <div className="px-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาวัสดุ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>

            {/* Category Filter */}
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-4 pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-target',
                                activeCategory === cat
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {cat === 'ทั้งหมด' ? '📋 ทั้งหมด' : typeLabels[cat] || cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock List */}
            <div className="px-4 pb-8 space-y-2">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Package className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">ไม่พบวัสดุ</p>
                    </div>
                )}

                {filtered.map((item) => {
                    const level = getStockLevel(item.inStock, item.minStock)
                    const stockPercent = Math.min(100, (item.inStock / (item.minStock * 2)) * 100)

                    return (
                        <Card key={item.id} className="border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                {/* Stock bar indicator */}
                                <div className="h-1 bg-muted">
                                    <div
                                        className={cn('h-full transition-all', level.bgColor)}
                                        style={{ width: `${stockPercent}%` }}
                                    />
                                </div>

                                <div className="p-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-muted-foreground">
                                                    {typeLabels[item.type] || item.type}
                                                </span>
                                                <span className={cn('text-[10px] font-medium', level.color)}>
                                                    ● {level.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg"
                                                onClick={() => adjustStock(item.id, -1)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>

                                            <div className="text-center min-w-[50px]">
                                                <p className="text-lg font-bold leading-none">{item.inStock}</p>
                                                <p className="text-[9px] text-muted-foreground">{item.unit}</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg"
                                                onClick={() => adjustStock(item.id, 1)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Min stock info */}
                                    <p className="text-[10px] text-muted-foreground mt-1.5">
                                        ขั้นต่ำ: {item.minStock} {item.unit} • ต้นทุน: ฿{item.costPrice.toLocaleString()}/{item.unit}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

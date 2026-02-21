'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getAllMaterialsForPricing } from '@/actions/pricing'
import { calculateQuotation, type PricingMaterial, type PricingTierInput, type PricingConfig, DEFAULT_PRICING_CONFIG, type QuotationResult } from '@/lib/pricing-engine'

// Extends local item with pricing material
export interface CalcLineItem {
    id: string
    description: string
    materialId: string | null
    width: number | null
    height: number | null
    quantity: number
    customUnitPrice: number | null // If user overrides
    // Readonly outputs from calc
    unitPrice: number
    totalPrice: number
}

interface PricingCalculatorProps {
    items: CalcLineItem[]
    onChange: (items: CalcLineItem[], results: QuotationResult | null) => void
    config?: Partial<PricingConfig>
}

export function PricingCalculator({ items, onChange, config }: PricingCalculatorProps) {
    const [materials, setMaterials] = useState<(PricingMaterial & { tiers: PricingTierInput[] })[]>([])

    useEffect(() => {
        getAllMaterialsForPricing().then(setMaterials)
    }, [])

    // Whenever items change, perform calculation
    useEffect(() => {
        if (materials.length === 0) return

        const pricingItems = items.map(item => {
            const mat = materials.find(m => m.id === item.materialId)
            if (!mat) {
                // Return dummy material if none selected, just to allow manual entry
                return {
                    name: item.description,
                    width: item.width,
                    height: item.height,
                    quantity: item.quantity,
                    customUnitPrice: item.customUnitPrice ?? 0,
                    material: {
                        id: 'custom',
                        name: 'Custom',
                        sellingPrice: item.customUnitPrice ?? 0,
                        costPrice: 0,
                        wasteFactor: 1,
                        unit: 'piece'
                    },
                    pricingTiers: []
                }
            }

            return {
                name: item.description || mat.name,
                width: item.width,
                height: item.height,
                quantity: item.quantity,
                customUnitPrice: item.customUnitPrice !== null ? item.customUnitPrice : undefined,
                material: mat,
                pricingTiers: mat.tiers
            }
        })

        const result = calculateQuotation(pricingItems, [], { ...DEFAULT_PRICING_CONFIG, ...config })

        // Check if any output prices differ from current state to prevent infinite loops
        let changed = false
        const updatedItems = items.map((item, idx) => {
            const resItem = result.lineItems[idx]
            if (resItem && (item.unitPrice !== resItem.unitPrice || item.totalPrice !== resItem.totalPrice)) {
                changed = true
                return {
                    ...item,
                    unitPrice: resItem.unitPrice,
                    totalPrice: resItem.totalPrice
                }
            }
            return item
        })

        if (changed) {
            onChange(updatedItems, result)
        } else {
            // Still pass result up, just don't create new object references for items 
            onChange(items, result)
        }
    }, [items, materials, config])

    const addItem = () => {
        const newItem: CalcLineItem = {
            id: crypto.randomUUID(),
            description: '',
            materialId: null,
            width: null,
            height: null,
            quantity: 1,
            customUnitPrice: null,
            unitPrice: 0,
            totalPrice: 0,
        }
        onChange([...items, newItem], null) // Will trigger effect
    }

    const removeItem = (id: string) => {
        onChange(items.filter((item) => item.id !== id), null) // Will trigger effect
    }

    const updateItem = (id: string, field: keyof CalcLineItem, value: any) => {
        const updatedItems = items.map((item) => {
            if (item.id === id) {
                const newItem = { ...item, [field]: value }
                // If user changes material, reset custom price so standard price applies
                if (field === 'materialId') {
                    newItem.customUnitPrice = null
                }
                // If user changes width/height and material uses pieces, maybe we don't care, 
                // but if they type a custom unit price manually
                if (field === 'unitPrice') {
                    newItem.customUnitPrice = value // Store manual override
                }
                return newItem
            }
            return item
        })
        onChange(updatedItems, null) // Will trigger effect
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการ
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[20%]">วัสดุ</TableHead>
                        <TableHead className="w-[25%]">รายละเอียด</TableHead>
                        <TableHead className="w-[10%] text-center">กว้าง(ม.)</TableHead>
                        <TableHead className="w-[10%] text-center">ยาว/สูง(ม.)</TableHead>
                        <TableHead className="w-[10%] text-center">จำนวน</TableHead>
                        <TableHead className="w-[10%] text-right">ราคา/หน่วย</TableHead>
                        <TableHead className="w-[10%] text-right">รวม</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <Select
                                    value={item.materialId || 'custom'}
                                    onValueChange={(val) => updateItem(item.id, 'materialId', val === 'custom' ? null : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกวัสดุ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">กำหนดเอง</SelectItem>
                                        {materials.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell>
                                <Input
                                    placeholder="รายละเอียด เช่น ป้ายหน้าร้าน"
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    className="text-center"
                                    placeholder="0.00"
                                    value={item.width !== null ? item.width : ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? parseFloat(e.target.value) : null
                                        updateItem(item.id, 'width', val)
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    className="text-center"
                                    placeholder="0.00"
                                    value={item.height !== null ? item.height : ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? parseFloat(e.target.value) : null
                                        updateItem(item.id, 'height', val)
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    className="text-center"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                    type="number"
                                    className="text-right"
                                    placeholder="Auto"
                                    value={item.customUnitPrice !== null ? item.customUnitPrice : item.unitPrice}
                                    onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value ? parseFloat(e.target.value) : 0)}
                                />
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                                {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => removeItem(item.id)}
                                    disabled={items.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

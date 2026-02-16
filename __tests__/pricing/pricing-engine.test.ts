import { describe, it, expect } from 'vitest'
import {
    calculateArea,
    applyWasteFactor,
    findApplicableTier,
    calculateLineItem,
    calculateServiceCharges,
    calculateVat,
    calculateQuotation,
    DEFAULT_PRICING_CONFIG,
    type PricingLineItem,
    type PricingMaterial,
    type PricingTierInput,
    type ServiceCharge,
    type PricingConfig,
} from '@/lib/pricing-engine'

// ============================================================
// MOCK DATA
// ============================================================

const mockVinyl: PricingMaterial = {
    id: 'mat-001',
    name: 'Vinyl Glossy',
    sellingPrice: 250,      // 250 บาท/sqm
    costPrice: 150,         // 150 บาท/sqm (ต้นทุน)
    wasteFactor: 1.15,      // เผื่อเหลือ 15%
    unit: 'sqm',
}

const mockAcrylic: PricingMaterial = {
    id: 'mat-002',
    name: 'Acrylic 3mm',
    sellingPrice: 800,
    costPrice: 450,
    wasteFactor: 1.10,
    unit: 'sqm',
}

const mockPieceMaterial: PricingMaterial = {
    id: 'mat-003',
    name: 'LED Module',
    sellingPrice: 350,
    costPrice: 200,
    wasteFactor: 1.0,       // ไม่มี waste สำหรับชิ้นงาน
    unit: 'piece',
}

const mockTiers: PricingTierInput[] = [
    { minQuantity: 10, discountPercent: 5 },
    { minQuantity: 50, discountPercent: 10 },
    { minQuantity: 100, discountPercent: 15 },
]

// ============================================================
// 1. calculateArea
// ============================================================
describe('calculateArea', () => {
    it('should calculate area for width × height', () => {
        const result = calculateArea(2, 3, 1)
        expect(result.areaPer).toBe(6)
        expect(result.totalArea).toBe(6)
    })

    it('should multiply area by quantity', () => {
        const result = calculateArea(2, 3, 5)
        expect(result.areaPer).toBe(6)
        expect(result.totalArea).toBe(30)
    })

    it('should return quantity as area when width is null (piece-based)', () => {
        const result = calculateArea(null, null, 10)
        expect(result.areaPer).toBeNull()
        expect(result.totalArea).toBe(10)
    })

    it('should return quantity as area when width is 0', () => {
        const result = calculateArea(0, 5, 3)
        expect(result.areaPer).toBeNull()
        expect(result.totalArea).toBe(3)
    })

    it('should handle 1×1 meter', () => {
        const result = calculateArea(1, 1, 1)
        expect(result.areaPer).toBe(1)
        expect(result.totalArea).toBe(1)
    })

    it('should handle decimal dimensions', () => {
        const result = calculateArea(1.5, 2.5, 2)
        expect(result.areaPer).toBe(3.75)
        expect(result.totalArea).toBe(7.5)
    })
})

// ============================================================
// 2. applyWasteFactor
// ============================================================
describe('applyWasteFactor', () => {
    it('should apply 15% waste factor', () => {
        expect(applyWasteFactor(10, 1.15)).toBe(11.5)
    })

    it('should not reduce area if wasteFactor < 1', () => {
        // wasteFactor ต้องไม่ต่ำกว่า 1 (ใช้ Math.max)
        expect(applyWasteFactor(10, 0.8)).toBe(10)
    })

    it('should return same area if wasteFactor is exactly 1', () => {
        expect(applyWasteFactor(10, 1.0)).toBe(10)
    })

    it('should apply 20% waste factor', () => {
        expect(applyWasteFactor(100, 1.20)).toBe(120)
    })
})

// ============================================================
// 3. findApplicableTier
// ============================================================
describe('findApplicableTier', () => {
    it('should return null for empty tiers', () => {
        expect(findApplicableTier(50, [])).toBeNull()
    })

    it('should return null when quantity is below all tiers', () => {
        expect(findApplicableTier(5, mockTiers)).toBeNull()
    })

    it('should return first tier when quantity equals minQuantity', () => {
        const tier = findApplicableTier(10, mockTiers)
        expect(tier?.discountPercent).toBe(5)
    })

    it('should return middle tier for mid-range quantity', () => {
        const tier = findApplicableTier(50, mockTiers)
        expect(tier?.discountPercent).toBe(10)
    })

    it('should return highest applicable tier', () => {
        const tier = findApplicableTier(200, mockTiers)
        expect(tier?.discountPercent).toBe(15)
    })

    it('should return first tier for quantity between first and second', () => {
        const tier = findApplicableTier(25, mockTiers)
        expect(tier?.discountPercent).toBe(5)
    })
})

// ============================================================
// 4. calculateLineItem — ป้ายง่ายๆ
// ============================================================
describe('calculateLineItem', () => {
    it('should calculate a basic vinyl banner', () => {
        const item: PricingLineItem = {
            name: 'ป้ายไวนิล 2×3 เมตร',
            width: 2,
            height: 3,
            quantity: 1,
            material: mockVinyl,
        }

        const result = calculateLineItem(item)

        expect(result.areaPer).toBe(6)
        expect(result.totalArea).toBe(6)
        expect(result.materialArea).toBeCloseTo(6.9, 10) // 6 * 1.15
        expect(result.unitPrice).toBe(250)
        // subtotal = 6.9 * 250 = 1725
        expect(result.subtotal).toBe(1725)
        expect(result.discountPercent).toBe(0)
        expect(result.totalPrice).toBe(1725)
    })

    it('should apply waste factor correctly', () => {
        const item: PricingLineItem = {
            name: 'Acrylic Sign',
            width: 1,
            height: 1,
            quantity: 1,
            material: mockAcrylic, // wasteFactor: 1.10
        }

        const result = calculateLineItem(item)
        expect(result.materialArea).toBeCloseTo(1.1, 10) // 1 * 1.10
        // subtotal = 1.1 * 800 = 880
        expect(result.subtotal).toBe(880)
    })

    it('should apply pricing tier discount', () => {
        const item: PricingLineItem = {
            name: 'ป้ายไวนิลจำนวนมาก',
            width: 1,
            height: 1,
            quantity: 50,  // >= 50 sqm → 10% discount
            material: mockVinyl,
            pricingTiers: mockTiers,
        }

        const result = calculateLineItem(item)

        expect(result.totalArea).toBe(50)
        expect(result.discountPercent).toBe(10)
        // materialArea = 50 * 1.15 = 57.5
        // subtotal = 57.5 * 250 = 14375
        // discount = 14375 * 0.10 = 1437.5 → 1438 (rounded)
        // totalPrice = 14375 - 1437.5 = 12937.5 → 12938 (rounded)
        expect(result.subtotal).toBe(14375)
        expect(result.totalPrice).toBe(12938)
    })

    it('should use customUnitPrice when provided', () => {
        const item: PricingLineItem = {
            name: 'Special Price Item',
            width: 1,
            height: 1,
            quantity: 1,
            material: mockVinyl,
            customUnitPrice: 500, // Override sellingPrice 250 → 500
        }

        const result = calculateLineItem(item)
        expect(result.unitPrice).toBe(500)
        // materialArea = 1 * 1.15 = 1.15
        // subtotal = 1.15 * 500 = 575
        expect(result.subtotal).toBe(575)
    })

    it('should handle piece-based items', () => {
        const item: PricingLineItem = {
            name: 'LED Module',
            width: null,
            height: null,
            quantity: 20,
            material: mockPieceMaterial,
        }

        const result = calculateLineItem(item)
        expect(result.areaPer).toBeNull()
        expect(result.totalArea).toBe(20)
        expect(result.materialArea).toBe(20) // wasteFactor = 1.0
        // subtotal = 20 * 350 = 7000
        expect(result.subtotal).toBe(7000)
    })

    it('should enforce minimum charge per item', () => {
        const config: PricingConfig = {
            ...DEFAULT_PRICING_CONFIG,
            minimumChargePerItem: 500,
        }

        const item: PricingLineItem = {
            name: 'ป้ายเล็กๆ',
            width: 0.1,
            height: 0.1,
            quantity: 1,
            material: mockVinyl,
        }

        const result = calculateLineItem(item, config)
        // Area = 0.01 sqm → price would be tiny
        // Should be bumped to minimum 500
        expect(result.totalPrice).toBe(500)
    })

    it('should calculate profit margin', () => {
        const item: PricingLineItem = {
            name: 'ป้าย 1×1',
            width: 1,
            height: 1,
            quantity: 1,
            material: mockVinyl, // sell: 250, cost: 150
        }

        const result = calculateLineItem(item)
        // materialArea = 1.15
        // totalPrice = 1.15 * 250 = 287.5 → 288
        // cost = 1.15 * 150 = 172.5
        // profit = 288 - 172.5 = 115.5 → 116
        expect(result.estimatedProfit).toBeGreaterThan(0)
        expect(result.profitMargin).toBeGreaterThan(0)
    })
})

// ============================================================
// 5. calculateServiceCharges
// ============================================================
describe('calculateServiceCharges', () => {
    it('should calculate fixed charge', () => {
        const charges: ServiceCharge[] = [
            { name: 'ค่าติดตั้ง', type: 'fixed', amount: 2000 },
        ]

        const result = calculateServiceCharges(charges, 10, 5000)
        expect(result[0].amount).toBe(2000)
    })

    it('should calculate per_sqm charge', () => {
        const charges: ServiceCharge[] = [
            { name: 'ค่าติดตั้ง', type: 'per_sqm', amount: 100 },
        ]

        const result = calculateServiceCharges(charges, 20, 5000)
        // 100 × 20 sqm = 2000
        expect(result[0].amount).toBe(2000)
    })

    it('should calculate percentage charge', () => {
        const charges: ServiceCharge[] = [
            { name: 'ค่าออกแบบ', type: 'percentage', amount: 10 },
        ]

        const result = calculateServiceCharges(charges, 10, 10000)
        // 10% of 10000 = 1000
        expect(result[0].amount).toBe(1000)
    })

    it('should handle multiple charges', () => {
        const charges: ServiceCharge[] = [
            { name: 'ติดตั้ง', type: 'fixed', amount: 3000 },
            { name: 'ออกแบบ', type: 'percentage', amount: 5 },
            { name: 'ขนส่ง', type: 'per_sqm', amount: 50 },
        ]

        const result = calculateServiceCharges(charges, 10, 20000)
        expect(result).toHaveLength(3)
        expect(result[0].amount).toBe(3000)   // fixed
        expect(result[1].amount).toBe(1000)   // 5% of 20000
        expect(result[2].amount).toBe(500)    // 50 × 10
    })
})

// ============================================================
// 6. calculateVat
// ============================================================
describe('calculateVat', () => {
    it('should calculate 7% VAT', () => {
        expect(calculateVat(10000, 0.07)).toBe(700)
    })

    it('should round VAT by default', () => {
        expect(calculateVat(9999, 0.07)).toBe(700) // 699.93 → 700
    })

    it('should not round when disabled', () => {
        const vat = calculateVat(9999, 0.07, false)
        expect(vat).toBeCloseTo(699.93, 2)
    })

    it('should handle 0% VAT', () => {
        expect(calculateVat(10000, 0)).toBe(0)
    })
})

// ============================================================
// 7. calculateQuotation — Full Integration
// ============================================================
describe('calculateQuotation', () => {
    it('should calculate a simple single-item quotation', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้ายหน้าร้าน 3×1 เมตร',
            width: 3,
            height: 1,
            quantity: 1,
            material: mockVinyl,
        }]

        const result = calculateQuotation(items)

        expect(result.lineItems).toHaveLength(1)
        expect(result.lineItems[0].totalArea).toBe(3)

        // materialArea = 3 * 1.15 = 3.45
        // itemsSubtotal = 3.45 * 250 = 862.5 → 863
        expect(result.itemsSubtotal).toBe(863)

        // VAT = 863 * 0.07 = 60.41 → 60
        expect(result.vatAmount).toBe(60)

        // Grand Total = 863 + 60 = 923
        expect(result.grandTotal).toBe(923)
    })

    it('should calculate multi-item quotation', () => {
        const items: PricingLineItem[] = [
            {
                name: 'ป้ายไวนิล',
                width: 2,
                height: 1,
                quantity: 2,
                material: mockVinyl,
            },
            {
                name: 'ป้ายอะครีลิค',
                width: 0.5,
                height: 0.5,
                quantity: 4,
                material: mockAcrylic,
            },
        ]

        const result = calculateQuotation(items)
        expect(result.lineItems).toHaveLength(2)
        expect(result.grandTotal).toBeGreaterThan(0)
        expect(result.vatAmount).toBeGreaterThan(0)
        expect(result.totalProfit).toBeGreaterThan(0)
    })

    it('should include service charges in total', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้าย',
            width: 2,
            height: 1,
            quantity: 1,
            material: mockVinyl,
        }]

        const services: ServiceCharge[] = [
            { name: 'ติดตั้ง', type: 'fixed', amount: 1500 },
        ]

        const resultWithService = calculateQuotation(items, services)
        const resultWithout = calculateQuotation(items, [])

        // Service charge should increase total
        expect(resultWithService.totalBeforeVat).toBe(resultWithout.totalBeforeVat + 1500)
        expect(resultWithService.grandTotal).toBeGreaterThan(resultWithout.grandTotal)
    })

    it('should enforce minimum order charge', () => {
        const items: PricingLineItem[] = [{
            name: 'สติกเกอร์เล็กๆ',
            width: 0.05,
            height: 0.05,
            quantity: 1,
            material: mockVinyl,
        }]

        const config: PricingConfig = {
            ...DEFAULT_PRICING_CONFIG,
            minimumChargePerOrder: 500,
        }

        const result = calculateQuotation(items, [], config)
        expect(result.totalBeforeVat).toBe(500)
    })

    it('should use custom VAT rate', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้าย',
            width: 1,
            height: 1,
            quantity: 1,
            material: mockVinyl,
        }]

        const noVat = calculateQuotation(items, [], {
            ...DEFAULT_PRICING_CONFIG,
            vatRate: 0,
        })

        const withVat = calculateQuotation(items, [], {
            ...DEFAULT_PRICING_CONFIG,
            vatRate: 0.07,
        })

        expect(noVat.vatAmount).toBe(0)
        expect(noVat.grandTotal).toBe(noVat.totalBeforeVat)
        expect(withVat.vatAmount).toBeGreaterThan(0)
        expect(withVat.grandTotal).toBeGreaterThan(withVat.totalBeforeVat)
    })

    it('should calculate profit metrics', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้าย',
            width: 2,
            height: 2,
            quantity: 1,
            material: mockVinyl, // sell: 250, cost: 150
        }]

        const result = calculateQuotation(items)

        expect(result.totalCost).toBeGreaterThan(0)
        expect(result.totalProfit).toBeGreaterThan(0)
        expect(result.averageProfitMargin).toBeGreaterThan(0)
        expect(result.averageProfitMargin).toBeLessThan(100)
    })
})

// ============================================================
// 8. Real-World Scenarios
// ============================================================
describe('Real-World Scenarios', () => {
    it('Scenario: ร้านสั่งป้ายอะครีลิค + ติดตั้ง + ออกแบบ', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้ายอะครีลิค LED หน้าร้าน',
            width: 3,
            height: 1.2,
            quantity: 1,
            material: mockAcrylic,
        }]

        const services: ServiceCharge[] = [
            { name: 'ออกแบบ', type: 'fixed', amount: 3000 },
            { name: 'ติดตั้ง', type: 'per_sqm', amount: 200 },
        ]

        const result = calculateQuotation(items, services)

        // Area = 3 × 1.2 ≈ 3.6 sqm (floating point)
        expect(result.lineItems[0].totalArea).toBeCloseTo(3.6, 5)

        // Service: ออกแบบ 3000 + ติดตั้ง (200 × 3.6 = 720) ≈ 3720
        expect(result.serviceTotalAmount).toBeCloseTo(3720, 0)

        // Should have VAT
        expect(result.vatRate).toBe(0.07)
        expect(result.vatAmount).toBeGreaterThan(0)

        console.log('=== ใบเสนอราคาร้านสั่งงาน ===')
        console.log(`ป้าย: ฿${result.itemsSubtotal.toLocaleString()}`)
        console.log(`ค่าบริการ: ฿${result.serviceTotalAmount.toLocaleString()}`)
        console.log(`ก่อน VAT: ฿${result.totalBeforeVat.toLocaleString()}`)
        console.log(`VAT 7%: ฿${result.vatAmount.toLocaleString()}`)
        console.log(`รวมสุทธิ: ฿${result.grandTotal.toLocaleString()}`)
        console.log(`กำไร ~${result.averageProfitMargin}%`)
    })

    it('Scenario: งานป้ายไวนิลจำนวนมาก ≥ 100 sqm → ส่วนลด 15%', () => {
        const items: PricingLineItem[] = [{
            name: 'ป้ายโฆษณาไวนิล',
            width: 5,
            height: 2,
            quantity: 10, // 10 ชิ้น × 10 sqm = 100 sqm
            material: mockVinyl,
            pricingTiers: mockTiers,
        }]

        const result = calculateQuotation(items)

        expect(result.lineItems[0].totalArea).toBe(100)
        expect(result.lineItems[0].discountPercent).toBe(15) // ≥ 100 sqm
        expect(result.lineItems[0].discountAmount).toBeGreaterThan(0)
        expect(result.grandTotal).toBeGreaterThan(0)
    })

    it('Scenario: ใบเสนอราคาเปล่า (0 items)', () => {
        const result = calculateQuotation([])

        expect(result.lineItems).toHaveLength(0)
        expect(result.itemsSubtotal).toBe(0)
        expect(result.grandTotal).toBe(0)
        expect(result.vatAmount).toBe(0)
    })
})

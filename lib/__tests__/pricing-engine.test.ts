import { describe, it, expect } from 'vitest'
import {
    calculateArea,
    applyWasteFactor,
    findApplicableTier,
    calculateLineItem,
    calculateVat,
    calculateQuotation,
    DEFAULT_PRICING_CONFIG,
    type PricingMaterial,
    type PricingLineItem,
} from '../pricing-engine'

// Mock Materials for Testing
const mockVinyl: PricingMaterial = {
    id: 'm1',
    name: 'Vinyl 360g',
    sellingPrice: 150, // 150 THB per sqm
    costPrice: 80,
    wasteFactor: 1.1, // +10% waste
    unit: 'sqm',
}

const mockStandee: PricingMaterial = {
    id: 'm2',
    name: 'PP Board Standee',
    sellingPrice: 800, // 800 THB per piece
    costPrice: 400,
    wasteFactor: 1.0,
    unit: 'piece',
}

describe('Pricing Engine - Core Math', () => {
    describe('calculateArea', () => {
        it('should calculate area correctly for dimensions (sqm)', () => {
            const { areaPer, totalArea } = calculateArea(2, 3, 2)
            expect(areaPer).toBe(6) // 2x3 = 6 sqm
            expect(totalArea).toBe(12) // 6 * 2 qty = 12 sqm
        })

        it('should handle null dimensions for a piece-based material', () => {
            const { areaPer, totalArea } = calculateArea(null, null, 5)
            expect(areaPer).toBe(null)
            expect(totalArea).toBe(5) // Quantity is treated as total units
        })
    })

    describe('applyWasteFactor', () => {
        it('should apply waste factor correctly', () => {
            // 10 sqm * 1.15 waste = 11.5
            expect(applyWasteFactor(10, 1.15)).toBe(11.5)
        })

        it('should fallback to 1 if wasteFactor is less than 1', () => {
            expect(applyWasteFactor(10, 0.5)).toBe(10)
        })
    })

    describe('findApplicableTier', () => {
        const tiers = [
            { minQuantity: 10, discountPercent: 5 },
            { minQuantity: 50, discountPercent: 10 },
            { minQuantity: 100, discountPercent: 20 },
        ]

        it('should return null if quantity is below lowest tier', () => {
            expect(findApplicableTier(5, tiers)).toBeNull()
        })

        it('should return 5% for quantity 15', () => {
            expect(findApplicableTier(15, tiers)?.discountPercent).toBe(5)
        })

        it('should return 10% for quantity 50', () => {
            expect(findApplicableTier(50, tiers)?.discountPercent).toBe(10)
        })

        it('should return 20% for quantity 150', () => {
            expect(findApplicableTier(150, tiers)?.discountPercent).toBe(20)
        })
    })

    describe('calculateVat', () => {
        it('should calculate 7% VAT', () => {
            expect(calculateVat(1000, 0.07, false)).toBe(70)
        })

        it('should round VAT based on config', () => {
            expect(calculateVat(1005, 0.07, true)).toBe(70) // 70.35 -> 70
        })
    })
})

describe('Pricing Engine - Unit Calculations (calculateLineItem)', () => {
    it('should calculate standard sqm item cost correctly', () => {
        const item: PricingLineItem = {
            name: 'Promotion Banner',
            width: 2,
            height: 5,
            quantity: 1,
            material: mockVinyl,
        }

        const result = calculateLineItem(item)

        // Logic: 
        // 1. Area = 10 sqm
        // 2. Material Area (w/ Waste 1.1) = 11 sqm
        // 3. Price = 11 * 150 = 1650
        expect(result.totalArea).toBe(10)
        expect(result.materialArea).toBe(11)
        expect(result.totalPrice).toBe(1650)
    })

    it('should correctly apply a tiered discount', () => {
        const item: PricingLineItem = {
            name: 'Bulk Flags',
            width: 1,
            height: 1,
            quantity: 100, // Meets 20% tier
            material: mockVinyl,
            pricingTiers: [{ minQuantity: 100, discountPercent: 20 }]
        }

        const result = calculateLineItem(item, { ...DEFAULT_PRICING_CONFIG, roundToInteger: false })

        // 1. Area = 100 sqm
        // 2. Material Area = 110 sqm (waste)
        // 3. Base Price = 110 * 150 = 16500
        // 4. Discount 20% = 3300
        // 5. Total = 13200
        expect(result.subtotal).toBe(16500)
        expect(result.discountPercent).toBe(20)
        expect(result.discountAmount).toBe(3300)
        expect(result.totalPrice).toBe(13200)
    })

    it('should use customUnitPrice if provided', () => {
        const item: PricingLineItem = {
            name: 'Special Deal Banner',
            width: 2,
            height: 2,
            quantity: 1,
            material: mockVinyl, // Normally 150
            customUnitPrice: 100 // Override to 100
        }

        const result = calculateLineItem(item)

        // Area = 4, Waste Area = 4.4, Price = 4.4 * 100 = 440
        expect(result.unitPrice).toBe(100)
        expect(result.totalPrice).toBe(440)
    })
})

describe('Pricing Engine - Quotation Total Calculation (calculateQuotation)', () => {
    it('should calculate grand total, vat, and sum up subitems correctly', () => {
        const items: PricingLineItem[] = [
            {
                name: 'Banner A',
                width: 2,
                height: 5, // 10sqm, waste 1.1 = 11sqm, 11*150 = 1650
                quantity: 1,
                material: mockVinyl,
            },
            {
                name: 'Standee B',
                width: null,
                height: null,
                quantity: 2, // 2 pieces * 800 = 1600 (waste 1.0)
                material: mockStandee,
            }
        ]

        const serviceCharges = [
            { name: 'Installation', type: 'fixed' as const, amount: 1500 }
        ]

        const result = calculateQuotation(items, serviceCharges, { ...DEFAULT_PRICING_CONFIG, roundToInteger: false })

        // Subtotal = 1650 + 1600 = 3250
        expect(result.itemsSubtotal).toBe(3250)

        // Services = 1500
        expect(result.serviceTotalAmount).toBe(1500)

        // Total Before VAT = 4750
        expect(result.totalBeforeVat).toBe(4750)

        // VAT (7%) = 332.5
        expect(result.vatAmount).toBeCloseTo(332.5)

        // Grand Total = 5082.5
        expect(result.grandTotal).toBeCloseTo(5082.5)
    })

    it('should enforce minimum order charge if configured', () => {
        const items: PricingLineItem[] = [
            {
                name: 'Small Sticker',
                width: 1,
                height: 1, // 1sqm, waste 1.1 = 1.1sqm * 150 = 165
                quantity: 1,
                material: mockVinyl,
            }
        ]

        // Ensure configuring a massive minimum charge boosts the price before VAT
        const result = calculateQuotation(items, [], { ...DEFAULT_PRICING_CONFIG, minimumChargePerOrder: 500, roundToInteger: false })

        expect(result.itemsSubtotal).toBe(165)
        expect(result.totalBeforeVat).toBe(500) // Bumped up by minimum charge!
        expect(result.vatAmount).toBe(35) // 7% of 500 = 35
        expect(result.grandTotal).toBe(535)
    })
})

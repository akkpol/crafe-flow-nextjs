import { describe, it, expect } from 'vitest'

/**
 * getStockLevel — ฟังก์ชันคำนวณระดับสต็อก
 * เราดึง logic มาจาก app/stock/page.tsx แล้วทำ test แยก
 */
function getStockLevel(current: number, min: number | null): { label: string; color: string; bgColor: string; glow: string } {
    if (!min) return { label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
    const ratio = current / min
    if (ratio <= 0.5) return { label: 'Critical', color: 'text-rose-400', bgColor: 'bg-rose-500', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]' }
    if (ratio <= 1) return { label: 'Low Stock', color: 'text-amber-400', bgColor: 'bg-amber-500', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' }
    return { label: 'Healthy', color: 'text-emerald-400', bgColor: 'bg-emerald-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
}

/**
 * handleAdjustStock logic — จำลอง Optimistic UI
 */
function calculateNewStock(currentVal: number, delta: number): number {
    return Math.max(0, currentVal + delta)
}

// ============================================================
// 1. getStockLevel TESTS
// ============================================================
describe('getStockLevel', () => {
    describe('when minStock is null or 0', () => {
        it('should return Healthy for null minStock', () => {
            const result = getStockLevel(100, null)
            expect(result.label).toBe('Healthy')
            expect(result.bgColor).toContain('emerald')
        })

        it('should return Healthy for 0 minStock', () => {
            const result = getStockLevel(50, 0)
            expect(result.label).toBe('Healthy')
        })

        it('should return Healthy even if current is 0 with null min', () => {
            const result = getStockLevel(0, null)
            expect(result.label).toBe('Healthy')
        })
    })

    describe('Critical level (ratio <= 0.5)', () => {
        it('should return Critical when stock is 0 and minStock is 10', () => {
            const result = getStockLevel(0, 10)
            expect(result.label).toBe('Critical')
            expect(result.bgColor).toContain('rose')
        })

        it('should return Critical when stock is exactly half of minStock', () => {
            const result = getStockLevel(5, 10)
            expect(result.label).toBe('Critical')
        })

        it('should return Critical when stock is 1 and minStock is 10', () => {
            const result = getStockLevel(1, 10)
            expect(result.label).toBe('Critical')
        })
    })

    describe('Low Stock level (ratio > 0.5 and <= 1)', () => {
        it('should return Low Stock when stock is 6 and minStock is 10', () => {
            const result = getStockLevel(6, 10)
            expect(result.label).toBe('Low Stock')
            expect(result.bgColor).toContain('amber')
        })

        it('should return Low Stock when stock equals minStock', () => {
            const result = getStockLevel(10, 10)
            expect(result.label).toBe('Low Stock')
        })

        it('should return Low Stock when stock is 8 and minStock is 10', () => {
            const result = getStockLevel(8, 10)
            expect(result.label).toBe('Low Stock')
        })
    })

    describe('Healthy level (ratio > 1)', () => {
        it('should return Healthy when stock is above minStock', () => {
            const result = getStockLevel(15, 10)
            expect(result.label).toBe('Healthy')
            expect(result.bgColor).toContain('emerald')
        })

        it('should return Healthy when stock is way above minStock', () => {
            const result = getStockLevel(100, 10)
            expect(result.label).toBe('Healthy')
        })

        it('should return Healthy when stock is 11 and minStock is 10', () => {
            const result = getStockLevel(11, 10)
            expect(result.label).toBe('Healthy')
        })
    })

    describe('Edge cases', () => {
        it('should handle minStock of 1', () => {
            expect(getStockLevel(0, 1).label).toBe('Critical')
            expect(getStockLevel(1, 1).label).toBe('Low Stock')
            expect(getStockLevel(2, 1).label).toBe('Healthy')
        })

        it('should handle very large numbers', () => {
            const result = getStockLevel(999999, 100)
            expect(result.label).toBe('Healthy')
        })

        it('should handle decimal values', () => {
            const result = getStockLevel(2.5, 5)
            expect(result.label).toBe('Critical')
        })
    })
})

// ============================================================
// 2. calculateNewStock (Optimistic UI logic) TESTS
// ============================================================
describe('calculateNewStock', () => {
    it('should increment stock by 1', () => {
        expect(calculateNewStock(10, 1)).toBe(11)
    })

    it('should decrement stock by 1', () => {
        expect(calculateNewStock(10, -1)).toBe(9)
    })

    it('should not go below 0', () => {
        expect(calculateNewStock(0, -1)).toBe(0)
    })

    it('should not go below 0 with large negative delta', () => {
        expect(calculateNewStock(5, -100)).toBe(0)
    })

    it('should handle delta of 0', () => {
        expect(calculateNewStock(10, 0)).toBe(10)
    })

    it('should handle large increments', () => {
        expect(calculateNewStock(0, 100)).toBe(100)
    })

    it('should decrement from 1 to 0', () => {
        expect(calculateNewStock(1, -1)).toBe(0)
    })
})

// ============================================================
// 3. Stock Percentage Calculation TESTS
// ============================================================
describe('Stock Percentage Calculation', () => {
    function calculateStockPercent(inStock: number, minStock: number | null): number {
        const maxDisplay = (minStock || 5) * 2
        return Math.min(100, (inStock / maxDisplay) * 100)
    }

    it('should cap at 100%', () => {
        expect(calculateStockPercent(100, 10)).toBe(100)
    })

    it('should show 50% when stock equals minStock', () => {
        expect(calculateStockPercent(10, 10)).toBe(50)
    })

    it('should show 0% when stock is 0', () => {
        expect(calculateStockPercent(0, 10)).toBe(0)
    })

    it('should use default maxDisplay of 10 when minStock is null', () => {
        // (5 * 2 = 10), so 5/10 = 50%
        expect(calculateStockPercent(5, null)).toBe(50)
    })

    it('should use default maxDisplay of 10 when minStock is 0', () => {
        // (5 * 2 = 10), so 3/10 = 30%
        expect(calculateStockPercent(3, 0)).toBe(30)
    })

    it('should show 25% when stock is half of minStock', () => {
        expect(calculateStockPercent(5, 10)).toBe(25)
    })
})

// ============================================================
// 4. Stock Filter Logic TESTS
// ============================================================
describe('Stock Filter Logic', () => {
    const mockStock = [
        { id: '1', name: 'Vinyl Glossy', type: 'VINYL', inStock: 100, minStock: 10, costPrice: 150 },
        { id: '2', name: 'Acrylic 3mm', type: 'SUBSTRATE', inStock: 50, minStock: 5, costPrice: 450 },
        { id: '3', name: 'Eco Solvent Ink', type: 'INK', inStock: 2, minStock: 5, costPrice: 3000 },
        { id: '4', name: 'Laminate Film', type: 'LAMINATE', inStock: 30, minStock: 10, costPrice: 200 },
    ]

    function filterStock(items: typeof mockStock, search: string, category: string) {
        return items.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
            const matchCategory = category === 'ทั้งหมด' || item.type === category
            return matchSearch && matchCategory
        })
    }

    it('should show all items when no filters', () => {
        const result = filterStock(mockStock, '', 'ทั้งหมด')
        expect(result).toHaveLength(4)
    })

    it('should filter by search term', () => {
        const result = filterStock(mockStock, 'vinyl', 'ทั้งหมด')
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Vinyl Glossy')
    })

    it('should filter by category', () => {
        const result = filterStock(mockStock, '', 'INK')
        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('INK')
    })

    it('should combine search and category filters', () => {
        const result = filterStock(mockStock, 'eco', 'INK')
        expect(result).toHaveLength(1)
    })

    it('should return empty for non-matching search', () => {
        const result = filterStock(mockStock, 'zzzzz', 'ทั้งหมด')
        expect(result).toHaveLength(0)
    })

    it('should be case-insensitive', () => {
        const result = filterStock(mockStock, 'VINYL', 'ทั้งหมด')
        expect(result).toHaveLength(1)
    })

    describe('Low Stock Detection', () => {
        it('should detect items at or below minStock', () => {
            const lowStock = mockStock.filter(i => i.inStock <= (i.minStock || 0))
            expect(lowStock).toHaveLength(1)
            expect(lowStock[0].name).toBe('Eco Solvent Ink')
        })
    })

    describe('Total Value Calculation', () => {
        it('should calculate total stock value correctly', () => {
            const totalValue = mockStock.reduce((acc, item) => acc + (item.inStock * item.costPrice), 0)
            // 100*150 + 50*450 + 2*3000 + 30*200
            // 15000 + 22500 + 6000 + 6000 = 49500
            expect(totalValue).toBe(49500)
        })
    })
})

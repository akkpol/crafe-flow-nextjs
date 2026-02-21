import { describe, it, expect } from 'vitest'

// ============================================================
// Customer Validation Logic Tests
// ============================================================
// These test the validation rules that exist in the server actions
// without needing Supabase connection

/** Validate customer name */
function validateName(name: string): string | null {
    if (!name || name.trim().length === 0) return 'ชื่อลูกค้าห้ามว่าง'
    return null
}

/** Validate tax ID */
function validateTaxId(taxId: string | undefined): string | null {
    if (taxId && taxId.length !== 13) return 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก'
    return null
}

/** Validate phone number format */
function validatePhone(phone: string | undefined): boolean {
    if (!phone) return true // optional
    return /^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ''))
}

/** Check if customer is corporate (has tax ID) */
function isCorporate(taxId: string | null): boolean {
    return taxId != null && taxId.length === 13
}

/** Filter customers by search query */
function filterCustomers(
    customers: Array<{ name: string; phone: string | null; taxId: string | null; lineId: string | null }>,
    query: string
) {
    const q = query.toLowerCase()
    return customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.taxId && c.taxId.includes(q)) ||
        (c.lineId && c.lineId.toLowerCase().includes(q))
    )
}

/** Sanitize customer input */
function sanitizeInput(input: { name: string; phone?: string; lineId?: string; address?: string; taxId?: string }) {
    return {
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        lineId: input.lineId?.trim() || null,
        address: input.address?.trim() || null,
        taxId: input.taxId?.trim() || null,
    }
}

// ============================================================
// TESTS
// ============================================================

describe('Customer Validation', () => {
    describe('validateName', () => {
        it('should reject empty name', () => {
            expect(validateName('')).toBe('ชื่อลูกค้าห้ามว่าง')
        })

        it('should reject whitespace-only name', () => {
            expect(validateName('   ')).toBe('ชื่อลูกค้าห้ามว่าง')
        })

        it('should accept valid name', () => {
            expect(validateName('คุณสมชาย')).toBeNull()
        })

        it('should accept company name', () => {
            expect(validateName('บจก. เอ บี ซี จำกัด')).toBeNull()
        })
    })

    describe('validateTaxId', () => {
        it('should accept undefined (optional)', () => {
            expect(validateTaxId(undefined)).toBeNull()
        })

        it('should accept empty string', () => {
            expect(validateTaxId('')).toBeNull()
        })

        it('should accept valid 13-digit tax ID', () => {
            expect(validateTaxId('1234567890123')).toBeNull()
        })

        it('should reject short tax ID', () => {
            expect(validateTaxId('12345')).toBe('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก')
        })

        it('should reject long tax ID', () => {
            expect(validateTaxId('12345678901234')).toBe('เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก')
        })
    })

    describe('validatePhone', () => {
        it('should accept undefined (optional)', () => {
            expect(validatePhone(undefined)).toBe(true)
        })

        it('should accept empty string', () => {
            expect(validatePhone('')).toBe(true)
        })

        it('should accept valid 10-digit phone', () => {
            expect(validatePhone('0891234567')).toBe(true)
        })

        it('should accept valid 9-digit phone', () => {
            expect(validatePhone('021234567')).toBe(true)
        })

        it('should accept phone with dashes', () => {
            expect(validatePhone('089-123-4567')).toBe(true)
        })

        it('should reject non-zero start', () => {
            expect(validatePhone('1234567890')).toBe(false)
        })

        it('should reject too short', () => {
            expect(validatePhone('0123')).toBe(false)
        })
    })
})

describe('Customer Type Classification', () => {
    it('should classify customer with tax ID as corporate', () => {
        expect(isCorporate('1234567890123')).toBe(true)
    })

    it('should classify customer without tax ID as individual', () => {
        expect(isCorporate(null)).toBe(false)
    })

    it('should classify customer with empty tax ID as individual', () => {
        expect(isCorporate('')).toBe(false)
    })
})

describe('Customer Search/Filter', () => {
    const mockCustomers = [
        { name: 'คุณสมชาย ร้านกาแฟ', phone: '0891234567', taxId: null, lineId: '@somchai' },
        { name: 'บจก. เอ บี ซี', phone: '0212345678', taxId: '1234567890123', lineId: null },
        { name: 'คุณมานี ร้านอาหาร', phone: '0812345678', taxId: null, lineId: '@manee_food' },
        { name: 'โรงพิมพ์ดี', phone: '0223456789', taxId: '9876543210987', lineId: '@printdi' },
    ]

    it('should find by name (Thai)', () => {
        const result = filterCustomers(mockCustomers, 'สมชาย')
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('คุณสมชาย ร้านกาแฟ')
    })

    it('should find by phone', () => {
        const result = filterCustomers(mockCustomers, '0812345678')
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('คุณมานี ร้านอาหาร')
    })

    it('should find by tax ID', () => {
        const result = filterCustomers(mockCustomers, '9876543210987')
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('โรงพิมพ์ดี')
    })

    it('should find by LINE ID', () => {
        const result = filterCustomers(mockCustomers, '@manee')
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('คุณมานี ร้านอาหาร')
    })

    it('should find multiple matches', () => {
        const result = filterCustomers(mockCustomers, 'ร้าน')
        expect(result).toHaveLength(2) // ร้านกาแฟ + ร้านอาหาร
    })

    it('should be case-insensitive for LINE ID', () => {
        const result = filterCustomers(mockCustomers, '@SOMCHAI')
        expect(result).toHaveLength(1)
    })

    it('should return empty for no match', () => {
        const result = filterCustomers(mockCustomers, 'ไม่มีในระบบ')
        expect(result).toHaveLength(0)
    })

    it('should return all for empty query', () => {
        const result = filterCustomers(mockCustomers, '')
        expect(result).toHaveLength(4)
    })
})

describe('Input Sanitization', () => {
    it('should trim whitespace from all fields', () => {
        const result = sanitizeInput({
            name: '  คุณสมชาย  ',
            phone: ' 0891234567 ',
            lineId: ' @somchai ',
            address: ' 123 ถ.สุขุมวิท ',
            taxId: ' 1234567890123 ',
        })
        expect(result.name).toBe('คุณสมชาย')
        expect(result.phone).toBe('0891234567')
        expect(result.lineId).toBe('@somchai')
        expect(result.address).toBe('123 ถ.สุขุมวิท')
        expect(result.taxId).toBe('1234567890123')
    })

    it('should convert empty strings to null', () => {
        const result = sanitizeInput({
            name: 'test',
            phone: '',
            lineId: '',
            address: '',
            taxId: '',
        })
        expect(result.phone).toBeNull()
        expect(result.lineId).toBeNull()
        expect(result.address).toBeNull()
        expect(result.taxId).toBeNull()
    })

    it('should handle undefined optional fields', () => {
        const result = sanitizeInput({ name: 'test' })
        expect(result.phone).toBeNull()
        expect(result.lineId).toBeNull()
        expect(result.address).toBeNull()
        expect(result.taxId).toBeNull()
    })
})

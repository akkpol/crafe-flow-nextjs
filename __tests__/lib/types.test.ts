import { describe, it, expect } from 'vitest'
import {
    STATUS_CONFIG,
    PRIORITY_CONFIG,
    DOCUMENT_STATUS_CONFIG,
    MATERIAL_TYPE_CONFIG,
    TRANSACTION_TYPE_CONFIG,
    KANBAN_COLUMNS,
} from '@/lib/types'
import type {
    Order,
    Customer,
    Material,
    OrderItem,
    Invoice,
    Quotation,
    QuotationItem,
    Payment,
    PaymentAccount,
    StockTransaction,
    PricingTier,
    Product,
    DesignFile,
    Organization,
    OrderWithRelations,
    QuotationWithRelations,
    InvoiceWithRelations,
    MaterialWithRelations,
    OrderStatus,
    Priority,
    DocumentStatus,
    MaterialType,
    TransactionType,
} from '@/lib/types'

// ============================================================
// 1. TYPE EXISTENCE TESTS — ทุก Type ต้อง import ได้โดยไม่ error
// ============================================================
describe('Type Definitions', () => {
    it('should export all 14 base row types', () => {
        // These are compile-time checks. If types are wrong, TS will fail.
        const assertType = <T>(_val?: T) => true

        expect(assertType<Organization>()).toBe(true)
        expect(assertType<Customer>()).toBe(true)
        expect(assertType<Order>()).toBe(true)
        expect(assertType<OrderItem>()).toBe(true)
        expect(assertType<Quotation>()).toBe(true)
        expect(assertType<QuotationItem>()).toBe(true)
        expect(assertType<Invoice>()).toBe(true)
        expect(assertType<Payment>()).toBe(true)
        expect(assertType<PaymentAccount>()).toBe(true)
        expect(assertType<Material>()).toBe(true)
        expect(assertType<StockTransaction>()).toBe(true)
        expect(assertType<PricingTier>()).toBe(true)
        expect(assertType<Product>()).toBe(true)
        expect(assertType<DesignFile>()).toBe(true)
    })

    it('should export enriched relational types', () => {
        const assertType = <T>(_val?: T) => true

        expect(assertType<OrderWithRelations>()).toBe(true)
        expect(assertType<QuotationWithRelations>()).toBe(true)
        expect(assertType<InvoiceWithRelations>()).toBe(true)
        expect(assertType<MaterialWithRelations>()).toBe(true)
    })

    it('should export all enum types', () => {
        const assertType = <T>(_val?: T) => true

        expect(assertType<OrderStatus>()).toBe(true)
        expect(assertType<Priority>()).toBe(true)
        expect(assertType<DocumentStatus>()).toBe(true)
        expect(assertType<MaterialType>()).toBe(true)
        expect(assertType<TransactionType>()).toBe(true)
    })
})

// ============================================================
// 2. STATUS_CONFIG TESTS
// ============================================================
describe('STATUS_CONFIG', () => {
    it('should have entries for all 7 order statuses', () => {
        const expectedStatuses = ['new', 'designing', 'approved', 'production', 'qc', 'installing', 'done']
        expectedStatuses.forEach((status) => {
            expect(STATUS_CONFIG[status]).toBeDefined()
        })
    })

    it('each status should have label, color, and icon', () => {
        Object.entries(STATUS_CONFIG).forEach(([key, config]) => {
            expect(config).toHaveProperty('label')
            expect(config).toHaveProperty('color')
            expect(config).toHaveProperty('icon')
            expect(typeof config.label).toBe('string')
            expect(typeof config.color).toBe('string')
            expect(typeof config.icon).toBe('string')
            expect(config.label.length).toBeGreaterThan(0)
        })
    })
})

// ============================================================
// 3. PRIORITY_CONFIG TESTS
// ============================================================
describe('PRIORITY_CONFIG', () => {
    it('should have entries for all 4 priorities', () => {
        const priorities: Priority[] = ['low', 'medium', 'high', 'urgent']
        priorities.forEach((priority) => {
            expect(PRIORITY_CONFIG[priority]).toBeDefined()
        })
    })

    it('each priority should have label and color', () => {
        Object.entries(PRIORITY_CONFIG).forEach(([key, config]) => {
            expect(config).toHaveProperty('label')
            expect(config).toHaveProperty('color')
            expect(config.label.length).toBeGreaterThan(0)
            expect(config.color.length).toBeGreaterThan(0)
        })
    })
})

// ============================================================
// 4. DOCUMENT_STATUS_CONFIG TESTS
// ============================================================
describe('DOCUMENT_STATUS_CONFIG', () => {
    it('should have entries for all 5 document statuses', () => {
        const statuses: DocumentStatus[] = ['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'VOID']
        statuses.forEach((status) => {
            expect(DOCUMENT_STATUS_CONFIG[status]).toBeDefined()
        })
    })

    it('each document status should have label, color, and icon', () => {
        Object.entries(DOCUMENT_STATUS_CONFIG).forEach(([key, config]) => {
            expect(config).toHaveProperty('label')
            expect(config).toHaveProperty('color')
            expect(config).toHaveProperty('icon')
        })
    })
})

// ============================================================
// 5. MATERIAL_TYPE_CONFIG TESTS
// ============================================================
describe('MATERIAL_TYPE_CONFIG', () => {
    it('should have entries for all 5 material types', () => {
        const types: MaterialType[] = ['VINYL', 'SUBSTRATE', 'LAMINATE', 'INK', 'OTHER']
        types.forEach((type) => {
            expect(MATERIAL_TYPE_CONFIG[type]).toBeDefined()
        })
    })

    it('each material type should have label and icon', () => {
        Object.entries(MATERIAL_TYPE_CONFIG).forEach(([key, config]) => {
            expect(config).toHaveProperty('label')
            expect(config).toHaveProperty('icon')
        })
    })
})

// ============================================================
// 6. TRANSACTION_TYPE_CONFIG TESTS
// ============================================================
describe('TRANSACTION_TYPE_CONFIG', () => {
    it('should have entries for all 3 transaction types', () => {
        const types: TransactionType[] = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']
        types.forEach((type) => {
            expect(TRANSACTION_TYPE_CONFIG[type]).toBeDefined()
        })
    })

    it('each transaction type should have label and color', () => {
        Object.entries(TRANSACTION_TYPE_CONFIG).forEach(([key, config]) => {
            expect(config).toHaveProperty('label')
            expect(config).toHaveProperty('color')
        })
    })
})

// ============================================================
// 7. KANBAN_COLUMNS TESTS
// ============================================================
describe('KANBAN_COLUMNS', () => {
    it('should have 7 columns in correct order', () => {
        expect(KANBAN_COLUMNS).toHaveLength(7)
        expect(KANBAN_COLUMNS).toEqual([
            'new', 'designing', 'approved', 'production', 'qc', 'installing', 'done'
        ])
    })

    it('first column should be "new" and last should be "done"', () => {
        expect(KANBAN_COLUMNS[0]).toBe('new')
        expect(KANBAN_COLUMNS[KANBAN_COLUMNS.length - 1]).toBe('done')
    })

    it('every column should have a matching STATUS_CONFIG entry', () => {
        KANBAN_COLUMNS.forEach((col) => {
            expect(STATUS_CONFIG[col]).toBeDefined()
        })
    })
})

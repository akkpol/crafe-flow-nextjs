import { z } from 'zod'

// ============================================================
// CUSTOMER SCHEMAS
// ============================================================
export const CustomerSchema = z.object({
    name: z.string().min(1, 'ชื่อลูกค้าห้ามว่าง'),
    phone: z.string().optional().nullable(),
    lineId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    taxId: z.string()
        .optional()
        .nullable()
        .refine(val => !val || val.length === 13, {
            message: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก',
        }),
})

// ============================================================
// MATERIAL SCHEMAS (STOCK)
// ============================================================
export const MaterialSchema = z.object({
    name: z.string().min(1, 'ชื่อวัสดุห้ามว่าง'),
    type: z.enum(['VINYL', 'SUBSTRATE', 'LAMINATE', 'INK', 'OTHER']),
    inStock: z.coerce.number().min(0).default(0),
    unit: z.string().default('units'),
    costPrice: z.coerce.number().min(0).default(0),
    sellingPrice: z.coerce.number().min(0).default(0),
    wasteFactor: z.coerce.number().min(0).default(0),
})

// ============================================================
// INVOICE SCHEMAS
// ============================================================
export const InvoiceItemSchema = z.object({
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    width: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    quantity: z.coerce.number().min(1).default(1),
    unitPrice: z.coerce.number().min(0).default(0),
    totalPrice: z.coerce.number().optional().nullable(),
    discount: z.coerce.number().min(0).default(0),
    materialId: z.string().optional().nullable()
}).refine(data => data.name || data.description, {
    message: "ระบุชื่อหรือรายละเอียดรายการ",
    path: ["name"]
})

export const InvoiceSchema = z.object({
    isTaxInvoice: z.boolean().default(false).optional(),
    customerId: z.string().uuid('รหัสลูกค้าไม่ถูกต้อง'),
    orderId: z.string().uuid().optional().nullable(),
    organizationId: z.string().uuid().optional().nullable(),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    dueDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// ============================================================
// QUOTATION SCHEMAS
// ============================================================
export const QuotationItemSchema = z.object({
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    width: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    quantity: z.coerce.number().min(1).default(1),
    unitPrice: z.coerce.number().min(0).default(0),
    totalPrice: z.coerce.number().optional().nullable(),
    discount: z.coerce.number().min(0).default(0),
}).refine(data => data.name || data.description, {
    message: "ระบุชื่อหรือรายละเอียดรายการ",
    path: ["name"]
})

export const QuotationSchema = z.object({
    customerId: z.string().uuid('รหัสลูกค้าไม่ถูกต้อง'),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    expiresAt: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
})

// ============================================================
// ORDER SCHEMAS
// ============================================================
export const OrderItemSchema = z.object({
    name: z.string().min(1, 'ระบุชื่องาน'),
    details: z.string().optional().nullable(),
    width: z.coerce.number().optional().nullable(),
    height: z.coerce.number().optional().nullable(),
    quantity: z.coerce.number().min(1).default(1),
    unitPrice: z.coerce.number().min(0).default(0),
    totalPrice: z.coerce.number().optional().nullable(),
})

export const OrderSchema = z.object({
    customerId: z.string().uuid('รหัสลูกค้าไม่ถูกต้อง'),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    deadline: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    notes: z.string().optional().nullable()
})

import { z } from 'zod'

// ============================================================
// CUSTOMER SCHEMAS
// ============================================================
export const CustomerSchema = z.object({
    name: z.string().min(1, 'ชื่อลูกค้าห้ามว่าง'),
    phone: z.string().optional().nullable(),
    email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().nullable(),
    lineId: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    taxId: z.string()
        .optional()
        .nullable()
        .refine(val => !val || val.length === 13, {
            message: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก',
        }),
    companyname: z.string().optional().nullable(),
    branch: z.string().optional().nullable(),
    creditlimit: z.coerce.number().min(0).default(0).optional(),
    paymentterms: z.coerce.number().int().min(0).default(30).optional(),
})

// ============================================================
// CUSTOMER LOCATION SCHEMAS
// ============================================================
export const CustomerLocationSchema = z.object({
    customerid: z.string().min(1, 'ต้องระบุ Customer ID'),
    label: z.string().optional().nullable(),
    addressline1: z.string().min(1, 'ต้องระบุที่อยู่'),
    addressline2: z.string().optional().nullable(),
    subdistrict: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    province: z.string().optional().nullable(),
    postalcode: z.string().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    googlemapsurl: z.string().url('URL ไม่ถูกต้อง').optional().nullable(),
    locationtype: z.enum(['installation', 'billing', 'warehouse', 'office']).default('installation').optional(),
    accessnotes: z.string().optional().nullable(),
    parkinginfo: z.string().optional().nullable(),
    contactonsite: z.string().optional().nullable(),
    isdefault: z.boolean().default(false).optional(),
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
    minStock: z.coerce.number().min(0).optional().nullable(),
    maxstock: z.coerce.number().min(0).optional().nullable(),
    description: z.string().optional().nullable(),
    sku: z.string().optional().nullable(),
    suppliername: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
})

// ============================================================
// STOCK TRANSACTION SCHEMA
// ============================================================
export const StockAdjustmentSchema = z.object({
    materialId: z.string().min(1),
    newAmount: z.coerce.number().min(0, 'จำนวนต้องไม่ติดลบ'),
    notes: z.string().min(1, 'ต้องระบุเหตุผล'),
})

// ============================================================
// INVOICE SCHEMAS
// ============================================================
export const InvoiceItemSchema = z.object({
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
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
    customerId: z.string().min(1, 'ต้องระบุลูกค้า'),
    orderId: z.string().optional().nullable(),
    organizationId: z.string().optional().nullable(),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    dueDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

// ============================================================
// PAYMENT ACCOUNT SCHEMAS
// ============================================================
export const PaymentAccountSchema = z.object({
    name: z.string().min(1, 'ต้องระบุชื่อบัญชี'),
    type: z.enum(['bank', 'promptpay', 'cash', 'other']).default('bank'),
    bankName: z.string().optional().nullable(),
    accountName: z.string().optional().nullable(),
    accountNumber: z.string().optional().nullable(),
    isActive: z.boolean().default(true).optional(),
    isDefault: z.boolean().default(false).optional(),
})

// ============================================================
// QUOTATION SCHEMAS
// ============================================================
export const QuotationItemSchema = z.object({
    name: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
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
    customerId: z.string().min(1, 'ต้องระบุลูกค้า'),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0).optional(),
    expiresAt: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    paymenttermstext: z.string().optional().nullable(),
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
    customerId: z.string().min(1, 'ต้องระบุลูกค้า'),
    totalAmount: z.coerce.number().min(0),
    vatAmount: z.coerce.number().min(0),
    grandTotal: z.coerce.number().min(0),
    deadline: z.string().optional().nullable(),
    installationdate: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    notes: z.string().optional().nullable(),
    quotationid: z.string().optional().nullable(),
})

export const UpdateOrderProgressSchema = z.object({
    progresspercent: z.coerce.number().int().min(0).max(100),
})

// ============================================================
// ATTACHMENT SCHEMA
// ============================================================
export const AttachmentSchema = z.object({
    attachabletype: z.enum(['order', 'quotation', 'invoice', 'customer', 'material']),
    attachableid: z.string().min(1),
    filename: z.string().min(1),
    fileurl: z.string().url('URL ไม่ถูกต้อง'),
    filetype: z.string().min(1),
    filesize: z.coerce.number().optional().nullable(),
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().nullable(),
    ispublic: z.boolean().default(false).optional(),
})

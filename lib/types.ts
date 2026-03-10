import { Database } from './database.types'

// ============================================================
// 1. BASE TYPE HELPER — ดึง Row type จาก Supabase โดยตรง
// ============================================================
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// ============================================================
// 2. ENUMS — ดึงจาก Database schema โดยตรง (Single Source of Truth)
// ============================================================
export type DocumentStatus = Database['public']['Enums']['DocumentStatus']
export type MaterialType = Database['public']['Enums']['MaterialType']
export type TransactionType = Database['public']['Enums']['TransactionType']
export type UnitType = Database['public']['Enums']['UnitType']

// App-level enums — Order workflow (7 steps Kanban)
export type OrderStatus =
    | 'new'
    | 'designing'
    | 'approved'
    | 'production'
    | 'qc'
    | 'installing'
    | 'done'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Quotation-specific status (แยกจาก Invoice)
// DRAFT → SENT → ACCEPTED (→ auto-create Order) | REJECTED
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'

// Invoice-specific status (เฉพาะ financial flow)
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'VOID'

// ============================================================
// 3. BASE ROW TYPES — 1:1 กับตารางในฐานข้อมูล
// ============================================================
export type Organization = Tables<'Organization'>
export type Customer = Tables<'Customer'>
export type CustomerLocation = Tables<'CustomerLocation'>
export type Order = Tables<'Order'>
export type OrderItem = Tables<'OrderItem'>
export type OrderHistory = Tables<'OrderHistory'>
export type OrderStatusConfig = Tables<'OrderStatusConfig'>
export type Quotation = Tables<'Quotation'>
export type QuotationItem = Tables<'QuotationItem'>
export type Invoice = Tables<'Invoice'>
export type InvoiceItem = Tables<'InvoiceItem'>
export type Payment = Tables<'Payment'>
export type PaymentAccount = Tables<'PaymentAccount'>
export type Receipt = Tables<'Receipt'>
export type Material = Tables<'Material'>
export type StockTransaction = Tables<'StockTransaction'>
export type PricingTier = Tables<'PricingTier'>
export type Product = Tables<'Product'>
export type DesignFile = Tables<'DesignFile'>
export type Attachment = Tables<'Attachment'>
export type Notification = Tables<'Notification'>
export type SystemSettings = Tables<'SystemSettings'>
export type ApprovalWorkflow = Tables<'ApprovalWorkflow'>

// ============================================================
// 4. ENRICHED TYPES — พร้อม Relations สำหรับ .select('*, Customer(*)')
//    ใช้ตอน query ข้อมูลพร้อม join จาก Supabase
// ============================================================

/** Order พร้อมข้อมูลลูกค้า + รายการสินค้า */
export type OrderWithRelations = Order & {
    Customer?: Customer | null
    OrderItem?: OrderItem[]
    DesignFile?: DesignFile[]
}

/** Quotation พร้อมข้อมูลลูกค้า + รายการสินค้า */
export type QuotationWithRelations = Quotation & {
    Customer?: Customer | null
    QuotationItem?: QuotationItem[]
}

/** Invoice พร้อมข้อมูลลูกค้า + Order + Payments */
export type InvoiceWithRelations = Invoice & {
    Customer?: Customer | null
    Order?: Order | null
    Payment?: Payment[]
    InvoiceItem?: InvoiceItem[]
}

/** Payment พร้อมข้อมูล Invoice + บัญชีธนาคาร */
export type PaymentWithRelations = Payment & {
    Invoice?: Invoice | null
    PaymentAccount?: PaymentAccount | null
}

/** Material พร้อม PricingTiers + ประวัติ Transaction */
export type MaterialWithRelations = Material & {
    PricingTier?: PricingTier[]
    StockTransaction?: StockTransaction[]
}

/** Customer พร้อมรายการ Order + Quotation + Invoice + Locations ทั้งหมด */
export type CustomerWithRelations = Customer & {
    Order?: Order[]
    Quotation?: Quotation[]
    Invoice?: Invoice[]
    CustomerLocation?: CustomerLocation[]
}

// ============================================================
// 5. INSERT / UPDATE SHORTHAND TYPES
//    ใช้สำหรับ Server Actions (create / update)
// ============================================================
export type OrderInsert = TablesInsert<'Order'>
export type OrderUpdate = TablesUpdate<'Order'>
export type OrderItemInsert = TablesInsert<'OrderItem'>

export type QuotationInsert = TablesInsert<'Quotation'>
export type QuotationUpdate = TablesUpdate<'Quotation'>
export type QuotationItemInsert = TablesInsert<'QuotationItem'>

export type InvoiceInsert = TablesInsert<'Invoice'>
export type InvoiceUpdate = TablesUpdate<'Invoice'>
export type InvoiceItemInsert = TablesInsert<'InvoiceItem'>

export type PaymentInsert = TablesInsert<'Payment'>
export type PaymentAccountInsert = TablesInsert<'PaymentAccount'>
export type PaymentAccountUpdate = TablesUpdate<'PaymentAccount'>

export type CustomerInsert = TablesInsert<'Customer'>
export type CustomerUpdate = TablesUpdate<'Customer'>
export type CustomerLocationInsert = TablesInsert<'CustomerLocation'>
export type CustomerLocationUpdate = TablesUpdate<'CustomerLocation'>

export type MaterialInsert = TablesInsert<'Material'>
export type MaterialUpdate = TablesUpdate<'Material'>

export type ProductInsert = TablesInsert<'Product'>
export type ProductUpdate = TablesUpdate<'Product'>

export type StockTransactionInsert = TablesInsert<'StockTransaction'>
export type AttachmentInsert = TablesInsert<'Attachment'>
export type AttachmentUpdate = TablesUpdate<'Attachment'>

// ============================================================
// 6. UI CONFIGURATION MAPS — ใช้ในหน้า Frontend
// ============================================================

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    new: { label: 'รับงาน', color: 'bg-cyan', icon: '📥' },
    designing: { label: 'ออกแบบ', color: 'bg-magenta', icon: '🎨' },
    approved: { label: 'ยืนยันแบบ', color: 'bg-cmyk-yellow', icon: '✅' },
    production: { label: 'ผลิต', color: 'bg-cyan', icon: '🏭' },
    qc: { label: 'QC', color: 'bg-magenta', icon: '🔍' },
    installing: { label: 'ติดตั้ง', color: 'bg-cmyk-yellow', icon: '🔧' },
    done: { label: 'เสร็จ', color: 'bg-emerald-500', icon: '🎉' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    low: { label: 'ต่ำ', color: 'text-muted-foreground' },
    medium: { label: 'ปานกลาง', color: 'text-cyan' },
    high: { label: 'สูง', color: 'text-cmyk-yellow' },
    urgent: { label: 'ด่วน!', color: 'text-destructive' },
}

/** สำหรับ Quotation เท่านั้น (ไม่ใช้กับ Invoice) */
export const QUOTATION_STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; icon: string }> = {
    DRAFT: { label: 'แบบร่าง', color: 'bg-muted text-muted-foreground', icon: '📝' },
    SENT: { label: 'ส่งแล้ว', color: 'bg-cyan/10 text-cyan', icon: '📤' },
    ACCEPTED: { label: 'อนุมัติ', color: 'bg-emerald-500/10 text-emerald-500', icon: '✅' },
    REJECTED: { label: 'ปฏิเสธ', color: 'bg-destructive/10 text-destructive', icon: '❌' },
}

/** สำหรับ Invoice เท่านั้น */
export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: string }> = {
    DRAFT: { label: 'แบบร่าง', color: 'bg-muted text-muted-foreground', icon: '📝' },
    SENT: { label: 'ส่งแล้ว', color: 'bg-cyan/10 text-cyan', icon: '📤' },
    PARTIAL: { label: 'ชำระบางส่วน', color: 'bg-cmyk-yellow/10 text-cmyk-yellow', icon: '⏳' },
    PAID: { label: 'ชำระแล้ว', color: 'bg-emerald-500/10 text-emerald-500', icon: '✅' },
    VOID: { label: 'ยกเลิก', color: 'bg-destructive/10 text-destructive', icon: '❌' },
}

/** @deprecated ใช้ QUOTATION_STATUS_CONFIG หรือ INVOICE_STATUS_CONFIG แทน */
export const DOCUMENT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    ...QUOTATION_STATUS_CONFIG,
    ...INVOICE_STATUS_CONFIG,
}

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, { label: string; icon: string }> = {
    VINYL: { label: 'วีนีล', icon: '🎨' },
    SUBSTRATE: { label: 'วัสดุพิมพ์', icon: '📦' },
    LAMINATE: { label: 'แลมิเนท', icon: '✨' },
    INK: { label: 'หมึก', icon: '🖨️' },
    OTHER: { label: 'อื่นๆ', icon: '📎' },
}

export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, { label: string; color: string }> = {
    STOCK_IN: { label: 'รับเข้า', color: 'text-emerald-500' },
    STOCK_OUT: { label: 'เบิกออก', color: 'text-destructive' },
    ADJUSTMENT: { label: 'ปรับปรุง', color: 'text-cmyk-yellow' },
}

export const KANBAN_COLUMNS: OrderStatus[] = [
    'new', 'designing', 'approved', 'production', 'qc', 'installing', 'done'
]

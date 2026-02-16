// ===== Database Types =====

export type OrderStatus =
    | 'new'
    | 'designing'
    | 'approved'
    | 'production'
    | 'qc'
    | 'installing'
    | 'done'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type MaterialType = 'VINYL' | 'SUBSTRATE' | 'LAMINATE' | 'INK' | 'OTHER'

export interface Order {
    id: string
    organizationId: string
    orderNumber: string
    customerId: string | null
    status: string
    totalAmount: number
    vatAmount: number
    grandTotal: number
    priority: Priority
    deadline: string | null
    notes: string | null
    createdAt: string
    updatedAt: string
    // Joined
    Customer?: Customer
}

export interface Customer {
    id: string
    organizationId: string
    name: string
    phone: string | null
    lineId: string | null
    address: string | null
    taxId: string | null
}

export interface Material {
    id: string
    organizationId: string
    name: string
    type: MaterialType
    unit: string
    costPrice: number
    sellingPrice: number
    inStock: number
    wasteFactor: number
}

export interface OrderItem {
    id: string
    orderId: string
    name: string
    width: number | null
    height: number | null
    quantity: number
    unitPrice: number
    totalPrice: number
    details: string | null
}

// ===== UI Helpers =====

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    new: { label: 'รับงาน', color: 'bg-cyan-500', icon: '📥' },
    designing: { label: 'ออกแบบ', color: 'bg-magenta-500', icon: '🎨' },
    approved: { label: 'ยืนยันแบบ', color: 'bg-yellow-500', icon: '✅' },
    production: { label: 'ผลิต', color: 'bg-cyan-600', icon: '🏭' },
    qc: { label: 'QC', color: 'bg-fuchsia-500', icon: '🔍' },
    installing: { label: 'ติดตั้ง', color: 'bg-yellow-600', icon: '🔧' },
    done: { label: 'เสร็จ', color: 'bg-emerald-500', icon: '🎉' },
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    low: { label: 'ต่ำ', color: 'text-muted-foreground' },
    medium: { label: 'ปานกลาง', color: 'text-cyan-600' },
    high: { label: 'สูง', color: 'text-yellow-600' },
    urgent: { label: 'ด่วน!', color: 'text-red-500' },
}

export const KANBAN_COLUMNS: OrderStatus[] = [
    'new', 'designing', 'approved', 'production', 'qc', 'installing', 'done'
]

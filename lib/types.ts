import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Order = Tables<'Order'> & { Customer?: Customer }
export type Customer = Tables<'Customer'>
export type Material = Tables<'Material'>
export type OrderItem = Tables<'OrderItem'>
export type Invoice = Tables<'Invoice'>
export type Quotation = Tables<'Quotation'>

// ===== Enums & Fixed Types =====
export type OrderStatus =
    | 'new'
    | 'designing'
    | 'approved'
    | 'production'
    | 'qc'
    | 'installing'
    | 'done'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type MaterialType = Database['public']['Enums']['MaterialType']

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

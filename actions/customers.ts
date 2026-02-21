'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// ============================================================
// TYPES
// ============================================================

export interface CustomerInput {
    name: string
    phone?: string
    lineId?: string
    address?: string
    taxId?: string
}

export interface CustomerRow {
    id: string
    organizationId: string
    name: string
    phone: string | null
    lineId: string | null
    address: string | null
    taxId: string | null
    createdAt: string
    updatedAt: string
}

// Hardcoded for now — will come from auth session later
const DEFAULT_ORG_ID = 'demo-org-123'

// ============================================================
// READ
// ============================================================

/** ดึงลูกค้าทั้งหมด (เรียงตามชื่อ) */
export async function getCustomers(): Promise<CustomerRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Customer')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching customers:', error)
        return []
    }

    return data as CustomerRow[]
}

/** ดึงลูกค้าตาม ID */
export async function getCustomerById(id: string): Promise<CustomerRow | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Customer')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching customer:', error)
        return null
    }

    return data as CustomerRow
}

/** ค้นหาลูกค้า */
export async function searchCustomers(query: string): Promise<CustomerRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Customer')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,taxId.ilike.%${query}%`)
        .order('name')
        .limit(20)

    if (error) {
        console.error('Error searching customers:', error)
        return []
    }

    return data as CustomerRow[]
}

// ============================================================
// CREATE
// ============================================================

export async function createCustomer(input: CustomerInput): Promise<{ success: boolean; data?: CustomerRow; error?: string }> {
    // Validation
    if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'ชื่อลูกค้าห้ามว่าง' }
    }

    if (input.taxId && input.taxId.length !== 13) {
        return { success: false, error: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Customer')
        .insert({
            id: crypto.randomUUID(),
            organizationId: DEFAULT_ORG_ID,
            name: input.name.trim(),
            phone: input.phone?.trim() || null,
            lineId: input.lineId?.trim() || null,
            address: input.address?.trim() || null,
            taxId: input.taxId?.trim() || null,
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true, data: data as CustomerRow }
}

// ============================================================
// UPDATE
// ============================================================

export async function updateCustomer(id: string, input: CustomerInput): Promise<{ success: boolean; error?: string }> {
    if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'ชื่อลูกค้าห้ามว่าง' }
    }

    if (input.taxId && input.taxId.length !== 13) {
        return { success: false, error: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('Customer')
        .update({
            name: input.name.trim(),
            phone: input.phone?.trim() || null,
            lineId: input.lineId?.trim() || null,
            address: input.address?.trim() || null,
            taxId: input.taxId?.trim() || null,
            updatedAt: new Date().toISOString(),
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

// ============================================================
// DELETE
// ============================================================

export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // ตรวจสอบว่ามี Order ที่เชื่อมอยู่หรือไม่
    const { data: orders } = await supabase
        .from('Order')
        .select('id')
        .eq('customerId', id)
        .limit(1)

    if (orders && orders.length > 0) {
        return { success: false, error: 'ไม่สามารถลบลูกค้าที่มี Order อยู่ได้' }
    }

    const { error } = await supabase
        .from('Customer')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting customer:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Quotation, QuotationItem, QuotationInsert, QuotationItemInsert, DocumentStatus } from '@/lib/types'

// ============================================================
// READ
// ============================================================

export async function getQuotations() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Quotation')
        .select('*, Customer(name)')
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching quotations:', error)
        return []
    }
    return data
}

export async function getQuotation(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Quotation')
        .select('*, Customer(*), QuotationItem(*)')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

// ============================================================
// HELPERS
// ============================================================

async function generateQuotationNumber() {
    const supabase = await createClient()
    // Find latest quotation number
    const { data } = await supabase
        .from('Quotation')
        .select('quotationNumber')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single()

    const currentYear = new Date().getFullYear().toString()
    const prefix = `QT-${currentYear}-`

    if (data?.quotationNumber && data.quotationNumber.startsWith(prefix)) {
        const sequence = parseInt(data.quotationNumber.split('-')[2])
        return `${prefix}${(sequence + 1).toString().padStart(4, '0')}`
    }

    return `${prefix}0001`
}

// ============================================================
// CREATE
// ============================================================

export async function createQuotation(
    quotationData: Partial<QuotationInsert>,
    items: Partial<QuotationItemInsert>[]
): Promise<{ success: boolean; data?: any; error?: string }> {
    const supabase = await createClient()
    const quotationNumber = await generateQuotationNumber()

    // Fetch Organization ID
    const { data: org } = await supabase.from('Organization').select('id').single()
    const organizationId = org?.id || 'demo-org-123'

    // 1. Create Quotation Header
    const { data: newQuotation, error: qtError } = await supabase
        .from('Quotation')
        .insert({
            id: crypto.randomUUID(),
            organizationId,
            quotationNumber,
            status: 'DRAFT',
            totalAmount: quotationData.totalAmount || 0,
            vatAmount: quotationData.vatAmount || 0,
            grandTotal: quotationData.grandTotal || 0,
            customerId: quotationData.customerId,
            expiresAt: (quotationData as any).expiresAt,
            notes: (quotationData as any).notes,
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

    if (qtError) {
        console.error('Error creating quotation:', qtError)
        return { success: false, error: qtError.message }
    }

    // 2. Create Quotation Items
    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            id: crypto.randomUUID(),
            quotationId: newQuotation.id,
            name: item.name || 'Untitled Item',
            description: item.description || '',
            width: item.width || 0,
            height: item.height || 0,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            discount: item.discount || 0,
        }))

        const { error: itemsError } = await supabase
            .from('QuotationItem')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating quotation items:', itemsError)
            // Rollback
            await supabase.from('Quotation').delete().eq('id', newQuotation.id)
            return { success: false, error: itemsError.message }
        }
    }

    revalidatePath('/billing')
    revalidatePath('/')
    return { success: true, data: newQuotation }
}

// ============================================================
// UPDATE STATUS
// ============================================================

export async function updateQuotationStatus(id: string, status: DocumentStatus) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('Quotation')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/billing')
    return { success: true }
}

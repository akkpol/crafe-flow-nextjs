'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Quotation, QuotationItem, QuotationInsert, QuotationItemInsert, DocumentStatus } from '@/lib/types'
import { requirePermission } from '@/lib/auth'
import { QuotationSchema, QuotationItemSchema } from '@/lib/schemas'
import { z } from 'zod'

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
    inQuotationData: z.input<typeof QuotationSchema>,
    inItems: z.input<typeof QuotationItemSchema>[]
): Promise<{ success: boolean; data?: any; error?: string }> {
    await requirePermission('billing')

    const quotationData = QuotationSchema.parse(inQuotationData)
    const items = z.array(QuotationItemSchema).parse(inItems)

    const supabase = await createClient()
    const quotationNumber = await generateQuotationNumber()

    // Fetch Organization ID
    const { data: org } = await supabase.from('Organization').select('id').single()
    const organizationId = org?.id || ''

    if (!organizationId) {
        return { success: false, error: 'Organization ID not found' }
    }

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
            expiresAt: quotationData.expiresAt,
            notes: quotationData.notes,
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
            width: Number(item.width) || 0,
            height: Number(item.height) || 0,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
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
    await requirePermission('billing')

    const supabase = await createClient()
    const { error } = await supabase
        .from('Quotation')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/billing')
    return { success: true }
}

// ============================================================
// CREATE QUOTATION + JOB (Quotation-First Workflow)
// ============================================================

export type CreateQuotationAndJobParams = {
    quotationData: z.input<typeof QuotationSchema>
    items: z.input<typeof QuotationItemSchema>[]
    jobOptions?: {
        deadline: string        // ISO date string
        priority: 'low' | 'medium' | 'high' | 'urgent'
        notes?: string
    }
}

export async function createQuotationAndJob(
    params: CreateQuotationAndJobParams
): Promise<{ success: boolean; quotation?: any; order?: any; error?: string }> {
    const { quotationData, items, jobOptions } = params

    // Step 1: Create the Quotation
    const qtResult = await createQuotation(quotationData, items)
    if (!qtResult.success || !qtResult.data) {
        return { success: false, error: qtResult.error }
    }
    const quotation = qtResult.data

    // If no job options, just return the quotation
    if (!jobOptions) {
        return { success: true, quotation }
    }

    // Step 2: Auto-create a linked Job (Order)
    const { createOrder } = await import('@/actions/orders')

    const jobNotes = `[${quotation.quotationNumber}]${jobOptions.notes ? ' ' + jobOptions.notes : ''}`

    const orderResult = await createOrder(
        {
            customerId: quotationData.customerId,
            totalAmount: quotationData.totalAmount || 0,
            vatAmount: quotationData.vatAmount || 0,
            grandTotal: quotationData.grandTotal || 0,
            deadline: jobOptions.deadline,
            priority: jobOptions.priority,
            notes: jobNotes,} as any,
        items.map(item => ({
            name: item.name || 'Untitled Item',
            width: Number(item.width) || 0,
            height: Number(item.height) || 0,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
            details: item.description || '',
        }))
    )

    if (!orderResult.success) {
        // QT was created but job failed — still a partial success
        console.error('Job auto-create failed after QT created:', orderResult.error)
        return { success: true, quotation, error: `QT created but Job failed: ${orderResult.error}` }
    }

    revalidatePath('/kanban')
    revalidatePath('/billing')
    revalidatePath('/')
    return { success: true, quotation, order: orderResult.data }
}






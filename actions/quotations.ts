'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { OrderInsert, QuotationStatus, Quotation, QuotationWithRelations } from '@/lib/types'
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
        .select('*, Customer(name, phone)')
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching quotations:', error)
        return []
    }
    return data
}

export async function getQuotation(id: string): Promise<QuotationWithRelations | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Quotation')
        .select('*, Customer(*), QuotationItem(*)')
        .eq('id', id)
        .single()

    if (error) return null
    return data as QuotationWithRelations
}

// ============================================================
// HELPERS
// ============================================================

async function generateQuotationNumber() {
    const supabase = await createClient()
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
): Promise<{ success: boolean; data?: Quotation; error?: string }> {
    await requirePermission('billing')

    const quotationData = QuotationSchema.parse(inQuotationData)
    const items = z.array(QuotationItemSchema).parse(inItems)

    const supabase = await createClient()
    const quotationNumber = await generateQuotationNumber()

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
            discount: quotationData.discount || 0,
            customerId: quotationData.customerId,
            expiresAt: quotationData.expiresAt,
            notes: quotationData.notes,
            paymenttermstext: quotationData.paymenttermstext,
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
            details: item.details || '',
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
            await supabase.from('Quotation').delete().eq('id', newQuotation.id)
            return { success: false, error: itemsError.message }
        }
    }

    revalidatePath('/billing')
    revalidatePath('/')
    return { success: true, data: newQuotation as Quotation }
}

// ============================================================
// UPDATE — Header + Items (full edit)
// ============================================================

export async function updateQuotation(
    id: string,
    inQuotationData: z.input<typeof QuotationSchema>,
    inItems: z.input<typeof QuotationItemSchema>[]
): Promise<{ success: boolean; error?: string }> {
    await requirePermission('billing')

    const quotationData = QuotationSchema.parse(inQuotationData)
    const items = z.array(QuotationItemSchema).parse(inItems)

    const supabase = await createClient()

    // Guard: only DRAFT quotations can be edited
    const { data: existing } = await supabase
        .from('Quotation')
        .select('status')
        .eq('id', id)
        .single()

    if (!existing) return { success: false, error: 'Quotation not found' }
    if (existing.status !== 'DRAFT') {
        return { success: false, error: `ไม่สามารถแก้ไขใบเสนอราคาที่มีสถานะ ${existing.status} ได้` }
    }

    // 1. Update header
    const { error: updateError } = await supabase
        .from('Quotation')
        .update({
            totalAmount: quotationData.totalAmount || 0,
            vatAmount: quotationData.vatAmount || 0,
            grandTotal: quotationData.grandTotal || 0,
            discount: quotationData.discount || 0,
            customerId: quotationData.customerId,
            expiresAt: quotationData.expiresAt,
            notes: quotationData.notes,
            paymenttermstext: quotationData.paymenttermstext,
            updatedAt: new Date().toISOString(),
        })
        .eq('id', id)

    if (updateError) return { success: false, error: updateError.message }

    // 2. Replace items (delete old + insert new)
    await supabase.from('QuotationItem').delete().eq('quotationId', id)

    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            id: crypto.randomUUID(),
            quotationId: id,
            name: item.name || 'Untitled Item',
            description: item.description || '',
            details: item.details || '',
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

        if (itemsError) return { success: false, error: itemsError.message }
    }

    revalidatePath('/billing')
    return { success: true }
}

// ============================================================
// UPDATE STATUS — จาก status เดิม → status ใหม่
// ============================================================

export async function updateQuotationStatus(
    id: string,
    status: QuotationStatus
): Promise<{ success: boolean; error?: string }> {
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
// ACCEPT QUOTATION → Auto-create Order (Quotation-First Workflow)
// ============================================================

export async function acceptQuotation(
    quotationId: string
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    await requirePermission('billing')

    const supabase = await createClient()

    // 1. Fetch quotation with items
    const quotation = await getQuotation(quotationId)
    if (!quotation) return { success: false, error: 'Quotation not found' }

    if (quotation.status === 'ACCEPTED') {
        return { success: false, error: 'ใบเสนอราคานี้ถูกยืนยันแล้ว' }
    }

    // 2. Check if order already exists for this quotation
    const { data: existingOrder } = await supabase
        .from('Order')
        .select('id')
        .eq('quotationid', quotationId)
        .single()

    if (existingOrder) {
        return { success: false, error: 'มีคำสั่งงานที่สร้างจากใบเสนอราคานี้แล้ว' }
    }

    // 3. Auto-create linked Order FIRST
    const { createOrder } = await import('@/actions/orders')

    const orderResult = await createOrder(
        {
            customerId: quotation.customerId ?? undefined,
            totalAmount: quotation.totalAmount,
            vatAmount: quotation.vatAmount,
            grandTotal: quotation.grandTotal,
            notes: `สร้างจากใบเสนอราคา ${quotation.quotationNumber}`,
            quotationid: quotationId,
        },
        (quotation.QuotationItem || []).map(item => ({
            name: item.name,
            width: item.width ?? undefined,
            height: item.height ?? undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            details: item.details ?? item.description ?? '',
        }))
    )

    if (!orderResult.success) {
        return { success: false, error: `ไม่สามารถสร้างคำสั่งงานได้: ${orderResult.error}` }
    }

    // 4. Only mark quotation as ACCEPTED after order is successfully created
    const { error: acceptError } = await supabase
        .from('Quotation')
        .update({
            status: 'ACCEPTED',
            approvedat: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .eq('id', quotationId)

    if (acceptError) {
        // Order was created but quotation update failed - this is a partial success
        console.error('Failed to update quotation status after order creation:', acceptError)
        return { 
            success: true, 
            orderId: orderResult.data?.id,
            error: `สร้างคำสั่งงานสำเร็จแต่อัปเดตสถานะใบเสนอราคาไม่ได้: ${acceptError.message}` 
        }
    }

    revalidatePath('/billing')
    revalidatePath('/kanban')
    revalidatePath('/')
    return { success: true, orderId: orderResult.data?.id }
}

// ============================================================
// REJECT QUOTATION
// ============================================================

export async function rejectQuotation(
    quotationId: string,
    reason: string
): Promise<{ success: boolean; error?: string }> {
    await requirePermission('billing')

    const supabase = await createClient()
    const { error } = await supabase
        .from('Quotation')
        .update({
            status: 'REJECTED',
            rejectionreason: reason,
            updatedAt: new Date().toISOString(),
        })
        .eq('id', quotationId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/billing')
    return { success: true }
}

// ============================================================
// CREATE QUOTATION + JOB (Quotation-First Workflow — deprecated)
// ใช้ createQuotation + acceptQuotation แยกกัน ดีกว่า
// ============================================================

export type CreateQuotationAndJobParams = {
    quotationData: z.input<typeof QuotationSchema>
    items: z.input<typeof QuotationItemSchema>[]
    jobOptions?: {
        deadline: string
        priority: 'low' | 'medium' | 'high' | 'urgent'
        notes?: string
    }
}

import { Order } from '@/lib/types'

export async function createQuotationAndJob(
    params: CreateQuotationAndJobParams
): Promise<{ success: boolean; quotation?: Quotation; order?: Order; error?: string }> {
    const { quotationData, items, jobOptions } = params

    const qtResult = await createQuotation(quotationData, items)
    if (!qtResult.success || !qtResult.data) {
        return { success: false, error: qtResult.error }
    }
    const quotation = qtResult.data

    if (!jobOptions) {
        return { success: true, quotation }
    }

    const { createOrder } = await import('@/actions/orders')

    const jobNotes = `[${quotation.quotationNumber}]${jobOptions.notes ? ' ' + jobOptions.notes : ''}`

    const orderPayload: Partial<OrderInsert> = {
        customerId: quotationData.customerId,
        totalAmount: Number(quotationData.totalAmount) || 0,
        vatAmount: Number(quotationData.vatAmount) || 0,
        grandTotal: Number(quotationData.grandTotal) || 0,
        deadline: jobOptions.deadline,
        priority: jobOptions.priority,
        notes: jobNotes,
        quotationid: quotation.id,
    }

    const orderResult = await createOrder(
        orderPayload,
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
        console.error('Job auto-create failed after QT created:', orderResult.error)
        return { success: true, quotation, error: `QT created but Job failed: ${orderResult.error}` }
    }

    revalidatePath('/kanban')
    revalidatePath('/billing')
    revalidatePath('/')
    return { success: true, quotation, order: orderResult.data }
}

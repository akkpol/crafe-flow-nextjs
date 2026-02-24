'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { Invoice } from '@/lib/types'
import { requirePermission } from '@/lib/auth'

/**
 * Generate a new Invoice ID (IV-YYYYMM-XXXX)
 */
export async function generateInvoiceNumber(): Promise<string> {
    const supabase = await createClient()
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const prefix = `IV-${year}${month}`

    const { data, error } = await supabase
        .from('Invoice')
        .select('invoiceNumber')
        .ilike('invoiceNumber', `${prefix}-%`)
        .order('invoiceNumber', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating invoice number:', error)
        throw new Error('Failed to generate invoice number')
    }

    let runningNumber = 1
    if (data && data.length > 0) {
        const lastNumber = data[0].invoiceNumber.split('-')[2]
        runningNumber = parseInt(lastNumber) + 1
    }

    return `${prefix}-${runningNumber.toString().padStart(4, '0')}`
}

/**
 * Generate a new Tax Invoice Number (TX-YYYYMM-XXXX)
 */
export async function generateTaxInvoiceNumber(): Promise<string> {
    const supabase = await createClient()
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const prefix = `TX-${year}${month}`

    const { data, error } = await supabase
        .from('Invoice')
        .select('taxInvoiceNumber')
        .ilike('taxInvoiceNumber', `${prefix}-%`)
        .order('taxInvoiceNumber', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating tax invoice number:', error)
        throw new Error('Failed to generate tax invoice number')
    }

    let runningNumber = 1
    if (data && data.length > 0 && data[0].taxInvoiceNumber) {
        const lastNumber = data[0].taxInvoiceNumber.split('-')[2]
        runningNumber = parseInt(lastNumber) + 1
    }

    return `${prefix}-${runningNumber.toString().padStart(4, '0')}`
}

export async function createInvoice(data: any, items: any[]) {
    // Permission guard — billing requires 'billing' or admin
    await requirePermission('billing')

    const supabase = await createClient()
    const invoiceNumber = await generateInvoiceNumber()

    let taxInvoiceNumber = null
    let taxInvoiceDate = null
    const isTaxInvoice = data.isTaxInvoice === true

    if (isTaxInvoice) {
        taxInvoiceNumber = await generateTaxInvoiceNumber()
        taxInvoiceDate = new Date().toISOString()
    }

    // Fetch Organization ID if not provided
    let organizationId = data.organizationId
    if (!organizationId) {
        const { data: org } = await supabase.from('Organization').select('id').single()
        organizationId = org?.id ?? ''
    }

    // 1. Create Invoice
    const { data: invoice, error: invoiceError } = await supabase
        .from('Invoice')
        .insert({
            id: crypto.randomUUID(),
            invoiceNumber,
            isTaxInvoice,
            taxInvoiceNumber,
            taxInvoiceDate,
            customerId: data.customerId,
            orderId: data.orderId || null,
            organizationId,
            totalAmount: data.totalAmount,
            vatAmount: data.vatAmount,
            grandTotal: data.grandTotal,
            dueDate: data.dueDate,
            status: 'SENT' as const, // SENT = unpaid/awaiting payment
            updatedAt: new Date().toISOString()
        })
        .select()
        .single()

    if (invoiceError) {
        return { success: false, error: invoiceError.message }
    }

    // 2. Create Invoice Items
    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            invoiceId: invoice.id,
            name: item.name || item.description || 'Untitled', // Ensure name is present
            description: item.description,
            width: item.width,
            height: item.height,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
            discount: item.discount || 0
        }))

        const { error: itemsError } = await supabase
            .from('InvoiceItem')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating invoice items:', itemsError)
            // Optional: Rollback invoice creation
            await supabase.from('Invoice').delete().eq('id', invoice.id)
            return { success: false, error: itemsError.message }
        }
    }

    // 3. Auto-deduct stock for items linked to a material
    try {
        for (const item of items) {
            if (!item.materialId) continue // Skip items without a linked material

            // Fetch the material to get wasteFactor and current stock
            const { data: material } = await supabase
                .from('Material')
                .select('id, inStock, wasteFactor, unit')
                .eq('id', item.materialId)
                .single()

            if (!material) continue

            // Calculate quantity used (apply wasteFactor)
            let quantityUsed: number
            if (item.width && item.height) {
                // sqm-based: width × height × qty × wasteFactor
                const area = item.width * item.height * (item.quantity || 1)
                quantityUsed = area * Math.max(1, material.wasteFactor || 1)
            } else {
                // piece-based: qty × wasteFactor
                quantityUsed = (item.quantity || 1) * Math.max(1, material.wasteFactor || 1)
            }

            const newStock = Math.max(0, material.inStock - quantityUsed)

            // Deduct from stock
            await supabase
                .from('Material')
                .update({ inStock: newStock, updatedAt: new Date().toISOString() })
                .eq('id', material.id)

            // Record stock transaction
            await supabase.from('StockTransaction').insert({
                id: crypto.randomUUID(),
                materialId: material.id,
                type: 'STOCK_OUT',
                quantity: quantityUsed,
                reason: `Invoice ${invoiceNumber}`,
                createdAt: new Date().toISOString(),
            })
        }
    } catch (stockError) {
        // Non-blocking: log but don't roll back invoice
        console.error('Error deducting stock for invoice:', stockError)
    }

    revalidatePath('/invoices')
    revalidatePath('/stock') // Refresh stock page
    return { success: true, data: invoice }
}

export async function getInvoices() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Invoice')
        .select('*, Customer(name)')
        .order('createdAt', { ascending: false })

    if (error) return []
    return data
}

export async function getInvoice(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Invoice')
        .select('*, Customer(*), InvoiceItem(*)')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function getUnpaidInvoices() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Invoice')
        .select('*, Customer(name)')
        .eq('status', 'SENT') // SENT = awaiting payment (UNPAID is not a valid status)
        .order('createdAt', { ascending: false })

    if (error) return []
    return data
}

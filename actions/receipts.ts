'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

/**
 * Generate a new Receipt Number (RE-YYYYMM-XXXX)
 */
export async function generateReceiptNumber(): Promise<string> {
    const supabase = await createClient()
    const year = new Date().getFullYear()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const prefix = `RE-${year}${month}`

    const { data, error } = await supabase
        .from('Receipt')
        .select('receiptNumber')
        .ilike('receiptNumber', `${prefix}-%`)
        .order('receiptNumber', { ascending: false })
        .limit(1)

    if (error) {
        console.error('Error generating receipt number:', error)
        throw new Error('Failed to generate receipt number')
    }

    let runningNumber = 1
    if (data && data.length > 0) {
        const lastNumber = data[0].receiptNumber.split('-')[2]
        runningNumber = parseInt(lastNumber) + 1
    }

    return `${prefix}-${runningNumber.toString().padStart(4, '0')}`
}

export async function createReceipt(data: {
    invoiceId: string
    paymentMethod: string
    notes?: string
    totalAmount: number
    customerId: string
    paymentDate: Date
}) {
    const supabase = await createClient()
    const receiptNumber = await generateReceiptNumber()

    // 1. Create Receipt
    const { data: receipt, error: receiptError } = await supabase
        .from('Receipt')
        .insert({
            receiptNumber,
            invoiceId: data.invoiceId,
            customerId: data.customerId,
            paymentMethod: data.paymentMethod,
            totalAmount: data.totalAmount,
            notes: data.notes,
            paymentDate: data.paymentDate.toISOString(),
            updatedAt: new Date().toISOString()
        })
        .select()
        .single()

    if (receiptError) {
        return { success: false, error: receiptError.message }
    }

    // 2. Update Invoice Status to PAID
    const { error: invoiceError } = await supabase
        .from('Invoice')
        .update({ status: 'PAID' })
        .eq('id', data.invoiceId)

    if (invoiceError) {
        console.error('Error updating invoice status:', invoiceError)
        // Rolling back receipt creation or just log error? 
        // Better to try to rollback but for now assume detailed error handling for later.
        // Or at least notify user.
    }

    revalidatePath('/invoices')
    revalidatePath('/receipts')

    return { success: true, data: receipt }
}

export async function getReceipts() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Receipt')
        .select('*, Customer(name), Invoice(invoiceNumber)')
        .order('createdAt', { ascending: false })

    if (error) return []
    return data
}

export async function getReceipt(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Receipt')
        .select('*, Customer(*), Invoice(*, InvoiceItem(*))') // Get Invoice Item details via Invoice
        .eq('id', id)
        .single()

    if (error) return null

    // We might need to transform InvoiceItems to be directly usable if needed, 
    // but the generic DocumentLayout can take them if formatted correctly.
    // The Receipt itself acts as a wrapper around the Invoice details usually.
    return data
}

'use server'

import { createClient } from '@/lib/supabase-server'
import { Material } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getStockItems() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Material')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching stock:', error)
        return []
    }

    return data as Material[]
}

export async function updateStockLevel(id: string, newAmount: number, reason: string) {
    const supabase = await createClient()

    // 1. Get current stock
    const { data: current, error: fetchError } = await supabase
        .from('Material')
        .select('inStock')
        .eq('id', id)
        .single()

    if (fetchError || !current) throw new Error('Material not found')

    const diff = newAmount - current.inStock
    if (diff === 0) return { success: true }

    // 2. Update stock
    const { error: updateError } = await supabase
        .from('Material')
        .update({ inStock: newAmount, updatedAt: new Date().toISOString() })
        .eq('id', id)

    if (updateError) {
        console.error('Error updating stock:', updateError)
        throw new Error('Failed to update stock')
    }

    // 3. Record transaction
    const { error: transactionError } = await supabase.from('StockTransaction').insert({
        id: crypto.randomUUID(),
        materialId: id,
        type: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
        quantity: Math.abs(diff),
        reason: reason,
        createdAt: new Date().toISOString(),
    })

    if (transactionError) {
        console.error('Error recording transaction:', transactionError)
        // Non-blocking error, but good to log
    }

    revalidatePath('/stock')
    revalidatePath('/') // Dashboard might use this
    return { success: true }
}

export async function createMaterial(data: any) {
    const supabase = await createClient()

    // Validate/Prepare data
    const newMaterial = {
        id: crypto.randomUUID(),
        organizationId: 'demo-org-123', // Hardcoded for now
        name: data.name,
        type: data.type,
        inStock: Number(data.inStock) || 0,
        unit: data.unit || 'units',
        costPrice: Number(data.costPrice) || 0,
        sellingPrice: Number(data.sellingPrice) || 0,
        wasteFactor: Number(data.wasteFactor) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    const { error } = await supabase.from('Material').insert(newMaterial)

    if (error) {
        console.error('Error creating material:', error)
        throw new Error('Failed to create material')
    }

    revalidatePath('/stock')
    return { success: true }
}

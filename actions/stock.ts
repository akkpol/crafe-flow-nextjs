'use server'

import { createClient } from '@/lib/supabase'
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

export async function updateStockLevel(id: string, newLevel: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('Material')
        .update({
            inStock: newLevel,
            updatedAt: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating stock:', error)
        return { success: false, error }
    }

    revalidatePath('/stock')
    revalidatePath('/') // Revalidate dashboard stats
    return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase-server'
import type { OrderHistory, Tables } from '@/lib/types'

export type OrderHistoryRecord = OrderHistory & {
    profiles?: Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null
}

export async function getOrderHistory(orderId: string): Promise<OrderHistoryRecord[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('OrderHistory')
        .select('*, profiles(full_name, avatar_url)')
        .eq('orderId', orderId)
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching history:', error)
        return []
    }

    return data as OrderHistoryRecord[]
}

'use server'

import { createClient } from '@/lib/supabase-server'

export async function getOrderHistory(orderId: string) {
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

    return data
}

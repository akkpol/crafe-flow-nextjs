'use server'

import { createClient } from '@/lib/supabase-server'

export interface LineUser {
    line_user_id: string
    display_name: string
    picture_url: string | null
    status_message: string | null
    last_interaction: string
}

export async function searchLineUsers(query: string): Promise<LineUser[]> {
    const supabase = await createClient()

    // Search by display name
    const { data, error } = await supabase
        .from('line_users')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .order('last_interaction', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error searching LINE users:', error)
        return []
    }

    return data as LineUser[]
}

export async function getRecentLineUsers(): Promise<LineUser[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('line_users')
        .select('*')
        .order('last_interaction', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching recent LINE users:', error)
        return []
    }

    return data as LineUser[]
}

'use server'

import { createClient } from '@/lib/supabase-server'
import type { Tables } from '@/lib/types'

export async function getProfiles(): Promise<Tables<'profiles'>[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name') // or email if name is null

    if (error) {
        console.error('Error fetching profiles:', error)
        return []
    }
    return data as Tables<'profiles'>[]
}

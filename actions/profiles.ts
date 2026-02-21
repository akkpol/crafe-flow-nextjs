'use server'

import { createClient } from '@/lib/supabase-server'

export async function getProfiles() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name') // or email if name is null

    if (error) {
        console.error('Error fetching profiles:', error)
        return []
    }
    return data
}

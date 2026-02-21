'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getOrganization() {
    const supabase = await createClient()

    // For now, we assume single organization or fetch the first one
    // In a multi-tenant app, this would filter by user's org
    const { data, error } = await supabase
        .from('Organization')
        .select('*')
        .single() // Expecting only one for now

    if (error) {
        console.error('Error fetching organization:', error)
        return null
    }

    return data
}

export async function updateOrganization(
    id: string,
    data: {
        name: string;
        address?: string;
        taxId?: string;
        phone?: string;
        email?: string;
        website?: string;
        logoUrl?: string; // We'll handle file upload separately in client
    }
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('Organization')
        .update({
            ...data,
            updatedAt: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}

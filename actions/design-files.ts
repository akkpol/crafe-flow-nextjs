'use server'

import { createClient } from '@/lib/supabase-server'
import { DesignFile } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/auth'

export async function getDesignFiles(orderId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('DesignFile')
        .select(`
            *,
            profiles:uploadedby (
                full_name,
                avatar_url
            )
        `)
        .eq('orderId', orderId)
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching design files:', error)
        return []
    }

    return data
}

export async function addDesignFile(payload: {
    orderId: string
    fileName: string
    fileUrl: string
    fileType: string
    filesize: number
    notes?: string
}) {
    await requirePermission('orders') // Should have a more specific production permission if needed

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('DesignFile').insert({
        id: crypto.randomUUID(),
        orderId: payload.orderId,
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        fileType: payload.fileType,
        filesize: payload.filesize,
        notes: payload.notes || '',
        uploadedby: user.id,
        version: 1, // Basic versioning
        createdAt: new Date().toISOString(),
    })

    if (error) {
        console.error('Error adding design file:', error)
        throw new Error('Failed to add design file')
    }

    revalidatePath('/kanban')
    return { success: true }
}

export async function deleteDesignFile(id: string, orderId: string) {
    await requirePermission('orders')

    const supabase = await createClient()

    const { error } = await supabase
        .from('DesignFile')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting design file:', error)
        throw new Error('Failed to delete design file')
    }

    revalidatePath('/kanban')
    return { success: true }
}

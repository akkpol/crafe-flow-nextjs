import { createClient } from '@/lib/supabase-server'
import { cache } from 'react'

export const getUser = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
})

export const getProfile = cache(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, roles(*)')
        .eq('id', user.id)
        .single()

    return profile
})

export const hasPermission = async (permission: string) => {
    const profile = await getProfile()
    if (!profile || !profile.roles) return false

    const permissions = (profile.roles as any).permissions
    if (!permissions) return false

    if (Array.isArray(permissions)) {
        return permissions.includes('*') || permissions.includes(permission)
    }
    return false
}

export const isAdmin = async () => {
    const profile = await getProfile()
    return profile?.roles?.name === 'admin'
}

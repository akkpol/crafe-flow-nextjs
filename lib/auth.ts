import { createClient } from '@/lib/supabase-server'
import { cache } from 'react'

export type RoleName = 'admin' | 'manager' | 'staff' | 'viewer'

export type Permission =
    | '*'
    | 'orders'
    | 'orders:read'
    | 'billing'
    | 'stock'
    | 'customers'
    | 'reports'

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

export const getUserRole = cache(async (): Promise<RoleName | null> => {
    const profile = await getProfile()
    return ((profile?.roles as any)?.name as RoleName) ?? null
})

/**
 * Check if the current user has a specific permission.
 * Admins with '*' permission pass all checks.
 * Also supports sub-permission check: 'orders:read' satisfies 'orders'.
 */
export const hasPermission = cache(async (permission: Permission): Promise<boolean> => {
    const profile = await getProfile()
    if (!profile?.roles) return false

    const permissions: string[] = (profile.roles as any)?.permissions ?? []

    // Wildcard grants everything
    if (permissions.includes('*')) return true

    // Exact match
    if (permissions.includes(permission)) return true

    // Check prefix: 'orders:read' satisfies 'orders' check if permission is 'orders:read'
    if (permissions.some(p => permission.startsWith(p + ':'))) return true

    return false
})

export const isAdmin = cache(async (): Promise<boolean> => {
    const role = await getUserRole()
    return role === 'admin'
})

export const isManagerOrAbove = cache(async (): Promise<boolean> => {
    const role = await getUserRole()
    return role === 'admin' || role === 'manager'
})

export const isStaffOrAbove = cache(async (): Promise<boolean> => {
    const role = await getUserRole()
    return role === 'admin' || role === 'manager' || role === 'staff'
})

/**
 * Use in Server Actions to throw if user lacks permission.
 * Example: await requirePermission('billing')
 */
export async function requirePermission(permission: Permission): Promise<void> {
    const allowed = await hasPermission(permission)
    if (!allowed) {
        throw new Error(`Permission denied: requires '${permission}'`)
    }
}

export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin()
    if (!admin) {
        throw new Error('Permission denied: admin only')
    }
}

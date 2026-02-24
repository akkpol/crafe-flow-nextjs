import { hasPermission, isAdmin, isManagerOrAbove, isStaffOrAbove, type Permission } from '@/lib/auth'

interface PermissionGuardProps {
    children: React.ReactNode
    /** Required permission. If not provided, uses role check. */
    permission?: Permission
    /** Minimum role required */
    role?: 'admin' | 'manager' | 'staff'
    /** What to show when access is denied (default: nothing) */
    fallback?: React.ReactNode
}

/**
 * PermissionGuard — Server Component
 * ===================================
 * Wraps UI sections that should only be visible to users with the right role/permission.
 *
 * @example
 * // Show only to admins
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * // Show to managers and above, with a fallback
 * <PermissionGuard role="manager" fallback={<p>Upgrade plan to access</p>}>
 *   <BillingSection />
 * </PermissionGuard>
 *
 * // Permission-based
 * <PermissionGuard permission="billing">
 *   <CreateInvoiceButton />
 * </PermissionGuard>
 */
export async function PermissionGuard({
    children,
    permission,
    role,
    fallback = null,
}: PermissionGuardProps) {
    let allowed = false

    if (permission) {
        allowed = await hasPermission(permission)
    } else if (role === 'admin') {
        allowed = await isAdmin()
    } else if (role === 'manager') {
        allowed = await isManagerOrAbove()
    } else if (role === 'staff') {
        allowed = await isStaffOrAbove()
    } else {
        allowed = true // No restriction
    }

    if (!allowed) return <>{fallback}</>
    return <>{children}</>
}

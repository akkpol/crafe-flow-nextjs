'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Order, OrderStatus, OrderInsert, OrderItemInsert, OrderWithRelations } from '@/lib/types'
import { requirePermission } from '@/lib/auth'
import { OrderSchema, OrderItemSchema, UpdateOrderProgressSchema } from '@/lib/schemas'
import { z } from 'zod'

// ============================================================
// READ
// ============================================================

export async function getOrders() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Order')
        .select('*, Customer(name, phone, lineId), OrderItem(name), profiles(full_name, avatar_url)')
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        return []
    }
    return data
}

export async function getOrder(id: string): Promise<OrderWithRelations | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Order')
        .select('*, Customer(*), OrderItem(*), DesignFile(*)')
        .eq('id', id)
        .single()

    if (error) return null
    return data as unknown as OrderWithRelations
}

// ============================================================
// HELPERS
// ============================================================

async function generateOrderNumber() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('Order')
        .select('orderNumber')
        .order('createdAt', { ascending: false })
        .limit(1)
        .single()

    const currentYear = new Date().getFullYear().toString()
    const prefix = `JOB-${currentYear}-`

    if (data?.orderNumber && data.orderNumber.startsWith(prefix)) {
        const sequence = parseInt(data.orderNumber.split('-')[2])
        return `${prefix}${(sequence + 1).toString().padStart(3, '0')}`
    }

    return `${prefix}001`
}

// ============================================================
// CREATE
// ============================================================

export async function createOrder(
    orderData: Partial<OrderInsert>,
    items: Partial<OrderItemInsert>[]
): Promise<{ success: boolean; data?: Order; error?: string }> {
    await requirePermission('orders')

    const supabase = await createClient()
    const orderNumber = await generateOrderNumber()

    const { data: org } = await supabase.from('Organization').select('id').single()
    const organizationId = org?.id ?? ''

    // 1. Create Order Header
    const { data: newOrder, error: orderError } = await supabase
        .from('Order')
        .insert({
            id: crypto.randomUUID(),
            organizationId,
            orderNumber,
            status: 'new',
            totalAmount: orderData.totalAmount || 0,
            vatAmount: orderData.vatAmount || 0,
            grandTotal: orderData.grandTotal || 0,
            customerId: orderData.customerId,
            deadline: orderData.deadline,
            installationdate: orderData.installationdate,
            priority: orderData.priority || 'medium',
            notes: orderData.notes,
            quotationid: orderData.quotationid,
            progresspercent: 0,
            updatedAt: new Date().toISOString(),
        })
        .select()
        .single()

    if (orderError) {
        console.error('Error creating order:', orderError)
        return { success: false, error: orderError.message }
    }

    // 2. Create Order Items
    if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
            id: crypto.randomUUID(),
            orderId: newOrder.id,
            name: item.name || 'Untitled Item',
            width: item.width || 0,
            height: item.height || 0,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            totalPrice: item.totalPrice || 0,
            details: item.details || '',
        }))

        const { error: itemsError } = await supabase
            .from('OrderItem')
            .insert(itemsToInsert)

        if (itemsError) {
            console.error('Error creating order items:', itemsError)
            await supabase.from('Order').delete().eq('id', newOrder.id)
            return { success: false, error: itemsError.message }
        }
    }

    // Log history
    await logOrderHistory(newOrder.id, 'ORDER_CREATED', { orderNumber, status: 'new' })

    revalidatePath('/kanban')
    revalidatePath('/jobs')
    revalidatePath('/')
    return { success: true, data: newOrder as Order }
}

// ============================================================
// UPDATE STATUS
// ============================================================

export async function updateOrderStatus(id: string, status: OrderStatus) {
    const supabase = await createClient()

    // Fetch old status for history
    const { data: current } = await supabase
        .from('Order')
        .select('status')
        .eq('id', id)
        .single()

    const { error } = await supabase
        .from('Order')
        .update({
            status,
            updatedAt: new Date().toISOString(),
            ...(status === 'done' ? { completedat: new Date().toISOString(), progresspercent: 100 } : {}),
        })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    await logOrderHistory(id, 'STATUS_CHANGE', {
        oldStatus: current?.status,
        newStatus: status,
    })

    revalidatePath('/kanban')
    return { success: true }
}

// ============================================================
// UPDATE ASSIGNEE
// ============================================================

export async function updateOrderAssignee(orderId: string, assigneeId: string | null) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('Order')
        .update({ assigneeId, updatedAt: new Date().toISOString() })
        .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    await logOrderHistory(orderId, 'ASSIGNEE_UPDATE', { assigneeId })

    revalidatePath('/kanban')
    return { success: true }
}

// ============================================================
// UPDATE PROGRESS
// ============================================================

export async function updateOrderProgress(
    orderId: string,
    progresspercent: number
): Promise<{ success: boolean; error?: string }> {
    const validated = UpdateOrderProgressSchema.parse({ progresspercent })

    const supabase = await createClient()
    const { error } = await supabase
        .from('Order')
        .update({
            progresspercent: validated.progresspercent,
            updatedAt: new Date().toISOString(),
        })
        .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/kanban')
    return { success: true }
}

// ============================================================
// UPDATE ORDER (full update — deadline, notes, priority, installationdate)
// ============================================================

export async function updateOrder(
    id: string,
    data: Partial<Pick<Order, 'deadline' | 'notes' | 'priority' | 'installationdate' | 'customerId'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('Order')
        .update({ ...data, updatedAt: new Date().toISOString() })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/kanban')
    revalidatePath('/jobs')
    return { success: true }
}

// ============================================================
// HISTORY LOG (internal helper)
// ============================================================

async function logOrderHistory(orderId: string, action: string, details: Record<string, unknown>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('OrderHistory').insert({
        orderId,
        action,
        details: JSON.stringify(details),
        oldStatus: details.oldStatus as string ?? null,
        newStatus: details.newStatus as string ?? null,
        actorId: user?.id ?? null,
        createdAt: new Date().toISOString(),
    })
}

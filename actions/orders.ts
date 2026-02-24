'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import type { Order, OrderItem, OrderStatus, OrderInsert, OrderItemInsert } from '@/lib/types'

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



export async function getOrder(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('Order')
        .select('*, Customer(*), OrderItem(*)')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

// ============================================================
// HELPERS
// ============================================================

async function generateOrderNumber() {
    const supabase = await createClient()
    // Find latest order number
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
): Promise<{ success: boolean; data?: any; error?: string }> {
    const supabase = await createClient()
    const orderNumber = await generateOrderNumber()

    // Fetch Organization ID dynamically
    const { data: org } = await supabase.from('Organization').select('id').single()
    const organizationId = org?.id ?? ''

    // 1. Create Order Headers
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
            priority: orderData.priority || 'medium',
            notes: orderData.notes,
            updatedAt: new Date().toISOString(), // Add this
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
            // Rollback (delete order)
            await supabase.from('Order').delete().eq('id', newOrder.id)
            return { success: false, error: itemsError.message }
        }
    }

    revalidatePath('/kanban')
    revalidatePath('/jobs')
    revalidatePath('/') // Dashboard
    return { success: true, data: newOrder }
}

// ============================================================
// UPDATE
// ============================================================

export async function updateOrderStatus(id: string, status: OrderStatus) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('Order')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    // Log history
    await logOrderHistory(id, 'STATUS_CHANGE', { status })

    revalidatePath('/kanban')
    return { success: true }
}

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

async function logOrderHistory(orderId: string, action: string, details: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user exists (might be anon or server action limitation?)
    // If no user, maybe use a system ID or null.

    await supabase.from('OrderHistory').insert({
        orderId,
        action,
        details: JSON.stringify(details),
        actorId: user?.id,
        createdAt: new Date().toISOString()
    })
}

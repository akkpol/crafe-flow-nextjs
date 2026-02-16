'use server'

import { createClient } from '@/lib/supabase'
import { Order } from '@/lib/types'

export async function getBillingStats() {
    const supabase = await createClient()

    // Fetch all active orders
    const { data: orders, error } = await supabase
        .from('Order')
        .select('*')

    if (error) {
        console.error('Error fetching billing stats:', error)
        return { toBeInvoiced: 0, overdue: 0, paidMonth: 0 }
    }

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const today = new Date().toISOString().split('T')[0]

    // Logic:
    // To Be Invoiced: Completed jobs (status=done) that are recent? Or maybe jobs in production?
    // Let's assume 'production', 'qc', 'installing' are "In Progress/To Be Invoiced"
    const toBeInvoiced = orders.filter((o: Order) =>
        ['production', 'qc', 'installing'].includes(o.status)
    ).length

    // Overdue: Deadline passed and not done
    const overdue = orders.filter((o: Order) =>
        o.deadline && o.deadline < today && o.status !== 'done'
    ).length

    // Paid Month: Done jobs updated this month (Proxy for payment)
    const paidMonth = orders.filter((o: Order) =>
        o.status === 'done' && o.updatedAt >= firstDay
    ).length

    return { toBeInvoiced, overdue, paidMonth }
}

export async function getRecentDocuments() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Order')
        .select('*, Customer(name)')
        .order('createdAt', { ascending: false })
        .limit(10)

    if (error) {
        console.error('Error fetching documents:', error)
        return []
    }

    return data.map((order: any) => {
        // Map Order Status to Billing Status
        let status: 'draft' | 'sent' | 'paid' | 'overdue' = 'draft'
        let type: 'Quote' | 'Invoice' = 'Quote'

        if (['new', 'designing'].includes(order.status)) {
            status = 'draft'
            type = 'Quote'
        } else if (order.status === 'approved') {
            status = 'sent' // Quote approved
            type = 'Quote'
        } else if (['production', 'qc', 'installing'].includes(order.status)) {
            status = 'sent' // Invoice sent?
            type = 'Invoice'
        } else if (order.status === 'done') {
            status = 'paid'
            type = 'Invoice'
        }

        // Overdue check
        const today = new Date().toISOString().split('T')[0]
        if (order.deadline && order.deadline < today && order.status !== 'done') {
            status = 'overdue'
        }

        return {
            id: order.orderNumber,
            type,
            customer: order.Customer?.name || 'ลูกค้าทั่วไป',
            date: new Date(order.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
            status,
            // Mock amount for now as DB doesn't have it explicitly or sum items?
            // Order has 'total_price' in schema? Let's check schema.
            // Wait, Order in schema.prisma usually has distinct fields.
            // Let's assume 'total_price' exists or calculate from OrderItem later.
            // Checking dashboard.ts, it selects *. Let's assume passed through.
            amount: order.totalPrice || 0,
        }
    })
}

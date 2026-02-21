'use server'

import { createClient } from '@/lib/supabase-server'
import { Order, Material } from '@/lib/types'

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Get all orders
    const { data: orders, error: ordersError } = await supabase
        .from('Order')
        .select('*')

    if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        return { totalJobs: 0, production: 0, installing: 0, doneMonth: 0 }
    }

    // Calculate stats
    const totalJobs = orders.length
    const production = orders.filter((o: Order) => o.status === 'production' || o.status === 'designing' || o.status === 'qc').length
    const installing = orders.filter((o: Order) => o.status === 'installing').length

    // Completed this month
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const doneMonth = orders.filter((o: Order) => o.status === 'done' && o.updatedAt >= firstDay).length

    return {
        totalJobs,
        production,
        installing,
        doneMonth
    }
}

export async function getRecentJobs() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Order')
        .select('*, Customer(name)')
        .order('createdAt', { ascending: false })
        .limit(5)

    if (error) {
        console.error('Error fetching recent jobs:', error)
        return []
    }

    return data.map((job: any) => ({
        id: job.id,
        title: job.orderNumber + (job.notes ? ` - ${job.notes}` : ''), // Use orderNumber as title for now as we don't have job title
        customer: job.Customer?.name || 'ลูกค้าทั่วไป',
        status: job.status,
        priority: job.priority,
        deadline: job.deadline || new Date().toISOString()
    }))
}

export async function getLowStockMaterials() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('Material')
        .select('*')
    //.lt('inStock', 'minStock') // Supabase filter limitation with column comparison, filter in JS for now or use RPC

    if (error) {
        console.error('Error fetching materials:', error)
        return []
    }

    // Filter in JS: inStock <= minStock
    return data
        .filter((m: Material) => m.inStock <= (m.minStock || 0))
        .map((m: Material) => ({
            name: m.name,
            current: m.inStock,
            unit: m.unit,
            min: m.minStock || 0
        }))
}

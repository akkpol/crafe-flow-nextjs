'use server'

import { createClient } from '@/lib/supabase-server'
import { DesignFile, Order } from '@/lib/types'

export interface JobFolder {
    id: string
    orderNumber: string
    jobTitle: string
    customer: string
    nasPath: string
    status: string
    files: Record<string, 'empty' | 'has_files' | 'complete'>
    createdAt: string
}

export async function getJobFolders(): Promise<JobFolder[]> {
    const supabase = await createClient()

    // Fetch Orders with Customer, OrderItem (for job title), and DesignFile
    const { data: orders, error } = await supabase
        .from('Order')
        .select(`
            *,
            Customer(name),
            OrderItem(name),
            DesignFile(*)
        `)
        .order('createdAt', { ascending: false })

    if (error) {
        console.error('Error fetching job folders:', error)
        return []
    }

    return orders.map((order: any) => {
        const jobTitle = order.OrderItem?.[0]?.name || 'งานทั่วไป'
        const customerName = order.Customer?.name || 'ลูกค้าทั่วไป'

        // Generate NAS Path
        // Format: \\NAS\งาน\YYYY\MM\OrderNo-JobTitle
        const date = new Date(order.createdAt)
        const year = date.getFullYear() + 543 // Thai Year? Or just AD? Usually AD for system folders. Let's use AD 2026 as in example.
        // Wait, example uses 2026. Let's use AD.
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const safeJobTitle = jobTitle.replace(/[^a-zA-Z0-9ก-๙\s-]/g, '').trim() // Sanitize
        const nasPath = `\\\\NAS\\งาน\\${year}\\${month}\\${order.orderNumber}-${safeJobTitle}`

        // Map Files
        // Simple logic for now: if any file exists, mark relevant categories
        // In real world, we'd check file extensions or types
        const files: Record<string, 'empty' | 'has_files' | 'complete'> = {
            customer_files: 'empty',
            design: 'empty',
            proof: 'empty',
            print_ready: 'empty',
            photos: 'empty',
        }

        if (order.DesignFile && order.DesignFile.length > 0) {
            // Just mark generic 'has_files' for now as we don't have category column
            files.design = 'has_files'
            // If more than 3 files, assume progress
            if (order.DesignFile.length > 3) {
                files.print_ready = 'has_files'
            }
        }

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            jobTitle,
            customer: customerName,
            nasPath,
            status: order.status,
            files,
            createdAt: order.createdAt,
        }
    })
}

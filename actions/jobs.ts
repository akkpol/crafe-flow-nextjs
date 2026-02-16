'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateJobSchema = z.object({
    customerName: z.string().min(1, 'ชื่อลูกค้าจำเป็น'),
    customerPhone: z.string().min(1, 'เบอร์โทรจำเป็น'),
    jobTitle: z.string().min(1, 'ชื่องานจำเป็น'),
    signType: z.string().optional().nullable(),
    width: z.coerce.number().optional().default(0),
    height: z.coerce.number().optional().default(0),
    price: z.coerce.number().optional().default(0),
    deadline: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    notes: z.string().optional().nullable(),
})

export async function createJob(formData: FormData) {
    const supabase = await createClient()

    // Validate data using Zod
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = CreateJobSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: validatedFields.error.errors.map(err => err.message).join(', ')
        }
    }

    const {
        customerName,
        customerPhone,
        jobTitle,
        signType,
        width,
        height,
        price,
        deadline,
        priority,
        notes
    } = validatedFields.data

    try {
        // 1. Get Organization
        const { data: org } = await supabase.from('Organization').select('id').limit(1).single()
        if (!org) {
            return { success: false, error: 'No organization found. Please set up organization first.' }
        }
        const organizationId = org.id

        // 2. Find or Create Customer
        let customerId;
        const { data: existingCustomer } = await supabase
            .from('Customer')
            .select('id')
            .eq('phone', customerPhone)
            .maybeSingle()

        if (existingCustomer) {
            customerId = existingCustomer.id
        } else {
            const { data: newCustomer, error: custError } = await supabase
                .from('Customer')
                .insert({
                    id: crypto.randomUUID(),
                    name: customerName,
                    phone: customerPhone,
                    organizationId,
                    updatedAt: new Date().toISOString()
                })
                .select()
                .single()

            if (custError) throw custError
            customerId = newCustomer.id
        }

        // 3. Generate Order Number (Simple logic: QT-YYYY-XXX)
        const year = new Date().getFullYear()
        const { count } = await supabase
            .from('Order')
            .select('*', { count: 'exact', head: true })

        const nextNum = (count || 0) + 1
        const orderNumber = `QT-${year}-${nextNum.toString().padStart(3, '0')}`

        // 4. Create Order
        const { data: order, error: orderError } = await supabase
            .from('Order')
            .insert({
                id: crypto.randomUUID(),
                customerId,
                organizationId,
                orderNumber,
                status: 'new',
                priority: priority,
                deadline: deadline || null,
                notes: notes || '',
                totalAmount: price,
                grandTotal: price,
                vatAmount: 0,
                updatedAt: new Date().toISOString()
            })
            .select()
            .single()

        if (orderError) throw orderError

        // 5. Create OrderItem
        const { error: itemError } = await supabase
            .from('OrderItem')
            .insert({
                id: crypto.randomUUID(),
                orderId: order.id,
                name: jobTitle,
                details: signType || '',
                width,
                height,
                quantity: 1,
                unitPrice: price,
                totalPrice: price
            })

        if (itemError) throw itemError

        revalidatePath('/')
        revalidatePath('/kanban')
        revalidatePath('/files')
        revalidatePath('/billing')

        return { success: true, orderId: order.id, orderNumber }
    } catch (error: any) {
        console.error('Error creating job:', error)
        return { success: false, error: error.message || 'Failed to create job' }
    }
}

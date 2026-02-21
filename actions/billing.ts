'use server'

import { createClient } from '@/lib/supabase-server'
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

    const [quotations, invoices, receipts] = await Promise.all([
        supabase.from('Quotation').select('*, Customer(name)').order('createdAt', { ascending: false }).limit(5),
        supabase.from('Invoice').select('*, Customer(name)').order('createdAt', { ascending: false }).limit(5),
        supabase.from('Receipt').select('*, Customer(name)').order('createdAt', { ascending: false }).limit(5)
    ])

    const allDocs = [
        ...(quotations.data || []).map((q: any) => ({ ...q, docType: 'Quote', docNumber: q.quotationNumber })),
        ...(invoices.data || []).map((i: any) => ({ ...i, docType: 'Invoice', docNumber: i.invoiceNumber })),
        ...(receipts.data || []).map((r: any) => ({ ...r, docType: 'Receipt', docNumber: r.receiptNumber }))
    ]

    // Sort by createdAt desc
    allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return allDocs.slice(0, 15).map((d: any) => {
        let status: 'draft' | 'sent' | 'paid' | 'overdue' = 'draft'

        if (d.docType === 'Quote') {
            switch (d.status) {
                case 'DRAFT': status = 'draft'; break;
                case 'SENT': status = 'sent'; break;
                case 'ACCEPTED': status = 'paid'; break;
                case 'REJECTED': status = 'overdue'; break;
                default: status = 'draft';
            }
        } else if (d.docType === 'Invoice') {
            switch (d.status) {
                case 'DRAFT': status = 'draft'; break;
                case 'SENT': status = 'sent'; break;
                case 'PAID': status = 'paid'; break;
                case 'UNPAID': status = 'sent'; break;
                case 'VOID': status = 'overdue'; break;
                default: status = 'draft';
            }
        } else if (d.docType === 'Receipt') {
            status = 'paid'
        }

        return {
            id: d.docNumber,
            type: d.docType,
            customer: d.Customer?.name || 'ลูกค้าทั่วไป',
            date: new Date(d.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }),
            status,
            amount: d.grandTotal || d.totalAmount || 0,
        }
    })
}

'use server'

import { createClient } from '@/lib/supabase-server'
import type { Invoice, Order, Quotation, Receipt } from '@/lib/types'

type CustomerSummary = { name: string | null }
type QuoteDocumentRow = Pick<Quotation, 'createdAt' | 'grandTotal' | 'quotationNumber' | 'status' | 'totalAmount'> & {
    Customer?: CustomerSummary | null
}
type InvoiceDocumentRow = Pick<Invoice, 'createdAt' | 'grandTotal' | 'invoiceNumber' | 'status' | 'totalAmount'> & {
    Customer?: CustomerSummary | null
}
type ReceiptDocumentRow = Pick<Receipt, 'createdAt' | 'receiptNumber' | 'totalAmount'> & {
    Customer?: CustomerSummary | null
}
type RecentDocument = {
    amount: number
    createdAt: string | null
    customerName: string
    docNumber: string
    docType: 'Quote' | 'Invoice' | 'Receipt'
    status: string | null
}

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
        o.deadline && new Date(o.deadline) < new Date() && o.status !== 'done'
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

    const quotationDocs: RecentDocument[] = ((quotations.data ?? []) as QuoteDocumentRow[]).map((quotation) => ({
        amount: quotation.grandTotal || quotation.totalAmount || 0,
        createdAt: quotation.createdAt,
        customerName: quotation.Customer?.name || 'ลูกค้าทั่วไป',
        docNumber: quotation.quotationNumber,
        docType: 'Quote',
        status: quotation.status,
    }))

    const invoiceDocs: RecentDocument[] = ((invoices.data ?? []) as InvoiceDocumentRow[]).map((invoice) => ({
        amount: invoice.grandTotal || invoice.totalAmount || 0,
        createdAt: invoice.createdAt,
        customerName: invoice.Customer?.name || 'ลูกค้าทั่วไป',
        docNumber: invoice.invoiceNumber,
        docType: 'Invoice',
        status: invoice.status,
    }))

    const receiptDocs: RecentDocument[] = ((receipts.data ?? []) as ReceiptDocumentRow[]).map((receipt) => ({
        amount: receipt.totalAmount || 0,
        createdAt: receipt.createdAt,
        customerName: receipt.Customer?.name || 'ลูกค้าทั่วไป',
        docNumber: receipt.receiptNumber,
        docType: 'Receipt',
        status: 'PAID',
    }))

    const allDocs: RecentDocument[] = [...quotationDocs, ...invoiceDocs, ...receiptDocs]

    // Sort by createdAt desc
    allDocs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

    return allDocs.slice(0, 15).map((document) => {
        let status: 'draft' | 'sent' | 'paid' | 'overdue' = 'draft'

        if (document.docType === 'Quote') {
            switch (document.status) {
                case 'DRAFT': status = 'draft'; break;
                case 'SENT': status = 'sent'; break;
                case 'ACCEPTED': status = 'paid'; break;
                case 'REJECTED': status = 'overdue'; break;
                default: status = 'draft';
            }
        } else if (document.docType === 'Invoice') {
            switch (document.status) {
                case 'DRAFT': status = 'draft'; break;
                case 'SENT': status = 'sent'; break;
                case 'PAID': status = 'paid'; break;
                case 'UNPAID': status = 'sent'; break;
                case 'VOID': status = 'overdue'; break;
                default: status = 'draft';
            }
        } else if (document.docType === 'Receipt') {
            status = 'paid'
        }

        return {
            id: document.docNumber,
            type: document.docType,
            customer: document.customerName,
            date: document.createdAt
                ? new Date(document.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
                : '-',
            status,
            amount: document.amount,
        }
    })
}

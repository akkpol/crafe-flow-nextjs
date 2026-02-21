import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { bahttext } from '@/lib/bahttext'
import { cn } from '@/lib/utils'

export type DocumentType = 'QUOTATION' | 'INVOICE' | 'RECEIPT' | 'TAX_INVOICE'

interface DocumentItem {
    index: number;
    name: string;
    description?: string;
    width?: number;
    height?: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface DocumentData {
    docNumber: string;
    date: Date;
    dueDate?: Date;
    reference?: string;
    salesperson?: string;
    items: DocumentItem[];
    subtotal: number;
    discount?: number;
    vat: number;
    grandTotal: number;
    notes?: string;
    paymentInfo?: any;
    status?: string;
}

interface OrganizationData {
    name: string;
    address?: string;
    taxId?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    signatureUrl?: string;
}

interface CustomerData {
    name: string;
    address?: string;
    taxId?: string;
    phone?: string;
    email?: string;
}

interface DocumentLayoutProps {
    type: DocumentType;
    org: OrganizationData;
    customer: CustomerData;
    data: DocumentData;
    className?: string; // For customized styling wrapper
}

export function DocumentLayout({ type, org, customer, data, className }: DocumentLayoutProps) {
    const titleMap: Record<DocumentType, { th: string; en: string }> = {
        'QUOTATION': { th: 'ใบเสนอราคา', en: 'QUOTATION' },
        'INVOICE': { th: 'ใบแจ้งหนี้', en: 'INVOICE' },
        'RECEIPT': { th: 'ใบเสร็จรับเงิน', en: 'RECEIPT' },
        'TAX_INVOICE': { th: 'ใบกำกับภาษี', en: 'TAX INVOICE' },
    }

    const { th: titleTH, en: titleEN } = titleMap[type]

    return (
        <div className={cn("w-[210mm] min-h-[297mm] mx-auto bg-white p-[15mm] text-black relative shadow-2xl print:shadow-none print:w-full print:h-full print:absolute print:top-0 print:left-0", className)}>
            {/* Header */}
            <header className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        {org.logoUrl ? <img src={org.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : 'Logo'}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-primary">{org.name}</h1>
                        <p className="text-xs text-gray-600 max-w-[300px] whitespace-pre-wrap">{org.address}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-600">
                            {org.taxId && <span>เลขผู้เสียภาษี: {org.taxId}</span>}
                            {org.phone && <span>โทร: {org.phone}</span>}
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800">{titleTH}</h2>
                    <p className="text-sm font-semibold text-gray-400 tracking-widest">{titleEN}</p>

                    <div className="mt-4 space-y-1">
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold text-gray-600">เลขที่:</span>
                            <span>{data.docNumber}</span>
                        </div>
                        <div className="flex justify-end gap-2 text-sm">
                            <span className="font-bold text-gray-600">วันที่:</span>
                            <span>{format(data.date, 'd MMMM yyyy', { locale: th })}</span>
                        </div>
                        {data.dueDate && (
                            <div className="flex justify-end gap-2 text-sm">
                                <span className="font-bold text-gray-600">ครบกำหนด:</span>
                                <span>{format(data.dueDate, 'd MMMM yyyy', { locale: th })}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <hr className="border-gray-200 mb-6" />

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">ลูกค้า (Customer)</h3>
                    <p className="font-bold text-lg">{customer.name}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.address || '-'}</p>
                    <div className="mt-2 text-sm text-gray-600">
                        {customer.taxId && <p>เลขผู้เสียภาษี: {customer.taxId}</p>}
                        {customer.phone && <p>โทร: {customer.phone}</p>}
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">อ้างอิง (Reference)</h3>
                    <p className="text-sm"><strong>ชื่องาน:</strong> {data.reference || '-'}</p>
                    {data.salesperson && <p className="text-sm"><strong>พนักงานขาย:</strong> {data.salesperson}</p>}
                </div>
            </div>

            {/* Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-primary/5 text-primary text-xs uppercase tracking-wide border-y border-primary/20">
                        <th className="py-2 px-2 text-center w-12">#</th>
                        <th className="py-2 px-4 text-left">รายการ (Description)</th>
                        <th className="py-2 px-2 text-center w-20">จำนวน</th>
                        <th className="py-2 px-4 text-right w-28">ราคา/หน่วย</th>
                        <th className="py-2 px-4 text-right w-28">รวมเงิน</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {data.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 px-2 text-center text-gray-400">{i + 1}</td>
                            <td className="py-3 px-4">
                                <p className="font-medium text-gray-800">{item.name}</p>
                                {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                                {(item.width || item.height) && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        ขนาด: {item.width ? item.width : '-'} x {item.height ? item.height : '-'} cm
                                    </p>
                                )}
                            </td>
                            <td className="py-3 px-2 text-center font-medium">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">{item.unitPrice.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-medium">{item.totalPrice.toLocaleString()}</td>
                        </tr>
                    ))}
                    {/* Empty Rows Filler if needed (optional for layout consistency) */}
                </tbody>
            </table>

            {/* Totals & Baht Text */}
            <div className="flex gap-8 items-start mb-12 break-inside-avoid">
                <div className="flex-1">
                    <div className="bg-gray-100 py-2 px-4 rounded text-center mb-2">
                        <span className="text-sm font-medium text-gray-600">จำนวนเงินตัวอักษร</span>
                    </div>
                    <p className="text-center font-medium text-primary text-lg">
                        ({bahttext(data.grandTotal)})
                    </p>
                    {data.notes && (
                        <div className="mt-6 border border-dashed border-gray-300 p-4 rounded-lg bg-yellow-50/50">
                            <p className="text-xs font-bold text-gray-500 mb-1">หมายเหตุ:</p>
                            <p className="text-xs text-gray-600 whitespace-pre-wrap">{data.notes}</p>
                        </div>
                    )}
                </div>
                <div className="w-64">
                    <div className="flex justify-between py-1 text-sm">
                        <span className="text-gray-600">รวมราคา</span>
                        <span className="font-medium">{data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {data.discount && data.discount > 0 && (
                        <div className="flex justify-between py-1 text-sm text-red-500">
                            <span>ส่วนลด</span>
                            <span>-{data.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-1 text-sm">
                        <span className="text-gray-600">ภาษีมูลค่าเพิ่ม (7%)</span>
                        <span className="font-medium">{data.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-b border-gray-200 mt-2">
                        <span className="font-bold text-gray-800">ยอดเงินสุทธิ</span>
                        <span className="font-bold text-xl text-primary">{data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-12 mt-auto break-inside-avoid">
                <div className="text-center">
                    <p className="text-sm font-medium mb-16 pb-4 border-b border-dotted border-gray-300 mx-8"></p>
                    <p className="text-sm font-medium text-gray-800">ผู้อนุมัติ (Authorized Signature)</p>
                    <p className="text-xs text-gray-500 mt-1">{format(data.date, 'd MMMM yyyy', { locale: th })}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium mb-16 pb-4 border-b border-dotted border-gray-300 mx-8"></p>
                    <p className="text-sm font-medium text-gray-800">ผู้รับวางบิล / ผู้รับของ</p>
                    <p className="text-xs text-gray-500 mt-1">วันที่ ______/______/______</p>
                </div>
            </div>

            {/* Print Only Footer */}
            <div className="hidden print:block fixed bottom-0 left-0 right-0 text-center text-[10px] text-gray-400 p-4">
                เอกสารนี้สร้างโดยระบบ CraftFlow - https://craftflow.app
            </div>
        </div>
    )
}

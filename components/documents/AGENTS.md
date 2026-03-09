# PDF Agent - Document Templates

This directory is owned by **PDF Agent**.

## Document Types

| Type | Thai | File |
|------|------|------|
| Quotation | ใบเสนอราคา | QuotationTemplate.tsx |
| Invoice | ใบแจ้งหนี้ | InvoiceTemplate.tsx |
| Receipt | ใบเสร็จรับเงิน | ReceiptTemplate.tsx |
| Tax Invoice | ใบกำกับภาษี | TaxInvoiceTemplate.tsx |

## Thai Legal Requirements (Tax Invoice)

Must include:
- คำว่า "ใบกำกับภาษี" ชัดเจน
- ชื่อ ที่อยู่ เลขผู้เสียภาษี ของผู้ขาย
- ชื่อ ที่อยู่ เลขผู้เสียภาษี ของผู้ซื้อ
- หมายเลขลำดับ
- วัน เดือน ปี
- รายการ จำนวน ราคา
- ภาษี 7% แยกออกจากราคา

## Baht Text
```typescript
import { bahttext } from '@/lib/bahttext'
bahttext(15750.50)
// → "หนึ่งหมื่นห้าพันเจ็ดร้อยห้าสิบบาทห้าสิบสตางค์"
```

## Rules

- A4 layout (210mm x 297mm)
- Thai fonts (Sarabun)
- Numbers with commas
- Currency format: ฿X,XXX.XX

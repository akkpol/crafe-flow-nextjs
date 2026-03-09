---
name: pdf-agent
description: Specialized agent for PDF document generation with Thai language support. Use when building quotations, invoices, receipts, or tax invoices.
---

# PDF Agent

## Role
Build and maintain PDF document generation for CraftFlow ERP.

## Specialization
- React-PDF / Browser print CSS
- Thai font embedding
- A4 document layout
- Baht text conversion

## File Ownership

### Can Edit
- `components/documents/*.tsx`
- `lib/pdf/*.ts`
- `public/fonts/*`

### Read-Only
- `lib/types.ts` - Integration Agent
- `actions/*.ts` - Backend Agent

## Document Types
| Type | Thai | File |
|------|------|------|
| Quotation | ใบเสนอราคา | QuotationTemplate.tsx |
| Invoice | ใบแจ้งหนี้ | InvoiceTemplate.tsx |
| Receipt | ใบเสร็จรับเงิน | ReceiptTemplate.tsx |
| Tax Invoice | ใบกำกับภาษี | TaxInvoiceTemplate.tsx |

## Thai Legal Requirements (Tax Invoice)
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

## Quality Gates
- [ ] PDF generates without errors
- [ ] Layout matches spec
- [ ] Thai text displays correctly
- [ ] Numbers formatted with commas
- [ ] Baht text shows correctly

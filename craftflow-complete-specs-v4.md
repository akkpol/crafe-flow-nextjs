# CraftFlow ERP - Complete Feature Specification v4

> **Purpose:** Technical implementation companion to `craftflow-master-checklist-v4.md`.
> **Source Priority:** Checklist v4 is authoritative for scope, validation, role access, blocker status, and acceptance coverage.
> **Merge Basis:** Consolidated from `craftflow-complete-specs.md`, `craftflow-complete-specs-v3.md`, and the findings captured in `spec-comparison-analysis.md`.
> **Design Goal:** Keep the UI precision and operational coverage of the master checklist while preserving the schema, workflow, and platform depth from the complete specs.

---

## 1. Spec Governance

### 1.1 Precedence Rules

1. `craftflow-master-checklist-v4.md` wins for scope, priority, validation, and role access.
2. This document fills in technical design, workflow definitions, interfaces, non-functional rules, and implementation notes.
3. Where `craftflow-complete-specs.md` and `craftflow-complete-specs-v3.md` disagree, the safer and more complete ERP interpretation wins.
4. New technical ideas not already grounded in checklist scope must be labeled as `proposed extension`.

### 1.2 ERP Safety Constraints

- Financial documents must be append-only in effect even when the UI supports correction, cancellation, or reissue.
- Historical invoice, receipt, and stock movement data must remain reconstructable.
- Authentication migration cannot break user attribution on historical records.
- Attachment and location features must inherit access control from their parent business entities.
- Reporting must derive from persisted business state, not temporary UI calculations.

### 1.3 Traceability

- **Checklist-derived strengths carried forward:** role-based feature coverage, validation details, micro-interactions, blocker prioritization, i18n/l10n coverage
- **Spec-derived strengths carried forward:** technical architecture, data models, interfaces, storage strategy, implementation sequencing, security rules
- **v3-derived differentiators carried forward:** universal file system, location model with Google Maps URLs, custom auth and session lifecycle

---

## 2. System Overview

### 2.1 Core Workflow

```text
Customer Contact
  -> Lead Capture and Qualification
  -> Quotation and Negotiation
  -> Order Confirmation
  -> Production Planning and Execution
  -> Quality Control and Installation
  -> Invoicing and Payment
  -> Receipt and After-sales
```

### 2.2 Role Model

| Role | Typical Access |
|---|---|
| Owner/Admin | Full settings, oversight, approvals |
| Sales Manager | Sales operations plus financial visibility |
| Sales Staff | Customer intake, quotations, follow-up |
| Production Manager | Jobs, assignments, quality, materials |
| Production Staff | Assigned job execution and proof uploads |
| Accountant | Invoice, receipt, finance reporting |
| Warehouse Manager | Materials, stock, stock adjustments |
| Viewer | Read-only views as configured |

### 2.3 Competitive Direction

- Universal attachments across documents and operational entities
- Operational location handling without high recurring maps API cost
- Portable authentication and session control rather than vendor lock-in
- Localization support for Thai-first operations and multilingual teams

---

## 3. Module Map

This document follows the same module order as checklist v4:

1. Multi-Channel Customer Intake & Customer Profile
2. Quotation & Pricing
3. Production Management
4. Financial Management
5. Inventory & Materials
6. Backend Administration
7. Competitive and Platform Features
8. Integrations, Localization, and Cross-Module Governance

---

## 4. Module 1: Multi-Channel Customer Intake & Customer Profile

### 4.1 Technical Objectives

- Consolidate customer intake across walk-in, phone, LINE, Facebook, email, and website
- Minimize duplicate customer creation
- Surface credit and outstanding status early in the sales flow
- Keep communication history queryable across channels

### 4.2 Key Workflows

- **Walk-in / phone intake**
  - Search first, create second
  - Show existing customer financial risk signals before starting a new quotation
- **Message channel intake**
  - Capture channel identity
  - Attempt match to existing customer
  - Queue uncertain matches for staff confirmation
- **Customer profile review**
  - Aggregate documents, interactions, payments, and operational history

### 4.3 Interface Surfaces

```ts
// Existing baseline behavior
interface QuickCustomerForm {
  name: string
  phone: string
  lineId?: string
  email?: string
  source: 'walk-in' | 'phone' | 'line' | 'facebook' | 'email' | 'website'
  referralSource?: string
}

// Carried-forward proposed design
interface CustomerProfileSummary {
  customerId: string
  outstandingBalance: number
  creditLimit?: number
  availableCredit?: number
  lastOrderDate?: string
  recentInteractionCount: number
  preferredLocale?: 'th' | 'en' | 'zh' | 'my'
}
```

### 4.4 Data and Integrity Notes

- Customer uniqueness should prioritize phone and verified channel identifiers
- Outstanding balance must be derived from invoice and receipt state, not manual profile fields
- Merging customers must preserve historical references and not orphan quotations or invoices

### 4.5 Acceptance Notes

- Customer history and outstanding balance are Phase 1 deployment gates
- Anti-spam and rate-limiting are required on public forms

---

## 5. Module 2: Quotation & Pricing

### 5.1 Technical Objectives

- Support configurable pricing models for signage and custom production work
- Make pricing reviewable and repeatable
- Preserve auditability across quote revisions and approvals

### 5.2 Key Workflows

- Customer selection or creation inline
- Product and material-driven quote calculation
- Optional approval path when thresholds are exceeded
- Export to customer-facing PDF without changing document state
- Convert accepted quotation to operational work order

### 5.3 Interface Surfaces

```ts
// Existing baseline behavior
interface QuotationPricingInput {
  productId: string
  quantity: number
  width?: number
  height?: number
  addons?: string[]
  manualDiscountType?: 'percent' | 'amount'
  manualDiscountValue?: number
}

// Carried-forward proposed design
interface QuotationDocumentSnapshot {
  quotationId: string
  issueDate: string
  validUntil: string
  subtotal: number
  vatAmount: number
  grandTotal: number
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
}
```

### 5.4 PDF Strategy

- Generate PDFs from persisted quotation data only
- Support Thai legal/business formatting and localized fonts
- Allow attachment references or QR links when the business enables customer sharing
- Preserve snapshot consistency between on-screen totals and exported totals

### 5.5 Integrity Notes

- Quotation edits after approval must follow revision rules, not silent overwrite
- If a quotation is already linked to downstream order or invoice state, the system must preserve prior revision context

---

## 6. Module 3: Production Management

### 6.1 Technical Objectives

- Translate approved commercial documents into actionable jobs
- Keep production visibility high on both desktop and mobile
- Store proof and design context close to the job

### 6.2 Key Workflows

- Create job from quotation
- Assign owner, due date, and priority
- Attach design assets and notes
- Update progress and proof
- Review completion before financial closure or customer delivery

### 6.3 Interface Surfaces

```ts
// Existing baseline behavior
interface ProductionJobSummary {
  jobId: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assigneeId?: string
  attachmentCount: number
  commentCount: number
}

// Carried-forward proposed design
interface JobReviewPayload {
  jobId: string
  completionPercent: number
  completionNotes: string
  proofAttachmentIds: string[]
  reviewAction: 'submit' | 'approve' | 'reject'
}
```

### 6.4 Integrity Notes

- File uploads must preserve version history and authorship
- Final completion should require explicit review state, not just a status drag
- Design file visibility must distinguish customer-shareable material from internal production-only files

---

## 7. Module 4: Financial Management

### 7.1 Technical Objectives

- Maintain clear document lineage from quotation to invoice to receipt
- Allow payment handling without weakening auditability
- Support Thai business documentation and reporting expectations

### 7.2 Key Workflows

- Create invoice from approved commercial state
- Issue tax invoice where required
- Apply full or partial payments
- Create receipt from applied payment
- Reflect payment status back into customer outstanding balance and reporting

### 7.3 Interface Surfaces

```ts
// Existing baseline behavior
interface InvoiceRecordSummary {
  invoiceId: string
  customerId: string
  issueDate: string
  dueDate?: string
  totalAmount: number
  paidAmount: number
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'cancelled'
}

// Carried-forward proposed design
interface ReceiptApplication {
  receiptId: string
  invoiceId: string
  appliedAmount: number
  paymentDate: string
  paymentMethod: 'cash' | 'transfer' | 'card' | 'other'
}
```

### 7.4 ERP Integrity Rules

- A receipt must reconcile to persisted payment application, not a UI-only running total
- Invoice cancellation must preserve history and reporting traceability
- Customer outstanding balance must use invoice and receipt state after all adjustments
- Financial reports must never depend on mutable presentation-only fields

### 7.5 PDF Strategy

- Quotation, invoice, tax invoice, and receipt PDF engines should share reusable rendering primitives
- Font embedding and locale-aware formatting are required
- Organization profile, signature, and bank account configuration are required dependencies

---

## 8. Module 5: Inventory & Materials

### 8.1 Technical Objectives

- Track material master data cleanly
- Support current stock visibility, historical movement review, and controlled automatic deduction

### 8.2 Interface Surfaces

```ts
// Existing baseline behavior
interface MaterialDefinition {
  materialId: string
  name: string
  unit: string
  unitCost?: number
  minimumStock?: number
  wasteFactor?: number
}

// Carried-forward proposed design
interface StockMovementRecord {
  movementId: string
  materialId: string
  movementType: 'in' | 'out' | 'adjustment'
  quantity: number
  reasonCode: string
  referenceType?: 'invoice' | 'job' | 'manual'
  referenceId?: string
  createdAt: string
}
```

### 8.3 Integrity Rules

- Editing a material definition must not rewrite old movement records
- Auto-deduct policy must be explicit: invoice-driven, production-consumption-driven, or staged
- Waste factor application must be consistent and reviewable
- Low stock alerts must be derived from current stock and configured thresholds

### 8.4 Implementation Note

- Treat stock movement history as a first-class audit artifact
- Do not store only current stock without preserving movement lineage

---

## 9. Module 6: Backend Administration

### 9.1 Organization Settings

- Store legal company details, tax fields, bank accounts, logo, signature, contact channels, and business hours
- These settings are dependencies for financial documents, contact templates, and branding

### 9.2 User Management and RBAC

- Manage invite, activation, blocking, and role assignment
- Show effective permissions before applying user changes
- Preserve authorship on historical records even if a user is deactivated

### 9.3 Approval Workflows

- Define thresholds, approver sequences, escalation, and audit trail
- Approval design must be modular enough to cover quotation, financial, or administrative approval use cases

### 9.4 Custom Authentication and Session Lifecycle

**Classification:** carried-forward proposed design from prior complete specs and v3.

```ts
interface AuthUser {
  id: string
  organizationId: string
  email: string
  fullName: string
  role: string
  passwordHash: string
  isActive: boolean
}

interface SessionRecord {
  id: string
  userId: string
  tokenHash: string
  userAgent?: string
  ipAddress?: string
  expiresAt: string
  isRevoked: boolean
  lastUsedAt?: string
}
```

**Impact statement**
- Replaces dependency on vendor-managed auth as the primary identity store.

**Compatibility expectation**
- Existing business records must continue to resolve the same user identity after migration.

**Rollback or fallback note**
- Until migration is proven safe, keep a reversible mapping path from legacy auth identities to custom user records.

**Security requirements**
- Passwords hashed with bcrypt or equivalent strong password hashing
- JWT or session token verification with revocation support
- Ability to revoke one session or all active sessions
- Password reset and forced logout flows

---

## 10. Module 7: Competitive and Platform Features

### 10.1 Universal File Attachment System

**Classification:** carried-forward proposed design strengthened by v3.

```ts
interface AttachmentRecord {
  id: string
  organizationId: string
  attachableType: 'quotation' | 'order' | 'invoice' | 'receipt' | 'customer' | 'product' | 'location'
  attachableId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  thumbnailUrl?: string
  category: 'design' | 'portfolio' | 'sample' | 'reference' | 'proof' | 'other'
  tags?: string[]
  title?: string
  description?: string
  displayOrder?: number
  version?: number
  replacesFileId?: string
  isPublic?: boolean
  uploadedBy?: string
}
```

**Impact statement**
- Introduces cross-entity file handling with stronger customer-facing and production-facing flows.

**Compatibility expectation**
- Existing document records should not require destructive schema changes if attachments are added later.

**Rollback or fallback note**
- Attachments can be disabled per module without invalidating source business records if the parent entities remain intact.

**Storage guidance**
- Bucket and visibility strategy should separate public-shareable files from internal-only files
- Preserve uploader attribution and replacement chain

### 10.2 Location Management and Google Maps

**Classification:** carried-forward proposed design strengthened by v3.

```ts
interface CustomerLocationRecord {
  id: string
  customerId: string
  label: string
  type: 'billing' | 'installation' | 'warehouse' | 'other'
  addressLine: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
  notes?: string
}
```

**Impact statement**
- Extends customer and order planning with service location context.

**Compatibility expectation**
- Orders may adopt location links incrementally; existing orders must remain valid without a linked location.

**Rollback or fallback note**
- Location support can fall back to plain address strings if structured location records are not yet implemented.

### 10.3 Collaboration, Portal, Analytics, and APIs

- Real-time collaboration remains within authenticated entity access boundaries
- Customer portal is a proposed extension for later phases
- Analytics dashboard is a proposed extension for later phases
- APIs and external integrations must be versioned and permission-gated

---

## 11. Module 8: Integrations, Localization, and Cross-Module Governance

### 11.1 Integration Coverage

- LINE OA
- Facebook Messenger
- Email delivery and parsing
- Optional SMS notifications
- Payment gateway integration

### 11.2 Internationalization and Localization

**Classification:** existing baseline behavior promoted to required v4 coverage.

Requirements:
- Thai as default locale
- English, Chinese, and Burmese support
- Locale-aware currency, number, and date formatting
- Buddhist Era display support where required
- Localized notifications and document labels
- PDF font embedding strategy for multilingual output
- Customer and user locale preferences

### 11.3 Cross-Module Governance Rules

- Customer credit state must be referenced consistently across sales and finance modules
- Production completion and financial completion are related but not identical states
- Stock deduction rules must declare the triggering business event
- Attachment and location access control must inherit from parent entity permissions
- Deactivated users remain attributable authors on prior records

---

## 12. Public Technical Surfaces

The following surfaces must be explicitly preserved or reviewed before implementation:

- Auth and session model
- Attachment model
- Customer location model
- Quotation, invoice, and receipt workflow interfaces
- Material and stock movement interfaces

Each surface in this v4 document is labeled as one of:
- `existing baseline behavior`
- `carried-forward proposed design`
- `proposed extension`

---

## 13. Implementation Priorities

### Phase 1: Deployment Baseline

- Customer history and outstanding balance
- Quotation editing and quotation PDF
- Design file upload, preview, and retrieval
- Job notes and proof uploads
- Invoice and receipt PDF
- Material edit and stock visibility
- Company logo, signature, and bank settings

### Phase 2: Team Efficiency and Competitive Advantage

- Unified inbox
- Approval workflows
- Low stock alerts and stock history polish
- Universal attachments
- Location management
- Custom auth and session lifecycle
- i18n/l10n rollout beyond Thai default

### Phase 3: Expansion

- Customer portal
- Analytics dashboard
- Public APIs and broader integrations

---

## 14. Verification Checklist For Future Implementation

- Every Phase 1 blocker in checklist v4 has a matching technical section here
- No financial or stock behavior is defined only in UI terms
- i18n/l10n coverage is preserved and not dropped by v3-centric changes
- Attachment, location, and auth designs include impact, compatibility, and fallback notes
- Any later schema change proposal must include migration and rollback planning

*End of Complete Feature Specification v4.*

# CraftFlow ERP - Master Feature Checklist v4

> **Purpose:** Primary source of truth for product scope, role access, UI behavior, validation, blocker status, and audit coverage.
> **Merge Basis:** Consolidated from `craftflow-master-checklist.md`, `craftflow-complete-specs.md`, and `craftflow-complete-specs-v3.md`.
> **Rule of Use:** If checklist v4 conflicts with any companion spec, checklist v4 wins for scope, validation, priority, and role access.
> **Do Not Modify Casually:** This document is intended to be stable and reviewable before any implementation or schema change.

---

## Document Rules

- **Phase Tags**
  - `P0 / Phase 1` = legacy parity or deployment blocker
  - `P1 / Phase 2` = competitive advantage that should follow baseline parity
  - `P2 / Phase 3` = optional enhancement
- **Blocker Tags**
  - `BLOCKER` means the old workflow cannot be fully replaced without this feature
- **ERP Safety Rules**
  - Any change affecting quotation, invoice, receipt, payment, stock, or customer credit must trace upstream and downstream effects first
  - Historical financial and inventory records must remain reviewable and must not be silently rewritten
  - Authentication, attachment, and location changes must not weaken accounting, order, or stock integrity

## Traceability Snapshot

- **Baseline parity drivers:** PDF exports, customer history and outstanding balance, design file handling, production proof flow, material and stock controls
- **Checklist strengths preserved:** role access per feature, micro-UX behavior, explicit validations, anti-spam controls, i18n/l10n coverage
- **Technical strengths carried from full specs:** auth/session model, attachment model, customer location model, implementation sequencing, security constraints
- **v3 differentiators preserved:** universal file attachments, location management and Google Maps URLs, custom authentication and session lifecycle

## Table of Contents

1. Module 1: Multi-Channel Customer Intake & Customer Profile
2. Module 2: Quotation & Pricing
3. Module 3: Production Management
4. Module 4: Financial Management
5. Module 5: Inventory & Materials
6. Module 6: Backend Administration
7. Module 7: Competitive and Platform Features
8. Module 8: Integrations, Localization, and Cross-Module Governance

---

## 1. Module 1: Multi-Channel Customer Intake & Customer Profile

### 1.1 Walk-in Customer Registration
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Search existing customer by name, phone, last 4 digits, and LINE ID
  - Auto-focus search on page load
  - Debounced real-time search at 300ms
  - Keyboard shortcuts: `Ctrl+N`, `Enter`, `Esc`
  - Quick create form with name, phone, LINE ID, email, source, referral source
  - Duplicate phone detection with merge or attach-to-existing decision
- **Validation:**
  - Name min 2 chars
  - Thai phone format required
  - Prevent duplicate silent creation
- **Must Show if Existing Customer Found:**
  - Outstanding balance
  - Last order date
  - Recent interactions

### 1.2 Phone Call Registration
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Auto-stamp call datetime and receiving staff
  - Capture inquiry type, urgency, notes, follow-up flag, follow-up date, assignee
  - Reuse quick customer registration flow
  - Optional call script templates by inquiry type

### 1.3 LINE OA Integration
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Webhook handler for message lifecycle events
  - Auto-capture LINE profile and attempt customer match
  - Inbox with unread state, templates, assignment, internal notes, rich messages
  - Business hours auto-reply and keyword auto-reply
  - Browser and sound notifications
- **Dependency Notes:**
  - Must link safely to customer records without duplicating customer identity

### 1.4 Facebook Integration
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Messenger webhook support
  - Customer auto-link by public profile
  - Comment monitoring and lead conversion queue

### 1.5 Email and Web Form Intake
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Public for submission; Owner and Sales for management
- **Micro-functions:**
  - Public contact form with name, phone, email, company, inquiry type, message
  - File uploads up to 5 files and 10MB each
  - Capture hidden fields: source, referrer, UTM
  - Auto-confirmation to customer and notification to staff
  - Optional email parser for intent extraction
- **Validation and Security:**
  - Real-time inline validation
  - Honeypot and reCAPTCHA v3
  - Rate limiting on public endpoints

### 1.6 Unified Inbox
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Consolidated queue across walk-in, phone, LINE, Facebook, email
  - Filters by channel, status, assignee, urgency, date
  - Bulk assign, resolve, archive, export

### 1.7 Customer Profile Management
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff, Accountant view, Production limited view
- **BLOCKER**
- **Must-have Sections:**
  - Contact info, business info, tax ID, address
  - Financial info including payment terms, credit limit, outstanding balance
  - Statistics and tags
  - Order history tab
  - Communication history tab
  - Credit history and available credit
- **Validation:**
  - Tax ID 13 digits when provided
  - Outstanding warning UI if overdue or over limit
- **Cross-module dependency notes:**
  - Customer outstanding balance must align with invoice and receipt state
  - Credit warnings must be visible at quotation and order creation time

---

## 2. Module 2: Quotation & Pricing

### 2.1 Smart Quotation Builder
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Pre-configured products, pricing models, size formulas, optional add-ons
  - Customer selection or creation inline
  - Item builder with quantity, dimensions, material relations, labor estimation
  - Pricing summary with subtotal, discounts, VAT, profit margin
  - Terms, validity, notes, delivery timeline, quotation number generation
  - Save as template and load template
- **Validation:**
  - Manual discount can be percent or fixed amount
  - Profit margin shown internally only
  - VAT must be explicit and reviewable

### 2.2 Quotation Approval Workflow
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Sales Manager
- **Micro-functions:**
  - Approval thresholds by amount or discount
  - Required approvers by role or user
  - Approval status tracking and audit trail

### 2.3 Quotation Comparison
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Compare versions or options side by side
  - Export comparison as PDF or image

### 2.4 Quotation PDF Export
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **BLOCKER**
- **Micro-functions:**
  - Generate Thai-ready quotation PDF
  - Include company profile, logo, contact channels, tax fields, terms, notes
  - Optional QR or short-link to shared attachments
  - Localized formatting for dates, currency, and multilingual font fallback
- **Validation:**
  - Output must match saved quotation state
  - Re-generated PDF must not alter source data

### 2.5 Quotation Editing and Lifecycle
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - Edit saved draft or sent quotation
  - Preserve revision history and status changes
  - Convert approved quotation to production order without re-entry
- **Cross-module dependency notes:**
  - Editing rules must not invalidate issued invoice or accepted order history

---

## 3. Module 3: Production Management

### 3.1 Advanced Kanban Board
- **Phase / Priority:** `P0 / Phase 1` for core board, `P1 / Phase 2` for advanced controls
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager view
- **Micro-functions:**
  - Display all jobs with priority, due date, assignee, attachment count, comment count
  - Mobile-safe button-based status actions
  - Desktop drag and drop
  - Timeline or history view

### 3.2 Design File Management
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager, Sales Staff
- **BLOCKER**
- **Micro-functions:**
  - Upload, preview, categorize, download, and version design files
  - Support images, PDF, AI, PSD, DWG, DXF and other approved types
  - Embedded PDF viewer
  - Public vs internal visibility flags
- **Validation:**
  - File size and MIME controls
  - Replace flow must keep previous version audit trail

### 3.3 Production Progress Tracking
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - Progress updates, job notes, blockers, due date awareness
  - Submit for review action
  - Proof image upload during work stages

### 3.4 Quality Control and Approval
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - Quality checklist by job type
  - Completion notes and final photos
  - Approve, reject, rework actions
- **Validation:**
  - Must be 100 percent progress before complete
  - Minimum proof set before final approval

---

## 4. Module 4: Financial Management

### 4.1 Invoice Generation
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Accountant
- **Micro-functions:**
  - Create invoice from order or quotation
  - Tax invoice support
  - Invoice numbering, issue date, due date, terms, notes
  - List and filter invoices by status
  - Edit and cancel flow with audit trail
- **ERP Safety Notes:**
  - Cancellation or correction must preserve historical traceability

### 4.2 Receipt and Payment Handling
- **Phase / Priority:** `P0 / Phase 1` for receipt issue, `P1 / Phase 2` for partial payment sophistication
- **Role Access:** Owner, Accountant
- **Micro-functions:**
  - Create receipt against invoice
  - Support bank account details and proof references
  - Update invoice payment status
  - Auto-complete order only when payment and fulfillment rules are satisfied
  - Partial payment support
- **Validation:**
  - No over-application of payment
  - Receipt total must reconcile with applied invoice amount

### 4.3 Financial Reports
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Accountant view
- **Micro-functions:**
  - Revenue, overdue, payment status, sales by channel, aging views
  - Filters by date, customer, staff, status
- **Cross-module dependency notes:**
  - Reports must derive from persisted invoice and receipt state, not temporary UI calculations

### 4.4 Invoice and Receipt PDF Export
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Sales Manager, Accountant
- **BLOCKER**
- **Micro-functions:**
  - Thai-compliant invoice, tax invoice, and receipt PDFs
  - Support logo, signature, tax data, bank data, multilingual fonts
  - Match stored financial state exactly

---

## 5. Module 5: Inventory & Materials

### 5.1 Material Management
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - Create, edit, archive, and view materials
  - Store price, units, minimum stock, waste factor, image, barcode, warehouse location
- **Validation:**
  - Editing material defaults must not rewrite historical issue or invoice records

### 5.2 Stock Tracking and Movement History
- **Phase / Priority:** `P0 / Phase 1` for core stock, `P1 / Phase 2` for history and alerts
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - Current stock view, inbound and outbound adjustments, movement history
  - Reason codes and notes for manual adjustments
  - Low stock alerts and recipients

### 5.3 Auto Stock Deduction
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** System automation, Warehouse Manager config
- **Micro-functions:**
  - Deduct stock from invoice or confirmed production consumption according to chosen policy
  - Apply waste factor where configured
- **ERP Safety Notes:**
  - Deduction policy must be explicit and auditable
  - Historical stock movement must remain reconstructable

---

## 6. Module 6: Backend Administration

### 6.1 Organization Settings
- **Phase / Priority:** `P0 / Phase 1`
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - Company profile, logo, signature, address, tax info
  - Bank account settings for receipts and invoices
  - Business hours and notification settings

### 6.2 User Management and RBAC
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - Invite, activate, block, assign role, review last active
  - Predefined roles plus configurable permissions matrix
  - Show effective permissions before save

### 6.3 Approval Workflows
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - Configure approvers by amount, module, role, and sequence
  - Audit trail of decisions

### 6.4 Custom Authentication and Session Management
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Admin for management; all staff for auth flows
- **Micro-functions:**
  - Password-based login, password reset, session tracking, revoke session, remember me
  - Device/session visibility and forced logout support
- **ERP Safety Notes:**
  - Auth migration must not alter accounting, customer, order, or inventory records
  - User identity continuity must be preserved for audit trails

---

## 7. Module 7: Competitive and Platform Features

### 7.1 Real-time Collaboration
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** All authenticated users with entity access
- **Micro-functions:**
  - Presence, comments, mentions, change awareness, basic conflict prevention

### 7.2 Universal File Attachment System
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** All authenticated users with entity-level access
- **Micro-functions:**
  - Attach files to quotation, order, invoice, receipt, customer, product, and location contexts
  - Categories: design, portfolio, sample, reference, proof, other
  - Tags, descriptions, display order, public visibility, version replacement chain
  - Shared customer-friendly view where allowed
- **Dependency Notes:**
  - Attachment visibility must respect business document access
  - Attachment lifecycle must not break historical document snapshots

### 7.3 Location Management and Google Maps
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Sales Manager, Sales Staff, Production Manager
- **Micro-functions:**
  - Customer locations with type, address, coordinates, notes, photos
  - Link service or installation location to order
  - Generate shareable Google Maps URLs without hard dependency on paid APIs
  - Multi-stop route support for operational planning

### 7.4 Customer Portal
- **Phase / Priority:** `P2 / Phase 3`
- **Role Access:** Customer users
- **Micro-functions:**
  - Track quotation, order, invoice, shared files, and status

### 7.5 Analytics Dashboard
- **Phase / Priority:** `P2 / Phase 3`
- **Role Access:** Owner, Admin, Managers as configured
- **Micro-functions:**
  - Executive dashboard, productivity, sales conversion, operational health

### 7.6 API and External Integrations
- **Phase / Priority:** `P2 / Phase 3`
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - Controlled APIs, webhooks, export feeds, and downstream integration support

---

## 8. Module 8: Integrations, Localization, and Cross-Module Governance

### 8.1 System Integrations
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** Owner, Admin
- **Coverage:**
  - LINE OA
  - Facebook Messenger
  - Email service
  - Optional SMS
  - Payment gateway integration

### 8.2 Internationalization and Localization
- **Phase / Priority:** `P1 / Phase 2`
- **Role Access:** All users
- **Coverage:**
  - Thai default, English, Chinese, Burmese
  - Locale-aware number, currency, tax text, and date formatting
  - Buddhist Era option
  - PDF font embedding and fallback strategy
  - Notification and message localization
  - Customer preferred locale
  - User preferred locale

### 8.3 Cross-Module Dependency Controls
- **Mandatory Review Areas Before Implementation Changes:**
  - Customer outstanding balance must match invoice and receipt state
  - Order completion must consider production completion and payment rules
  - Stock deduction policy must be explicit and consistent with invoice or production event rules
  - File and location associations must not bypass access control
  - User deactivation must preserve authorship and audit history

### 8.4 Phase 1 Deployment Gate
- **A deployment-ready baseline requires all items below:**
  - Customer history and outstanding balance
  - Quotation editing and quotation PDF
  - Design file upload and retrieval
  - Job notes and proof uploads
  - Invoice and receipt PDF
  - Material edit and stock visibility
  - Organization logo, signature, and bank settings

*End of Master Checklist v4.*

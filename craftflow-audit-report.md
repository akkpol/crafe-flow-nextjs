# CraftFlow ERP - Feature Audit Report

> **Purpose:** This document tracks the implementation status of features defined in the `craftflow-master-checklist.md`.
> **Status Indicators:**
> - ✅ Implemented and functional
> - ❌ Missing or incomplete
> - ⚠️ Partially implemented or needs review

---

## 📋 Audit Summary

- [ ] Module 1: Multi-Channel Customer Intake & Customer Profile
- [ ] Module 2: Quotation & Pricing
- [ ] Module 3: Production Management
- [ ] Module 4: Financial Management
- [ ] Module 5: Inventory & Materials
- [ ] Module 6: Backend Administration
- [ ] Module 7: Modern Competitive Features
- [ ] Module 8: System Integrations & i18n/l10n

---
## 1. Module 1: Multi-Channel Customer Intake & Customer Profile

### 1.1 Walk-in Customer Registration (Quick Registration)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ❌ Auto-focus search field on page load (Not observed in code)
  - ⚠️ Real-time search (debounced 300ms) by name, phone, LINE ID (Partial - exists in jobs/invoices pages via `searchCustomers` but not full global search as spec)
  - ✅ Display "Create New" button if no match found (Present in flows like `jobs/new/page.tsx`)
  - ❌ Keyboard Shortcuts: `Ctrl+N`, `Enter`, `Esc` (Not implemented)
  - ⚠️ Form Fields:
    - ✅ Name (Required, min 1 char implemented vs min 2 chars in spec)
    - ⚠️ Phone (Optional in `CustomerSchema` but spec says Required, 10 digits Thai format)
    - ✅ LINE ID (Optional)
    - ✅ Email (Optional, valid format implemented in `CustomerSchema`)
    - ❌ Source dropdown (walk-in, phone, line, facebook, email, website)
    - ❌ Referral Source (Optional text)
  - ❌ Validation:
    - ❌ Duplicate phone detection with merge option (Not implemented in `actions/customers.ts`)
  - ❌ Existing Customer Quick Lookup Display:
    - ❌ Show recent interactions (last 3)
    - ❌ Show outstanding balance prominently
    - ❌ Show last order date

### 1.2 Phone Call Registration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ❌ Call Intake Form (Not implemented)
  - ❌ Call Script Template (Not implemented)

### 1.3 LINE OA Integration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ⚠️ LINE Webhook Handler (Has `api/line/webhook` but full features pending)
  - ❌ Auto-Response Features (Keyword auto-reply, business hours)
  - ⚠️ LINE User Auto-Capture (Can fetch LINE user in `LineUserSearch` component, but auto-match/pending match UI is missing)
  - ❌ LINE Message Dashboard (Staff UI) (Not implemented)
  - ❌ Notifications (Not implemented)

### 1.4 Facebook Integration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ❌ FB Messenger Webhook integration
  - ❌ Auto-link with customer profile
  - ❌ Facebook Comments Monitoring

### 1.5 Email & Web Form Intake
- **Role Access:** Public (Form), Owner/Sales (Dashboard)
- **Micro-functions:**
  - ❌ Web Contact Form (Public)
  - ❌ Submission Flow
  - ❌ Email Parser (LLM based)

### 1.6 Unified Inbox (Omnichannel Dashboard)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ❌ Consolidated View of all channels
  - ❌ Status Groups
  - ❌ Filters
  - ❌ Bulk Actions

### 1.7 Customer Profile Management
- **Role Access:** Owner, Sales Manager, Sales Staff, Accountant, Production
- **Micro-functions:**
  - ⚠️ Detail Page Layout (Has dedicated detail page in `app/customers/[id]/page.tsx`, but still missing full financial summary/tags)
    - ✅ Contact Info (Basic fields exist)
    - ⚠️ Business Info (Missing Company, Branch, Industry fields in schema)
    - ❌ Financial Info (Credit Limit, Outstanding, Payment Terms missing)
    - ❌ Outstanding warning UI
    - ⚠️ Statistics (Basic document counts and totals shown, but not full customer KPIs)
    - ❌ Tags & Notes
  - ⚠️ Order History View (Customer detail page shows quotation/order/invoice/receipt history, but no dedicated tabbed CRM layout yet)
  - ❌ Communication History Tab
  - ❌ Customer Segmentation (Auto-Tagging)
  - ❌ Credit Management (Limits, Warnings)

## 2. Module 2: Quotation & Pricing

### 2.1 Smart Quotation Builder
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ⚠️ Pre-configured Products Catalog: (Partial: Has Materials and Pricing Engine `lib/pricing-engine.ts`, but full "Product Catalog" with fixed formulas is limited compared to spec)
    - ✅ Categories
    - ✅ Pricing Models
    - ✅ Base price input
    - ✅ Materials relation
    - ❌ Optional addons per product (Missing robust Addon management)
    - ✅ Minimum order quantity/size settings (Implemented via `minimumChargePerItem` config)
  - ✅ Dynamic Pricing Engine (Implemented via `lib/pricing-engine.ts`):
    - ✅ Calculate Base Price
    - ✅ Apply Volume Discount (PricingTier logic exists)
    - ✅ Apply Customer Discount
    - ❌ Apply Complexity Multiplier
    - ✅ Calculate Material Cost & Labor Estimation
    - ✅ Calculate Final Price (Subtotal, Discount, Profit, Profit Margin)
  - ⚠️ Quotation Form UI (Step-by-Step) (`app/billing/new/page.tsx`):
    - ✅ Step 1: Customer Selection
    - ✅ Step 2: Add Items
    - ✅ Step 3: Pricing Summary (Includes auto VAT calculation)
    - ⚠️ Step 4: Terms & Validity (Has basics, but lacks granular checkboxes for Payment Terms and explicit validity configs as spec'd)
  - ❌ Quotation Templates (Save/Load templates not implemented)

### 2.2 Quotation Approval Workflow
- **Role Access:** Owner, Sales Manager
- **Micro-functions:**
  - ❌ Approval Rules Setup (Not found)
  - ❌ Pending Approvals Dashboard (Not found)
  - ❌ Approval Actions (Approve/Reject/Request Changes)
  - ❌ Notification Flow

### 2.3 Quotation Comparison
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ❌ Select 2-4 quotations for comparison
  - ❌ Side-by-side View
  - ❌ Highlight differences
  - ❌ Export comparison

### 2.4 PDF Export - Quotation (BLOCKER FEATURE)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - ⚠️ PDF Generation System (Has `components/documents/DocumentLayout.tsx` for HTML preview, but no server-side Puppeteer or React-PDF actual exporter found to generate true `.pdf` files)
  - ✅ Thai Business Standard Format (Handled in HTML layout)
  - ⚠️ Watermark (Not explicitly found)
  - ⚠️ Bilingual support (Layout handles mapping but full switch not wired up for export)
  - ❌ Share via public link

## 3. Module 3: Production Management

### 3.1 Advanced Kanban Board
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager
- **Micro-functions:**
  - ✅ Default Columns: รอดำเนินการ, รอวัสดุ, กำลังผลิต, รอตรวจสอบ, กำลังติดตั้ง, เสร็จสิ้น (Defined in `KANBAN_COLUMNS`)
  - ❌ Customizable Columns (Not implemented)
  - ⚠️ Job Card Design:
    - ✅ Display Order Number, Product Name, Customer Name
    - ✅ Display Assigned Worker
    - ✅ Display Deadline
    - ✅ Display Priority Indicator (Mapped via `PRIORITY_CONFIG`)
    - ❌ Display Attachment/Comment counts
    - ❌ Display Progress Bar
  - ✅ Drag & Drop Functionality (Desktop) (Implemented via `dnd-kit` in `kanban/page.tsx`)
  - ❌ Mobile Interaction: Button-based status change
  - ⚠️ Filters & Search:
    - ❌ Free text search
    - ❌ Deadline dropdown
    - ❌ Priority/Assigned To checkboxes
    - ❌ Customer selection
    - ❌ Saved Views

### 3.2 Design File Management (BLOCKER FEATURE)
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager, Sales Staff
- **Micro-functions:**
  - ✅ File Upload System (Implemented via `DesignFileManager` and Server Actions)
  - ✅ File Manager Interface (Integrated into `JobDetailsDialog`)
  - ❌ File Versioning (Basic logical tracking exists, UI pending)

### 3.3 Production Progress Tracking
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - ❌ Progress Update Form
  - ❌ Job History Timeline View
  - ❌ Photo Gallery

### 3.4 Quality Control & Approval
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - ❌ Submit for Review (Worker Action)
  - ❌ Review Dashboard (Manager View)
  - ❌ Detailed Review Screen
  - ❌ Review Decisions
  - ❌ Rejection Form

## 4. Module 4: Financial Management

### 4.1 Invoice Generation
- **Role Access:** Owner, Sales Manager, Accountant
- **Micro-functions:**
  - ✅ Auto-Generate Invoice from Order (Implemented in `app/invoices/new/page.tsx` & `actions/invoices.ts`)
  - ✅ Tax Invoice Support (BLOCKER FEATURE) (Checkbox and auto-generation exists)
  - ⚠️ Invoice List:
    - ❌ Status Filters (Not fully implemented on list view)
    - ❌ Search by Customer, Number, Date Range (Basic listing only)
  - ❌ Edit/Cancel Invoice (Admin/Accountant)
  - ⚠️ PDF Export - Invoice (BLOCKER FEATURE): (HTML layout exists, but real PDF export is missing)
  - ⚠️ Auto-deduct materials from stock when invoiced (Pending inspection of Module 5 logic)

### 4.2 Payment Receipt
- **Role Access:** Owner, Accountant
- **Micro-functions:**
  - ✅ Payment Recording Form (`app/receipts/new/page.tsx`)
    - ✅ Invoice Selection
    - ✅ Payment Date picker
    - ✅ Payment Method dropdown
    - ❌ Bank Transfer Details (Partial, but misses robust tracking)
    - ❌ File Upload for Proof (Slip)
    - ✅ Amount Received input
    - ✅ Notes text area
  - ❌ Partial Payment Support (Not found in `actions/receipts.ts`)
  - ✅ Auto-Status Updates:
    - ✅ Update Invoice to `PAID`
    - ✅ Update Order to `completed`
    - ✅ Generate Receipt
  - ⚠️ PDF Export - Receipt (BLOCKER FEATURE): (HTML layout exists, true PDF export missing)

### 4.3 Financial Reports
- **Role Access:** Owner, Accountant
- **Micro-functions:**
  - ⚠️ Revenue Dashboard: (Basic stats exist in `app/billing/page.tsx`, but missing advanced KPIs)
  - ❌ Revenue Trend Chart
  - ❌ Top Performers
  - ❌ Aging Report
  - ❌ Profit Analysis

## 5. Module 5: Inventory & Materials

### 5.1 Material Management
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - ⚠️ Material Master Data Form (`app/stock/page.tsx` & `actions/stock.ts`):
    - ✅ Basic Info: Name, Type (as Category), Unit
    - ❌ SKU (Missing from schema analysis & UI)
    - ✅ Pricing: Cost Price, Selling Price
    - ✅ Inventory Info: Current Stock, Min Stock
    - ❌ Max Stock (Missing)
    - ❌ Waste Factor input (Missing in UI)
    - ❌ Supplier Info (Missing)
    - ❌ Additional fields (Description, Image URL, Barcode, Location)
    - ❌ Status: IsActive (Soft Delete not implemented)
  - ⚠️ Material List View:
    - ✅ Filters: Category (Type)
    - ❌ Filters: Low Stock Only
    - ✅ Columns: Name, Stock, Min, Cost, Actions
    - ✅ Status Indicators (Critical, Low Stock, Healthy logic implemented in `getStockLevel`)
    - ❌ Export/Import to Excel
  - ⚠️ Edit/Delete Material:
    - ❌ Edit form (Update all fields)
    - ❌ Delete / Soft Delete

### 5.2 Stock Tracking
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - ⚠️ Stock Adjustment Form:
    - ✅ Current Stock Display
    - ❌ Type Dropdown (IN, OUT, ADJUSTMENT - Hardcoded "Manual Adjustment" in UI)
    - ✅ Quantity Input (Direct update of `newAmount`)
    - ❌ Reference/Notes (Passed as "Manual Adjustment" without UI input)
  - ❌ Batch Operations
  - ❌ Stock Transaction History (Table exists in DB per analysis, but UI not found)

### 5.3 Auto-Deduct on Invoice
- **Role Access:** System Auto, Warehouse Manager (Config)
- **Micro-functions:**
  - ❌ Deduction Logic (Trigger on invoice, Product -> Materials formula calculation not found in `actions/invoices.ts` or `actions/stock.ts`)
  - ❌ Deduction Rule Configuration
  - ❌ Insufficient Stock Handling
  - ❌ Stock Transaction Logging for Auto-Deducts

### 5.4 Low Stock Alerts
- **Role Access:** Owner, Warehouse Manager, Production Manager
- **Micro-functions:**
  - ❌ Alert Settings Configuration
  - ⚠️ Alert Display (Has `getLowStockMaterials` in `actions/dashboard.ts` and shown on `app/page.tsx`, but no push/email alerts)
  - ❌ Reorder Suggestions (Smart Reorder)

## 6. Module 6: Backend Administration

### 6.1 Organization Settings
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - ✅ Company Profile Form (`app/settings/organization/page.tsx`):
    - ✅ Company Name (TH, EN)
    - ✅ Tax ID (13 digits), Branch
    - ✅ Address
    - ✅ Contact Info
  - ❌ Bank Account Settings:
    - ❌ Add/Edit/Delete Bank Account
    - ❌ Set Default Account
    - ❌ PromptPay ID
    - ❌ Show QR PromptPay toggle
  - ❌ Branding Settings:
    - ❌ Upload Company Logo (Pending implementation, noted in comments)
    - ❌ Upload Digital Signature

### 6.2 User Management
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - ✅ User List Dashboard (`app/admin/users/page.tsx`):
    - ✅ List all active/inactive users
    - ✅ Filters (Role, Status)
    - ✅ Columns: Name, Email, Role, Status
  - ⚠️ Role-Based Access Control (RBAC):
    - ✅ Pre-defined Roles (Admin, Manager, Staff, etc. exist in `ROLE_CONFIG` & `auth/callback/route.ts`)
    - ✅ Assign/Change Role for User (`RoleDropdown`)
    - ❌ View Permission Matrix
  - ❌ Invite User:
    - ❌ Form: Email, Full Name, Role Dropdown
    - ❌ Send Invitation
    - ❌ Generate time-limited invitation link
  - ❌ User Activity Log:
    - ❌ Track logins, creations, updates
    - ❌ Filters & Export
  - ⚠️ Custom Authentication System:
    - ❌ Email/Password login (bcrypt hashed) - (Currently uses Supabase Auth, not custom JWT as spec'd)
    - ❌ Refresh tokens & active sessions
    - ❌ Logout current/all devices
    - ❌ Password reset
    - ❌ Email verification
    - ❌ Optional 2FA

### 6.3 Approval Workflows Configuration
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - ❌ Workflow Settings Dashboard
  - ❌ Approval Rules Setup (Quotations)
  - ❌ Approval Rules Setup (Invoices)
  - ❌ Custom Approval Rules Builder (Advanced)

## 7. Module 7: Modern Competitive Features

### 7.1 Real-time Collaboration
- **Role Access:** All authenticated users
- **Micro-functions:**
  - ❌ Presence Indicators (Active Users List, currently viewing)
  - ❌ Internal Comments (Thread, @Mentions)

### 7.2 Universal File Attachment System
- **Role Access:** All authenticated users
- **Micro-functions:**
  - ❌ Attachment Model (Polymorphic `attachableType`, metadata, tags)
  - ❌ File Replacement & Versioning
  - ❌ Public Share Link

### 7.3 Location Management & Google Maps
- **Role Access:** Owner, Sales Manager, Sales Staff, Production Manager
- **Micro-functions:**
  - ❌ Customer Location Record (Address fields, Lat/Lng, Google Maps URL, Types, Photos)
  - ❌ Link Location to Order (`serviceLocationId`)

## 8. Module 8: System Integrations & i18n/l10n

### 8.1 System Integrations
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - ⚠️ LINE Official Account Integration (Basic webhook exists, but full integration missing)
  - ❌ Facebook Messenger Integration
  - ❌ Email Service (SendGrid/AWS SES/Resend)
  - ❌ SMS Notifications
  - ❌ Payment Gateways
  - ❌ Public API

### 8.2 Internationalization & Localization (i18n/l10n)
- **Role Access:** All Users
- **Micro-functions:**
  - ❌ Supported Languages (next-intl not configured, no translation JSON files found)
  - ❌ Locale Config (Path-based routing)
  - ❌ Language Switcher Component
  - ❌ Font Loading per Locale
  - ❌ Currency/Date Formatting
  - ❌ Notification Translations
  - ❌ PDF Document i18n (Customer's preferred language)
  - ❌ Data Model Updates (`localePreference`, `preferredLocale`)

---
*End of Audit Report.*

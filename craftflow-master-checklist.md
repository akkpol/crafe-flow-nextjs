# CraftFlow ERP - Master Feature Checklist

> **Purpose:** This document is the immutable source of truth for all CraftFlow ERP features, broken down to the micro-function, UI, validation, and role-access level.
> **Note:** Do not modify this file unless explicitly instructed. It serves as the baseline for all development and auditing activities.

---

## 📋 Table of Contents

1. [Module 1: Multi-Channel Customer Intake & Customer Profile](#module-1-multi-channel-customer-intake--customer-profile)
2. [Module 2: Quotation & Pricing](#module-2-quotation--pricing)
3. [Module 3: Production Management](#module-3-production-management)
4. [Module 4: Financial Management](#module-4-financial-management)
5. [Module 5: Inventory & Materials](#module-5-inventory--materials)
6. [Module 6: Backend Administration](#module-6-backend-administration)
7. [Module 7: Modern Competitive Features](#module-7-modern-competitive-features)
8. [Module 8: System Integrations & i18n/l10n](#module-8-system-integrations--i18nl10n)

---
## 1. Module 1: Multi-Channel Customer Intake & Customer Profile

### 1.1 Walk-in Customer Registration (Quick Registration)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Auto-focus search field on page load
  - [ ] Real-time search (debounced 300ms) by name, phone, LINE ID
  - [ ] Display "Create New" button if no match found
  - [ ] Keyboard Shortcuts:
    - `Ctrl+N` = New customer
    - `Enter` = Select first result
    - `Esc` = Clear search
  - [ ] Form Fields:
    - [ ] Name (Required, min 2 chars)
    - [ ] Phone (Required, 10 digits Thai format `0xx-xxx-xxxx`)
    - [ ] LINE ID (Optional)
    - [ ] Email (Optional, valid format)
    - [ ] Source dropdown (walk-in, phone, line, facebook, email, website)
    - [ ] Referral Source (Optional text)
  - [ ] Validation:
    - [ ] Duplicate phone detection with merge option
  - [ ] Existing Customer Quick Lookup Display:
    - [ ] Show recent interactions (last 3)
    - [ ] Show outstanding balance prominently
    - [ ] Show last order date

### 1.2 Phone Call Registration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Call Intake Form:
    - [ ] Auto-populate Call DateTime
    - [ ] Auto-populate Received By (Logged-in user)
    - [ ] Call Duration tracking (Optional)
    - [ ] Customer info fields (same as Walk-in)
    - [ ] Inquiry Type dropdown (quotation, order_status, complaint, general)
    - [ ] Urgency dropdown (low, medium, high, urgent)
    - [ ] Notes text area
    - [ ] Requires Follow-up toggle
    - [ ] Follow-up Date picker
    - [ ] Assigned To dropdown (User list)
  - [ ] Call Script Template (Optional): Pre-set questions by inquiry type

### 1.3 LINE OA Integration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] LINE Webhook Handler (message, follow, unfollow, join, leave)
  - [ ] Auto-Response Features:
    - [ ] Welcome message on first contact
    - [ ] Keyword auto-reply ("ราคา", "สถานะ", "ติดต่อ")
    - [ ] Business hours check (auto-reply if outside hours)
  - [ ] LINE User Auto-Capture:
    - [ ] Fetch LINE profile on first message
    - [ ] Auto-match with existing customer by Display Name (fuzzy)
    - [ ] "Pending Match" UI for staff to confirm if multiple matches
  - [ ] LINE Message Dashboard (Staff UI):
    - [ ] Real-time inbox (WebSocket/polling)
    - [ ] Group by LINE user
    - [ ] Unread message badge
    - [ ] Quick reply templates
    - [ ] Rich message support (images, flex)
    - [ ] Assign conversation to staff
    - [ ] Internal notes (invisible to customer)
  - [ ] Notifications: Browser push, sound alert (toggleable)

### 1.4 Facebook Integration
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] FB Messenger Webhook integration
  - [ ] Auto-link with customer profile (fetch public name/pic)
  - [ ] Facebook Comments Monitoring (alert staff, quick reply, convert to lead)

### 1.5 Email & Web Form Intake
- **Role Access:** Public (Form), Owner/Sales (Dashboard)
- **Micro-functions:**
  - [ ] Web Contact Form (Public):
    - [ ] Fields: Name(req), Phone(req), Email(req), InquiryType(req), Company(opt), Message(req)
    - [ ] File Attachments (Max 5 files, 10MB each)
    - [ ] Hidden fields: Source, Referrer, UTM params
    - [ ] Real-time validation on blur with inline errors
    - [ ] reCAPTCHA v3 & Honeypot
  - [ ] Submission Flow:
    - [ ] Upload attachments to storage
    - [ ] Create lead in DB
    - [ ] Auto-send confirmation email to customer
    - [ ] Notify staff (Email, Dashboard, LINE opt)
  - [ ] Email Parser (Advanced - LLM based):
    - [ ] Extract Intent, Urgency, Requirements, Contact
    - [ ] Auto-create lead
    - [ ] Suggest response template

### 1.6 Unified Inbox (Omnichannel Dashboard)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Consolidated View of all channels (LINE, FB, Email, Phone, Walk-in)
  - [ ] Status Groups: New, In Progress, Resolved
  - [ ] Filters: Channel, Status, Assigned To, Date Range, Urgency, Customer Type
  - [ ] Bulk Actions: Assign, Resolve, Archive, Export CSV

### 1.7 Customer Profile Management
- **Role Access:** Owner, Sales Manager, Sales Staff, Accountant (View), Production (View limited)
- **Micro-functions:**
  - [ ] Detail Page Layout:
    - [ ] Contact Info (Phone, LINE, Email, Address)
    - [ ] Business Info (Company, Tax ID 13 digits, Branch, Industry)
    - [ ] Financial Info (Credit Limit, Outstanding, Payment Terms)
    - [ ] Outstanding warning UI (⚠️ if overdue/exceeded)
    - [ ] Statistics (Total Orders, Total Spent, Avg Order, First/Last Order Date)
    - [ ] Tags & Notes (Manual and Auto tags)
  - [ ] Order History Tab (Filterable, Exportable)
  - [ ] Communication History Tab (All channels merged)
  - [ ] Customer Segmentation (Auto-Tagging):
    - [ ] Rules based on: Total Spent, Order Count, Last Order Days, Payment Behavior
  - [ ] Credit Management:
    - [ ] Credit Limit & Terms settings
    - [ ] Auto-calculate available credit
    - [ ] Credit History Log (increases, payments, invoices)
    - [ ] Quotation/Order creation block or warning if credit exceeded

---
## 2. Module 2: Quotation & Pricing

### 2.1 Smart Quotation Builder
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Pre-configured Products Catalog:
    - [ ] Categories (LED, Acrylic, etc.)
    - [ ] Pricing Models: per_sqm, per_unit, per_meter, fixed
    - [ ] Base price input
    - [ ] Materials relation (Formula calculation, e.g. width * height * 1.15)
    - [ ] Optional addons (per_unit or fixed)
    - [ ] Minimum order quantity/size settings
  - [ ] Dynamic Pricing Engine:
    - [ ] Calculate Base Price
    - [ ] Apply Volume Discount (tiers)
    - [ ] Apply Customer Discount
    - [ ] Apply Complexity Multiplier
    - [ ] Calculate Material Cost & Labor Estimation
    - [ ] Calculate Final Price (Subtotal, Discount, Profit, Profit Margin)
  - [ ] Quotation Form UI (Step-by-Step):
    - [ ] **Step 1: Customer Selection** (Search or Create New)
    - [ ] **Step 2: Add Items**
      - [ ] Select Product from Catalog
      - [ ] Input Size (Width x Height), Quantity
      - [ ] Addons selection
      - [ ] Auto-calculate subtotal per item
    - [ ] **Step 3: Pricing Summary**
      - [ ] Subtotal
      - [ ] Apply manual discount (Percent or Amount)
      - [ ] Auto VAT 7% calculation
      - [ ] Display Profit Margin (Hidden from customer)
    - [ ] **Step 4: Terms & Validity**
      - [ ] Auto-generate Quotation Number (`QT-YYYYMM-XXXX`)
      - [ ] Issue Date (Default today)
      - [ ] Valid Until Date (Default +X days)
      - [ ] Payment Terms checkboxes (e.g. 50% deposit)
      - [ ] Delivery Timeline (Days)
      - [ ] Notes / Special Conditions (Text area)
  - [ ] Quotation Templates:
    - [ ] Save current quotation as template
    - [ ] Load items/terms from pre-saved template
    - [ ] Track template usage count

### 2.2 Quotation Approval Workflow
- **Role Access:** Owner, Sales Manager
- **Micro-functions:**
  - [ ] Approval Rules Setup:
    - [ ] Condition types: discount_percent, total_amount, profit_margin, custom
    - [ ] Operators: gt, lt, eq, between
    - [ ] Required Approvers (Role, Count)
  - [ ] Pending Approvals Dashboard:
    - [ ] List quotations requiring approval
    - [ ] Show Reason, Total, Discount, Profit Margin
    - [ ] Urgency indicator
  - [ ] Approval Actions:
    - [ ] ✅ Approve (Moves status to Approved)
    - [ ] ❌ Reject (Moves status to Rejected, requires reason)
    - [ ] 💬 Request Changes (Moves to Draft, notes to sales)
  - [ ] Notification Flow:
    - [ ] Alert approver via In-app, Email, LINE
    - [ ] Alert sales rep upon decision

### 2.3 Quotation Comparison
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Select 2-4 quotations for comparison
  - [ ] Side-by-side Table/Card View
  - [ ] Highlight differences (Size, Price, Warranty, etc.)
  - [ ] Export comparison as PDF/Image

### 2.4 PDF Export - Quotation (BLOCKER FEATURE)
- **Role Access:** Owner, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] Thai Business Standard Format adherence
  - [ ] **Header:** Logo, Company Name (TH/EN), Address, Tax ID, Quote No., Date, Validity
  - [ ] **Customer Section:** Name, Company, Address, Phone, Tax ID
  - [ ] **Items Table:** #, Description (includes size/details), Qty, Unit Price, Total
  - [ ] **Summary Section:** Subtotal, Discount, Before VAT, VAT 7%, Grand Total, Amount in Words (Thai Baht)
  - [ ] **Terms Section:** Payment terms, Delivery, Notes, Signatures
  - [ ] **Footer:** Contact Info
  - [ ] PDF Generation System (Puppeteer or React-PDF):
    - [ ] Support Thai Fonts (Sarabun/Noto Sans Thai)
    - [ ] Watermark ("DRAFT" or "EXPIRED")
    - [ ] Bilingual support (TH/EN switchable)
  - [ ] Share via public link or direct download

---
## 3. Module 3: Production Management

### 3.1 Advanced Kanban Board
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager (View)
- **Micro-functions:**
  - [ ] Default Columns: รอดำเนินการ (new), รอวัสดุ (pending), กำลังผลิต (in_progress), รอตรวจสอบ (review), กำลังติดตั้ง (installing), เสร็จสิ้น (completed)
  - [ ] Customizable Columns (Add, Remove, Reorder, Rename, WIP limits)
  - [ ] Job Card Design:
    - [ ] Display Order Number (`OR-YYYYMM-XXXX`)
    - [ ] Display Product Name
    - [ ] Display Customer Name
    - [ ] Display Assigned Worker
    - [ ] Display Deadline (with days remaining)
    - [ ] Display Priority Indicator (🔴 High, 🟡 Med, 🟢 Low)
    - [ ] Display Attachment/Comment counts
    - [ ] Display Progress Bar
  - [ ] Drag & Drop Functionality (Desktop):
    - [ ] Move card between columns
    - [ ] Auto-update `status` on drop
    - [ ] Log history (`status_changed`)
    - [ ] Trigger notifications to stakeholders
  - [ ] Mobile Interaction: Button-based status change (`[← รอวัสดุ] [รอตรวจสอบ →]`)
  - [ ] Filters & Search:
    - [ ] Free text search
    - [ ] Deadline dropdown (Today, This Week, Overdue, Custom)
    - [ ] Priority checkboxes
    - [ ] Assigned To checkboxes
    - [ ] Customer selection
    - [ ] Saved Views ("My Jobs", "Overdue", etc.)

### 3.2 Design File Management (BLOCKER FEATURE)
- **Role Access:** Owner, Production Manager, Production Staff, Sales Manager, Sales Staff
- **Micro-functions:**
  - [ ] File Upload System:
    - [ ] Drag-and-drop zone (`FileUploadZone`)
    - [ ] Support multiple files (Max 20 per order)
    - [ ] Max size: 50MB per file
    - [ ] Accepted Types: `.jpg, .png, .gif, .svg, .ai, .psd, .pdf, .eps, .cdr, .dwg, .dxf, .doc, .docx`
    - [ ] Upload Progress Indicator (Progress bar, speed, % complete)
    - [ ] Save metadata to DB: `fileName`, `fileType`, `fileSize`, `fileUrl`, `thumbnailUrl`, `uploadedBy`, `uploadedAt`, `version`, `notes`
    - [ ] Integration with Supabase Storage (Bucket: `design-files`)
    - [ ] Handle cache, public URLs, error handling
  - [ ] File Manager Interface:
    - [ ] List View (Name, Size, Uploader, Time)
    - [ ] Actions: Preview, Download, Delete (Uploader/Admin only)
    - [ ] Image Preview Modal (Full-size, Zoom)
    - [ ] PDF Viewer Embedded
  - [ ] File Versioning:
    - [ ] Track versions (v1, v2)
    - [ ] Side-by-side comparison (future)
    - [ ] Restore previous version

### 3.3 Production Progress Tracking
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - [ ] Progress Update Form:
    - [ ] Slider for progress % (0-100%)
    - [ ] Photo Upload (Take photo mobile, Gallery upload, Multiple, Captions)
    - [ ] Notes text area
    - [ ] Issues/Blockers checkboxes (Need materials, Technical, etc.)
  - [ ] Job History Timeline View:
    - [ ] Chronological list of events (Status changes, Assignments, Progress updates, Files, Comments, Material issues)
    - [ ] Display timestamp, user, action details
  - [ ] Photo Gallery:
    - [ ] Grid view of progress photos
    - [ ] Actions: Click full-size, Swipe, Download, Delete, Add caption, Share via LINE

### 3.4 Quality Control & Approval
- **Role Access:** Production Manager, Production Staff
- **Micro-functions:**
  - [ ] Submit for Review (Worker Action):
    - [ ] Validation: Must be 100% progress
    - [ ] Validation: Minimum 3 final photos required
    - [ ] Validation: Completion notes required
    - [ ] Checkboxes (All work completed, Photos uploaded, Materials returned)
  - [ ] Review Dashboard (Manager View):
    - [ ] List of jobs "Pending Review"
    - [ ] Show job details (Completed by, Time, Customer, Due Date, Photos, Notes)
  - [ ] Detailed Review Screen:
    - [ ] Final Photos display (Large + Thumbnails)
    - [ ] Worker Notes display
    - [ ] Quality Checklist (Dimensions, Materials, Finish, Electrical, Packaging)
  - [ ] Review Decisions:
    - [ ] ✅ Approve (Move to Installing/Completed, Notify)
    - [ ] ⚠️ Approve with notes (Move forward, add installation notes)
    - [ ] ❌ Reject (Return to In Progress, Add Rejection Reason)
  - [ ] Rejection Form:
    - [ ] Issues Found checkboxes (Dimension, Quality, Materials, Damage)
    - [ ] Detailed Explanation text area
    - [ ] Attach Reference Photos
    - [ ] Severity Level (Minor, Major, Critical)

---
## 4. Module 4: Financial Management

### 4.1 Invoice Generation
- **Role Access:** Owner, Sales Manager, Accountant
- **Micro-functions:**
  - [ ] Auto-Generate Invoice from Order:
    - [ ] Copy financial data (Subtotal, VAT, Grand Total)
    - [ ] Generate Invoice Number (`IV-YYYYMM-XXXX` or `TX-YYYYMM-XXXX`)
    - [ ] Due Date picker (Default: 30 days)
    - [ ] Copy items (Name, Description, Qty, Unit Price, Total)
  - [ ] Tax Invoice Support (BLOCKER FEATURE):
    - [ ] Checkbox "Tax Invoice" (ใบกำกับภาษี)
    - [ ] Auto-generate Tax Invoice Number if checked
    - [ ] Ensure Thai Tax ID (13 digits) exists for both Company and Customer
    - [ ] VAT 7% Breakdown
  - [ ] Invoice List:
    - [ ] Status Filters (DRAFT, SENT, PARTIALLY_PAID, PAID, OVERDUE)
    - [ ] Search by Customer, Number, Date Range
  - [ ] Edit/Cancel Invoice (Admin/Accountant):
    - [ ] Edit details before sent
    - [ ] Cancel/Void invoice (logs reason, removes from revenue)
  - [ ] PDF Export - Invoice (BLOCKER FEATURE):
    - [ ] Title: ใบแจ้งหนี้ / INVOICE or ใบกำกับภาษี / TAX INVOICE
    - [ ] Payment Status Stamp (UNPAID, PARTIALLY PAID, PAID)
    - [ ] Payment Information Section (Bank Account, QR Code, PromptPay)
    - [ ] All Thai standard fields (similar to Quotation PDF)
  - [ ] Auto-deduct materials from stock when invoiced (See Module 5)

### 4.2 Payment Receipt
- **Role Access:** Owner, Accountant
- **Micro-functions:**
  - [ ] Payment Recording Form:
    - [ ] Invoice Selection (`IV-YYYYMM-XXXX`)
    - [ ] Amount Due display
    - [ ] Payment Date picker (Default today)
    - [ ] Payment Method dropdown (Cash, Transfer, Cheque, Credit Card)
    - [ ] Bank Transfer Details (Bank, Account, Time, Reference)
    - [ ] File Upload for Proof (Slip)
    - [ ] Amount Received input
    - [ ] Notes text area
  - [ ] Partial Payment Support:
    - [ ] Allow recording amount < Amount Due
    - [ ] Update Invoice status to `PARTIALLY_PAID`
    - [ ] Display Outstanding Balance
  - [ ] Auto-Status Updates:
    - [ ] Update Invoice to `PAID` if full amount received
    - [ ] Update Order to `completed` if invoice is fully paid
    - [ ] Generate Receipt (`RC-YYYYMM-XXXX`)
  - [ ] PDF Export - Receipt (BLOCKER FEATURE):
    - [ ] Title: ใบเสร็จรับเงิน / OFFICIAL RECEIPT
    - [ ] Receipt No., Date, Invoice Ref.
    - [ ] Received From (Name, Company, Tax ID)
    - [ ] Items (Description, Amount)
    - [ ] Payment Method & Reference
    - [ ] Amount in Words (Thai)
    - [ ] Signature Line (Accountant) + PAID Stamp

### 4.3 Financial Reports
- **Role Access:** Owner, Accountant (View)
- **Micro-functions:**
  - [ ] Revenue Dashboard:
    - [ ] Period Filter (This Month, Date Range)
    - [ ] KPIs: Total Revenue, Total Orders, Total Outstanding
    - [ ] Comparison vs previous period (+X%)
  - [ ] Revenue Trend Chart (Line Chart):
    - [ ] Daily/Weekly/Monthly view
  - [ ] Top Performers:
    - [ ] Top 5 Customers by Revenue
    - [ ] Top 5 Products by Revenue
  - [ ] Aging Report:
    - [ ] Outstanding Receivables by buckets: Current (0-30), 31-60, 61-90, Over 90 days
    - [ ] Customer List with overdue days, amount
    - [ ] Action buttons (Follow, Remind)
    - [ ] Export to Excel
  - [ ] Profit Analysis:
    - [ ] Breakdown: Revenue, Material Costs, Labor Costs, Overhead, Profit
    - [ ] Profit Margin progress bar (%)
    - [ ] By Product Category table (Revenue, Cost, Profit, Margin)

---
## 5. Module 5: Inventory & Materials

### 5.1 Material Management
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - [ ] Material Master Data Form:
    - [ ] Basic Info: Name, SKU (Unique), Category (Dropdown), Unit (Dropdown)
    - [ ] Pricing: Cost Price, Selling Price (THB)
    - [ ] Inventory Info: Current Stock, Min Stock (Reorder Point), Max Stock
    - [ ] Waste Factor input (Default 1.15)
    - [ ] Supplier Info: Name, Contact, Lead Time Days
    - [ ] Additional: Description, Image URL, Barcode, Warehouse Location
    - [ ] Status: IsActive (Soft Delete)
  - [ ] Material List View:
    - [ ] Filters: All, Category, Low Stock Only
    - [ ] Columns: Name, Category, Stock, Min, Unit, Cost, Sell, Actions
    - [ ] Status Indicators: 🟢 (Stock > Min + 20%), 🟡 (Near Min), 🔴 (Below Min)
    - [ ] Export/Import to Excel (Optional)
  - [ ] Edit/Delete Material:
    - [ ] Edit form (Update all fields)
    - [ ] Soft Delete (set IsActive to false)

### 5.2 Stock Tracking
- **Role Access:** Owner, Production Manager, Warehouse Manager
- **Micro-functions:**
  - [ ] Stock Adjustment Form:
    - [ ] Current Stock Display
    - [ ] Type Dropdown: IN, OUT, ADJUSTMENT, RETURN, DAMAGE
    - [ ] Quantity Input (+/-)
    - [ ] New Stock Level Display
    - [ ] Reference/Notes (e.g., PO-XXXX, received from YYY)
  - [ ] Batch Operations:
    - [ ] Import Excel or multi-row form (SKU, Type, Qty, Reference)
  - [ ] Stock Transaction History:
    - [ ] Log table: Date, Type, Qty, Balance, Reference, By (User)
    - [ ] Filters: Date Range, Type, Reference, User

### 5.3 Auto-Deduct on Invoice
- **Role Access:** System Auto, Warehouse Manager (Config)
- **Micro-functions:**
  - [ ] Deduction Logic:
    - [ ] Trigger when Order becomes Invoice (or manually configurable)
    - [ ] Loop OrderItems -> Product -> Materials
    - [ ] Calculate `baseQty` using `quantityFormula`
    - [ ] Apply `wasteFactor` (`baseQty * wasteFactor`)
    - [ ] Check if sufficient stock (`inStock < qtyWithWaste`)
  - [ ] Deduction Rule Configuration:
    - [ ] Trigger: `on_invoice`, `on_order`, `on_completion`, `manual`
    - [ ] `applyWasteFactor` toggle
    - [ ] `allowNegativeStock` toggle
    - [ ] `blockInvoiceIfInsufficient` toggle
  - [ ] Insufficient Stock Handling:
    - [ ] Warning dialog showing required vs available
    - [ ] Options: Block Invoice, Proceed Anyway, Create PO
  - [ ] Stock Transaction Logging:
    - [ ] Log auto-deductions with reference to Order/Invoice
    - [ ] Trigger Low Stock Alert if below minimum

### 5.4 Low Stock Alerts
- **Role Access:** Owner, Warehouse Manager, Production Manager
- **Micro-functions:**
  - [ ] Alert Settings Configuration:
    - [ ] Trigger when below minimum
    - [ ] Daily summary report (Time)
    - [ ] Notification Methods: In-app, Email, LINE Notify
    - [ ] Recipients Checkboxes (Role or User)
  - [ ] Alert Display:
    - [ ] In-App Notification (Current vs Min stock)
    - [ ] Email Notification (List of items below min)
  - [ ] Reorder Suggestions (Smart Reorder):
    - [ ] Calculate Average Daily Usage (30 days)
    - [ ] Calculate Safety Stock
    - [ ] Suggest Order Quantity (to reach Max Stock, rounded to supplier minimum)
    - [ ] Display Analysis (Days until stockout, Lead time)

---
## 6. Module 6: Backend Administration

### 6.1 Organization Settings
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - [ ] Company Profile Form:
    - [ ] Company Name (TH, EN)
    - [ ] Tax ID (13 digits), Branch
    - [ ] Address (Line 1, Line 2, Subdistrict, District, Province, Postal Code)
    - [ ] Contact Info (Phone, Mobile, Email, Website, LINE OA, Facebook)
  - [ ] Bank Account Settings:
    - [ ] Add/Edit/Delete Bank Account
    - [ ] Account Type (Company, Personal)
    - [ ] Bank Dropdown
    - [ ] Account Number, Account Name, Branch
    - [ ] Set Default Account
    - [ ] PromptPay ID (Tax ID, Phone, e-Wallet)
    - [ ] Show QR PromptPay toggle
  - [ ] Branding Settings:
    - [ ] Upload Company Logo (PNG/JPG, max size, square)
    - [ ] Upload Digital Signature (PNG/JPG)
    - [ ] Save to Supabase Storage, update Org settings

### 6.2 User Management
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - [ ] User List Dashboard:
    - [ ] List all active/inactive users
    - [ ] Filters (Role, Status)
    - [ ] Columns: Name, Email, Role, Status, Last Active, Actions (Edit, Block)
  - [ ] Role-Based Access Control (RBAC):
    - [ ] Pre-defined Roles: Owner, Sales Manager, Sales Staff, Production Manager, Production Staff, Accountant, Warehouse Manager, Viewer
    - [ ] Assign/Change Role for User
    - [ ] View Permission Matrix (Read-only for now)
  - [ ] Invite User:
    - [ ] Form: Email, Full Name, Role Dropdown
    - [ ] Display Permissions based on selected Role
    - [ ] Send Invitation (Email, Include instructions)
    - [ ] Generate time-limited invitation link (7 days)
  - [ ] User Activity Log:
    - [ ] Track logins, document creations, updates, file uploads
    - [ ] Filters: User, Date Range, Activity Type
    - [ ] Export to CSV
  - [ ] Custom Authentication System:
    - [ ] Email/Password login (bcrypt hashed)
    - [ ] Refresh tokens & active sessions
    - [ ] Logout current/all devices
    - [ ] Password reset (time-limited token)
    - [ ] Email verification
    - [ ] Optional 2FA

### 6.3 Approval Workflows Configuration
- **Role Access:** Owner, Admin
- **Micro-functions:**
  - [ ] Workflow Settings Dashboard:
    - [ ] Manage workflows for: Quotations, Invoices, Purchase Orders
  - [ ] Approval Rules Setup (Quotations):
    - [ ] Require approval checkboxes (Discount > X%, Total > Y, Profit < Z%)
    - [ ] Select Approvers (Users/Roles)
    - [ ] Approval Type: Any or All
  - [ ] Approval Rules Setup (Invoices):
    - [ ] Require approval checkboxes (Amount > X, Tax invoices)
    - [ ] Select Approvers
  - [ ] Custom Approval Rules Builder (Advanced):
    - [ ] Rule Name, Apply To Dropdown
    - [ ] Conditions Builder (Field, Operator, Value)
    - [ ] Sequential vs Parallel Approvals
    - [ ] Notification Settings (Email immediately, 24h reminder, 48h escalate)

---
## 7. Module 7: Modern Competitive Features

### 7.1 Real-time Collaboration
- **Role Access:** All authenticated users
- **Micro-functions:**
  - [ ] Presence Indicators:
    - [ ] Show who's viewing/editing the current document (e.g., Quotation, Order)
    - [ ] Active Users List (Sidebar/Header)
  - [ ] Internal Comments:
    - [ ] Comment Thread (tied to Quotation, Order, Invoice)
    - [ ] @Mentions support (Notify user)
    - [ ] Reply to comments

### 7.2 Universal File Attachment System
- **Role Access:** All authenticated users (based on entity access)
- **Micro-functions:**
  - [ ] Attachment Model:
    - [ ] Polymorphic `attachableType` (quotation, order, invoice, receipt, customer)
    - [ ] `attachableId` link
    - [ ] Metadata: `title`, `description`, `category` (design, portfolio, sample, reference, proof, payment)
    - [ ] `tags` array
    - [ ] `isPublic` toggle
  - [ ] File Replacement & Versioning:
    - [ ] ReplacesFileId tracking
    - [ ] Version number tracking
  - [ ] Public Share Link:
    - [ ] Generate unique, secure link for `isPublic=true` files

### 7.3 Location Management & Google Maps
- **Role Access:** Owner, Sales Manager, Sales Staff, Production Manager
- **Micro-functions:**
  - [ ] Customer Location Record:
    - [ ] Address fields (Line 1, 2, Sub, Dist, Prov, Postal)
    - [ ] Latitude/Longitude (Optional)
    - [ ] Google Maps URL (Auto-generated or pasted)
    - [ ] Google Place ID (Optional)
    - [ ] Location Type (billing, installation, warehouse, other)
    - [ ] Access Notes, Parking Info, Contact Onsite
    - [ ] Site Photo URLs
    - [ ] `isDefault` toggle
    - [ ] Label (e.g., "Branch 1")
  - [ ] Link Location to Order:
    - [ ] `serviceLocationId` on Order record
    - [ ] Open in Google Maps button on Job Detail screen
    - [ ] Share location link via LINE/SMS

## 8. Module 8: System Integrations & i18n/l10n

### 8.1 System Integrations
- **Role Access:** Owner, Admin (Config)
- **Micro-functions:**
  - [ ] LINE Official Account Integration (Webhook, Auto-reply, Messaging API)
  - [ ] Facebook Messenger Integration (Webhook, Page Access Token)
  - [ ] Email Service (SendGrid/AWS SES/Resend) for transactional emails
  - [ ] SMS Notifications (ThaiSMS, Thaibulksms) for OTP, status updates
  - [ ] Payment Gateways (2C2P, Omise, PromptPay QR)
  - [ ] Public API (RESTful, Webhook, OAuth 2.0) - Future Phase

### 8.2 Internationalization & Localization (i18n/l10n)
- **Role Access:** All Users
- **Micro-functions:**
  - [ ] Supported Languages: Thai (th) [Default], English (en), Chinese (zh-CN), Burmese (my)
  - [ ] Architecture: `next-intl` (App Router compatible)
  - [ ] Locale Config: Path-based locale prefix (`/th/dashboard`, `/en/dashboard`)
  - [ ] Language Switcher Component (Top nav, instant switch, save preference)
  - [ ] Font Loading per Locale (Sarabun/Noto for TH, Inter for EN, Noto/PingFang for ZH, Padauk/Noto for MY)
  - [ ] Currency Formatting (THB, adapts to locale)
  - [ ] Date/Time Formatting (Local format, Buddhist Era optional)
  - [ ] Notification Translations (Templates in locale JSON files)
  - [ ] PDF Document i18n:
    - [ ] Output in Customer's preferred language
    - [ ] Thai Legal Requirements Override (Company name, Tax Title, Amount in words, Signatures MUST be in Thai)
    - [ ] Font Embedding in PDFs (Sarabun, NotoSansSC, Padauk)
  - [ ] Data Model Updates:
    - [ ] `User.localePreference`
    - [ ] `Customer.preferredLocale`
    - [ ] `OrganizationSettings.defaultLocale`, `supportedLocales`, `dateCalendar`

---
*End of Master Checklist.*

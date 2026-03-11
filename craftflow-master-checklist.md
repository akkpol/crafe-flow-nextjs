# CraftFlow - Master Feature Checklist

> **IMPORTANT:** This file is the immutable master source of truth for all project features.
> Do NOT modify this checklist without explicit permission from the user.
> When auditing or checking feature status, record the findings in a separate audit report (e.g., `craftflow-audit-report.md`) instead of updating the statuses here.

---

## 🛑 Phase 1 BLOCKING Issues (Critical Path to Deployment)
*Must be completed before the system can launch.*

- [ ] **PDF Export System** (Priority: P0)
  - [ ] Export Quotation to PDF
  - [ ] Export Invoice / Tax Invoice to PDF
  - [ ] Export Receipt to PDF
- [ ] **File Management** (Priority: P0)
  - [ ] Upload design files to jobs
  - [ ] List / download design files
- [ ] **Customer Management** (Priority: P0)
  - [ ] View customer order history
  - [ ] Calculate and display outstanding balance

---

## 📦 Phase 1 Deliverables (Baseline Parity)
*System can replace the old system for 100% of daily operations.*

### STEP 1 - Customer Intake
- [x] LINE OA Auto-capture
- [x] Search customer by LINE
- [x] Create/Edit customer
- [ ] View customer history (Blocker)
- [ ] View outstanding balance (Blocker)

### STEP 2 - Quotation
- [x] Select material + calculate
- [x] Auto VAT calculation
- [x] Save quotation (DRAFT)
- [x] Change status workflow
- [ ] Export PDF quotation (Blocker)
- [ ] Edit saved quotation

### STEP 3 - Production Order
- [x] Create job from quotation
- [x] Set deadline + priority
- [x] Assign to worker
- [ ] Attach design files (Blocker)
- [ ] Add job notes

### STEP 4 - Kanban Board
- [x] Display all jobs
- [ ] Upload proof photos
- [ ] "Submit for review" button
- [ ] "Complete job" button

### STEP 5 - Invoice
- [x] Create invoice
- [x] Tax invoice support
- [x] List all invoices
- [x] Filter unpaid invoices
- [ ] Export PDF invoice (Blocker)

### STEP 6 - Receipt
- [x] Create receipt
- [x] List all receipts
- [ ] Export PDF receipt (Blocker)

### STEP 7 - Backend & Settings
- [x] Material management
- [x] Stock tracking
- [ ] Edit/Delete material
- [x] Company profile settings
- [ ] Bank account settings
- [ ] Upload logo/signature

---

## 🚀 Phase 2 Deliverables (Competitive Advantage)
*Improvements over the old system.*

- [ ] Send LINE notification (Customer Intake)
- [ ] Attach proof images (Production Order)
- [x] Drag & drop Kanban (desktop)
- [x] Button status change Kanban (mobile)
- [x] History timeline (Kanban)
- [ ] Edit job details in-place (Kanban)
- [ ] Edit/Cancel invoice
- [x] Auto-update invoice status (Receipt)
- [x] Auto-complete order (Receipt)
- [ ] Partial payment (Receipt)
- [x] Auto-deduct on invoice (Backend)
- [x] Waste factor (Backend)
- [ ] Low stock alert (Backend)
- [ ] Stock movement history (Backend)
- [ ] User management (Backend)
- [ ] Reports/Analytics (Backend)

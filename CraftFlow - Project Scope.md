# CraftFlow - Project Scope & Feature Priority Matrix

> **Project Type:** B2B System Replacement (Contract Work)
> **Client:** Existing business replacing legacy system
> **Goal:** Build better system that does everything the old system did + more

---

## 🎯 Project Scoping Framework

### Phase Definition Rules:
- **Phase 1 (MUST)**: Features the OLD system has (baseline parity)
- **Phase 2 (SHOULD)**: Improvements over old system (competitive advantage)
- **Phase 3 (COULD)**: Nice-to-haves (future enhancements)

---

## 📊 Feature Priority Matrix

| Feature | Old System Has? | Phase | Priority | Effort | Status |
|---------|----------------|-------|----------|--------|--------|
| **STEP 1 - Customer Intake** |
| LINE OA Auto-capture | ❌ | 1 | P0 | M | ✅ Done |
| Search customer by LINE | ❌ | 1 | P0 | S | ✅ Done |
| Create/Edit customer | ✅ | 1 | P0 | S | ✅ Done |
| View customer history | ✅ | 1 | P0 | M | ❌ Missing |
| View outstanding balance | ✅ | 1 | P0 | S | ❌ Missing |
| Send LINE notification | ❌ | 2 | P1 | M | ❌ Missing |
| **STEP 2 - Quotation** |
| Select material + calculate | ✅ | 1 | P0 | M | ✅ Done |
| Auto VAT calculation | ✅ | 1 | P0 | S | ✅ Done |
| Save quotation (DRAFT) | ✅ | 1 | P0 | S | ✅ Done |
| Change status workflow | ✅ | 1 | P0 | M | ✅ Done |
| **📄 Export PDF quotation** | **✅** | **1** | **P0** | **L** | **❌ BLOCKING** |
| Edit saved quotation | ✅ | 1 | P0 | M | ❌ Missing |
| **STEP 3 - Production Order** |
| Create job from quotation | ❌ | 1 | P0 | M | ✅ Done |
| Set deadline + priority | ✅ | 1 | P0 | S | ✅ Done |
| Assign to worker | ✅ | 1 | P0 | S | ✅ Done |
| **📎 Attach design files** | **✅** | **1** | **P0** | **M** | **❌ BLOCKING** |
| Attach proof images | ✅ | 2 | P1 | M | ❌ Missing |
| Add job notes | ✅ | 1 | P0 | S | ❌ Missing |
| **STEP 4 - Kanban Board** |
| Display all jobs | ✅ | 1 | P0 | M | ✅ Done |
| Drag & drop (desktop) | ❌ | 2 | P1 | M | ✅ Done |
| Button status change (mobile) | ❌ | 2 | P1 | S | ✅ Done |
| History timeline | ❌ | 2 | P1 | M | ✅ Done |
| Upload proof photos | ✅ | 1 | P0 | M | ❌ Missing |
| "Submit for review" button | ✅ | 1 | P0 | S | ❌ Missing |
| "Complete job" button | ✅ | 1 | P0 | S | ❌ Missing |
| Edit job details in-place | ✅ | 2 | P1 | M | ❌ Missing |
| **STEP 5 - Invoice** |
| Create invoice | ✅ | 1 | P0 | M | ✅ Done |
| Tax invoice support | ✅ | 1 | P0 | M | ✅ Done |
| List all invoices | ✅ | 1 | P0 | S | ✅ Done |
| Filter unpaid invoices | ✅ | 1 | P0 | S | ✅ Done |
| **📄 Export PDF invoice** | **✅** | **1** | **P0** | **L** | **❌ BLOCKING** |
| Edit/Cancel invoice | ✅ | 2 | P1 | M | ❌ Missing |
| **STEP 6 - Receipt** |
| Create receipt | ✅ | 1 | P0 | M | ✅ Done |
| Auto-update invoice status | ❌ | 2 | P1 | M | ✅ Done |
| Auto-complete order | ❌ | 2 | P1 | S | ✅ Done |
| List all receipts | ✅ | 1 | P0 | S | ✅ Done |
| **📄 Export PDF receipt** | **✅** | **1** | **P0** | **L** | **❌ BLOCKING** |
| Partial payment | ✅ | 2 | P1 | M | ❌ Missing |
| **STEP 7 - Backend** |
| Material management | ✅ | 1 | P0 | M | ✅ Done |
| Stock tracking | ✅ | 1 | P0 | M | ✅ Done |
| Auto-deduct on invoice | ❌ | 2 | P1 | M | ✅ Done |
| Waste factor | ❌ | 2 | P1 | S | ✅ Done |
| Low stock alert | ✅ | 2 | P1 | M | ❌ Missing |
| Edit/Delete material | ✅ | 1 | P0 | S | ❌ Missing |
| Stock movement history | ✅ | 2 | P1 | M | ❌ Missing |
| Company profile settings | ✅ | 1 | P0 | S | ✅ Done |
| Bank account settings | ✅ | 1 | P0 | M | ❌ Missing |
| Upload logo/signature | ✅ | 1 | P0 | M | ❌ Missing |
| User management | ✅ | 2 | P1 | L | ❌ Missing |
| **Reports/Analytics** | ✅ | 2 | P1 | XL | ❌ Missing |

---

## 🚨 BLOCKING Issues (Must Fix for Phase 1)

### Critical Path to Deployment:

1. **PDF Export System** (3 documents) — P0 BLOCKER
   - Quotation PDF
   - Invoice/Tax Invoice PDF  
   - Receipt PDF
   - **Why critical:** Old system has this, can't launch without it

2. **Design File Upload** — P0 BLOCKER
   - Upload files to job
   - List/download files
   - **Why critical:** Workers need design files to produce

3. **Customer Detail Page** — P0 BLOCKER
   - View order history
   - Calculate outstanding balance
   - **Why critical:** Sales needs to know credit status

---

## 📋 Phase 1 Deliverables (Contract Baseline)

**Definition of Done for Phase 1:**
> System can replace old system for 100% of daily operations

### Must-Have Checklist:
- [ ] PDF Export (Quotation, Invoice, Receipt) 
- [ ] Design file upload/download
- [ ] Customer history + outstanding balance
- [ ] Edit quotations
- [ ] Edit/delete materials
- [ ] Job notes field
- [ ] Proof photo upload (workers)
- [ ] Bank account settings (for receipt)
- [ ] Logo/signature upload (for PDF)

**Phase 1 Acceptance Criteria:**
1. ✅ Can create quotation → send PDF to customer
2. ✅ Can receive job → attach design → produce
3. ✅ Can track production → upload proof
4. ✅ Can invoice → receive payment → issue receipt
5. ✅ Can manage stock
6. ✅ Can check customer credit status

**Estimated Time:** 2-3 weeks (with AI agents)

---

## 📋 Phase 2 Deliverables (Competitive Advantage)

**Definition:** Features that make system BETTER than old one

### Should-Have Checklist:
- [ ] LINE notification automation
- [ ] Partial payments
- [ ] Low stock alerts
- [ ] Edit/cancel invoices
- [ ] User role management
- [ ] Basic reports (revenue, deadlines)
- [ ] Edit job details in kanban
- [ ] Custom status columns

**Phase 2 Acceptance Criteria:**
1. Reduces manual work by 30%
2. Prevents common errors (stock-outs, missed deadlines)
3. Enables multi-user workflows

**Estimated Time:** 2-3 weeks

---

## 📋 Phase 3 Deliverables (Future Enhancements)

**Definition:** Nice-to-haves that don't block operations

### Could-Have Checklist:
- [ ] Advanced analytics dashboard
- [ ] Automated quotation templates
- [ ] Customer portal
- [ ] Mobile app
- [ ] Inventory forecasting
- [ ] Multi-location support

**Phase 3:** Based on user feedback after 2-3 months

---

## 🎯 Recommended Approach

### Week 1-2: Phase 1 Critical Path
**Focus:** The 3 BLOCKING features
1. PDF export system (Day 1-4)
2. File upload system (Day 5-7)
3. Customer detail page (Day 8-10)

### Week 3: Phase 1 Completion
**Focus:** Remaining P0 features
4. Edit quotation
5. Material edit/delete
6. Job notes & proof upload
7. Settings UI (logo, bank)

### Week 4: Testing & Deployment
- Integration testing
- User acceptance testing
- Training
- Go-live

### Week 5-6: Phase 2
- Based on Phase 1 feedback
- Focus on automation & error prevention

---

## 📝 Client Communication Template

**Use this for scope management:**

```
Subject: CraftFlow - Phase 1 Scope Confirmation

Hi [Client],

Based on our discussions, I've documented the Phase 1 scope:

✅ INCLUDED (Must-have for launch):
- PDF export for all documents
- Design file management
- Customer history tracking
- [list other P0 features]

⏸️ DEFERRED to Phase 2 (Post-launch):
- Advanced analytics
- [list P1 features]

🔄 CHANGE REQUEST PROCESS:
If you need to add/change features:
1. Document the change
2. Estimate impact (time/cost)
3. Mutual agreement before proceeding

Can you confirm this scope by [date]?

Thanks,
[Your name]
```

---

## ✅ Next Steps

1. **Review this matrix with client** — Get sign-off on Phase 1 scope
2. **Create detailed PRDs** for 3 blocking features
3. **Set up weekly check-ins** with client
4. **Build Phase 1** with AI agents (Windsurf)
5. **Deploy & collect feedback**
6. **Plan Phase 2** based on real usage

